/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	experimental: {
		images: {
			layoutRaw: true,
		},
	},
	images: {
		domains: ["cdn.discordapp.com"],
	},
	webpack: (config) => {
		config.experiments = {
			asyncWebAssembly: true,
			topLevelAwait: true, layers: true,
		};
		config.module.rules.push = {
			test: /\.wasm$/,
			type: "asset/inline",
		};
		return config;
	},
};
export default config;
