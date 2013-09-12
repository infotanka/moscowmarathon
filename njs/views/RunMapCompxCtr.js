define(['provoda', 'jquery', './RunMapCtr'],
function(provoda, $, RunMapCtr) {
"use strict";

var RunMapCompxCtr = function() {};
provoda.View.extendTo(RunMapCompxCtr, {
	children_views:{
		run_map: RunMapCtr
	},
	'collch-run_map': 'tpl.ancs.map-con',
	createDetails: function() {
		this.c = this.root_view.els.runm_c;
		this.createTemplate();
		


		var scroll_marker = this.tpl.ancs['scroll_marker'];
		var marker_width = scroll_marker.width();
		var half_width = marker_width/2;

		var relative_con = this.tpl.ancs['timeline'];

		var _this = this;


		var changeTime = function(pos, offset, width) {
			var factor = pos/(width + marker_width);
			factor = Math.min(factor, 1);
			factor = Math.max(factor, 0);

			var start_pos = offset.left - half_width;


			var target_pos = start_pos + width * factor;
			scroll_marker.css('left', target_pos + 'px');
			_this.RPCLegacy('setTime', factor);
		};

		var con_offset;
		var con_width;
		var watchPos = function(e) {
			var pos = e.pageX - con_offset.left;
			changeTime(pos, con_offset, con_width);
		};

		
		scroll_marker
			.on('mousedown', function(e) {
				e.preventDefault();
				con_offset = relative_con.offset();
				con_width = relative_con.width();
				$(document).on('mousemove', watchPos);
				$(document).on('mouseup', function() {
					$(document).off('mousemove', watchPos);
				});
			});
	},
	/*'compx-bigdata': {
		depends_on: ['geodata', 'cvs_data'],
		fn: function(geodata, cvs_data) {
			if (geodata && cvs_data){
				getHardMap(cvs_data, geodata, this.tpl.ancs['map-con'][0]);
				return {
					geodata: geodata,
					cvs_data: cvs_data
				};
			}
		}
	},*/

	tpl_events:{
		
	},
	tpl_r_events:{
		
	}
});
return RunMapCompxCtr;
});