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
		switchMenu: function(e, node) {
			$(node).parent().toggleClass('menu_opened');
			console.log(arguments);
		}
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
		},
		filter_city:{
			setFilterBy: function(e, node, scope) {
				this.RPCLegacy('setFilterBy', 'city', scope.filtr_item.label);
			}
		}
	}
});
return StartPageCtr;
});