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
			left: 0,
			right: 0,
			top: 0,
			bottom:0,
			position: 'absolute',
			'z-index': -1
		});
		//[51.505, -0.09]
		//[37.5485429, 55.7139477]
		var map = L.map(div, {
			zoomControl:false,
			trackResize: false
		}).setView([55.7139477, 37.5485429], 5);
		this.map = map;
		//$(div).css()


		map.dragging.disable();
		map.touchZoom.disable();
		map.doubleClickZoom.disable();
		map.scrollWheelZoom.disable();
		map.boxZoom.disable();
		map.keyboard.disable();
		window.map = map;
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
		var _this = this;

		$(window).on('resize', spv.debounce(function() {
			_this.checkSizes();
		},100));

		this.wch(this, 'width', function(e) {
			this.parent_view.promiseStateUpdate('mapwidth', e.value);
		});
		this.wch(this, 'height', function(e) {
			this.parent_view.promiseStateUpdate('mapheight', e.value);
		});
		this.checkSizes();
	},
	createDD: function() {

	},
	checkSizes: function() {
		var result = {};
		var container = this.c.parent();
		
		if (container[0]){
			result.width = container.width();
		}

		result.height = Math.max(window.innerHeight - 70, 400);

		var zopts = {animate: false};
		
		

		var geobounds = this.state('geobounds');
		if (geobounds){
			this.map.fitBounds(geobounds, zopts);
		}
		var zooml = this.map.getZoom();
		this.map.invalidateSize(zopts);
		this.map.setZoom(zooml + 1, zopts);
		this.map.setZoom(zooml, zopts);
		this.updateManyStates(result);
	},
	updateManyStates: function(obj) {
		var changes_list = [];
		for (var name in obj) {
			changes_list.push(name, obj[name]);
		}
		this._updateProxy(changes_list);
	},
	'compx-geobounds': {
		depends_on: ['geodata'],
		fn: function(geodata) {
			var lay = L.geoJson(geodata);//.addTo(this.map);
			var geobounds = lay.getBounds();
			this.map.fitBounds(geobounds, {animate: false});
			return geobounds;
			//console.log(lay.getBounds());
		}
	},
	'comx-center': {
		depends_on: 'geobounds',
		fn: function(geobounds) {
			if (geobounds){
				this.map.fitBounds(geobounds);
			}
			
		}
	}

});


return GeoMapCtr;
});