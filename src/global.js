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
}

var vc_byid = [];
var vc_table = [];

function web3dviewer_init() {

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
		var progressive = (element.getAttribute("progressive") === 'true');
		var vc = new viewController(id, mesh, progressive);
		vc_byid[element.id] = vc;
		vc_table.push(vc);

		vc.width = parseInt(element.style.width);
		vc.height = parseInt(element.style.height);
		vc.init();
	}
	animate();
}

var VIEW_ANGLE = 60,
NEAR = 0.1,
FAR = 200;

/*
var CAMERA_MOVE = 5;

//Vars
var
home,
maxDimension,
stats,
vslider,
offset=0,
refinestep = 10,
loaded = false,
time = new Date().getTime(),
timedelay = 3000,
timeLastRefine = new Date().getTime(),
minfps = 1,
fps=0,
framescounter=0,
progressive=false,

//Renderer

//important vars
webgl = isWebGLSupported();
*/

