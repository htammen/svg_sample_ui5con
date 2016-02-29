jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"de/tammenit/svg/ui5con/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"de/tammenit/svg/ui5con/test/integration/pages/Worklist",
		"de/tammenit/svg/ui5con/test/integration/pages/Object",
		"de/tammenit/svg/ui5con/test/integration/pages/NotFound",
		"de/tammenit/svg/ui5con/test/integration/pages/Browser",
		"de/tammenit/svg/ui5con/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "de.tammenit.svg.ui5con.view."
	});

	sap.ui.require([
		"de/tammenit/svg/ui5con/test/integration/WorklistJourney",
		"de/tammenit/svg/ui5con/test/integration/ObjectJourney",
		"de/tammenit/svg/ui5con/test/integration/NavigationJourney",
		"de/tammenit/svg/ui5con/test/integration/NotFoundJourney",
		"de/tammenit/svg/ui5con/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});