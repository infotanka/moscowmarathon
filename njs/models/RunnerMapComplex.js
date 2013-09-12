define(['provoda', './modules/mm2013geo', './modules/cvsloader'], function(provoda, geodata, cvsloader) {
"use strict";


var RunMap = function() {};
provoda.HModel.extendTo(RunMap, {
	init: function(opts) {
		this._super(opts);

		this.wch(this.map_parent, 'selected_time');
		this.updateState('geodata', geodata);
		cvsloader.on('load', function(cvs_data) {
			this.updateState('cvs_data', cvs_data);
		}, this.getContextOpts());
	}
});

var RunnerMapComplex = function() {};
provoda.HModel.extendTo(RunnerMapComplex, {
	init: function(opts){
		this._super(opts);
		this.updateState('geodata', geodata);
		cvsloader.on('load', function(cvs_data) {
			this.updateState('cvs_data', cvs_data);
		}, this.getContextOpts());

		var run_map = new RunMap();
		run_map.init({
			app: this.app,
			map_parent: this
		});
		this.updateNesting('run_map', run_map);

		this.setTime(0.2);
	},
	setTime: function(factor) {
		this.updateState('selected_time', factor);
	}
});
return RunnerMapComplex;
});