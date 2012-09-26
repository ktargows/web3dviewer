function isWebGLSupported() {
	try { 
	 !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); 
	} catch( e ) { 
		return 0;
	}
	return 1;
}

function animate() {
	requestAnimationFrame(animate);
	for (var i in vc_table){
		vc_table[i].render();
	}
	fps++;
	if( (Date.now() - start_time) > 1000 ){ 
		if( fps < 20){
			for (var i in vc_table){
				vc_table[i].progressive = false;
			}
		}
		fps = 0;
		start_time = Date.now();
	}
}

var vc_byid = [];
var vc_table = [];
var vc_master;
var viewController;
var start_time;
var fps;

function web3dviewer_init() {
	// Some browsers (like Safari) does not support bind. So we mimic its behaviour
	if (typeof Function.prototype.bind !== 'function') {
		Function.prototype.bind = function (bind) {
		    var self = this;
		    return function () {
		        var args = Array.prototype.slice.call(arguments);
		        return self.apply(bind || null, args);
		    };
		};
	}

	var components = document.getElementsByClassName("web3dviewer");
	for (var i=0; i < components.length; i++) {
		var element = components.item(i);
		var id = element.id;
		if( !id ){
			id = "web3dviewer"+i;
			element.id = id;
		};
		var mesh = element.getAttribute("mesh");
		if( !mesh ){ mesh = "cube"; };

		var master = element.getAttribute("master");

		var vc = new viewController(id, mesh, master);
		vc_byid[id] = vc;
		vc_table.push(vc);
		
		if( master ){
			vc_byid[master].children.push(id);
		}

		vc.progressive = !(element.getAttribute("noprogressive") != null);
		vc.noinertia = (element.getAttribute("noinertia") != null);
		vc.view  = element.getAttribute("view");

		vc.width = parseInt(element.style.width);
		vc.height = parseInt(element.style.height);
		vc.init();
	}
	start_time = Date.now();
	animate();
}



