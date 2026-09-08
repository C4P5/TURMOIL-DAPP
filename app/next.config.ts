import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The home directory is itself a git repo with its own package-lock.json, so
  // Next infers the wrong workspace root and warns. Pin it to this app.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
