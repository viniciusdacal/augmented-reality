var CoreManager = (function(){
	'use strict';
	var core = {

		init: function(canvasId){
			this.canvasEl = document.getElementById(canvasId);
			this.ctx = this.canvasEl.getContext('2d');
		}
	};

	return core;
});