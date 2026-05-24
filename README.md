# mw-gadgets-definition-ux

UX of the [[MediaWiki:Gadgets-definition|Gadgets-definition]].

Adds links to:

- gadget description;
- link to preferences;
- dependencies;
- scripts and styles of the gadget.

Additionally you have the ability to:

- filter lists of definitions:
	- you can find all gadgets using `oojs`
	- also filter in reverse (e.g. find not `hidden`)
	- can use regexp for filtering
	- keeps headers (only hides list)
- load and filter by actual descriptions:
	- there is a button to load descriptions
	- upon click descriptions are added to a page
	- updates filter so you can find gadget by human-descriptions

**Installation**:
1. Open and edit: https://meta.wikimedia.org/wiki/Special:MyPage/global.js
2. Add:
```js
// [[:en:Wikipedia:Gadgets-definition UX]]
// [[:pl:Wikipedia:Narzędzia/Gadgets-definition UX]]
mw.loader.load( 'https://meta.wikimedia.org/w/index.php?title=MediaWiki:Gadgets-definition-ux.js&action=raw&ctype=text/javascript' );
```

**Documentation and usage information**:
- English: https://en.wikipedia.org/wiki/Wikipedia:Gadgets-definition_UX
- Polish (*polski*): https://pl.wikipedia.org/wiki/Wikipedia:Narz%C4%99dzia/Gadgets-definition_UX

## Table of contents

<!-- TOC -->

- [Table of contents](#table-of-contents)
- [Requirements](#requirements)
- [Installation](#installation)
- [Linting](#linting)
- [Deployment](#deployment)
	- [Bot config](#bot-config)
	- [Run deployment](#run-deployment)
- [License](#license)

<!-- /TOC -->

## Requirements

- Node.js 20.19.0 or newer (mostly for the linter).
- A Wikimedia bot password configuration for deployment. You don't need a bot account though (bot password is just a token).

## Installation

```bash
npm ci
```

## Linting

Run ESLint:
```bash
npm run lint
```

## Deployment

Deployment is handled by `wikiploy.mjs` (defines destination projects) and `wikiploy-common.mjs` (defines files to deploy).

### Bot config

Before deploying, create a local bot config file:
```text
bot.config.mjs
```

This file is ignored by Git and should contain private credentials.

`wikiploy.mjs` imports it as:
```js
import * as botpass from './bot.config.mjs';
```

### Run deployment

```bash
node wikiploy-dev.mjs
node wikiploy.mjs
```

## License

Maciej Nux Jaros, Erutuon.

[CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/)