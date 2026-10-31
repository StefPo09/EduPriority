import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      { source: "/home", destination: "/" },
      { source: "/signup", destination: "/" },
      { source: "/login", destination: "/" },
      { source: "/requests/new", destination: "/" },
      { source: "/requests/:id", destination: "/" },
      { source: "/dashboard", destination: "/" },
      { source: "/calendar", destination: "/" },
      { source: "/home/calendar", destination: "/" },
      { source: "/materials", destination: "/" },
      { source: "/schedule", destination: "/" },
      { source: "/class", destination: "/" },
      { source: "/settings", destination: "/" },
      { source: "/export", destination: "/" },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
