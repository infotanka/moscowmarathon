define(['d3', 'provoda', 'spv', './modules/maphelper', 'jquery'], function(d3, provoda, spv, mh, $) {
"use strict";

var TimeGraphCtr = function() {};
provoda.View.extendTo(TimeGraphCtr, {
	createBase: function() {
		var svg = document.createElementNS(mh.SVGNS, 'svg');
		this.c = $(svg).css('display', 'none');
		this.svg = d3.select(svg);

		var _this = this;

		$(window).on('resize', spv.debounce(function() {
			_this.checkSizes();
		},100));
	},
	checkSizes: function() {
		var result = {};
		var container = this.c.parent();
		
		if (container[0]){
			result.width = container.width();
		}

		result.height = container.height();
		this.updateManyStates(result);
	},
	updateManyStates: function(obj) {
		var changes_list = [];
		for (var name in obj) {
			changes_list.push(name, obj[name]);
		}
		this._updateProxy(changes_list);
	},
	'compx-time_value': {
		depends_on: ['selected_time', 'cvs_data'],
		fn: function(selected_time, cvs_data) {
			if (cvs_data && typeof selected_time != 'undefined'){
				return cvs_data.max_time * selected_time;
			}
		}
	},
	'compx-bd': {
		depends_on: ['height', 'width', 'vis_ready'],
		fn: function(height, width, vis_ready) {
			if (!height || !width || !vis_ready){
				return;
			}
			//var container = this.c.parent();
			//container.css('height', height);
			this.width = width;
			this.height = height;
			this.c.css('display', '');
			this.svg.attr({
				width: this.width,
				height: this.height
			});
	
				
			return Date.now();
		}
	},
	'compx-total_distance':{
		depends_on: ['geodata'],
		fn: function(geodata) {
			if (geodata){
				return d3.geo.length(geodata) * mh.earth_radius;
			}
		}
	},
	'compx-basedet': {
		depends_on: ['total_distance', 'bd'],
		fn: function(total_distance, bd) {
			if (total_distance && bd){
				
				return Date.now();
			}
			
		}
	},
	'compx-draw': {
		depends_on: ['basedet', 'cvs_data'],
		fn: function(basedet, cvs_data) {
			if (!basedet || !cvs_data){
				return;
			}
			

			this.knodes.base.attr("d", this.path);
			this.knodes.base.points_cache_key = this.projection.scale() + '_' + this.projection.translate();
			mh.getPoints(cvs_data, this.knodes, time_value, false, cvs_data.start_time, this.total_distance);

			

			
		//	xAxis.attr("x1", t[0]).attr("x2", t[0]);
			//yAxis.attr("y1", t[1]).attr("y2", t[1]);
		//
			return {};
		}
	},
});

return TimeGraphCtr;

});