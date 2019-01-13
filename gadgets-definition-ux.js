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

function processGadgetDefinition(innerHTML) {
	return innerHTML
		.replace(/([\w_-]+\.(?:css|js))/g, // link script names
			function (scriptFile) {
				return makeWikilink("MediaWiki:Gadget-" + scriptFile, scriptFile);
			})
		.replace(/^(\s*)([\w_-]+)\s*/,  // link gadget name to system message page and add space after it
			function (wholeMatch, whitespace, gadgetName) {
				return whitespace
					+ makeWikilink("MediaWiki:Gadget-" + gadgetName, gadgetName)
					+ " ";
			})
		.replace(/\s*\|\s*/g, " | ") // spaces around pipes
		.replace(/dependencies\s*=\s*(.+?)(?=\s*[|\]])/g, // spaces around commas in dependencies
			function (wholeMatch, dependencies) {
				return "dependencies = " + dependencies.replace(
					/\s*,\s*/g, ", ");
			});
}

var $gadgetsDefinitionContent = $(".page-MediaWiki_Gadgets-definition #mw-content-text");

// Handle gadget definitions in lists.
$gadgetsDefinitionContent.find("li").each(function (i, element) {
	element.innerHTML = processGadgetDefinition(element.innerHTML);
});

// Handle gadget definitions in pre tags.
$gadgetsDefinitionContent.find("pre").each(function (i, element) {
	element.innerHTML = element.innerHTML.replace(/[^\n]+/g, processGadgetDefinition);
});
	
});

})();