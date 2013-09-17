define(['../libs/BrowseMap'], function(BrowseMap) {
"use strict";

var Runner = function() {};
BrowseMap.Model.extendTo(Runner, {
	model_name: 'runner',
	init: function(opts, raw) {
		this._super(opts);
		this.mapStates(this.raw_map_st, raw, true);
		this.initStates();
	},
	raw_map_st: {
		pos: 'pos',
		num: 'num',
		full_name: 'full_name',
		birthyear: 'birthyear',
		country: 'country',
		region: 'region',
		city: 'city',
		team: 'team',

		gender: 'gender',
		full_time_string: 'result_time_string'
	}

	//Ctry✌✄✌Region✌✄✌City✌✄✌Club✌✄✌Result✌✄✄✌Group✌✄✌P.on g.✌✄✌Netto time✌✄✄
});
return Runner;

});