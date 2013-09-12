define(['d3', 'libs/veon'],function(d3, veon){
"use strict";
var SVGNS = 'http://www.w3.org/2000/svg';
var x_axis_points = {
	p1: {
		x: 0,
		y: 0
	},
	p2: {
		x: 1,
		y: 0
	}
};
var earth_radius = 6371000;


var getAngleBySegmentsPoints = function(s1_x1, s1_y1, s1_x2, s1_y2, s2_x1, s2_y1, s2_x2, s2_y2) {
	return Math.atan2((s1_y2 - s1_y1),(s1_x2 - s1_x1)) - Math.atan2((s2_y2 - s2_y1),(s2_x2 - s2_x1));
};
var getAngleBySegmentsPointsM = function(s1_p1, s1_p2, s2_p1, s2_p2) {
	return getAngleBySegmentsPoints(s1_p1.x, s1_p1.y, s1_p2.x, s1_p2.y, s2_p1.x, s2_p1.y, s2_p2.x, s2_p2.y);
};

var getPointOnPerpendicular = function(x1, y1, x2, y2, xt, yt, value) {
	if (!value){
		return [xt, yt, xt, yt];
	}
	var diff_x = x1-x2;
	var diff_y = y1-y2;
	var dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y);
	diff_x = diff_x/dist;
	diff_y = diff_y/dist;

	return [xt + (value/2) * diff_y, yt - (value/2) * diff_x, xt + (-value/2) * diff_y, yt - (-value/2) * diff_x];
};
var getPointOnPerpendicularM = function(p1, p2, pt, distance) {
	return getPointOnPerpendicular(p1.x, p1.y, p2.x, p2.y, pt.x, pt.y, distance);
};
var getPointsDistance = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow((x2 - x1),2)+ Math.pow((y2 - y1), 2));
};
var getPointsDistanceM = function(p1, p2) {
	return getPointsDistance(p1.x, p1.y, p2.x, p2.y);
};
var geometry = {
	getPointsDistance: getPointsDistance,
	getPointOnPerpendicular: getPointOnPerpendicular,
	getPointOnPerpendicularM: getPointOnPerpendicularM
};
window.geometry = geometry;

var getPointOnLine = function(p1, angle, distance) {
	var a = Math.cos(angle) * distance;
	var b = Math.sin(angle) * distance;

	var x = p1.x + a;
	var y = p1.y + b;
	return {
		x: x,
		y: y
	};

};


var getDistance = function(x1, y1, x2, y2, x) {
	return ((x - x1) * (y2 - y1)) / (x2 - x1) + y1;
};


var getDistances = function(cvs, miliseconds) {
	var result = [];
	for (var i = 0; i < cvs.length; i++) {
		var cur = cvs[i];
		var time = getDistance(cur.start_time,0,   cur.end_time,42000,   miliseconds);
		if (typeof time == 'number' && !isNaN(time)){
			result.push(time);
		}

	}
	return result;
};

var getRunners = function(array, d_ge, d_l) {
	var count = 0;
	for (var i = 0; i < array.length; i++) {
		var cur = array[i];
		if (cur >= d_ge && cur < d_l){
			count++;
		}
		
	}
	return count;
};





var format  = function(p){
	return p.x + ',' + p.y;
};
var formatCurve = function(prev_pcurv2, pcurv1, endp){
	return format(prev_pcurv2) + ' ' + format(pcurv1) + ' ' + format(endp);
};


var getAreaPathData = function(area, base_districts, prev_districts) {
	var bstr = "M";
	var target = [];
	var part1 = [], part2 = [];
	var cur;
	var i, prevp;

	var zero_base_district = base_districts[0];

	bstr += format(zero_base_district.pm);
	for (i = 1; i < area.length; i++) {

		prevp = (i - 1 === 0) ? zero_base_district.pcurv2 :  area[ i - 1 ].pcurv2;
		cur = area[i];
		part1.push(formatCurve(prevp, cur.pcurv1, cur.pm));
	}
	bstr += ' C' + part1.join(' ');
	bstr += ' L' + format(base_districts[ base_districts.length - 1 ].pm);


	for (i = (prev_districts.length - 1) - 1; i >= 0; i--) {
		prevp = prev_districts[i+1].pcurv1;
		cur = (i === 0) ? base_districts[0] : prev_districts[i];
		part2.push(formatCurve(prevp, cur.pcurv2, cur.pm));

	}

	bstr += ' C' + part2.join(' ') + 'Z';
	return bstr;

};
/*
var setRunnersPoints = function(cur) {
	if (!cur.runners){
		return;
	}

};
*/

var getAreaByData = function(cvs, base_districts, prev_districts, seconds, step, start_time) {
	var area = [];
	var cur, prev_di;
	var distances = getDistances(cvs, start_time +  seconds * 1000);
	var i;
	//var max_runners = 0;
	
	for (i = 0; i < base_districts.length; i++) {
		cur = base_districts[i];
		prev_di = prev_districts[i];
		var obj = {};
		var runners = getRunners(distances, cur.start, cur.end);
		//max_runners = Math.max(max_runners, runners);
		//var value = Math.random()*20 + 5;
		//var value = runners_pxheight_factor * runners;
		var value = ((Math.pow(3, 2) * runners)/step);
		obj.height = value;
		obj.runners = runners;

		var spcurv1 = getPointOnPerpendicularM(prev_di.pcurv1, prev_di.pcurv2, prev_di.pcurv1, obj.height);
		var spcurv2 = getPointOnPerpendicularM(prev_di.pcurv1, prev_di.pcurv2, prev_di.pcurv2, obj.height);

		obj.pcurv1 = {
			x: spcurv1[0],
			y: spcurv1[1]
		};
		obj.pcurv2 = {
			x: spcurv2[0],
			y: spcurv2[1]
		};
		var perppoints = getPointOnPerpendicularM(prev_di.pcurv1, prev_di.pcurv2, prev_di.pm, obj.height);
		obj.pm = {
			x: perppoints[0],
			y: perppoints[1]
		};
		//setMorePoints(obj, cur);
		//setRunnersPoints(obj, cur);
		area.push(obj);


	}
	//var runners_pxheight_factor = max_graph_height/max_runners;
	return area;
};

var base_points_cache = {};
var getBasePoints = function(base, step, total_distance){
	var points_key = base.points_cache_key;
	if (base_points_cache[points_key]){
		return base_points_cache[points_key];
	} else {

		var points = [],
			pieces = [],
			piece = 0,
			d3path_node = base.node(),
			px_distance = d3path_node.getTotalLength(),
			i, cur;

		while (piece <= px_distance){
			pieces.push(piece);
			if (piece == px_distance){
				break;
			}
			piece = Math.min(px_distance, piece + step);
		}
		for (i = 0; i < pieces.length; i++) {
			points.push({
				p: d3path_node.getPointAtLength(pieces[i]),
				l: pieces[i]
			});
		}

		var complects = [],
			px_in_m = px_distance/total_distance;

		
		for (i = 1; i < points.length; i++) {
			var c1 = points[i-1],
				c2 = points[i],
				p1 = c1.p,
				p2 = c2.p;

			var obj = {
				p1: p1,
				p2: p2,
				start: c1.l/px_in_m,
				end: c2.l/px_in_m,
				pm: {
					x: (p1.x + p2.x)/2,
					y: (p1.y + p2.y)/2
				},
				dist: getPointsDistanceM(p1, p2),
				angle: getAngleBySegmentsPointsM(p1, p2, x_axis_points.p1, x_axis_points.p2)
			};

			obj.pcurv1 = getPointOnLine(p1, obj.angle, obj.dist * (1/4));
			obj.pcurv2 = getPointOnLine(p1, obj.angle, obj.dist * (3/4));


			complects.push(obj);
			//console.log(getAngleBySegmentsPointsM(p1, p2, x_axis_points.p1, x_axis_points.p2)/(Math.PI/180));
		}

		return (base_points_cache[points_key] = {
			complects: complects,
			points: points
		});
	}
};





var getPoints = function(cvs_data, knodes, seconds, animate, start_time, total_distance) {

	


	
	var i, cur, step = 15;

	var boundrect = knodes.base.node().getBoundingClientRect();
	var max_graph_height;
	if (boundrect.width <= 50 || boundrect.height <= 50) {
		//knodes.vis.attr("d", '');
		return;
	} else {
		max_graph_height = boundrect.width/10;
	}

	var complects = getBasePoints(knodes.base, step, total_distance).complects;
	


	


	
	
	
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
		if (false && animate){
			knodes.age_areas[el.key].transition()
				.duration(100)
				.attr("d", areas[i]);
		} else {
			knodes.age_areas[el.key].attr("d", areas[el.key]);
		}
	});

	(function(){
		return;
		var connections = [];
		var angles = [];
		for (var i = 0; i < complects.length; i++) {
			var cur = complects[i];
			var next = complects[i+1];
			if (next){
				connections.push({
					angle: getAngleBySegmentsPointsM(cur.p1, cur.p2, next.p1, next.p2)/(Math.PI/180),
					pstart: cur.p1,
					pcon: cur.p2,
					pend: next.p2
				});
				//angles.push();
			}
		}
		connections.sort(function(a,b){
			return spv.sortByRules(a, b, [{
				field: ['angle']
			}]);
		});

		

		var place = knodes.debug_group;
		place.selectAll('*').remove();

		var dfrag = document.createDocumentFragment();
		var bindClick = function(data, circle) {
			circle.node().onclick = function() {
				console.log(data.angle);
			};
		};
		for (var i = 0; i < connections.length; i++) {
			var cur = connections[i];
			var circle =  place.append('circle')
				.attr("cy", cur.pcon.y)
				.attr("cx", cur.pcon.x)
				.attr("r", 5)
				.style({
					stroke: 'none',
					"fill": 'red',
					opacity: ( Math.abs(cur.angle) % 60)/60 + 0.1
				});
			bindClick(cur, circle);
		}

		//console.log(connections);
	})();
	
	
	
	var p_w = 3;
	//var p_h = 3;
	var getSQPoint = function(width, num) {
		var row_capacity = Math.floor(width/p_w);
		if (!row_capacity){
			return;
		}
		var remainder = num % row_capacity;
		var row = Math.ceil(num/row_capacity);
		//var x,y;

		return {
			x: 2 + (4 * (remainder - 1)),
			y: 2 + (4 * (row - 1))
		};
	//var

	};
	var getSQPoints = function(node, width, value) {
		
		for (var i = 0; i < value; i++) {
			var data = getSQPoint(width, i + 1);
			if (!data){
				continue;
			}
			node.append('circle')
				.attr("cy", data.y)
				.attr("cx", data.x)
				.attr("r", 1)
				.style({
					stroke: 'none',
					"fill": 'blue'
				});
		}

	};

	//
	(function(){
		return;
		var i,cur;
		var place = knodes.debug_group;
		place.selectAll('*').remove();

		var dfrag = document.createDocumentFragment();



		for (i = 0; i < complects.length; i++) {
			cur = complects[i];
			var gnode = document.createElementNS(SVGNS, 'g');
			dfrag.appendChild(gnode);
			var gg = d3.select(gnode);
			gg.attr({
				'transform':
					'translate( ' + cur.p1.x + ',' + cur.p1.y + ' ) ' +
					'rotate( ' + cur.angle/(Math.PI/180) +' )'
			});
			getSQPoints(gg, cur.dist, cur.runners);
			/*gg.append('rect').attr({
				x: 0,
				y: 0,
				width: width,
				height: 60,
				fill: 'none',
				stroke: '#ccc',
				'stroke-width': 1
			});*/
		}
		place.node().appendChild(dfrag);
		
	})();

	
	//console.log(complects);

};



var getPointAtDistance = function(array, distance){
	var distances = [];
	var sub_distance = distance/earth_radius;
	var target;
	for (var i = 0; i < array.length; i++) {
		var el = array[i];
		if (i){

			var cur = {
				point: el,
				distance: d3.geo.distance(el, array[i-1]) + distances[i-1].distance
			};
			if ((distances[i-1].distance * earth_radius) <= distance && (cur.distance * earth_radius) > distance){
				target = {
					start: distances[i-1],
					end: cur
				};
				break;
			}
			distances.push(cur);

		} else {
			distances.push({
				point: el,
				distance: 0
			});
		}
	}
	if (target){
		var p1 = target.start.point;
		var p2 = target.end.point;
		var startp = new veon.LatLon(p1[0], p1[1]);
		var endp = new veon.LatLon(p2[0], p2[1]);
		var bearing = startp.bearingTo(endp);
		var target_point = startp.destinationPoint(bearing, (distance - target.start.distance * earth_radius )/1000);
		target.target = [target_point._lat, target_point._lon];
		return target;
	}
};

 
var numAssert = function(num) {
	if (isNaN(num)){
		throw new Error('NaN');
	}
		
};
var setMorePoints = function(obj, cur) {
	if (!obj.height){
		obj.cxp1 = cur.p1;
		obj.cxp2 = cur.p2;
		return;
	}

	numAssert(cur.dist);

	var dset1 = getPointOnPerpendicularM(cur.p1, cur.p2, cur.p1, obj.height);
	var dset2 = getPointOnPerpendicularM(cur.p1, cur.p2, cur.p2, obj.height);



	//var morep = getPointOnPerpendicular(cur.pt.x, cur.pt.y, cur.pm.x, cur.pm.y, cur.pt.x, cur.pt.y, dist);

	dset1.forEach(numAssert);
	dset2.forEach(numAssert);

	obj.cxp1 = {
		x: dset1[0],
		y: dset1[1]
	};

	obj.cxp2 = {
		x: dset2[0],
		y: dset2[1]
	};
};
return {
	earth_radius: earth_radius,
	getPoints: getPoints,
	getPointAtDistance: getPointAtDistance,
	SVGNS: SVGNS
};


});