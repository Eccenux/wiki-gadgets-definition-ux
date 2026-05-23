/*
 * Adds links to gadget definitions in [[MediaWiki:Gadgets-definition]] and
 * prettifies them by adding whitespace.
 * Adds anchors to gadget definitions as well as CSS to highlight them when we
 * click a link to them.
 *
 * Source (forked in December 2023):
 * https://en.wiktionary.org/w/index.php?title=User:Erutuon/scripts/gadgets-definition.js
 *
 * Common history of changes and source:
 * https://github.com/Eccenux/wiki-gadgets-definition-ux
 */
/* global $ */
(function gadgetsDefinitionIIFE () {
	"use strict";

	// Only operate on [[MediaWiki:Gadgets-definition]] when the text is visible.
	if (!(mw.config.get("wgCanonicalNamespace") == "MediaWiki"
	&& mw.config.get("wgTitle") === "Gadgets-definition"
	&& document.querySelector(".mw-parser-output")))
		return;

	// extra styles
	mw.loader.using("mediawiki.util", function () {
		mw.util.addCSS(`
			#mw-content-text {
				/* Highlight a gadget's definition when we follow a link to it. */
				li:target {
					border: solid 1px lightgreen;
					padding: 0.1em 0.3em;
					background-color: #eee;
				}
			}
			#gad-def-action-container,
			#gad-def-filter-container {
				display: flex;
				gap: .4em;
			}

			#gad-def-action-container {
				.u-button {
					padding: 4px 10px;
					border: 1px solid #a2a9b1;
					border-radius: 2px;
					background: #f8f9fa;
					color: #202122;
					font-size: 0.875rem;
					line-height: 1.28571429;
					cursor: pointer;
					transition: background .1s, border-color .1s;


					&:hover {
						background: #ffffff;
						border-color: #72777d;
					}
					&:active {
						background: #eaecf0;
						border-color: #72777d;
					}
					&:focus {
						outline: 2px solid #36c;
						outline-offset: -1px;
					}

					&.loading {
						opacity: .6;
						pointer-events: none;
						cursor: wait;
					}
				}
			}
		`);
	});

	if (!window.userNuViewFilterLoaded) {
		mw.loader.load("https://pl.wikipedia.org/w/index.php?action=raw&ctype=text/javascript&smaxage=21600&maxage=86400&title=Wikipedysta:Nux/ViewFilter.js");
	}

	// Technique gleaned from [[w:fr:Utilisateur:Od1n/AddLinksGadgetsDefinition.js]].
	// This anchor element is used to generate links and is not attached to the document.
	var link = document.createElement("a");
	function makeLink({href, text, classList = []}={}) {
		link.href = href;
		link.textContent = text;
		link.className = '';
		if (classList.length) {
			link.classList.add(...classList);
		}
		return link.outerHTML;
	}

	function makeWikilink({page, text='', classList = []}={}) {
		return makeLink({href:mw.util.getUrl(page), text: text || page, classList});
	}

	function linkGadgetSource({name, classList = ['u-gad-src-link']}={}) {
		return makeWikilink({page:"MediaWiki:Gadget-" + name, text:name, classList});
	}

	function linkGadgetAnchor({name, text='', classList = ['u-gad-anchor']}={}) {
		return makeLink({href:"#" + makeGadgetId(name), text:text || name, classList});
	}

	var gadgetNameRegex = /^(\s*)([\w_ -]+)\s*/;
	function getGadgetName(innerHTML) {
		var match = gadgetNameRegex.exec(innerHTML);
		return match ? match[2] : null;
	}

	function makeGadgetId(gadgetName) {
		return "Gadget-" + gadgetName.trim();
	}

	function processGadgetDefinition(innerHTML) {
		let isHidden = innerHTML.search(/[ |[\]]hidden[ |[\]]/) >= 0;
		return innerHTML
			// link gadget name to system message page and add space after it
			.replace(gadgetNameRegex,
				function (wholeMatch, whitespace, gadgetName) {
					gadgetName = gadgetName.trim();
					let codeName = gadgetName.replaceAll(' ', '_');
					let prefsUrl = makeWikilink({
						page:"Special:Preferences#mw-input-wpgadget-" + encodeURIComponent(codeName), 
						text:"⚙️",
						classList:['u-prefs-link'],
					});
					return whitespace
						+ linkGadgetSource({name:gadgetName, classList:['u-gad-desc-link']})
						+ (isHidden ? '' : ` (${prefsUrl})`)
						+ " "
					;
				})
			.replace(/([\w_\-.]+\.(?:css|js(?:on)?))/g, (a)=>linkGadgetSource({name:a})) // link script names
			.replace(/\s*\|\s*/g, " | ") // spaces around pipes
			
			/*
			 * process options
			 *
			 * Link dependencies: ext.gadget.name to entry on this page, others to
			 * [[mw:ResourceLoader/Core modules]] (even though not all have an entry
			 * there).
			 *
			 * Link peers to entry on this page.
			 *
			 * Link rights to [[mw:Manual:User_rights#List_of_permissions]]. There
			 * are unfortunately no anchors for individual rights.
			 *
			 * Link skin names to page in Skin namespace on MediaWiki. This uses
			 * wgAvailableSkins so will probably fail if the skin has a
			 * MediaWiki:skinname-<name> page in the local wiki.
			 */
			.replace(/([a-z]+)\s*=\s*(.+?)(?=\s*[|\]])/g,
				function (wholeMatch, key, value) {
					var splitValue = value.split(/\s*,\s*/g);
					switch (key) {
						case "dependencies":
							splitValue = splitValue.map(function (dependency) {
								var gadgetName = /^ext\.gadget\.(.+)$/.exec(dependency);
								if (gadgetName) {
									let classList = ['u-dependency', 'u-gadget'];
									return linkGadgetAnchor({name:gadgetName[1], text:dependency, classList});
								}
								else {
									let classList = ['u-dependency', 'u-module'];
									return makeWikilink({page:"mw:ResourceLoader/Core modules#" + dependency, text:dependency, classList});
								}
							});
							break;
						case "rights": {
							let classList = ['u-user-right'];
							key = makeWikilink({page:"mw:Manual:User_rights#List_of_permissions", text:key, classList});
							break;
						}
						case "skins": {
							let skinNames = mw.config.get('wgAvailableSkins');
							if (skinNames) {
								splitValue = splitValue.map(function (skin) {
									let classList = ['u-skin'];
									return skinNames[skin]
										? makeWikilink({page:"mw:Skin:" + skinNames[skin], text:skin, classList})
										: skin;
								});
							}
							break;
						}
						case "peers": {
							// light deps see: https://www.mediawiki.org/wiki/Extension:Gadgets#Options
							let classList = ['u-peer', 'u-gadget'];
							splitValue = splitValue.map((v)=>linkGadgetAnchor({name:v, classList}));
						}
					}
					return key + " = " + splitValue.join(", ");
				});
	}

	/** Find actual parser output. */
	function findParserOutput(parserOutput) {
		// on preview page parserOutput from wikipage.content is not actually the content
		if (!parserOutput.classList.contains('mw-parser-output')) {
			let el = parserOutput.querySelector('.mw-parser-output');
			if (el) parserOutput = el;
		}
		return parserOutput;
	}

	let _ViewFilter = false;
	let listFilter = false;
	let contentReadyForFilter = false;
	function initFilter(parserOutput) {
		// remove the previous filter
		$('#gad-def-filter-container').remove();
		// add just before the content
		parserOutput = findParserOutput(parserOutput);
		parserOutput.insertAdjacentHTML("afterbegin", '<div id="gad-def-filter-container">');
		// init/re-init
		listFilter = new _ViewFilter();
		listFilter.init("#gad-def-filter-container", "#mw-content-text li");
	}

	function initActionBar(parserOutput) {
		if ($('#gad-def-action-container').length) {
			return;
		}
		// add just before the content
		parserOutput = findParserOutput(parserOutput);
		parserOutput.insertAdjacentHTML("afterbegin", '<div id="gad-def-action-container">');

		// action(s)
		let actionBar = document.querySelector("#gad-def-action-container");
		initLoadAction(actionBar);
	}
	// action: load and filter by actual descriptions
	function initLoadAction(actionBar) {
		const button = actionBar.insertAdjacentElement(
			"afterbegin",
			Object.assign(document.createElement("input"), {
				type: "button",
				className: "u-button",
				value: "Load desc.",
				title: "Load descriptions of gadgets",
			}),
		);
		button.addEventListener("click",()=>runLoadAction(button));
	}
	// load and filter by actual descriptions
	async function runLoadAction(button) {
		button.classList.add('loading');

		let gadgets = {}; // title=>{id, li, desc}
		let list = document.querySelectorAll('li:has(.u-gad-desc-link)');
		for (let li of list) {
			let title = li.querySelectorAll('.u-gad-desc-link').href.replace(/.+\/wiki\//, '');
			gadgets[title] = {
				title: title,
				id: li.id,
				li,
				desc:'',
			};
		}

		const chunkSize = 40;
		let titles = Object.keys(gadgets);
		let titleChunks = chunkArray(titles, chunkSize);
		for (const chunk of titleChunks) {
			await loadDescToGadgets(chunk, gadgets);
		}

		// TODO: update filter after load

		button.classList.remove('loading');
	}
	/**
	 * @typedef {Object} GadgetLoadDto
	 * @property {string} title
	 * @property {string} id
	 * @property {HTMLLIElement} li
	 * @property {string} desc
	 */
	/**
	 * Load desc to a list of gadgets.
	 * @param {string[]} titles
	 * @param {Object.<string, GadgetLoadDto>} gadgets
	 */
	async function loadDescToGadgets(titles, gadgets) {
		const api = new mw.Api();

		let response = await api.get({
			action: 'query',
			prop: 'revisions',
			rvprop: 'content',
			rvslots: 'main',
			formatversion: 2,
			titles: titles.join('|'),
		});

		for (let page of response.query.pages) {
			let title = page.title;
			let desc = page.revisions?.[0]?.slots?.main?.content;
			if (title in gadgets) {
				let gadget = gadgets[title];
				gadget.li.append(Object.assign(document.createElement("span"), {
					className: "u-desc",
					textContent: desc,
				}));
			} else {
				console.warn('Title is missing, different format?', title);
			}
		}
	}
	/**
	 * Split array into chunks.
	 *
	 * @template T
	 * @param {T[]} items
	 * @param {number} [chunkSize=40]
	 * @returns {T[][]}
	 */
	function chunkArray(items, chunkSize = 40) {
		const chunks = [];

		for (let i = 0; i < items.length; i += chunkSize) {
			chunks.push(items.slice(i, i + chunkSize));
		}

		return chunks;
	}

	// on-ready and on-ajax-load
	mw.hook( 'wikipage.content' ).add( function ( $parserOutput ) {	
		// Process gadget definitions in lists.
		$parserOutput.find("li").each(function (i, element) {
			// Add id so that gadget definitions can be highlighted when we click a link
			// to them.
			var gadgetName = getGadgetName(element.innerHTML);
			if (gadgetName)
				element.id = makeGadgetId(gadgetName);
			
			element.innerHTML = processGadgetDefinition(element.innerHTML);
		});
		
		// Process gadget definitions in pre tags.
		$parserOutput.find("pre").each(function (i, element) {
			element.innerHTML = element.innerHTML.replace(/[^\n]+/g, processGadgetDefinition);
		});

		initActionBar($parserOutput[0]);
		if (listFilter) {
			initFilter($parserOutput[0]);
		} else {
			contentReadyForFilter = $parserOutput[0];
		}
	});

	mw.hook('userjs.ViewFilter.loaded').add(function (ViewFilter) {
		_ViewFilter = ViewFilter;
		if (contentReadyForFilter) {
			initFilter(contentReadyForFilter);
		}
	});

})(); // IIFE