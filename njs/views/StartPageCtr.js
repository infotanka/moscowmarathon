define(['provoda', 'jquery'],
function(provoda, $) {
"use strict";

var StartPageCtr = function() {};
provoda.View.extendTo(StartPageCtr, {
	children_views:{

	},
	createDetails: function() {
		this.c = this.root_view.els.start_screen;
		this.createTemplate();
		
	},

	tpl_events:{
		
	},
	tpl_r_events:{
		
	}
});
return StartPageCtr;
});