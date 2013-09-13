define(['../libs/BrowseMap', 'spv', 'provoda', './Runner', './modules/cvsloader', 'lodash'],
function(BrowseMap, spv, provoda, Runner, cvsloader, _) {
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
			this.makeFiltersResult();
		}, this.getContextOpts());

		this.filters = {};
		this.filters_cache = {};
		
		return this;
	},
	getFilterData: function(runners, field, limit) {
		limit = limit || 0;
		var full_field = ['states', field];
		var index = spv.makeIndexByField(runners, full_field, true);

		var result = [];
		for (var name in index){
			if (name == '#other' || index[name].length < limit){
				continue;
			}
			result.push({
				label: name,
				counter: index[name].length
			});
		}


		var filter_opts = [{
			field: ['counter'],
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
			limit: 3,
			no_flabel: 'Все команды'
		}, {
			name: 'city',
			limit: 3,
			no_flabel: 'Со всего мира'
		}, {
			name: 'country',
			limit: 3,
			no_flabel: 'Со всего мира'
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
		var index = {};

		for (var i = 0; i < age_ranges.length; i++) {
			index[age_ranges[i].label] = groups[i];
			result.push({
				label: age_ranges[i].label,
				counter: groups[i].length
			});

			//age_ranges[i]
		}
		return {
			index: index,
			items: result
		};
	},
	setFilterBy: function(type, name) {
		if (this.filters[type] == name){
			this.filters[type] = null;
		} else {
			this.filters[type] = name;
		}
		this.checkFilters();
	},
	checkFilters: function() {
		var result = [];
		var caches = [];
		for (var type in  this.filters) {
			var cur = this.filters[type];
			if (!cur){
				continue;
			}
			result.push({
				type: type,
				value: cur
			});
		}
		var _this = this;
		var sort_rule = [{
			field: function(el) {
				var array = _this.filters_cache[el.type];
				array = array && array[el.value];
				return array && array.length;
			}
		}];

		result.sort(function(a, b) {
			return spv.sortByRules(a, b, sort_rule);
		});
		result.forEach(function(el) {
			caches.push(_this.filters_cache[el.type][el.value]);
		});

		this.makeFiltersResult(result, caches);

		//console.log(result);

	},
	makeFiltersResult: function(filters, caches) {
		var result = this.getNesting('runners');
		if (filters && filters.length){

			result = _.intersection.apply(_, caches);
		//	console.log(result);
			//return result;
		} else {
			//return result;
		}
		var rules = [{field: ['states', 'pos']}];
		result.sort(function(a, b) {
			return spv.sortByRules(a, b, rules);
		});
		this.updateNesting('runners_filtered', result);
		

	}

});
return StartPage;

});