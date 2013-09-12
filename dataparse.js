(function(){
"use strict";
var max_time = 0;
var stringToTime = function(obj, place) {
	if (obj[place]){
		var date = obj[place].split(/\:|\./gi);
		obj[place] = (date[0] * 60 + date[1]*1) * 60 + date[2]*1;
	}
};
var cvs = document.getElementById('cvs').textContent.replace(/✌/gi, '').split(/\n/gi).map(function(el){
	var pa = el.split('✄');
	stringToTime(pa, 15);
	stringToTime(pa, 8);
	if (pa[8]){
		max_time = Math.max(pa[8], max_time);
	}
	pa[3] = pa[3] * 1;
	return pa;
});

var ncvs = [];
for (var i = 0; i < cvs.length; i++) {
	if (cvs[i][8]){
		ncvs.push(cvs[i]);
	}
}


window.onmessage = function(e) {
	
	if (e.data == 'send_data'){
		var parent = window.parent;
		if (parent){
			parent.postMessage({
				cvs_data: true,
				data: {
					max_time: max_time,
					items: ncvs
				}
			}, '*');
		}
	}
};
})();