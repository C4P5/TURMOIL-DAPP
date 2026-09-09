// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title TURMOIL — provable-origin used cooking oil
/// @notice A pickup is only real if a restaurant and a collector both signed it,
///         a lot only settles if the litres add up, and audits are drawn after
///         the lot is sealed so nobody knows what will be checked.
/// ponytail: one contract, not four. Single operator, never upgraded — splitting
/// this into BatchRegistry/PayoutEscrow/LotRegistry/AuditSampler would buy four
/// deploys, four verifications and cross-contract auth for zero behaviour.
contract Turmoil is EIP712, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev USDC has 6 decimals on Hedera as everywhere else. `pricePerLitre` is
    ///      denominated in the token's smallest unit, never assumed to be 1e18.
    IERC20 public immutable payToken;

    uint256 public pricePerLitre; // token smallest-unit per whole litre
    uint16 public toleranceBps = 200; // 2% shrinkage allowed in transit
    uint16 public sampleBps = 3000; // 30% of a lot's batches get audited
    uint16 public depositBps = 5000; // collector bond = 50% of lot value

    /// @dev A sample of one cannot deter anything. With k=1 the catch probability
    ///      equals the fabricated fraction f, so EV(cheat) = f·(1 − D) and no bond
    ///      short of the entire lot's value makes that negative. Small lots need a
    ///      floor on the sample size, not a percentage of it.
    uint256 public constant MIN_SAMPLE = 3;

    /// @notice How long a sampled restaurant has to confirm before the collector can
    ///         be flagged. Without a window the operator could flag a batch before the
    ///         restaurant ever had a chance to answer, which would make the whole
    ///         challenge decorative.
    uint64 public challengeWindow = 3 days;

    mapping(address => bool) public isRestaurant;
    mapping(address => bool) public isCollector;
    mapping(address => bool) public isPlant;
    mapping(address => uint256) public deposit; // collector => posted bond
    /// @notice Spent batch digests.
    ///
    /// Replaces a per-restaurant nonce. Replay protection needs *uniqueness*, not
    /// *ordering* — and ordering was actively harmful: the nonce was read at execution
    /// time, so a restaurant could only ever have one signed-but-unsubmitted batch in
    /// existence. Two trucks generating QRs the same morning meant the second honest
    /// signature was dead on arrival, failing as BadSignature: indistinguishable from
    /// forgery, on stage, with two restaurants in the demo.
    mapping(bytes32 => bool) public spent;

    struct Batch {
        address restaurant;
        address collector;
        uint64 litres;
        uint64 lotId;
        bool audited;
        bool failed;
        /// @dev Set by the restaurant's own signature, not by the operator.
        bool confirmed;
    }

    struct Lot {
        address collector;
        uint64 attestedLitres;
        uint64 receivedLitres;
        /// @dev The plant that signed for the received weight. Recorded so the figure
        ///      the mass balance is checked against is attributable to a counterparty
        ///      rather than to whoever happens to own this contract.
        address plant;
        uint64 drawnAt;
        bool isSealed;
        bool settled;
        /// @dev Explicit flag rather than `seed != 0`. Zero is a legal seed — and it is
        ///      the value block.prevrandao actually returns off-Hedera — so overloading
        ///      it as "not drawn yet" silently disables the once-only guard.
        bool drawn;
        uint256 seed;
    }

    Batch[] public batches;
    Lot[] public lots;
    mapping(address => uint256) public openLotOf; // collector => lotId+1, 0 = none
    mapping(uint256 => uint256[]) internal _lotBatches;

    bytes32 private constant BATCH_TYPEHASH =
        keccak256("Batch(address restaurant,address collector,uint64 litres,bytes32 ref,uint256 deadline)");

    bytes32 private constant RECEIPT_TYPEHASH =
        keccak256("Receipt(uint256 lotId,uint64 receivedLitres,uint256 deadline)");

    bytes32 private constant CONFIRM_TYPEHASH = keccak256("Confirm(uint256 batchId,uint256 deadline)");

    event Attested(uint256 indexed batchId, uint256 indexed lotId, address restaurant, uint64 litres, uint256 paid);
    event LotSealed(uint256 indexed lotId, uint64 attestedLitres);
    event LotSettled(uint256 indexed lotId, uint64 receivedLitres, uint256 slashed);
    event AuditDrawn(uint256 indexed lotId, uint256 seed, uint256[] sampled);
    event AuditFailed(uint256 indexed batchId, uint256 fine);
    event BatchConfirmed(uint256 indexed batchId, address restaurant);
    event DepositChanged(address indexed collector, uint256 balance);

    error NotRegistered();
    error BadSignature();
    error Expired();
    error LotClosed();
    error LotNotReady();
    error NothingToAudit();
    error SelfDeal();
    error UnderBonded();
    error AlreadyDrawn();
    error NotSampled();
    error AlreadyConfirmed();
    error ChallengeOpen();

    constructor(IERC20 token, uint256 pricePerLitre_) EIP712("TURMOIL", "1") Ownable(msg.sender) {
        payToken = token;
        pricePerLitre = pricePerLitre_;
    }

    // --- registry -----------------------------------------------------------

    function setRestaurant(address who, bool ok) external onlyOwner {
        isRestaurant[who] = ok;
    }

    function setCollector(address who, bool ok) external onlyOwner {
        isCollector[who] = ok;
    }

    function setPlant(address who, bool ok) external onlyOwner {
        isPlant[who] = ok;
    }

    function setChallengeWindow(uint64 seconds_) external onlyOwner {
        challengeWindow = seconds_;
    }

    function setParams(uint256 price_, uint16 tolerance_, uint16 sample_, uint16 depositBps_) external onlyOwner {
        require(tolerance_ <= 10_000 && sample_ <= 10_000 && depositBps_ <= 10_000, "bps");
        pricePerLitre = price_;
        toleranceBps = tolerance_;
        sampleBps = sample_;
        depositBps = depositBps_;
    }

    /// @notice Collectors post a bond. Sized at `depositBps` of expected lot value,
    ///         so one failed audit consumes it — see the extrapolation in `flagAudit`.
    function postDeposit(uint256 amount) external nonReentrant {
        if (!isCollector[msg.sender]) revert NotRegistered();
        payToken.safeTransferFrom(msg.sender, address(this), amount);
        deposit[msg.sender] += amount;
        emit DepositChanged(msg.sender, deposit[msg.sender]);
    }

    // --- attestation --------------------------------------------------------

    /// @notice Record a pickup. Requires signatures from BOTH parties over the
    ///         same struct — neither can produce a valid batch alone. The restaurant
    ///         never sends a transaction and never needs gas.
    /// @param ref A client-generated identifier, already carried in the QR. Its only
    ///        job is to make two otherwise-identical pickups produce different digests.
    function attest(
        address restaurant,
        address collector,
        uint64 litres,
        bytes32 ref,
        uint256 deadline,
        bytes calldata sigRestaurant,
        bytes calldata sigCollector
    ) external nonReentrant returns (uint256 batchId) {
        if (block.timestamp > deadline) revert Expired();
        if (!isRestaurant[restaurant] || !isCollector[collector]) revert NotRegistered();
        // Two ROLES is not two PARTIES. Without this, one address registered in both
        // roles signs once, passes the signature twice, and pays itself.
        if (restaurant == collector) revert SelfDeal();
        require(litres > 0, "zero litres");

        bytes32 digest =
            _hashTypedDataV4(keccak256(abi.encode(BATCH_TYPEHASH, restaurant, collector, litres, ref, deadline)));
        if (spent[digest]) revert BadSignature();
        if (ECDSA.recover(digest, sigRestaurant) != restaurant) revert BadSignature();
        if (ECDSA.recover(digest, sigCollector) != collector) revert BadSignature();

        spent[digest] = true; // effect before interaction; kills replay

        uint256 lotId = _openLot(collector);
        batchId = batches.length;
        // Named fields, not positional: adding a field to the struct should be a
        // compile error here, not a silent shift of every value after it.
        batches.push(
            Batch({
                restaurant: restaurant,
                collector: collector,
                litres: litres,
                // casting to 'uint64' is safe because lotId only ever grows by one per lot
                // forge-lint: disable-next-line(unsafe-typecast)
                lotId: uint64(lotId),
                audited: false,
                failed: false,
                confirmed: false
            })
        );
        _lotBatches[lotId].push(batchId);
        lots[lotId].attestedLitres += litres;

        _requireBonded(collector, lotId);

        emit Attested(batchId, lotId, restaurant, litres, uint256(litres) * pricePerLitre);
        payToken.safeTransfer(restaurant, uint256(litres) * pricePerLitre);
    }

    /// @dev The bond is the only thing any slash can ever take. If it does not cover
    ///      the lot it secures, every enforcement path in this contract is decoration.
    ///      This is what makes depositBps load-bearing rather than declared.
    function _requireBonded(address collector, uint256 lotId) internal view {
        uint256 lotValue = uint256(lots[lotId].attestedLitres) * pricePerLitre;
        if (deposit[collector] * 10_000 < lotValue * depositBps) revert UnderBonded();
    }

    function _openLot(address collector) internal returns (uint256 lotId) {
        uint256 marker = openLotOf[collector];
        if (marker != 0) return marker - 1;
        lotId = lots.length;
        // Push empty and set the one non-zero field. Nothing to keep in sync when the
        // struct grows.
        lots.push();
        lots[lotId].collector = collector;
        openLotOf[collector] = lotId + 1;
    }

    // --- settlement ---------------------------------------------------------

    function sealLot() external returns (uint256 lotId) {
        return _seal(msg.sender);
    }

    /// @notice Force-seal a collector's open lot. Without this the collector holds a
    ///         veto over their own enforcement: settleLot and drawAudit both require a
    ///         sealed lot, so a collector who has just inflated one simply never seals,
    ///         the restaurants stay paid, and neither mechanism ever runs.
    function sealLotOf(address collector) external onlyOwner returns (uint256 lotId) {
        return _seal(collector);
    }

    function _seal(address collector) internal returns (uint256 lotId) {
        uint256 marker = openLotOf[collector];
        if (marker == 0) revert LotNotReady();
        lotId = marker - 1;
        lots[lotId].isSealed = true;
        openLotOf[collector] = 0;
        emit LotSealed(lotId, lots[lotId].attestedLitres);
    }

    /// @notice The plant signs for what physically arrived. The sum of attested
    ///         batches may not exceed it beyond tolerance; the gap is slashed from
    ///         the collector's bond, never from investor funds.
    ///
    /// The weight is a SIGNED figure from a registered plant, not an argument the
    /// operator supplies. Without that, the party running the mass balance also
    /// chooses the number it is checked against — which is the ISCC failure this
    /// project exists to attack, rebuilt with a nicer database.
    function settleLot(uint256 lotId, uint64 receivedLitres, uint256 deadline, bytes calldata sigPlant)
        external
        onlyOwner
    {
        Lot storage lot = lots[lotId];
        // Distinct errors: an unsealed lot is not the same problem as a settled one,
        // and conflating them sent a caller looking in the wrong place.
        if (!lot.isSealed) revert LotNotReady();
        if (lot.settled) revert LotClosed();
        if (block.timestamp > deadline) revert Expired();

        address plant = ECDSA.recover(
            _hashTypedDataV4(keccak256(abi.encode(RECEIPT_TYPEHASH, lotId, receivedLitres, deadline))), sigPlant
        );
        if (!isPlant[plant]) revert NotRegistered();

        lot.plant = plant;
        lot.receivedLitres = receivedLitres;
        lot.settled = true;

        uint256 allowed = (uint256(receivedLitres) * (10_000 + toleranceBps)) / 10_000;
        uint256 slashed;
        if (lot.attestedLitres > allowed) {
            uint256 shortfall = uint256(lot.attestedLitres) - allowed;
            slashed = _slash(lot.collector, shortfall * pricePerLitre);
        }
        emit LotSettled(lotId, receivedLitres, slashed);
    }

    // --- audit --------------------------------------------------------------

    /// @notice Draw the audit sample. Called only after the lot is sealed, so the
    ///         collector cannot know in advance which pickups will be challenged.
    function drawAudit(uint256 lotId) external onlyOwner returns (uint256[] memory sampled) {
        Lot storage lot = lots[lotId];
        if (!lot.isSealed) revert LotNotReady();
        // Once only. Without this the drawer redraws until the sample flags whatever
        // it wants, and "the collector cannot know what will be challenged" becomes
        // "the owner can challenge everything".
        if (lot.drawn) revert AlreadyDrawn();

        uint256 n = _lotBatches[lotId].length;
        if (n == 0) revert NothingToAudit();

        uint256 k = (n * sampleBps + 9_999) / 10_000; // ceil
        if (k < MIN_SAMPLE) k = MIN_SAMPLE; // a sample of one deters nothing
        if (k > n) k = n;

        uint256 seed = _seed();
        lot.seed = seed;
        lot.drawn = true;
        lot.drawnAt = uint64(block.timestamp);

        // Partial Fisher-Yates over a memory copy: sampling WITHOUT replacement, so
        // k draws really do cover k distinct batches. With replacement, a 3-of-3 draw
        // could land on the same batch three times — worst exactly where the lot is
        // smallest and deterrence is already weakest.
        uint256[] memory pool = _lotBatches[lotId];
        sampled = new uint256[](k);
        for (uint256 i; i < k; ++i) {
            uint256 j = i + (uint256(keccak256(abi.encode(seed, i))) % (n - i));
            (pool[i], pool[j]) = (pool[j], pool[i]);
            sampled[i] = pool[i];
            batches[pool[i]].audited = true;
        }
        emit AuditDrawn(lotId, seed, sampled);
    }

    /// @dev HIP-351 pseudorandom seed. `0x169` exists only on Hedera.
    /// ponytail: fall back to prevrandao so the suite runs on anvil/forge. The
    /// fallback is unusable for real deterrence — Hedera deploys must hit 0x169.
    function _seed() internal returns (uint256) {
        (bool ok, bytes memory out) = address(0x169).call(abi.encodeWithSignature("getPseudorandomSeed()"));
        if (ok && out.length >= 32) return abi.decode(out, (uint256));
        return block.prevrandao;
    }

    /// @notice A sampled restaurant failed to confirm its pickup. The collector loses
    ///         the ENTIRE bond, not a proportion of it.
    ///
    /// Why the whole bond: any fine set to an unbiased extrapolation of the sample
    /// gives EV(cheat) = 0 by construction, and the earlier `lotValue · sampleBps`
    /// rule was strictly positive-EV — a caught cheat forfeited a bond worth twice
    /// what it stole, while an uncaught one kept everything. Deterrence needs the
    /// downside to dominate the upside, which means burning the bond and sizing the
    /// bond above any theft the mass-balance check would let through.
    function flagAudit(uint256 batchId) external onlyOwner {
        Batch storage b = batches[batchId];
        if (!b.audited || b.failed) revert NotSampled();
        // A restaurant that answered cannot be flagged. This is what makes the
        // challenge a defence rather than a formality.
        if (b.confirmed) revert AlreadyConfirmed();
        // And it must have had time to answer. Flagging the instant the sample is
        // drawn would let the operator fine anyone it liked.
        if (block.timestamp <= lots[b.lotId].drawnAt + challengeWindow) revert ChallengeOpen();

        b.failed = true;
        emit AuditFailed(batchId, _slash(b.collector, type(uint256).max));
    }

    /// @notice A sampled restaurant confirms the pickup really happened, with its own
    ///         signature. Gasless: anyone may relay it, exactly like `attest`.
    ///
    /// This is the leg that makes "the restaurants are the check on TURMOIL" true.
    /// Before it existed, `flagAudit` was an unsigned assertion by the operator and a
    /// restaurant could neither prove it had confirmed nor dispute a false flag.
    function confirmBatch(uint256 batchId, uint256 deadline, bytes calldata sigRestaurant) external {
        if (block.timestamp > deadline) revert Expired();
        Batch storage b = batches[batchId];
        if (!b.audited) revert NotSampled();
        if (b.confirmed) revert AlreadyConfirmed();

        address signer = ECDSA.recover(
            _hashTypedDataV4(keccak256(abi.encode(CONFIRM_TYPEHASH, batchId, deadline))), sigRestaurant
        );
        if (signer != b.restaurant) revert BadSignature();

        b.confirmed = true;
        emit BatchConfirmed(batchId, signer);
    }

    function _slash(address collector, uint256 amount) internal returns (uint256 taken) {
        uint256 bal = deposit[collector];
        taken = amount > bal ? bal : amount;
        deposit[collector] = bal - taken;
        emit DepositChanged(collector, deposit[collector]);
    }

    // --- views --------------------------------------------------------------

    function lotBatches(uint256 lotId) external view returns (uint256[] memory) {
        return _lotBatches[lotId];
    }

    function batchCount() external view returns (uint256) {
        return batches.length;
    }

    function lotCount() external view returns (uint256) {
        return lots.length;
    }

    /// @dev Pure with respect to chain state — no nonce lookup — so the collector's app
    ///      can build a QR without a round trip, and two QRs can be live at once.
    function batchDigest(address restaurant, address collector, uint64 litres, bytes32 ref, uint256 deadline)
        external
        view
        returns (bytes32)
    {
        return _hashTypedDataV4(
            keccak256(abi.encode(BATCH_TYPEHASH, restaurant, collector, litres, ref, deadline))
        );
    }

    function receiptDigest(uint256 lotId, uint64 receivedLitres, uint256 deadline) external view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(RECEIPT_TYPEHASH, lotId, receivedLitres, deadline)));
    }

    function confirmDigest(uint256 batchId, uint256 deadline) external view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(CONFIRM_TYPEHASH, batchId, deadline)));
    }
}
