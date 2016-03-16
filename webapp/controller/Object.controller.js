/*global location*/
sap.ui.define([
		"de/tammenit/svg/ui5con/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"de/tammenit/svg/ui5con/model/formatter"
	], function (BaseController, JSONModel, History, formatter) {
		"use strict";

		return BaseController.extend("de.tammenit.svg.ui5con.controller.Object", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0
					});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						// Restore original busy indicator delay for the object view
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler  for navigating back.
			 * It checks if there is a history entry. If yes, history.go(-1) will happen.
			 * If not, it will replace the current entry of the browser history with the worklist route.
			 * @public
			 */
			onNavBack : function() {
				var oHistory = History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();

				if (sPreviousHash !== undefined) {
					// The history contains a previous entry
					history.go(-1);
				} else {
					// Otherwise we go backwards with a forward history
					var bReplace = true;
					this.getRouter().navTo("worklist", {}, bReplace);
				}
			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				this.getView().byId('euromap').setLicense({
					preText: "Graphic by",
					owner: "Amibreton",
					ownerLink: "https://commons.wikimedia.org/wiki/User:Amibreton",
					licenseLink: "https://creativecommons.org/licenses/by-sa/2.5/deed.en",
					licenseText: "CC by-sa-2.5",
					srcPreText: "you can find the original",
					srcLink: "https://commons.wikimedia.org/wiki/File:Blank_map_of_Europe_EU27_iso3166-1_code.svg",
					srcText: "here"
				});
				
				this.getModel("objectView").setProperty("/busy", false);
			}

		});

	}
);