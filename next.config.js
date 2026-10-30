/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product photos are stored as URLs (Cloudinary, Unsplash for the seed
    // data). Add any other host product images come from here.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;
