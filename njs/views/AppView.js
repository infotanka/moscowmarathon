define(['./AppBaseView', 'jquery', 'spv', './StartPageCtr', './RunMapCompxCtr'],
function(AppBaseView, $, spv, StartPageCtr, RunMapCompxCtr) {
"use strict";



var notExist = function(el) {return typeof el == 'undefined';};
var noArgs = function() {
	return Array.prototype.some.call(arguments, notExist);
};

var AppView = function(){};
AppBaseView.extendTo(AppView, {
	children_views: {
		start_page : {
			main: StartPageCtr
		},
		runs_map_compx: RunMapCompxCtr
	},
	'collch-start_page': true,
	'collch-runs_map_compx': true,//'els.geom_c',
	createDetails: function() {
		this._super();
		var _this = this;
		setTimeout(function() {
			spv.domReady(_this.d, function() {
				_this.buildAppDOM();
			});
		});
	},
	onDomBuild: function() {
		this.c = $(this.d.body);
		this.c.addClass('app-loaded');
		this.completeDomBuilding();
	},
	buildAppDOM: function() {
		var d = this.d;
		this.els.scrolling_viewport = {
			node: $(d.body),
			offset: true
		};
		this.els.start_screen = $('#start-screen',d);
		this.els.ui_samples = $(d.body).children('#dom-templates');
		this.els.runm_c = $('#runs_map_compx');
	//	this.els.screens = $('#structure_map');
		this.handleStartScreen(this.els.start_screen);
		this.onDomBuild();
		
	},
	handleStartScreen: function(start_screen) {
		var st_scr_scrl_con = start_screen.parent();
		var start_page_wrap = st_scr_scrl_con.parent();
		/*var tpl = this.buildTemplate();
		tpl.init({
			node: start_page_wrap,
			spec_states: {
				'$lev_num': -1
			}
		});
		this.tpls.push(tpl);*/

		this.lev_containers[-1] = {
			c: start_page_wrap,
			material: start_screen,
			scroll_con: st_scr_scrl_con
		};
	},
	noArgs: noArgs
	
});
return AppView;
});