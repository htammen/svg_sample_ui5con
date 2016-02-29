sap.ui.define([
		"de/tammenit/svg/ui5con/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("de.tammenit.svg.ui5con.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);