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
		filter_team: {
			setFilterBy: function(e, node, scope) {
				this.RPCLegacy('setFilterBy', 'team', scope.filtr_item.label);
			}
		},
		filter_ages:{
			setFilterBy: function(e, node, scope) {
				this.RPCLegacy('setFilterBy', 'ages', scope.filtr_item.label);
			}
		}
	}
});
return StartPageCtr;
});