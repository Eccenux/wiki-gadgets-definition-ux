/*
 * Add links to gadget definitions in [[MediaWiki:Gadgets-definition]] and
 * prettify them by adding whitespace.
 */

(function gadgetsDefinitionIIFE () {
"use strict";

// Avoid mangling history page.
if (![ "view", "edit", "submit" ].includes(mw.config.get("wgAction")))
	return;

mw.loader.using("mediawiki.util", function () {

// Technique gleaned from [[w:fr:Utilisateur:Od1n/AddLinksGadgetsDefinition.js]].
var link = document.createElement("a");
function makeWikilink(page, text) {
	link.href = mw.util.getUrl(page);
	link.textContent = text || page;
	return link.outerHTML;
}

var gadgetNameRegex = /^(\s*)([\w_-]+)\s*/;
function getGadgetName(innerHTML) {
	var match = gadgetNameRegex.exec(innerHTML);
	return match ? match[2] : null;
}

function processGadgetDefinition(innerHTML) {
	return innerHTML
		.replace(gadgetNameRegex,  // link gadget name to system message page and add space after it
			function (wholeMatch, whitespace, gadgetName) {
				return whitespace
					+ makeWikilink("MediaWiki:Gadget-" + gadgetName, gadgetName)
					+ " ";
			})
		.replace(/([\w_-]+\.(?:css|js))/g, // link script names
			function (scriptFile) {
				return makeWikilink("MediaWiki:Gadget-" + scriptFile, scriptFile);
			})
		.replace(/\s*\|\s*/g, " | ") // spaces around pipes
		.replace(/dependencies\s*=\s*(.+?)(?=\s*[|\]])/g, // spaces around commas in dependencies
			function (wholeMatch, dependencies) {
				return "dependencies = "
					+ dependencies.split(/\s*,\s*/g).map(function (dependency) {
						var match;
						if ((match = /^ext\.gadget\.(.+)$/.exec(dependency)) !== null) {
							link.href = mw.util.getUrl("MediaWiki:Gadget-" + match[1]);
							link.text = dependency;
							return link.outerHTML;
						} else {
							link.href = mw.util.getUrl("mw:ResourceLoader/Core modules#" + dependency);
							link.text = dependency;
							return link.outerHTML;
						}
						return dependency;
					}).join(", ");
			});
}

var $gadgetsDefinitionContent = $(".page-MediaWiki_Gadgets-definition #mw-content-text");

// Process gadget definitions in lists.
$gadgetsDefinitionContent.find("li").each(function (i, element) {
	gadgetName = getGadgetName(element.innerHTML);
	element.innerHTML = processGadgetDefinition(element.innerHTML);
	if (gadgetName)
		element.id = "Gadget-" + gadgetName;
});

// Process gadget definitions in pre tags.
$gadgetsDefinitionContent.find("pre").each(function (i, element) {
	element.innerHTML = element.innerHTML.replace(/[^\n]+/g, processGadgetDefinition);
});
	
}); // mw.loader.using

})(); // IIFE