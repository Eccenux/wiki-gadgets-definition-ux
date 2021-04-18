/*
 * Adds links to gadget definitions in [[MediaWiki:Gadgets-definition]] and
 * prettifies them by adding whitespace.
 * Adds anchors to gadget definitions as well as CSS to highlight them when we
 * click a link to them.
 *
 * Can be loaded with the following code:
mw.loader.load("//en.wiktionary.org/w/index.php?title=User:Erutuon/scripts/gadgets-definition.js&action=raw&ctype=text/javascript");
 *
 */

/* jshint boss: true, undef: true, unused: true */
/* globals $, mw */

(function gadgetsDefinitionIIFE () {
"use strict";

// Only operate on [[MediaWiki:Gadgets-definition]] when the text is visible.
if (!(mw.config.get("wgCanonicalNamespace") == "MediaWiki"
&& mw.config.get("wgTitle") === "Gadgets-definition"
&& document.querySelector(".mw-parser-output")))
	return;

mw.loader.using("mediawiki.util", function () {
	// Highlight a gadget's definition when we follow a link to it.
	mw.util.addCSS("li:target { \
		border: solid 1px lightgreen; \
		padding: 0.1em 0.3em; \
		background-color: #eee; \
	}");
});

// Technique gleaned from [[w:fr:Utilisateur:Od1n/AddLinksGadgetsDefinition.js]].
// This anchor element is used to generate links and is not attached to the document.
var link = document.createElement("a");
function makeLink(href, text) {
	link.href = href;
	link.textContent = text;
	return link.outerHTML;
}

function makeWikilink(page, text) {
	return makeLink(mw.util.getUrl(page), text || page);
}

function linkGadgetSource(sourcePage) {
	return makeWikilink("MediaWiki:Gadget-" + sourcePage, sourcePage);
}

function linkGadgetAnchor(gadgetName, text) {
	return makeLink("#" + makeGadgetId(gadgetName), text || gadgetName);
}

var gadgetNameRegex = /^(\s*)([\w_-]+)\s*/;
function getGadgetName(innerHTML) {
	var match = gadgetNameRegex.exec(innerHTML);
	return match ? match[2] : null;
}

function makeGadgetId(gadgetName) {
	return "Gadget-" + gadgetName;
}

function processGadgetDefinition(innerHTML) {
	return innerHTML
		// link gadget name to system message page and add space after it
		.replace(gadgetNameRegex,
			function (wholeMatch, whitespace, gadgetName) {
				return whitespace
					+ linkGadgetSource(gadgetName)
					+ " ";
			})
		.replace(/([\w_\-.]+\.(?:css|js))/g, linkGadgetSource) // link script names
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
							if (gadgetName)
								return linkGadgetAnchor(gadgetName[1], dependency);
							else
								return makeWikilink("mw:ResourceLoader/Core modules#" + dependency, dependency);
						});
						break;
					case "rights":
						key = makeWikilink("mw:Manual:User_rights#List_of_permissions", key);
						break;
					case "skins": {
						var skinNames = mw.config.get('wgAvailableSkins');
						if (skinNames) {
							splitValue = splitValue.map(function (skin) {
								return skinNames[skin]
									? makeWikilink("mw:Skin:" + skinNames[skin], skin)
									: skin;
							});
						}
						break;
					}
					case "peers":
						splitValue = splitValue.map(linkGadgetAnchor);
					
				}
				return key + " = " + splitValue.join(", ");
			});
}

$(function () {
	var $parserOutput = $(".mw-parser-output");
	
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
});

})(); // IIFE