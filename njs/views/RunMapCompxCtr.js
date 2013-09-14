define(['provoda', 'jquery', './GeoMapCtr', './TimeGraphCtr', './modules/colors', 'spv'],
function(provoda, $, GeoMapCtr, TimeGraphCtr, colors, spv) {
"use strict";

var RunMapCompxCtr = function() {};
provoda.View.extendTo(RunMapCompxCtr, {
	gender_grads: [colors.getRGBGradient(250, ['#FFCBD5', '#EE2046'].map(colors.parseHEXString)), colors.getRGBGradient(250, ['#B8E8FF', '#1D56DF'].map(colors.parseHEXString))],
	grays: colors.getRGBGradient(250, ['#333333', '#EEEEEE'].map(colors.parseHEXString)),
	children_views:{
		geo_map: GeoMapCtr,
		time_graph: TimeGraphCtr
	},
	'collch-time_graph': 'tpl.ancs.timeline',
	createDetails: function() {
		this.c = this.root_view.els.runm_c;
		this.createTemplate();
		


		var scroll_marker = this.tpl.ancs['scroll_marker'];
		this.marker_width = scroll_marker.width();
		this.half_width = this.marker_width/2;

		var relative_con = this.tpl.ancs['timeline'];

		var _this = this;


		this.setVisState('con_width', relative_con.width());

		var changeTime = function(pos) {
			var factor = pos/(_this.state('vis_con_width') + _this.marker_width);
			factor = Math.min(factor, 1);
			factor = Math.max(factor, 0);
			_this.promiseStateUpdate('', factor);
			_this.RPCLegacy('setTime', factor);
		};


		var watchPos = function(e) {
			var pos = e.pageX - _this.con_offset.left;
			changeTime(pos, _this.con_offset);
		};

		
		scroll_marker
			.on('mousedown', function(e) {
				e.preventDefault();
				_this.con_offset = relative_con.offset();
				$(document).on('mousemove', watchPos);
				$(document).on('mouseup', function() {
					$(document).off('mousemove', watchPos);
				});
			});
		this.wch(this.root_view, 'maxwdith', spv.debounce(function() {
			this.con_offset = null;
			this.checkSizes();
		},100));
	},
	checkSizes: function() {
		this.setVisState('con_width', this.tpl.ancs['timeline'].width());
	},
	'compx-curpos':{
		depends_on: ['selected_time', 'vis_con_width'],
		fn: function(factor, con_width) {
			if (!this.con_offset){
				this.con_offset = this.tpl.ancs['timeline'].offset();
			}
			var start_pos =  - this.half_width;


			var target_pos = start_pos + con_width * factor;
			this.tpl.ancs['scroll_marker'].css('left', target_pos + 'px');
		}
	},
	'compx-time_value': {
		depends_on: ['selected_time', 'cvs_data'],
		fn: function(selected_time, cvs_data) {
			if (cvs_data && typeof selected_time != 'undefined'){
				return cvs_data.max_time * selected_time;
			}
		}
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