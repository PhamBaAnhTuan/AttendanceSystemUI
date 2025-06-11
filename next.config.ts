import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
// /** @type {import('next').NextConfig} */

// module.exports = {
// 	experimental: {
// 		serverActions: {
// 			bodySizeLimit: "10mb",
// 		},
// 	},
// 	typescript: {
// 		ignoreBuildErrors: true,
// 	},
// 	eslint: {
// 		ignoreDuringBuilds: true,
// 	},
// };
