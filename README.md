# mw-gadgets-definition-ux

UX of the [[MediaWiki:Gadgets-definition|Gadgets-definition]].

Adds links to:

- gadget description;
- link to preferences;
- dependencies;
- scripts and styles of the gadget.

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

MIT, Maciej Nux Jaros, Erutuon.
