define(['provoda', 'jquery','spv'],
function(provoda, $, spv) {
"use strict";

var StartPageCtr = function() {};
provoda.View.extendTo(StartPageCtr, {
	children_views:{

	},
	createDetails: function() {
		this.c = this.root_view.els.start_screen;
		this.createTemplate();
		
		this.c.find('.filterr_menu').each(function(i, el) {
			var root = $(el);
			$(el).find('.filtrr').click(function(e) {
				e.stopPropagation();
				root.toggleClass('menu_opened');
			});
			root.click(function(e) {
				e.stopPropagation();
				root.removeClass('menu_opened');
			});
			$(document).click(function() {
				root.removeClass('menu_opened');
			});
			
		});
	},

	tpl_events:{
		makeSearch: spv.debounce(function(e, node) {
			this.RPCLegacy('makeSearch', $(node).val());
		}, 200)
	},
	setFilterBy: function(type, scope) {
		var item = scope.filtr_item;
		this.RPCLegacy('setFilterBy', type, !item.novalue && item.label);
	},
	tpl_r_events:{
		filter_gender:{
			setFilterBy: function(e, node, scope) {
				this.setFilterBy('gender', scope);
			}
		},
		filter_team: {
			setFilterBy: function(e, node, scope) {
				this.setFilterBy('team', scope);
				
			}
		},
		filter_ages:{
			setFilterBy: function(e, node, scope) {
				this.setFilterBy('ages', scope);
			}
		},
		filter_city:{
			setFilterBy: function(e, node, scope) {
				this.setFilterBy('city', scope);
			}
		}
	}
});
return StartPageCtr;
});