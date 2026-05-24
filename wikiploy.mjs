/* eslint-disable no-unused-vars */

/**
 * Deploy to all (dev, release).
 */

import { DeployConfig, Wikiploy, setupSummary } from 'wikiploy';

import * as botpass from './bot.config.mjs';
const ployBot = new Wikiploy(botpass);

// common deploy function(s)
import { addConfig, addConfigRelease } from './wikiploy-common.mjs';

// run asynchronously to be able to wait for results
(async () => {
	const configs = [];

	/*
		dev/release diff:
		https://meta.wikimedia.org/wiki/Special:ComparePages?page1=MediaWiki%3AGadgets-definition-ux.js&rev1=&page2=User%3ANux%2Fgadgets-definition-ux.js&rev2=&action=&unhide=
	*/

	// dev:
	addConfig(configs, 'meta.wikimedia.org');
	// release:
	addConfigRelease(configs, 'meta.wikimedia.org');

	// custom summary
	let summary = 'change from Github'; // default
	let version = '';
	await setupSummary(ployBot, version, summary); // get from cli

	// deploy
	await ployBot.deploy(configs);
})().catch(err => {
	console.error(err);
	process.exit(1);
});