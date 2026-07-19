const openmrsConfig = require('@openmrs/rspack-config');

const createConfig = openmrsConfig.default ?? openmrsConfig;

module.exports = (env, argv = {}) => {
	const config = createConfig(env, argv);

	if ((argv.mode ?? process.env.NODE_ENV ?? 'development') !== 'production' && Array.isArray(config.plugins)) {
		config.plugins = config.plugins.filter((plugin) => plugin?.constructor?.name !== 'TsCheckerRspackPlugin');
	}

	return config;
};
