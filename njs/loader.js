(function(){
"use strict";
requirejs.config({
	paths: {
		provoda: 'libs/provoda',
		spv: 'libs/spv',
		angbo: 'libs/StatementsAngularParser.min',
		jquery: 'libs/jquery-2.0.2.min',
		d3: 'libs/d3.v3.min'
	},
	shim: {
		"jquery-ui": {
			exports: "$",
			deps: ['jquery']
		},
		segments_data: {
			init: function(){
				return {
					types_features: window.types_features,
					uds_object: window.uds_object,
					segments: window.segments
				};
			}
		},
		d3: {
			exports: 'd3'
		}
	}
});

require(['models/AppModel', 'views/AppView', 'angbo'], function(AppModel, AppView) {
	var app = new AppModel();
	app.init();
	window.app = app;

	var view = new AppView();
	app.mpx.addView(view, 'root');

	view.init({
		mpx: app.mpx
	}, {d: window.document});
	view.requestAll();
});

})();