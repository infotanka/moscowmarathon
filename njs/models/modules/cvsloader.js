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


var checkData = function() {
	if (cvs_data){
		var cvs = cvs_data.items;
		cvs.sort(function(a, b){
			return spv.sortByRules(a, b, [{
				field: ['result_time'],
				reverse: false
			}]);
		});

		


		

		var last_finish_time = 0;

		for (var i = 0; i < cvs.length; i++) {

			last_finish_time = Math.max(last_finish_time, cvs[i].end_time);
		}

		/*
		18-19, 20-22, 23-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65+

18-22
23-34
35-49
50-65
65+

		v


		*/

		var big_ages_group

		var small_ages_group = [
			{
				start: 18,
				end: 22,
				label: '18-22'
			},{
				start: 23,
				end: 34,
				label: '23-34'
			},{
				start: 35,
				end: 49,
				label: '35-49'
			},{
				start: 50,
				end: 65,
				label: '50-65'
			},{
				start: 65,
				end: Infinity,
				label: '65+'
			}
		];

		var age_ranges_to_use = small_ages_group;
		var age_field = [3];

		var start_year = (new Date(cvs_data.start_time)).getFullYear();

		var getAgeGroups = function(array, ranges, field){
			var age_groups = [];
			var r = array;
			var max = 0;
			for (var i = 0; i < ranges.length; i++) {

				var age_range = ranges[i];
				var g = spv.filter(r, field, function(value) {
					var date = start_year - value;
					if (date >= age_range.start && date <= age_range.end){
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
				
				genders_groups[cvs[i].gender].raw.push(cvs[i]);
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

		cvs_data.last_finish_time = last_finish_time;
		cvs_data.run_gap = (last_finish_time - cvs_data.start_time)/1000;
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
	.attr('src', 'data/data.html')
	.on('load', function() {
		frame.contentWindow.postMessage('send_data','*');
	})
	.appendTo(document.body);




});

return eventor;
});