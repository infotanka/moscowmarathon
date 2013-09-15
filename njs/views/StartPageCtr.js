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
		this.header = this.tpl.ancs['runners_header'];
		this.list = this.tpl.ancs['runners_list'];

		this.promiseStateUpdate('header_height', this.header.height());
		this.checkListPos();



		var _this = this;
		$(window).on('resize', function() {

		});
		this.wch(this.root_view, 'mapheight', function(e) {
			if (!e.value){
				return;
			}
			this.checkListPos();
			this.checkFixPos();
		});

		$(window).on('scroll', function() {

			_this.checkFixPos();
		});
		//
		//
	},
	'after-collch-runners_filtered':function() {
		this.nextTick(function() {
			this.checkListPos();
			this.checkFixPos();
		});
	},
	checkFixPos: function() {
		//header_fixed
		
		var list_top = this.state('list_top');
		var list_bottom = this.state('list_bottom');
		var header_height = this.state('header_height');
		if (list_top && list_bottom){
			var header_fixed = this.state('header_fixed');
			var possible_top = (header_fixed ? list_top - header_height : list_top) - header_height;
			var possible_bottom = (header_fixed ? list_bottom - header_height : list_bottom);
			var scroll_top = $(window).scrollTop();
			var need_fix = scroll_top > possible_top && scroll_top < possible_bottom;
			this.header.toggleClass('fixed_rheader', need_fix);
			this.list.css('margin-top', need_fix ? (header_height + 'px') : '' );
			
		}

		//var possible_top = 
	},
	checkListPos: function() {
		var top = this.list.offset().top;
		this.promiseStateUpdate('list_top', top);
		this.promiseStateUpdate('list_bottom', top + this.list.height());

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