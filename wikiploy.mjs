/* eslint-disable no-unused-vars */
/**
 * Deploy to all.
 */
import {DeployConfig, Wikiploy, setupSummary } from 'wikiploy';

import * as botpass from './bot.config.mjs';
const ployBot = new Wikiploy(botpass);

// common deploy function(s)
import { addConfig } from './wikiploy-common.mjs';

// run asynchronously to be able to wait for results
(async () => {
	const configs = [];

    // https://meta.wikimedia.org/w/index.php?title=User:Nux/gadgets-definition-ux.js&action=history
	addConfig(configs, 'meta.wikimedia.org');
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