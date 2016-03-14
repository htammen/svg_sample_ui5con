sap.ui.define(["sap/ui/layout/VerticalLayout"], function(Control) {

	/**
	 * Constructor
	 *
	 */
	return Control.extend("de.tammenit.svg.ui5con.controls.Euromap", (function() {
		var that;

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
					}
				},
				aggregations: {
					// html-control as container for the SVG control 
					_html: {type: "sap.ui.core.HTML", multiple: false, visibility: "hidden"},
					// data aggregation storing the data-binding of this control
					data : { type : "sap.ui.core.Element" }
				},
				events: {}
			};
		}
		
		function init() {
			that = this;
			// create _html control as aggregation
			this._sContainerId = this.getId() + "--container";
			this.setAggregation("_html", new sap.ui.core.HTML({ content : "<div id='" + this._sContainerId + "' class='sapUiSmallMargin'></div>" }));
		}

		/**
		 * Renders the control based on the properties.
		 *
		 * @param oRm
		 * @param oControl
		 */
		function renderer(oRm, oControl) {
			oRm.write("<h2 style='text-align:center'>" + oControl.getTitle() + "</h2>");
			oRm.write("<h3 style='text-align:center'>" + oControl.getSubTitle() + "</h2>");

			// render the _html container control
			oRm.renderControl(oControl.getAggregation("_html"));
			// Creative common License of the graphic
			oRm.write('<div style="font-size:9px;">Graphic by <a href="https://commons.wikimedia.org/wiki/User:Amibreton" target="blank">Amibreton</a>, ' +
						'License: <a href="https://creativecommons.org/licenses/by-sa/2.5/deed.en" target="blank">CC by-sa-2.5</a>, ' +
						'you can find the original <a href="https://commons.wikimedia.org/wiki/File:Blank_map_of_Europe_EU27_iso3166-1_code.svg" target="blank">here</a><div>');
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

			// read the data from databinding into a flat array
			var chartData = this.getBinding("data").getContexts().map(function(oContext) {
				return oContext.getObject();
			});
			// set the color and tooltip for each country in the chartData read from the backend 
			chartData.forEach(function(country) {
				var countryTag = d3.select("#" + country.code);
				if(country.quantity != 0) {
				 	countryTag.style("fill", "#CDCDCD")   // set fill color of the country initially to gray
				 				// change the color slowly to the color that corresponds to the quantity (Wow!!!) 
				 				.transition().duration(5000).style("fill", colorScale(country.quantity)) 
					 			.style("opacity", 1.0)
			 					.style("stroke", "black"); // the border is painted in black
				} else {
					// set opacity of background color to 20% if no attendee is there for a country
			 		countryTag.style("opacity", 1)
			 					.style("fill", "#CDCDCD")
			 					.style("stroke", "white")
						 		.transition().duration(5000)
						 			.style("opacity", 0.2)
						 			.style("stroke", "black"); 
				}
				// set a tooltip for each country		 		
				var countrySel = countryTag.selectAll("title").data([1]);
				
				countrySel.enter()
						.append("title");
				countrySel.text(country.quantity + " fellows from " + country.name + " are here.");
			});
		}

		function onAfterRendering() {

			// if no svg-element currently exists we load the svg from a file and
			// add it to html-container.
			if(d3.select("svg").empty()) {
				// load the svg
				var modulePath = jQuery.sap.getModulePath("de.tammenit.svg.ui5con.svg");
				var oSVG = jQuery.sap.syncGetText(modulePath + "/europemap.svg");
				var domSVG = jQuery(oSVG.data);
				// ... and append it to the html container control
				d3.select("#" + this._sContainerId)
					.node().appendChild(domSVG[domSVG.length-1]);

				// watch the change event of the data-binding and call the _renderSVG function
				// on change
				this.getBinding("data").attachChange(function() {
					that._renderSVG();	
				});
			}
			
			_setControlHeight();
			jQuery(window).resize(_setControlHeight);
		}
		
		/**
		 * Sets the height of the control to the height of the window - 250.
		 * The new height is set at the #plantViewContainer div element that wraps the svg graphic
		 * @private
		 */
		function _setControlHeight() {
			var newHeight = jQuery(window).height() - 250;
			jQuery('#' + that._sContainerId).height(newHeight);
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