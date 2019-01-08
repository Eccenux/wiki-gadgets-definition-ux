/*
 * Prettify gadget definitions in [[MediaWiki:Gadgets-definition]] by adding
 * whitespace.
 */

(function gadgetsDefinitionIIFE () {
"use strict";

function processGadgetDefinition(innerHTML) {
	return innerHTML
		.replace(/([\w_-]+\.(?:css|js))/g, // link script names
			"<a href='//en.wiktionary.org/wiki/MediaWiki:Gadget-$1'>$1</a>")
		.replace(/^(\s*[\w_-]+)\s*/, "$1 ")  // space after gadget name
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

})();