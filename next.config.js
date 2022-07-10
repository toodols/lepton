/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	experimental: {
		reactRoot: true,
		images: {
			layoutRaw: true,
		},
	},
	images: {
		domains: ["cdn.discordapp.com"],
	},
	webpack: (config) => {
		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
			topLevelAwait: true,
		};
		return config;
	},
};
export default config;
