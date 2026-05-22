import { DeployConfig } from 'wikiploy';

/**
 * Add config.
 * @param {Array} configs DeployConfig array.
 * @param {String} site Domian of a MW site.
 */
export function addConfig(configs, site, isRelease) {
	let deploymentName = isRelease ? 'MediaWiki:Gadgets-definition-ux' : '~/gadgets-definition-ux';
	configs.push(new DeployConfig({
		src: 'src/gadgets-definition-ux.js',
		dst: `${deploymentName}.js`,
		site,
		nowiki: true,
	}));
	// configs.push(new DeployConfig({
	// 	src: 'dist/gadgets-definition-ux.css',
	// 	dst: `${deploymentName}.css`,
	// 	site,
	// }));
}
export function addConfigRelease(configs, site) {
	addConfig(configs, site, true);
}
