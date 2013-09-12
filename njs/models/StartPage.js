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
				runners.push(runner);
			}
			this.updateNesting('runners', runners);
		}, this.getContextOpts());
		
		return this;
	}
});
return StartPage;

});