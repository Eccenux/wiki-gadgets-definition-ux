/*
 * Add links to gadget definitions in [[MediaWiki:Gadgets-definition]] and
 * prettify them by adding whitespace.
 */

(function gadgetsDefinitionIIFE () {
"use strict";

// Avoid mangling history page or making editor uneditable.
if (mw.config.get("wgAction") !== "view")
	return;

mw.loader.using("mediawiki.util", function () {
mw.util.addCSS("li:target { border: solid 1px lightgreen; background-color: #eee; }");

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

function makeGadgetId(gadgetName) {
	return "Gadget-" + gadgetName;
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
		.replace(/([a-z]+)\s*=\s*(.+?)(?=\s*[|\]])/g, // spaces around commas in dependencies
			function (wholeMatch, key, value) {
				var regex = /\s*,\s*/g;
				if (!(key === "dependencies" || key === "rights" || key === "skins"))
					return key + " = " + value.replace(regex, ", ");
				
				var splitValue = value.split(regex), newValue;
				if (key === "dependencies") {
					splitValue = splitValue.map(function (dependency) {
						var match;
						if ((match = /^ext\.gadget\.(.+)$/.exec(dependency)) !== null) {
							link.href = "#" + makeGadgetId(match[1]);
							link.text = dependency;
							return link.outerHTML;
						} else {
							link.href = mw.util.getUrl("mw:ResourceLoader/Core modules#" + dependency);
							link.text = dependency;
							return link.outerHTML;
						}
						return dependency;
					});
				} else if (key === "rights") {
					link.href = mw.util.getUrl("mw:Manual:User_rights#List_of_permissions");
					link.text = "rights";
					key = link.outerHTML;
				} else if (key === "skins") {
					var skinNames = mw.config.get('wgAvailableSkins');
					splitValue = splitValue.map(function (skin) {
						if (skinNames[skin]) {
							link.href = mw.util.getUrl("mw:Skin:" + skinNames[skin]);
							link.text = skin;
							return link.outerHTML;
						}
						return skin;
					});
				}
				return key + " = " + splitValue.join(", ");
			});
}

var $gadgetsDefinitionContent = $(".page-MediaWiki_Gadgets-definition #mw-content-text");

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