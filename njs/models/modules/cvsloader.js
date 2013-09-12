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
				field: [8],
				reverse: false
			}]);
		});

		var start_time = new Date(2013, 6, 30, 9) * 1;


		var group_num = 20;
		var groups_count = Math.ceil(cvs.length/group_num);

		var normlz_maxtime = cvs_data.max_time /4;
		var start_diff = (normlz_maxtime / groups_count) * 1000;

		for (var i = 0; i < cvs.length; i++) {

			cvs[i].start_time = start_time + (Math.ceil((i+1)/groups_count) - 1) * start_diff;
			cvs[i].end_time = start_time + cvs[i][8] * 1000;
		}



		var getAgeGroups = function(array){
			var age_groups = [];
			var age_groups_count = 3;
			var age_groups_diff = (65 - 18)/age_groups_count;
			var r = array;
			var start_year = (new Date(start_time)).getFullYear();
			var field = [3];
			for (var i = 0; i < age_groups_count; i++) {
				var age_group_range = 18 + i * age_groups_diff;
				var g = spv.filter(r, field, function(value) {
					var date = start_year - value;
					if (date < age_group_range){
						return true;
					}

				});
				age_groups.push(g);
				r = g.not;
				//console.log(g);
			}
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
				genders_groups[gender].raw.push(cvs[i]);
			}
			genders_groups.forEach(function(el, num) {
				el.age_groups = getAgeGroups(el.raw);
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

		cvs_data.runners_groups = runners_groups;
		cvs_data.start_time = start_time;
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