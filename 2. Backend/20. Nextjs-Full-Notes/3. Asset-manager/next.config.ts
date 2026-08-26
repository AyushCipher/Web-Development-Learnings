import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // next/image optimizes and serves images through Next's own image
  // endpoint, but it refuses to do that for external hosts unless they're
  // explicitly allow-listed (a security measure against abuse via
  // arbitrary remote URLs). Every <Image src={asset.fileUrl}> in this app
  // (gallery cards, asset grids, the purchase page, admin approval) points
  // at a Cloudinary URL, so Cloudinary's host has to be listed here or
  // next/image would throw at render time. (`domains` is the older,
  // simpler form of this config - `images.remotePatterns` is the more
  // precise modern replacement.)
  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
