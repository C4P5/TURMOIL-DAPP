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
    uint16 public sampleBps = 1000; // 10% of a lot's batches get audited
    uint16 public depositBps = 1000; // collector deposit = 10% of lot value

    mapping(address => bool) public isRestaurant;
    mapping(address => bool) public isCollector;
    mapping(address => uint256) public deposit; // collector => posted bond
    mapping(address => uint256) public nonces; // restaurant => next batch nonce

    struct Batch {
        address restaurant;
        address collector;
        uint64 litres;
        uint64 lotId;
        bool audited;
        bool failed;
    }

    struct Lot {
        address collector;
        uint64 attestedLitres;
        uint64 receivedLitres;
        bool isSealed;
        bool settled;
        uint256 seed;
    }

    Batch[] public batches;
    Lot[] public lots;
    mapping(address => uint256) public openLotOf; // collector => lotId+1, 0 = none
    mapping(uint256 => uint256[]) internal _lotBatches;

    bytes32 private constant BATCH_TYPEHASH =
        keccak256("Batch(address restaurant,address collector,uint64 litres,uint256 nonce,uint256 deadline)");

    event Attested(uint256 indexed batchId, uint256 indexed lotId, address restaurant, uint64 litres, uint256 paid);
    event LotSealed(uint256 indexed lotId, uint64 attestedLitres);
    event LotSettled(uint256 indexed lotId, uint64 receivedLitres, uint256 slashed);
    event AuditDrawn(uint256 indexed lotId, uint256 seed, uint256[] sampled);
    event AuditFailed(uint256 indexed batchId, uint256 fine);
    event DepositChanged(address indexed collector, uint256 balance);

    error NotRegistered();
    error BadSignature();
    error Expired();
    error LotClosed();
    error LotNotReady();
    error NothingToAudit();

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
    function attest(
        address restaurant,
        address collector,
        uint64 litres,
        uint256 deadline,
        bytes calldata sigRestaurant,
        bytes calldata sigCollector
    ) external nonReentrant returns (uint256 batchId) {
        if (block.timestamp > deadline) revert Expired();
        if (!isRestaurant[restaurant] || !isCollector[collector]) revert NotRegistered();
        require(litres > 0, "zero litres");

        uint256 nonce = nonces[restaurant];
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(BATCH_TYPEHASH, restaurant, collector, litres, nonce, deadline))
        );
        if (ECDSA.recover(digest, sigRestaurant) != restaurant) revert BadSignature();
        if (ECDSA.recover(digest, sigCollector) != collector) revert BadSignature();

        nonces[restaurant] = nonce + 1; // effect before interaction; kills replay

        uint256 lotId = _openLot(collector);
        batchId = batches.length;
        // casting to 'uint64' is safe because lotId only ever grows by one per lot
        // forge-lint: disable-next-line(unsafe-typecast)
        batches.push(Batch(restaurant, collector, litres, uint64(lotId), false, false));
        _lotBatches[lotId].push(batchId);
        lots[lotId].attestedLitres += litres;

        uint256 pay = uint256(litres) * pricePerLitre;
        emit Attested(batchId, lotId, restaurant, litres, pay);
        payToken.safeTransfer(restaurant, pay);
    }

    function _openLot(address collector) internal returns (uint256 lotId) {
        uint256 marker = openLotOf[collector];
        if (marker != 0) return marker - 1;
        lotId = lots.length;
        lots.push(Lot(collector, 0, 0, false, false, 0));
        openLotOf[collector] = lotId + 1;
    }

    // --- settlement ---------------------------------------------------------

    function sealLot() external returns (uint256 lotId) {
        uint256 marker = openLotOf[msg.sender];
        if (marker == 0) revert LotNotReady();
        lotId = marker - 1;
        lots[lotId].isSealed = true;
        openLotOf[msg.sender] = 0;
        emit LotSealed(lotId, lots[lotId].attestedLitres);
    }

    /// @notice The plant reports what physically arrived. The sum of attested
    ///         batches may not exceed it beyond tolerance; the gap is slashed from
    ///         the collector's deposit, never from investor funds.
    function settleLot(uint256 lotId, uint64 receivedLitres) external onlyOwner {
        Lot storage lot = lots[lotId];
        if (!lot.isSealed || lot.settled) revert LotClosed();

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

        uint256[] storage ids = _lotBatches[lotId];
        uint256 n = ids.length;
        if (n == 0) revert NothingToAudit();

        uint256 k = (n * sampleBps + 9_999) / 10_000; // ceil, always >= 1
        uint256 seed = _seed();
        lot.seed = seed;

        sampled = new uint256[](k);
        for (uint256 i; i < k; ++i) {
            // ponytail: sampling with replacement. Collisions only reduce coverage,
            // never bias which batch can be picked. Swap for Fisher-Yates if k/n grows.
            uint256 pick = ids[uint256(keccak256(abi.encode(seed, i))) % n];
            batches[pick].audited = true;
            sampled[i] = pick;
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

    /// @notice A sampled restaurant failed to confirm its pickup. The collector is
    ///         fined as if `sampleBps` of the whole lot were fabricated — the same
    ///         rate we sampled at. Faking a slice risks the entire deposit.
    function flagAudit(uint256 batchId) external onlyOwner {
        Batch storage b = batches[batchId];
        require(b.audited && !b.failed, "not sampled");
        b.failed = true;

        uint256 lotValue = uint256(lots[b.lotId].attestedLitres) * pricePerLitre;
        uint256 fine = (lotValue * sampleBps) / 10_000;
        emit AuditFailed(batchId, _slash(b.collector, fine));
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

    function batchDigest(address restaurant, address collector, uint64 litres, uint256 deadline)
        external
        view
        returns (bytes32)
    {
        return _hashTypedDataV4(
            keccak256(abi.encode(BATCH_TYPEHASH, restaurant, collector, litres, nonces[restaurant], deadline))
        );
    }
}
