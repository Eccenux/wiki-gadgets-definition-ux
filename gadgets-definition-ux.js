(function gadgetsDefinitionIIFE () {
"use strict";

// Link the names of the JavaScript and CSS pages in [[MediaWiki:Gadgets-definition]].
function linkifyGadgetDefinition(innerHTML) {
	return innerHTML.replace(/([\w_-]+\.(?:css|js))/g,
		"<a href='//en.wiktionary.org/wiki/MediaWiki:Gadget-$1'>$1</a>");
}

var $gadgetsDefinitionContent = $(".page-MediaWiki_Gadgets-definition #mw-content-text");

// Handle gadget definitions in lists.
$gadgetsDefinitionContent.find("li").each(function (i, element) {
	element.innerHTML = linkifyGadgetDefinition(element.innerHTML);
});

// Handle gadget definitions in pre tags.
$gadgetsDefinitionContent.find("pre").each(function (i, element) {
	element.innerHTML = element.innerHTML.replace(/[^\n]+/g, linkifyGadgetDefinition);
});

})();