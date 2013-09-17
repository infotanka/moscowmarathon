define(['provoda', 'jquery', 'spv'], function(provoda, $, spv) {
"use strict";
var eventor = new provoda.Eventor();
eventor.init();
var cvs_data;
eventor.onRegistration('load', function(cb) {
	if (cvs_data){
		cb(cvs_data);
	}
});

var getResultSteps = function(el) {
	var result = [];
	result.push({
		distance:0,
		time: el.start_time
	}, {
		distance: 42100,
		time: el.end_time
	});
	return result;
};

var checkData = function() {
	if (cvs_data){
		var cvs = cvs_data.items;
		cvs.sort(function(a, b){
			return spv.sortByRules(a, b, [{
				field: [8],
				reverse: false
			}]);
		});

		var start_time = new Date(2013, 6, 30, 9) * 1;


		var group_num = 20;
		var groups_count = Math.ceil(cvs.length/group_num);

		var normlz_maxtime = cvs_data.max_time /4;
		var start_diff = (normlz_maxtime / groups_count) * 1000;

		var last_finish_time = 0;

		for (var i = 0; i < cvs.length; i++) {

			cvs[i].start_time = start_time + (Math.ceil((i+1)/groups_count) - 1) * start_diff;
			cvs[i].end_time = start_time + cvs[i][8] * 1000;
			last_finish_time = Math.max(last_finish_time, cvs[i].end_time);
			cvs[i].result_steps = getResultSteps(cvs[i]);
		}

		var age_ranges = [
		{
			start: 0,
			end: 18,
			label: '<18'
		},
		{
			start: 18,
			end: 33,
			label: 33
		},{
			start: 33,
			end: 48,
			label: 48
		},{
			start: 48,
			end: 65,
			label: 65
		}, {
			start: 65,
			end: Infinity,
			label: '>65'
		}
		];

		var compact_age_ranges = [
		{
			start: 0,
			end: 25,
			label: '<25'
		}, {
			start: 25,
			end: 45,
			label: '45',
			full_label: '25-45'
		},{
			start: 45,
			end: 60,
			label: '60',
			full_label: '45-60'
		},{
			start: 60,
			end: Infinity,
			label: '>60'
		}];
		var age_ranges_to_use = compact_age_ranges;
		var age_field = [3];

		var start_year = (new Date(start_time)).getFullYear();

		var getAgeGroups = function(array, ranges, field){
			var age_groups = [];
			var r = array;
			var max = 0;
			for (var i = 0; i < ranges.length; i++) {

				var age_range = ranges[i];
				var g = spv.filter(r, field, function(value) {
					var date = start_year - value;
					if (date > age_range.start && date <= age_range.end){
						return true;
					}

				});
				age_groups.push(g);
				r = g.not;
				max = Math.max(max, g.length);
				//console.log(g);
			}
			age_groups.max = max;

			return age_groups;

		};

		var genders_groups = [{
			raw: []
		}, {
			raw: []
		}];
		var runners_groups = [];

		(function(){
			var i;
			for ( i = 0; i < cvs.length; i++) {
				var gender = Math.random() > 0.66 ? 0 : 1;
				cvs[i].gender = gender;
				genders_groups[gender].raw.push(cvs[i]);
			}
			genders_groups.forEach(function(el) {
				el.age_groups = getAgeGroups(el.raw, age_ranges_to_use, age_field);
			});
			for ( i = 0; i < genders_groups[0].age_groups.length; i++) {
				runners_groups.push({
					key: 0 + '-' + i,
					num: i + 1,
					groups_count: genders_groups[0].age_groups.length,
					gender: 0,
					runners: genders_groups[0].age_groups[i]
				});
			}
			for ( i = genders_groups[1].age_groups.length - 1; i >= 0; i--) {
				runners_groups.push({
					key: 1 + '-' + i,
					num: i + 1,
					groups_count: genders_groups[1].age_groups.length,
					gender: 1,
					runners: genders_groups[1].age_groups[i]
				});
			}
			runners_groups.reverse();


		})();
		cvs_data.getAgeGroups = getAgeGroups;
		cvs_data.genders_groups = genders_groups;
		cvs_data.runners_groups = runners_groups;
		cvs_data.start_time = start_time;
		cvs_data.last_finish_time = last_finish_time;
		cvs_data.age_ranges = age_ranges_to_use;
		eventor.trigger('load', cvs_data);
	}
};

var frame;
$(window).on('message', function(e) {
	var message = e.originalEvent.data;
	if (message && message.cvs_data){
		cvs_data = message.data;
	}
	$(frame).remove();
	//console.log(e.originalEvent.data);
	checkData();
});

$(function() {

frame = document.createElement('iframe');
$(frame)
	.css({
		visibility: 'hidden',
		position: 'absolute',
		top: 0,
		left: '-1000px'
	})
	.attr('src', 'data.html')
	.on('load', function() {
		frame.contentWindow.postMessage('send_data','*');
	})
	.appendTo(document.body);




});

return eventor;
});