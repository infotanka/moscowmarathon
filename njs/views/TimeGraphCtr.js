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


		var _this = this;

		var checkPointerMove = function(e) {
			_this.checkPointerMove(e);
		};

		var tmcon = this.parent_view.tpl.ancs['timeline'];

		tmcon
		.on('mouseenter', function() {
			_this.coffset = tmcon.offset();
			$(window.document).on('mousemove', checkPointerMove);
		})
		.on('mouseleave', function() {

			$(window.document).off('mousemove', checkPointerMove);
			_this.promiseStateUpdate('selector', false);
		});

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

			
			var createText = function(cur, from_start) {
				var tstr;
				if (from_start) {
					tstr = moment(cvs_data.start_time).startOf('day')
					.add( cur.relative_to_start)
					.format(cur.last ? 'HH:mm:ss' : 'HH:mm');
				} else {
					tstr = moment(cur.relative_to_day)
					.format(cur.last ? 'HH:mm:ss' : 'HH:mm');
				}
				var span_top = $('<span class="tl_text_mark"></span>').appendTo(dfrg);
				if (from_start){
					span_top.addClass('mark_bottom');
				} else {
					span_top.addClass('mark_top');
				}

				$('<span class="just_text_of_mark"></span>').text(tstr).appendTo(span_top);


				span_top.css('left', width_factor * cur.value);
				if (cur.last){
					span_top.addClass('last_mark');
				}
			};

			for (var i = 0; i < hours_steps.length; i++) {
				var cur = hours_steps[i];
//				var full_format = 
				createText(cur);
				createText(cur, true);
				
				
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
	px_step: 3,
	'compx-draw': {
		depends_on: ['basedet', 'cvs_data', 'age_areas'],
		fn: function(basedet, cvs_data, age_areas) {
			if (!basedet || !cvs_data ||!age_areas){
				return;
			}
			var y_scale = 1.2;
			var _this = this;
			var px_step = this.px_step;
			var steps = this.width/px_step;



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
				//var max_runners;
				
				for (var i = 0; i < steps; i++) {
					var array = makeStep(i, runners);
					runners_by_time.push(array);
				//	max_runners = Math.max(max_runners, array.length);
					if (array.length){
					//	has_data[i] = array.length;
					}

				}
			//	runners_by_time.max_runners = max_runners;
				return runners_by_time;
			};

			var reversed_groups = cvs_data.runners_groups.slice();
			reversed_groups.reverse();

			var runners_byd = {};

			cvs_data.runners_groups.forEach(function(el) {
				runners_byd[el.key] = getRunnersByTime(el.runners);
			});

			var getMaxInStep = function(step_num) {
				var summ = 0;
				reversed_groups.forEach(function(el) {
					summ += runners_byd[el.key][step_num].length;
				});
				return summ;
			};



			var max_runners_in_step = 0;
			for (var i = 0; i < steps; i++) {
				max_runners_in_step = Math.max(max_runners_in_step, getMaxInStep(i));
			}



			var points_byd = {};

			var height_factor = this.height/(max_runners_in_step * y_scale);

			var getRunByDPoints = function(array, prev_array) {

				var result = [];
				for (var i = 0; i < steps; i++) {
					var x1 = i * px_step;
					var x2 = x1 + px_step;
					var y = _this.height - height_factor * array[i].length;
					if (prev_array){
						var prev_v = prev_array[i *2];
						y = y - (_this.height - prev_v.y);
					}
					



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
			
			reversed_groups.forEach(function(el, i) {
				var prev = reversed_groups[i-1];
				prev = prev && points_byd[prev.key];
				points_byd[el.key] = getRunByDPoints(runners_byd[el.key], prev);
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

			return {
				runners_byd: runners_byd,
				points_byd: points_byd,
				areas_data: areas_data,
				y_scale: y_scale,
				height_factor: height_factor
			};
		}
		
	},
	checkPointerMove: function(e) {
			//this.coffset
		var pos = e.pageX - this.coffset.left;


		var pos_x = Math.round(pos/this.px_step);
		if (pos_x < 0){
			this.promiseStateUpdate('selector', false);
			return;
		}
		var draw = this.state('draw');
		if (!draw){
			this.promiseStateUpdate('selector', false);
			return;
		}

		var pos_y = Math.floor((this.height - (e.pageY - this.coffset.top))/draw.height_factor);
		if (pos_y < 0){
			this.promiseStateUpdate('selector', false);
			return;
		}
		this.promiseStateUpdate('selector', {
			pos_x: pos_x,
			pos_y: pos_y
		});
	},
	'compx-selected_runners': {
		depends_on: ['selector', 'draw', 'cvs_data'],
		fn: function(selector, draw, cvs_data) {
			if (!selector || !draw){
				return;
			}
			var matched = [];
			cvs_data.runners_groups.forEach(function(el) {
				var array = draw.runners_byd[el.key];
				//console.log(array);
				var runner = array[selector.pos_x][selector.pos_y];
				if (runner){
					matched.push(runner);
				}
				
				//age_areas[el.key].attr("d", areas_data[el.key]);
			});
			if (matched.length){
				console.log(matched[0].full_name);
			}
			
		}
	}
});

return TimeGraphCtr;

});