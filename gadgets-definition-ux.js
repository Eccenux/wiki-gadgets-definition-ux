/*
 * Add links to gadget definitions in [[MediaWiki:Gadgets-definition]] and
 * prettify them by adding whitespace.
 */

(function gadgetsDefinitionIIFE () {
"use strict";

if (mw.config.get("wgPageName") !== "MediaWiki:Gadgets-definition")
	return;

// Avoid mangling history page or making editor uneditable.
if ([ "view", "edit", "submit" ].indexOf(mw.config.get("wgAction")) === -1)
	return;

mw.loader.using("mediawiki.util", function () {
mw.util.addCSS("li:target { border: solid 1px lightgreen; background-color: #eee; }");

// Technique gleaned from [[w:fr:Utilisateur:Od1n/AddLinksGadgetsDefinition.js]].
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
		.replace(gadgetNameRegex,  // link gadget name to system message page and add space after it
			function (wholeMatch, whitespace, gadgetName) {
				return whitespace
					+ linkGadgetSource(gadgetName)
					+ " ";
			})
		.replace(/([\w_-]+\.(?:css|js))/g, linkGadgetSource) // link script names
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
				var regex = /\s*,\s*/g;
				if (!(key === "dependencies" || key === "rights" || key === "skins" || key === "peers"))
					return key + " = " + value.replace(regex, ", ");
				
				var splitValue = value.split(regex), newValue;
				if (key === "dependencies") {
					splitValue = splitValue.map(function (dependency) {
						var match;
						if ((match = /^ext\.gadget\.(.+)$/.exec(dependency)) !== null) {
							return linkGadgetAnchor(match[1], dependency);
						} else {
							return makeWikilink("mw:ResourceLoader/Core modules#" + dependency, dependency);
						}
						return dependency;
					});
				} else if (key === "rights") {
					key = makeWikilink("mw:Manual:User_rights#List_of_permissions", key);
				} else if (key === "skins") {
					var skinNames = mw.config.get('wgAvailableSkins');
					splitValue = splitValue.map(function (skin) {
						return skinNames[skin]
							? makeWikilink("mw:Skin:" + skinNames[skin], skin)
							: skin;
					});
				} else if (key === "peers") {
					splitValue = splitValue.map(linkGadgetAnchor);
				}
				return key + " = " + splitValue.join(", ");
			});
}

var $gadgetsDefinitionContent = $(".page-MediaWiki_Gadgets-definition .mw-parser-output");

// Process gadget definitions in lists.
$gadgetsDefinitionContent.find("li").each(function (i, element) {
	var gadgetName = getGadgetName(element.innerHTML);
	element.innerHTML = processGadgetDefinition(element.innerHTML);
	if (gadgetName)
		element.id = makeGadgetId(gadgetName);
});

// Process gadget definitions in pre tags.
$gadgetsDefinitionContent.find("pre").each(function (i, element) {
	element.innerHTML = element.innerHTML.replace(/[^\n]+/g, processGadgetDefinition);
});
	
}); // mw.loader.using

})(); // IIFE