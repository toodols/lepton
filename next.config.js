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
		config.experiments = { topLevelAwait: true, layers: true };
		return config;
	},
};
export default config;
