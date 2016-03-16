sap.ui.define(["sap/ui/layout/VerticalLayout", "sap/ui/thirdparty/d3"], function(Control, d3) {

	/**
	 * Constructor
	 *
	 */
	return Control.extend("de.tammenit.controls.svg.Map", (function() {
		var that;

		/**
		 * Provides the properties and events of the control DataTile
		 */
		function getMetadata() {
			return {
				properties: {
					/** Title that is displayed with an <h2> tag above the SVG graphic.
					 * Leave blank to disable 
					 */
					"title": {
						type: "string",
						defaultValue: ""
					},
					/** Subtitle. Displayed with an <h3> tag under the title.
					 * Leave blank to disable
					 */
					"subTitle": {
						type: "string",
						defaultValue: ""
					},
					/**
					 * This property defines the color palette from the `colorbrewer.js` file that is used. 
					 * Have a look into the file to see which palettes are available
					 */
					"colorpalette": {
						type: "string",
						defaultValue: "Reds"
					},
					/**
					 * This property defines at which value of `quantityPropertyName` the color changes to the next value of the `colorpalette`.
					 */
					"colorChangeValues": {
						type: "int[]"
					},
					/**
					 * This property defines the name of the SVG file. 
					 * You can use any SVG file you like with this control, even files that don't display a map. 
					 * It's only important that the file contains `ìd`s that match to the entities in the entityset.
					 */ 
					"svgFileName": {
						type: "string",
						defaultValue: ""
					},
					/**
					 * Set license information for your graphic if needed. You can create an Object with the 
					 * following properties and assign it to the license property
					 * <pre><code>
					 *	this.getView().byId('euromap').setLicense({
					 *		preText: "Graphic by",
					 *		owner: "Amibreton",
					 *		ownerLink: "https://commons.wikimedia.org/wiki/User:Amibreton",
					 *		licenseLink: "https://creativecommons.org/licenses/by-sa/2.5/deed.en",
					 *		licenseText: "CC by-sa-2.5",
					 *		srcPreText: "you can find the original",
					 *		srcLink: "https://commons.wikimedia.org/wiki/File:Blank_map_of_Europe_EU27_iso3166-1_code.svg",
					 *		srcText: "here"
					 *	});
					 * </code></pre>
					 */
					"license": {
						type: "Object"
					},
					/**
					 * This is the technical property that is used for resolving the DOM node in the SVG file. 
					 * For each entity of the entityset the value of this property is used to retrieve the according DOM node.  
					 * e.g.:  
					 * <pre><code>
					 *	<path
					 *		id="gb"
					 *		class="eu europe"
					 *		d="M 203.55368,395.07058 C 205.23859,396.38106 206.64268,397.12991 206.45547,383.27618 z "/>
					 * </code></pre>
					 * In this example the id of the SVG path is `gb` (for Great Britain). 
					 * In you entityset there must be an entity which `codePropertyName` value is also `gb`.
					 */
					"codePropertyName": {
						type: "string"
					},
					/**
					 * This is a numeric quantity value that is used for colorizing the svg path that was found 
					 * for the `codePropertyName` value. The higher the value the darker the color of this path.
					 */
					"quantityPropertyName": {
						type: "string"
					},
					/**
					 * This value is used for generating a tooltip for the svg path.
					 */
					"descriptionPropertyName": {
						type: "string"
					},
					"standardFillColor": {
						type: "string",
						defaultValue: "#CDCDCD"
					},
					"tooltipText1": {
						type: "string"
					},
					"tooltipText2": {
						type: "string"
					},
					"tooltipText3": {
						type: "string"
					}
				},
				aggregations: {
					// html-control as container for the SVG control 
					_html: {
						type: "sap.ui.core.HTML",
						multiple: false,
						visibility: "hidden"
					},
					// data aggregation storing the data-binding of this control
					data: {
						type: "sap.ui.core.Element"
					}
				},
				events: {}
			};
		}

		function init() {
			that = this;
			// create _html control as aggregation
			this._sContainerId = this.getId() + "--container";
			this.setAggregation("_html", new sap.ui.core.HTML({
				content: "<div id='" + this._sContainerId + "' class='sapUiSmallMargin'></div>"
			}));
		}

		/**
		 * Renders the control based on the properties.
		 *
		 * @param oRm
		 * @param oControl
		 */
		function renderer(oRm, oControl) {
			if (oControl.getTitle()) {
				oRm.write("<h2 style='text-align:center'>" + oControl.getTitle() + "</h2>");
			}
			if (oControl.getSubTitle()) {
				oRm.write("<h3 style='text-align:center'>" + oControl.getSubTitle() + "</h2>");
			}

			// render the _html container control
			oRm.renderControl(oControl.getAggregation("_html"));
			
			// show license information for the graphi or whatever
			if (oControl.getLicense()) {
				var licObj = oControl.getLicense();
				oRm.write(
					'<div style="font-size:9px;">' + licObj.preText + ' <a href= ' + licObj.ownerLink + ' target="blank">' + licObj.owner + '</a>, ' +
					'License: <a href=' + licObj.licenseLink + ' target="blank">' + licObj.licenseText + '</a>, ' +
					licObj.srcPreText + ' <a href=' + licObj.srcLink + ' target="blank">' + licObj.srcText + '</a><div>'
				);
			}
		}

		/**
		 * Renders the SVG. Read here https://bost.ocks.org/mike/bar/3/ to understand what happens here
		 */
		function _renderSVG() {
			var range = this.colorTheme[9];

			// define a color scale to change the color of a country according to number of attendees
			var colorScale = d3.scale.linear()
				.domain(this.getColorChangeValues()) // change color at this values
				.range(range);

			// read the data from databinding into a flat array
			var chartData = this.getBinding("data").getContexts().map(function(oContext) {
				return oContext.getObject();
			});
			// set the color and tooltip for each country in the chartData read from the backend 
			chartData.forEach(function(chartObj) {
				var countryTag = d3.select("#" + chartObj[this.getCodePropertyName()]);
				if (chartObj[this.getQuantityPropertyName()] != 0) {
					countryTag.style("fill", this.getStandardFillColor()) // set fill color of the country initially to gray
					// change the color slowly to the color that corresponds to the quantity (Wow!!!) 
					.transition().duration(5000).style("fill", colorScale(chartObj[this.getQuantityPropertyName()]))
						.style("opacity", 1.0)
						.style("stroke", "black"); // the border is painted in black
				} else {
					// set opacity of background color to 20% if no attendee is there for a country
					countryTag.style("opacity", 1)
						.style("fill", this.getStandardFillColor())
						.style("stroke", "white")
						.transition().duration(5000)
						.style("opacity", 0.2)
						.style("stroke", "black");
				}
				// set a tooltip for each country		 		
				var countrySel = countryTag.selectAll("title").data([1]);
				countrySel.enter()
					.append("title");
				countrySel.text(this.getTooltipText1() + chartObj[this.getQuantityPropertyName()] + this.getTooltipText2() + chartObj[this.getDescriptionPropertyName()] + this.getTooltipText3());
			}.bind(this));
		}

		function onAfterRendering() {

			// if no svg-element currently exists we load the svg from a file and
			// add it to html-container.
			if (d3.select("svg").empty()) {
				// load the svg, retrieve the svg file from a folder in the using project
				var componentName = sap.ui.core.Component.getOwnerComponentFor(this).getManifestObject().getComponentName();
				var modulePath = jQuery.sap.getModulePath(componentName);
				var oSVG = jQuery.sap.syncGetText(modulePath + "/" + this.getSvgFileName());
				var domSVG = jQuery(oSVG.data);
				// ... and append it to the html container control
				d3.select("#" + this._sContainerId)
					.node().appendChild(domSVG[domSVG.length - 1]);

				// retrieve the colortheme from the according control property
				this.colorTheme = colorbrewer[this.getColorpalette()];
				if (!this.colorTheme) {
					this.colorTheme = colorbrewer['Reds'];
				}

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