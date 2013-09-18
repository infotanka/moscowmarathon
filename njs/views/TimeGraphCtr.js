define(['d3', 'provoda', 'spv', './modules/maphelper', 'jquery', './modules/colors', 'moment'], function(d3, provoda, spv, mh, $, colors, moment) {
"use strict";

var TimeGraphCtr = function() {};
provoda.View.extendTo(TimeGraphCtr, {
	createBase: function() {
		var svg = document.createElementNS(mh.SVGNS, 'svg');
		this.c = $(svg).css('display', 'none');
		this.svg = d3.select(svg);

		this.wch(this.root_view, 'maxwdith', spv.debounce(function() {
			this.checkSizes();
		},100));
		this.wch(this, 'vis_con_appended', function(e) {
			if (e.value){
				this.checkSizes();
			}
			this.setVisState('ready', e.value);
			
		});
		this.areas_group = this.svg.append('g');

		this.timemarksg1 = this.svg.append('g');
		this.timemarksg2 = this.svg.append('g');
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
				return cvs_data.run_gap * selected_time;
			}
		}
	},
	'compx-hours_steps':{
		depends_on: ['cvs_data'],
		fn: function(cvs_data) {
			if (!cvs_data){
				return;
			}
			var step = 60*60;

			var items = [];
			var cur = 0;
			while (cur < cvs_data.run_gap){
				items.push({
					relative_to_start: cur * 1000,
					relative_to_day: cvs_data.start_time + cur * 1000,
					value: cur
				});
				cur += step;
				//cur = Math.min(cur, cvs_data.run_gap);
			}
			items.pop();
			items.push({
				relative_to_start: cvs_data.run_gap * 1000,
				relative_to_day: cvs_data.start_time + cvs_data.run_gap * 1000,
				value: cvs_data.run_gap,
				last: true
			});
			return items;

		}
	},
	'compx-hours_marks':{
		depends_on: ['hours_steps', 'cvs_data', 'width'],
		fn: function(hours_steps,cvs_data, width) {
			if (!hours_steps || !cvs_data || !width){
				return;
			}
			var node  = this.parent_view.tpl.ancs['timeline_textc'];
			node.empty();
			var width_factor = width/cvs_data.run_gap;
			var dfrg = document.createDocumentFragment();

			
			

			for (var i = 0; i < hours_steps.length; i++) {
				var cur = hours_steps[i];
//				var full_format = 
				
				var tstr = moment(cvs_data.start_time).startOf('day').add(cur.relative_to_start).format(cur.last ? 'HH:mm:ss' : 'HH:mm');
				var span_top = $('<span class="mark_top"></span>').appendTo(dfrg);

				$('<span class="just_text_of_mark"></span>').text(tstr).appendTo(span_top);


				span_top.css('left', width_factor * cur.value);
				if (cur.last){
					span_top.addClass('last_mark');
				}
				
			}

			$(dfrg).appendTo(node);

		}
	},
	'compx-timesteps': {
		depends_on: ['cvs_data'],
		fn: function(cvs_data) {
			var step = 20*60;

			var items = [];
			var cur = 0;
			while (cur < cvs_data.run_gap){
				items.push(cur);
				cur += step;
				//cur = Math.min(cur, cvs_data.run_gap);
			}
			//items.pop();
			items.push(cvs_data.run_gap);
			return items;

		}
	},
	'compx-marks': {
		depends_on: ['timesteps', 'bd'],
		fn: function(timesteps, bd) {
			if (timesteps && bd){
				var result = [];
				this.timemarksg1.selectAll('*').remove();
				this.timemarksg2.selectAll('*').remove();
				var mheight = 4;
				for (var i = 0; i < timesteps.length; i++) {
					var line1 = this.timemarksg1.append('line');
					line1.attr({
						y1: 0,
						y2: mheight,
						'stroke':'#CBCBCB',
						'stroke-width':1
					});
					var line2 = this.timemarksg1.append('line');
					line2.attr({
						y1: this.height,
						y2: this.height - mheight,
						'stroke':'#CBCBCB',
						'stroke-width':1
					});
					result.push({
						top: line1,
						bottom: line2
					});

					//timesteps[i]
				}
				return result;
			}

		}
	},
	'compx-marks_done': {
		depends_on: ['marks', 'bd', 'cvs_data', 'timesteps'],
		fn: function(marks, bd, cvs_data, timesteps) {
			if (marks && bd && cvs_data && timesteps){
				var width_factor = this.width/cvs_data.run_gap;
				for (var i = 0; i < marks.length; i++) {
					var val =  width_factor * timesteps[i];
					var attrs = {
						x1: val,
						x2: val
					};
					marks[i].top.attr(attrs);
					marks[i].bottom.attr(attrs);
				}
				return [];
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
	'compx-age_areas': {
		depends_on: ['cvs_data'],
		fn: function(cvs_data) {
			if (!cvs_data){
				return;
			}

			this.areas_group.selectAll('*').remove();
			var age_areas = {};


			var array = cvs_data.runners_groups.slice();//.reverse();
			var _this = this;
			array.forEach(function(el) {
				var grad = _this.parent_view.gender_grads[el.gender];
				var color = colors.getGradColor(el.num, 1, el.groups_count, grad);
				age_areas[ el.key ] = (_this.areas_group.append('path').style({
					stroke: 'none',
					"fill": color
				}));

			});
			return age_areas;
		}
	},
	'compx-draw': {
		depends_on: ['basedet', 'cvs_data', 'age_areas'],
		fn: function(basedet, cvs_data, age_areas) {
			if (!basedet || !cvs_data ||!age_areas){
				return;
			}
			var y_scale = 1.2;
			var _this = this;
			var px_step = 3;
			var steps = this.width/px_step;

			var max_runners = 0;

			var time_step = (cvs_data.last_finish_time - cvs_data.start_time)/steps;

			steps = Math.ceil(steps);

			var makeStep = function(step_num, runners) {
				var result = [];
				var range_start = cvs_data.start_time + step_num * time_step;
				var range_end = range_start + time_step;
				for (var i = 0; i < runners.length; i++) {
					var cur = runners[i];
					if (cur.end_time > range_start &&  cur.end_time <= range_end){
						result.push(cur);
						//cur.finish_g = result;
					} else {

					}
				}
				return result;
			};
			var getRunnersByTime = function(runners) {
				//var has_data = {};
				var runners_by_time = [];
				
				for (var i = 0; i < steps; i++) {
					var array = makeStep(i, runners);
					runners_by_time.push(array.length);
					max_runners = Math.max(max_runners, array.length);
					if (array.length){
					//	has_data[i] = array.length;
					}

				}
				return runners_by_time;
			};

			
			
			var runners_byd = {};

			cvs_data.runners_groups.forEach(function(el) {
				runners_byd[el.key] = getRunnersByTime(el.runners);
			});

			var points_byd = {};

			var height_factor = this.height/(max_runners * y_scale);

			var getRunByDPoints = function(array) {
				var result = [];
				for (var i = 0; i < steps; i++) {
					var x1 = i * px_step;
					var x2 = x1 + px_step;
					var y = _this.height - height_factor * array[i];
					result.push({
						x: x1,
						y: y
					}, {
						x: x2,
						y: y
					});
				}
				return result;
			};
			cvs_data.runners_groups.forEach(function(el) {
				points_byd[el.key] = getRunByDPoints(runners_byd[el.key]);
			});



			var areas_data = {};

			var getRunByDPathData = function(array) {
				var result = '';
				result += 'M' + mh.format({x: array[0].x, y: _this.height});
				for (var i = 0; i < array.length; i++) {
					result += ' L' + mh.format(array[i]);
				}
				result += ' L' + mh.format({x: (array[array.length - 1]).x, y: _this.height});
				result += ' Z';
				return result;
			};
			cvs_data.runners_groups.forEach(function(el) {
				areas_data[el.key] = getRunByDPathData(points_byd[el.key]);
			});


			cvs_data.runners_groups.forEach(function(el) {
				age_areas[el.key].attr("d", areas_data[el.key]);
			});

		//	console.log(runners_byd);


/*			_this = this;

			var 
		

			var areas_data = {};
			var areas = {};
			//areas.push(getAreaPathData(getAreaByData(cvs, complects, complects), complects));
			var prev;
			cvs_data.runners_groups.forEach(function(el, i) {
				var prev_districts = (i === 0) ? complects : prev;
				areas_data[el.key] = getAreaByData(el.runners, complects, prev_districts, seconds, step, start_time);
				prev = areas_data[el.key];
			});
			cvs_data.runners_groups.forEach(function(el) {
				areas[el.key] = getAreaPathData(areas_data[el.key], complects, complects);
			});
			cvs_data.runners_groups.forEach(function(el) {
				
				_this.age_areas[el.key].attr("d", areas[el.key]);
				
			});
*/


		//	this.knodes.base.attr("d", this.path);
		//	this.knodes.base.projection_key = this.projection.scale() + '_' + this.projection.translate();
		//	mh.getPoints(cvs_data, this.knodes, time_value, false, cvs_data.start_time, this.total_distance);

			

			
		//	xAxis.attr("x1", t[0]).attr("x2", t[0]);
			//yAxis.attr("y1", t[1]).attr("y2", t[1]);
		//
			return {};
		}
	},
});

return TimeGraphCtr;

});