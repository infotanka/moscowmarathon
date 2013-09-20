(function(){
"use strict";
window.onmessage = function(e) {
	
	if (e.data == 'send_data'){
		var parent = window.parent;
		if (parent){
			parent.postMessage({
				cvs_data: true,
				data: window.jsondata
			}, '*');
		}
	}
};
})();