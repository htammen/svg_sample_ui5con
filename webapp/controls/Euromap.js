sap.ui.define(["sap/ui/layout/VerticalLayout"], function(Control) {

	/**
	 * Constructor
	 *
	 */
	return Control.extend("de.tammenit.svg.ui5con.controls.Euromap", (function() {
		var that;
		/** contains the data that has to be rendered */
		var chartData;

		function init() {
			that = this;
		}

		/**
		 * Provides the properties and events of the control DataTile
		 */
		function getMetadata() {
			return {
				properties: {
					"title": {
						type: "string",
						defaultValue: ""
					},
					"subTitle": {
						type: "string",
						defaultValue: ""
					},
					"dataPath": {
						type: "string"
					}
				},
				events: {}
			};
		}
		
		/**
		 * Renders the control based on the properties.
		 *
		 * @param oRm
		 * @param oControl
		 */
		function renderer(oRm, oControl) {
			oRm.write("<h2>" + oControl.getTitle() + "</h2>");
			oRm.write("<h3>" + oControl.getSubTitle() + "</h2>");

			oRm.write('<div id="euromapContainer" class="sapUiSmallMargin">');
			var modulePath = jQuery.sap.getModulePath("de.tammenit.svg.ui5con.svg");
			var oSVG = jQuery.sap.syncGetText(modulePath + "/europemap.svg");
			oRm.write(oSVG.data);
			// Creative common License of the graphic
			oRm.write('<div style="font-size:9px;">Graphic by <a href="https://commons.wikimedia.org/wiki/User:Amibreton" target="blank">Amibreton</a>, ' +
						'License: <a href="https://creativecommons.org/licenses/by-sa/2.5/deed.en" target="blank">CC by-sa-2.5</a>, ' +
						'you can find the original <a href="https://commons.wikimedia.org/wiki/File:Blank_map_of_Europe_EU27_iso3166-1_code.svg" target="blank">here</a><div>');
			oRm.write('</div>');
		
			// After the static svg part has been created read the data from the OData service and expand the SVG	
			oControl.getModel().read(
				oControl.getDataPath(), {
					success: function(_readData) {
						oControl.chartData = _readData;
						that._renderSVG();
					},
					error: function(err) {
						console.log(err);
					}
				}
			);
			
		}

		/**
		 * Renders the SVG. Read here https://bost.ocks.org/mike/bar/3/ to understand what happens here
		 */
		function _renderSVG() {
			var range = colorbrewer.Reds[9];
			
			// define a color scale to change the color of a country according to number of attendees
			var colorScale = d3.scale.linear()
				.domain([0, 1, 2, 3, 5, 10, 20, 50]) // change color at this values
				.range(range);

			// set the color and tooltip for each country in the chartData read from the backend 
			this.chartData.results.forEach(function(country) {
				var countryTag = d3.select("#" + country.code);
			 	countryTag.style("fill", "#CDCDCD")   // set fill color of the country initially to gray
			 				// change the color slowly to the color that corresponds to the quantity (Wow!!!) 
			 				.transition().duration(5000).style("fill", colorScale(country.quantity)) 
		 					.style("stroke", "black"); // the border is painted in black

				// set a tooltip for each country		 		
				countryTag.selectAll("title").data([1])
					.enter()
						.append("title")
							.text(country.quantity + " fellows from " + country.name + " are here.");

				// 
			 	if(country.quantity === 0) {
			 		countryTag.style("opacity", 1) 
			 					.style("stroke", "white")
						 		.transition().duration(5000)
						 			.style("opacity", 0.2)
						 			.style("stroke", "black"); 
			 	}
			});
		}

		/**
		 * Sets the height of the control to the height of the window - 250.
		 * The new height is set at the #plantViewContainer div element that wraps the svg graphic
		 * @private
		 */
		function _setControlHeight() {
			var newHeight = jQuery(window).height() - 250;
			jQuery('#euromapContainer').height(newHeight);
		}

		function onAfterRendering() {
			_setControlHeight();
			jQuery(window).resize(_setControlHeight);
		}
		return {
			init: init,
			metadata: getMetadata(),
			renderer: renderer,
			_renderSVG: _renderSVG,
			onAfterRendering: onAfterRendering
		};
	}()));
}, true);