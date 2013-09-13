define(['provoda', 'spv', 'jquery', 'leaflet', './RunMapCtr'], function(provoda, spv, $, L, RunMapCtr) {
"use strict";
var GeoMapCtr = function() {};
provoda.View.extendTo(GeoMapCtr, {
	children_views:{
		run_map: RunMapCtr,
		
	},
	'collch-run_map': true,
	bindBase: function() {
		//this.c = this.parent_view.tpl.ancs['map-con'];
		// create a map in the "map" div, set the view to a given place and zoom
		/*
		this.map = L.map(this.c[0], {zoomControl:false }).setView([51.505, -0.09], 13);

		this.map.doubleClickZoom.disable();
		this.map.dragging.disable();
		//this.map.zooming.disable();
		//{trackResize: true}

		// add an OpenStreetMap tile layer
		L.tileLayer('http://c.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png', {
			minZoom: 13,
			maxZoom:13,
			attribution: '<a href="http://www.mapbox.com/about/maps/">Terms & Feedback</a>',
		}).addTo(this.map);

		this.wch(this, 'vis_con_appended', function(e) {
			if (e.value){
				this.createDD();
			}
			
		});*/


	},
	createDD: function() {

	}

});


return GeoMapCtr;
});