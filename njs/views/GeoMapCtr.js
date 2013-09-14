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


		var div = document.createElement('div');

		this.c.append(div);

		$(div).css({
			height: '400px',
			width: '400px',
			position: 'absolute',
			'z-index': -1
		});
		//[51.505, -0.09]
		//[37.5485429, 55.7139477]
		var map = L.map(div, {zoomControl:false }).setView([55.7139477, 37.5485429], 5);
		this.map = map;
		//$(div).css()


		map.dragging.disable();
		map.touchZoom.disable();
		map.doubleClickZoom.disable();
		map.scrollWheelZoom.disable();
		map.boxZoom.disable();
		map.keyboard.disable();
		//this.map.zooming.disable();
		//{trackResize: true}

		// add an OpenStreetMap tile layer
		L.tileLayer('http://c.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png', {
			
			attribution: '<a href="http://www.mapbox.com/about/maps/">Terms & Feedback</a>',
		}).addTo(this.map);

		this.wch(this, 'vis_con_appended', function(e) {
			if (e.value){
				this.createDD();
			}
		});
		

		this.project = function(p) {
			var point = map.latLngToLayerPoint(new L.LatLng(p[1], p[0]));
			return [point.x, point.y];
		};
	},
	createDD: function() {

	},
	'compx-center': {
		depends_on: ['geodata'],
		fn: function(geodata) {
			var lay = L.geoJson(geodata);//.addTo(this.map);
			this.map.fitBounds(lay.getBounds());
			console.log(lay.getBounds());
		}
	}

});


return GeoMapCtr;
});