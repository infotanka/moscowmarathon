define(['../libs/BrowseMap', 'spv', 'provoda', './Runner', './modules/cvsloader', 'lodash'],
function(BrowseMap, spv, provoda, Runner, cvsloader, _) {
"use strict";


var FilterItem = function() {};
BrowseMap.Model.extendTo(FilterItem, {
	init: function(opts, params, type) {
		this._super(opts);
		spv.cloneObj(this.init_states, params);
		this.init_states.type = type;
		this.initStates();
		this.wch(this.map_parent, 'selected_filter_' + type, this.checkActiveState);

	},
	checkActiveState: function(e) {
		var novalue = this.state('novalue');
		if (novalue){
			this.updateState('active', !e.value);
		} else {
			this.updateState('active', e.value && e.value == this.state('label'));
		}
	},
	setFilter: function() {
		//this.RPCLegacy('setFilterBy', type, !item.novalue && item.label);
		this.map_parent.setFilterBy(this.state('type'), !this.state('novalue') && this.state('label'));
	}
});


var StartPage = function() {};
BrowseMap.Model.extendTo(StartPage, {
	model_name: 'start_page',
	zero_map_level: true,
	init: function(opts) {
		this._super(opts);
		this.common_sopts = {app: this.app, map_parent: this};
		this.updateState('query', '');
		
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




		this.wch(this, 'query', function(e) {
			var runners = this.getNesting('runners');
			if (!runners){
				return;
			}
			if (e.value){
				this.searched_r = spv.searchInArray(runners, e.value, this.search_fields);
			} else {
				this.searched_r = [];
				
			}
			this.checkRunners();
		});
		
		return this;
	},
	makeSearch: function(query) {
		this.updateState('query', query);
	},
	search_fields: [['states','pos'], ['states','full_name']],
	getFilterData: function(runners, field, limit) {
		var count = 0;
		limit = limit || 0;
		var full_field = ['states', field];
		var index = spv.makeIndexByField(runners, full_field, true);

		var result = [];
		for (var name in index){
			count++;
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
			items: result,
			count: count
		};
	},
	getIndexes: function(runners, cvsdata) {
		var states = {};
		var _this = this;

		var teams_header =['команда', 'команды', 'команд'];
		var city_header = ['город', 'города', 'городов'];

		var selectByNum = function(num, array) {
			return num + ' ' + array[spv.getUnitBaseNum(num)];
		};


		var setFilterResult = function(result, name, no_flabel, reverse) {
			_this.filters_cache[name] = result.index;
			if (no_flabel){
				if (typeof no_flabel == 'string'){
					result.items.unshift({
						label: no_flabel,
						novalue: true,
						counter: result.count
					});
				} else {
					result.items.unshift({
						label: 'Все ' + selectByNum(result.count, no_flabel),
						novalue: true,
						counter: result.count
					});
					
				}
				
			}
			if (reverse){
				result.items.reverse();
			}

			var array = [];
			for (var i = 0; i < result.items.length; i++) {
				var cur = new FilterItem();
				cur.init(_this.common_sopts, result.items[i], name);
				array.push(cur);
			}
			_this.updateNesting('filter_' + name, array);
			
			states['filter_' + name] = result.items;
		};

		
		[{
			name: 'team',
			limit: 3,
			no_flabel: teams_header
		}, {
			name: 'city',
			limit: 3,
			no_flabel: city_header
		}, {
			name: 'country',
			limit: 3,
			no_flabel: 'Со всего мира'
		}].forEach(function(el) {
			var result = _this.getFilterData(runners, el.name, el.limit);
			setFilterResult(result, el.name, el.no_flabel);
			
		});
		
		//var ages;
		//spv.makeIndex()


		setFilterResult(this.getAgesGroups(runners, cvsdata.big_ages_ranges, cvsdata), 'ages', 'от 18 до 70');
		setFilterResult(this.getGenderGroups(runners), 'gender', 'Всех вместе', true);

		this.updateManyStates(states);
	},
	getGenderGroups: function(runners) {
		var result = [];
		
		var field = ['states', 'gender'];
		var index = spv.makeIndexByField(runners, field, true);


		result.push({
			label: 'Женщин',
			counter: index[0] && index[0].length
		},{
			label: 'Мужчин',
			counter: index[1] && index[1].length
		});

		index = {
			'Мужчин': index[1],
			'Женщин': index[0]
		};
		return {
			index: index,
			items: result
		};
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
		this.updateState('selected_filter_' + type, this.filters[type]);
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
		if (result){
			result = result.slice();
		}
		if (filters && filters.length){

			result = _.intersection.apply(_, caches);
		//	console.log(result);
			//return result;
		} else {
			//return result;
		}
		var rules = [{field: ['states', 'pos']}, {field: ['states', 'num']}];
		result.sort(function(a, b) {
			return spv.sortByRules(a, b, rules);
		});
		this.filtered_r = result;
		this.checkRunners();
		
		

	},
	checkRunners: function() {
		var has_query = !!this.state('query');
		if (has_query){
			this.updateNesting('runners_filtered', this.searched_r);
		} else {
			this.updateNesting('runners_filtered', this.filtered_r);
		}
	}

});
return StartPage;

});