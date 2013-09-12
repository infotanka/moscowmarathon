define(['d3', 'provoda', 'spv', 'libs/simplify', 'libs/veon', './modules/colors', './modules/maphelper', 'jquery'],
function(d3, provoda, spv, simplify, veon, colors, mh, $) {
"use strict";

var RunMapCtr = function() {};
provoda.View.extendTo(RunMapCtr, {
	createBase: function() {

		var svg = document.createElementNS(mh.SVGNS, 'svg');
		this.c = $(svg).css('display', 'none');
		this.svg = d3.select(svg);
		this.knodes = {};
		var knodes = this.knodes;

		var main_group = this.svg.append('g');
		knodes.main_group = main_group;

		knodes.base = main_group.append("path");

		knodes.areas_group = main_group.append('g');

		knodes.debug_group = main_group.append('g');




		knodes.bottom_group = this.svg.append('g');
		knodes.bottom_path = knodes.bottom_group.append('path').style({
			stroke: '#333',
			"fill": 'none'
		});
		knodes.bottom_lines = knodes.bottom_group.append('g');





		knodes.left_group = this.svg.append('g');
		knodes.left_path = knodes.left_group.append('path').style({
			stroke: '#333',
			"fill": 'none'
		});
		knodes.left_lines = knodes.left_group.append('g');


		
		
		this.wch(this, 'vis_con-appended', function(e) {
			if (e.value){
				this.createBBDetails();
			}
			this.setVisState('ready', e.value);
			
		});

		this.grays = colors.getRGBGradient(250, ['#333333', '#EEEEEE'].map(colors.parseHEXString));
	},
	earth_radius: mh.earth_radius,
	createBBDetails: function() {
		var container = this.c.parent();


		this.width = $(container).width();
		this.height = $(container).height();
		this.c.css('display', '');
		this.projection = d3.geo.mercator().scale(1).translate([0, 0]);
		this.path = d3.geo.path().projection(this.projection);

		this.behavior = d3.behavior.zoom();

		this.svg.attr({
			width: this.width,
			height: this.height
		});
		

		
		var _this = this;

		this.svg.call(this.behavior
			.translate(this.projection.translate())
			.scale(this.projection.scale())
			.on("zoom", function() {
				//_this.redraw;
				_this.setVisState('map_event', Date.now());
			}));

	},
	'compx-time_value': {
		depends_on: ['selected_time', 'cvs_data'],
		fn: function(selected_time, cvs_data) {
			if (cvs_data && typeof selected_time != 'undefined'){
				return cvs_data.max_time * selected_time;
			}
		}
	},
	'compx-genderpaths': {
		depends_on: ['cvs_data', 'vis_ready'],
		fn: function(cvs_data, vis_ready) {
			if (!vis_ready || !cvs_data){
				return;
			}
			this.knodes.age_areas = {};

			var man_colors_gradient = colors.getRGBGradient(250, ['#B8E8FF', '#1D56DF'].map(colors.parseHEXString));
			var woman_colors_gradient = colors.getRGBGradient(250, ['#FFCBD5', '#EE2046'].map(colors.parseHEXString));

			var gender_grads = [woman_colors_gradient, man_colors_gradient];

			var array = cvs_data.runners_groups.slice().reverse();
			var _this = this;
			array.forEach(function(el) {
				var grad = gender_grads[el.gender];
				var color = colors.getGradColor(el.num, 1, el.groups_count, grad);
				_this.knodes.age_areas[ el.key ] = (_this.knodes.areas_group.append('path').style({
					stroke: 'none',
					"fill": color
				}));

			});
		}
	},
	'compx-basedet': {
		depends_on: ['geodata', 'vis_ready'],
		fn: function(geodata, vis_ready) {
			if (geodata && vis_ready){
				var b = this.path.bounds(geodata),
					s = 0.95 / Math.max((b[1][0] - b[0][0]) / this.width, (b[1][1] - b[0][1]) / this.height),
					t = [(this.width - s * (b[1][0] + b[0][0])) / 2, (this.height - s * (b[1][1] + b[0][1])) / 2];

				this.behavior.translate(t).scale(s);

				this.projection
					.scale(s)
					.translate(t);

				
				this.knodes.base.data([geodata]);

				var rad_distance = d3.geo.length(geodata);
				this.total_distance = rad_distance * this.earth_radius;

				//this.redraw();

				var _this = this;
				(function(){
					var dot = this.svg.append('circle')
						.attr("r", 5)
						.style({
							stroke: 'none',
							"fill": 'red'
						});

					var setDot = function(distance){
						var pp = mh.getPointAtDistance(geodata.geometry.coordinates, distance);
						var pjr = _this.projection(pp.target);

					
						dot
							.attr("cy", pjr[1])
							.attr("cx", pjr[0]);
					};

					var input = document.querySelector('input.dot');
					if (!input){
						setDot(15985);
						return;
					}
					input.oninput = function(){
						setDot(input.value * 1);
					};

					setDot(input.value * 1);

						
				}).call(this);

				return {};
			}
			
		}
	},

	'compx-draw': {
		depends_on: ['basedet', 'cvs_data', 'time_value', 'vis_map_event'],
		fn: function(basedet, cvs_data, time_value) {
			if (!basedet || !cvs_data || typeof time_value == 'undefined'){
				return;
			}
			var t = this.projection.translate();

			

			if (d3.event) {
				var t1 =t, t2 = d3.event.translate,
					tval = [t2[0]-t1[0], t2[1]-t1[1]];

				if (this.current_translate != tval){
					this.current_translate = tval;
					this.knodes.main_group.attr("transform", "translate(" + tval+ ")");
				}
				if (this.current_scale != d3.event.scale){
					this.current_scale = d3.event.scale;
					this.projection
						//.translate(d3.event.translate)
						.scale(d3.event.scale);
					this.knodes.base.attr("d", this.path);
					this.knodes.base.points_cache_key = this.behavior.scale();
					mh.getPoints(cvs_data, this.knodes, time_value, false, cvs_data.start_time, this.total_distance);
				}
				
				
				


			} else {
				this.knodes.base.attr("d", this.path);
				this.knodes.base.points_cache_key = this.behavior.scale();
				mh.getPoints(cvs_data, this.knodes, time_value, false, cvs_data.start_time, this.total_distance);
			}

			

			
		//	xAxis.attr("x1", t[0]).attr("x2", t[0]);
			//yAxis.attr("y1", t[1]).attr("y2", t[1]);
		//
			return {};
		}
	},
	'compx-altit':{
		depends_on: ['basedet', 'cvs_data', 'geodata'],
		fn: function(draw, cvs_data, geodata) {
			if (!draw || !geodata){
				return;
			}



			//var max_alt = 0;
			var min_alt = Infinity;
			var coordinates = geodata.geometry.coordinates;

			coordinates.forEach(function(el, i){
				min_alt = Math.min(min_alt, el[2]);

				if (coordinates[i-1]){
					/*var gp = function(p){
						return {
							lat: p[0],
							lon: p[1]
						};
					};
					var p1 = gp(el);
					var p2 = gp(coordinates[i-1]);*/
					//el[3] = veon.calcDist(p1, p2) + coordinates[i-1][3];
					//el[3] = veon.getPointsDistanceM(el, coordinates[i-1]) + coordinates[i-1][3];
					el[3] = d3.geo.distance(el, coordinates[i-1]) + coordinates[i-1][3];

				} else {
					el[3] = 0;
				}
			});
			
			var _this = this;
			/*
			var getPB = function(el){
				var pjr = _this.projection(el);

				return [
					pjr[0] + ',' + (_this.height - (el[2] - min_alt)),
					(el[2] - min_alt) + ',' + pjr[1]
				];
			};*/


			var getAltVPoints = function(el){
				var pjr = _this.projection(el);
				return [
					{
						x: pjr[0],
						y: (_this.height - (el[2] - min_alt)),
						z: _this.height - pjr[1]
					},
					{
						x: (el[2] - min_alt),
						y: pjr[1],
						z: pjr[0]
					}
				];
			};

			var getPathPartByRange = function(array, range){
				var result = [];
				array.forEach(function(el){
					var distance = el[3];
					var min = range[0] / _this.earth_radius;
					var max = range[1] / _this.earth_radius;
					if (distance >= min && distance < max){
						result.push(el);
					}
				});
				return result;
			};

			
			

			var formatForPath = function(p){
				return p.x + ',' + p.y;
			};
			var getPathData = function(array){
				var result = '';
				result += 'M' + formatForPath(array[0]);

				array.slice(1).forEach(function(el){
					result += ' L' + formatForPath(el);
				});
				return result;
			};

			var getSortedPointsGroups = function(array){
				var result = [];
				result.max_dist = 0;
				result.min_dist = Infinity;

				//var max_dist = 0;
				for (var i = 1; i < array.length; i++) {
					var obj = {
						start: array[i-1],
						end: array[i]
					};
					var mid_dist = (obj.start.z + obj.end.z)/2;
					result.max_dist = Math.max(result.max_dist, mid_dist);
					result.min_dist = Math.min(result.min_dist, mid_dist);
					obj.mid_dist = mid_dist;
					result.push(obj);
				}
				result.sort(function( a, b ){
					return spv.sortByRules(a,b, [{
						field: ['mid_dist']
					}]);
				});
				result.reverse();

				return result;
			};




			var bottom_range = [16998, Infinity];
			var points_bottom = [];
			var bottom_array = getPathPartByRange(coordinates, bottom_range);
			bottom_array.forEach(function(el){
				var point = getAltVPoints(el);
				points_bottom.push(point[0]);

			});
			points_bottom = simplify(points_bottom, 10, true);

			var complects_bo = getSortedPointsGroups(points_bottom);

			
			this.knodes.bottom_lines.selectAll('*').remove();
			complects_bo.forEach(function(el){

				_this.knodes.bottom_lines.append('path').style({
					stroke: 'none',
					fill: colors.getGradColor(el.mid_dist, complects_bo.min_dist, complects_bo.max_dist, _this.grays),
					opacity: 0.8
				}).attr('d', 'M' + el.start.x + ',' + _this.height + ' L ' + formatForPath(el.start) + ' L ' + formatForPath(el.end) + ' L ' + el.end.x +',' + _this.height + "Z");

				_this.knodes.bottom_lines.append('line').style({
					stroke: '#666',
					fill: 'none'
				}).attr({
					x1: el.start.x,
					y1: el.start.y,
					x2: el.end.x,
					y2: el.end.y
				});



			});
			_this.knodes.bottom_path.attr("d", getPathData(points_bottom));



			

			var points_left = [];
			var left_range = [0, 16998];
			var left_array = getPathPartByRange(coordinates, left_range);
	

			left_array.forEach(function(el){
				var point = getAltVPoints(el);
				points_left.push(point[1]);

			});
			points_left = simplify(points_left, 10, true);
			_this.knodes.left_path.attr("d", getPathData(points_left));
		}
	}
});

return RunMapCtr;
});