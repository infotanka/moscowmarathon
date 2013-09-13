define(['../libs/BrowseMap', 'spv', 'provoda', './Runner', './modules/cvsloader'],
function(BrowseMap, spv, provoda, Runner, cvsloader) {
"use strict";

var StartPage = function() {};
BrowseMap.Model.extendTo(StartPage, {
	model_name: 'start_page',
	zero_map_level: true,
	init: function(opts) {
		this._super(opts);
		this.common_sopts = {app: this.app, map_parent: this};

		
		cvsloader.on('load', function(data) {
			var runners = [];
			for (var i = 0; i < data.items.length; i++) {
				var runner = new Runner();
				runner.init(this.common_sopts, data.items[i]);
				data.items[i].model = runner;
				runners.push(runner);
			}
			this.updateNesting('runners', runners);
			this.getIndexes(runners, data);
		}, this.getContextOpts());

		this.filters_cache = {};
		
		return this;
	},
	getFilterData: function(runners, field, limit) {
		limit = limit || 0;
		var full_field = ['states', field];
		var index = spv.makeIndexByField(runners, full_field);

		var result = [];
		for (var name in index){
			if (name == '#other' || index[name].length < limit){
				continue;
			}
			result.push({
				label: name,
				length: index[name].length
			});
		}


		var filter_opts = [{
			field: ['length'],
			reverse: true
		}, {
			field: ['label']
		}];
		result.sort(function(a, b) {
			return spv.sortByRules(a, b, filter_opts);
		});

		return {
			index: index,
			items: result
		};
	},
	getIndexes: function(runners, cvsdata) {
		var states = {};
		var _this = this;

		var setFilterResult = function(result, name) {
			_this.filters_cache[name] = result.index;
			states['filter_' + name] = result.items;
		};

		
		[{
			name: 'team',
			limit: 3
		}, {
			name: 'city',
			limit: 3
		}, {
			name: 'country',
			limit: 3
		}].forEach(function(el) {
			var result = _this.getFilterData(runners, el.name, el.limit);
			setFilterResult(result, el.name);
			
		});
		
		//var ages;
		//spv.makeIndex()
		var agesgroups = this.getAgesGroups(runners, cvsdata.age_ranges, cvsdata);
		setFilterResult(agesgroups, 'ages');

		this.updateManyStates(states);

		console.log(states);
		console.log('ff', agesgroups);
	},
	getAgesGroups: function(runners, age_ranges, cvsdata) {
		var result = [];
		var field = ['states', 'birthyear'];
		var groups = cvsdata.getAgeGroups(runners, age_ranges, field);

		for (var i = 0; i < age_ranges.length; i++) {
			
			result.push({
				label: age_ranges[i].label,
				length: groups[i].length
			});

			//age_ranges[i]
		}
		return {
			index: groups,
			items: result
		};
	}
});
return StartPage;

});