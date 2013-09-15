define(['provoda', 'jquery', './GeoMapCtr', './TimeGraphCtr', './modules/colors', 'spv', 'd3', './modules/maphelper'],
function(provoda, $, GeoMapCtr, TimeGraphCtr, colors, spv, d3, mh) {
"use strict";

var RunMapCompxCtr = function() {};
provoda.View.extendTo(RunMapCompxCtr, {
	gender_grads: [colors.getRGBGradient(255, ['#FFCBD5', '#EE2046'].map(colors.parseHEXString)), colors.getRGBGradient(255, ['#B8E8FF', '#1D56DF'].map(colors.parseHEXString))],
	grays: colors.getRGBGradient(4, ['#333333', '#EEEEEE'].map(colors.parseHEXString)),
	children_views:{
		geo_map: GeoMapCtr,
		time_graph: TimeGraphCtr
	},
	'collch-time_graph': 'tpl.ancs.timeline',
	createDetails: function() {
		this.c = this.root_view.els.runm_c;
		this.createTemplate();
		

		var svg;
		svg = document.createElementNS(mh.SVGNS, 'svg');
		//this.c = $(svg).css('display', 'none');
		$(svg).appendTo(this.tpl.ancs['legendage']);
		
		this.legendage = d3.select(svg);

		svg = document.createElementNS(mh.SVGNS, 'svg');
		$(svg).appendTo(this.tpl.ancs['legendcount']);
		this.legendcount =  d3.select(svg);
		this.createLegendCount();


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

		this.wch(this.root_view, 'runners_rate', function(e) {
			this.promiseStateUpdate('runners_rate', e.value);
		});


		var mth_counter = 0;
		var mth_text = ['марафон', '42 км 195 м'];
		this.tpl.ancs['mthswitch']
			.on('mouseenter', function() {
				$(this).text(mth_text[1]);
			})
			.on('mouseleave', function() {
				$(this).text(mth_text[0]);
			});

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
	createLegendCount: function() {
		var container = this.tpl.ancs['legendcount'];
		var width = container.width();
		var height= container.height();

		var
			p1 = {x:0, y:0},
			p2 = {x: width, y:0},
			p3 = {x: width/2, y: height};

		var data = mh.formatPathPoints([p1, p2, p3]) + ' Z';

		var style = {
			fill: '#7FBFFF',
			stroke: 'none'
		};
		this.legendcount.append('path')
			.attr('d', data)
			.style(style);

	},
	'compx-legend_count':{
		depends_on: ['runners_rate'],
		fn: function(runners_rate) {
			if (!runners_rate){
				return;
			}
			var container = this.tpl.ancs['legendcount'];

			var width = container.width();
		//	var height= container.height();
			//var svg = this.legendcount;
			//svg.selectAll('*').remove();


			var maxcount = (runners_rate.height * runners_rate.runners)/width;
			this.tpl.ancs['legendcounttext'].text(Math.round(maxcount));
			//console.log(maxcount)

		}
	},
	'compx-legend_age':{
		depends_on: ['cvs_data'],
		fn: function(cvs_data) {
			var container = this.tpl.ancs['legendage'];
			var width = container.width();
			var height= container.height();
			var svg = this.legendage;
			svg.selectAll('*').remove();

			var space = 1;
			var vert_space = 1;
			var half_width = width/2;
			//var _this = this;
			
			var max1 = cvs_data.genders_groups[1].age_groups.max;
			var max2 = cvs_data.genders_groups[0].age_groups.max;

			var width_factor = (width - space)/(max1 + max2);

			


			var _this = this;

			(function(){
				var array = cvs_data.genders_groups[1].age_groups;
				var grad = _this.gender_grads[1];

				var el_height = Math.round((height - vert_space * (array.length - 1))/array.length);
				var limit = half_width - space/2;
				

				array.forEach(function(el, i) {
					


					var y = el_height * i + vert_space * i;
					var rwidth = (el.length * width_factor);
					var x = limit - rwidth;
					var color = colors.getGradColor(i+1, 1, array.length, grad);

					svg.append('rect').attr({
						x: x,
						y: y,
						width: rwidth,
						height: el_height,
						fill: color
					});
				//	console.log(el);
				});

			})();

			(function(){
				var array = cvs_data.genders_groups[0].age_groups;
				var grad = _this.gender_grads[0];

				var el_height = Math.round((height - vert_space * (array.length - 1))/array.length);
				var limit = half_width - space/2;
				

				array.forEach(function(el, i) {
					


					var y = el_height * i + vert_space * i;
					var rwidth = (el.length * width_factor);
					var x = (width - limit);
					var color = colors.getGradColor(i+1, 1, array.length, grad);

					svg.append('rect').attr({
						x: x,
						y: y,
						width: rwidth,
						height: el_height,
						fill: color
					});
				//	console.log(el);
				});

			})();
			
			
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