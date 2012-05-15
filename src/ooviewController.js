function isWebGLSupported() {
	try { 
	 !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); 
	} catch( e ) { 
		return 0;
	}
	return 1;
}

//requestAnimationFrame(vc.animate);
function animate() {
        requestAnimationFrame(animate);
	for (var i in vc_table){
		vc_table[i].render();
	}
}

var vc_byid = [];
var vc_table = [];

function init() {

	var components = document.getElementsByClassName("web3dviewer");
	for (var i=0; i < components.length; i++) {
		var element = components.item(i);
		var vc = new viewController(element.id, 'cube');
		vc_byid[element.id] = vc;
		vc_table.push(vc);
		vc.init();
	}
	animate();
}

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
WIDTH = 200,
HEIGHT = 200,

//Camera
VIEW_ANGLE = 60,
ASPECT = WIDTH / HEIGHT,
NEAR = 1,
FAR = 10000,

//important vars
webgl = isWebGLSupported(),
loader,
scene,
camera,
renderer,
mesh,
light;


viewController = function(id, mesh_name) {
  this.id = id;
  this.mesh_name = mesh_name;

  this.mouseDownX = 0; 
  this.mouseDownY = 0;
  this.windowHalfX = window.innerWidth/2;
  this.windowHalfY = window.innerHeight/2; 
  this.mouseX = 0;
  this.mouseY = 0;
  this.targetRotationX = 0; 
  this.targetRotationY = 0;
  this.mouseDownRotationX = 0;
  this.mouseDownRotationY = 0;
  this.wheelData = 0;
  this.noinertia = 0;
  this.newrotationmatrix;
  this.newrotation;
  this.slowRotationX=0;
  this.slowRotationY=0;

}

viewController.prototype.init = function () {

	this.renderer = new THREE.CanvasRenderer({antialias: true});
		
	this.renderer.setSize(WIDTH, HEIGHT);
	this.renderer.setClearColorHex(0xEEEEEE, 1.0);
	this.renderer.clear();
	
	this.camera = new THREE.PerspectiveCamera(
			   VIEW_ANGLE,
			   ASPECT,
			   NEAR,
			   FAR );
	
//	stats = new Stats();
//	stats.domElement.style.position = 'absolute';
//	stats.domElement.style.top = '0px';
//	stats.domElement.style.left = '0px';
//	document.getElementById("web3dviewer").appendChild( stats.domElement );
	
	
	this.scene = new THREE.Scene();
	this.scene.add(this.camera);
	this.scene.add( new THREE.AmbientLight( 0x505050, 2000 ) );
	this.light = new THREE.PointLight( 0x707070, 1, 2000 );
	this.scene.add( this.light );

	this.loadMesh(true);

//	setParameters();
	this.mesh.doubleSided = true;
	this.mesh.geometry.computeBoundingBox();
	var box = this.mesh.geometry.boundingBox;
	if(box) {
		maxDimension = Math.max(box.x[1]-box.x[0], box.y[1]-box.y[0]);
		maxDimension = Math.ceil(Math.max(maxDimension, box.z[1]-box.z[0]));
		this.camera.position.z = this.light.position.z = maxDimension*2;
		this.camera.position.x = box.x[0] + (box.x[1]-box.x[0])/2;
		this.camera.position.y = box.y[0] + (box.y[1]-box.y[0])/2;
		
		//vslider.setMinimum(-maxDimension);
		//vslider.setMaximum(maxDimension*1.5);
		//vslider.setValue(maxDimension*0.25);
	}
	this.scene.add(this.mesh);



	document.getElementById(this.id).appendChild( this.renderer.domElement );

	
//	vslider = new Slider(document.getElementById("slider-vertical"), document.getElementById("slider-vertical-input"), "vertical");
	
//	vslider.onchange = onSliderChange;
	
	this.renderer.domElement.style.position = 'absolute';
	this.renderer.domElement.style.left = '0px';

	this.renderer.domElement.addEventListener('mousedown', this.onMouseDown, false);
//	this.renderer.domElement.addEventListener('DOMMouseScroll', onMouseScroll, false);
//	this.renderer.domElement.addEventListener('mousewheel', onMouseScroll, false);
//	this.renderer.domElement.addEventListener('touchstart', onTouchStart, false);
//	this.renderer.domElement.addEventListener('touchmove', onTouchMove, false);
//	this.renderer.domElement.addEventListener('touchend', onTouchEnd, false);
//	this.renderer.domElement.addEventListener('contextmenu', onContextMenu, false);

	this.render();
	

}

/*
function onContextMenu(event) {
	
	event = event ? event : document.event;
	
	event.preventDefault();
	return false;
}
*/
viewController.prototype.loadMesh = function (test) {
	
	if(!test) {
		this.mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({color: 0xffffff, shading: THREE.FlatShading}));
		this.loadBaseMesh();
	}
	else {
		this.mesh = new THREE.Mesh(new THREE.CubeGeometry(20,20,20), new THREE.MeshNormalMaterial());
//		loader = new THREE.JSONLoader();
//		loader.load('meshes/WaltHeadLo.js', function ( geometry ) {
//			mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial( { overdraw: true } ) );
//		}; 
	}
	
} 
/*
function setParameters() {
		
		mesh.doubleSided = true;
		mesh.geometry.computeBoundingBox();
		var box = mesh.geometry.boundingBox;
		if(box) {
			maxDimension = Math.max(box.x[1]-box.x[0], box.y[1]-box.y[0]);
			maxDimension = Math.ceil(Math.max(maxDimension, box.z[1]-box.z[0]));
			camera.position.z = light.position.z = maxDimension*2;
			camera.position.x = box.x[0] + (box.x[1]-box.x[0])/2;
			camera.position.y = box.y[0] + (box.y[1]-box.y[0])/2;
			
			//vslider.setMinimum(-maxDimension);
			//vslider.setMaximum(maxDimension*1.5);
			//vslider.setValue(maxDimension*0.25);
		}
		scene.add(mesh);
}
*/


viewController.prototype.render = function () {
	if(this.mesh) {
		this.rotateMesh();
	}
	this.renderer.render(this.scene, this.camera);
//	stats.update();
}


viewController.prototype.rotateMesh = function () {

	this.newrotationmatrix = new THREE.Matrix4();
	this.newrotation = new THREE.Vector3((this.targetRotationY-this.slowRotationY)*0.05,(this.targetRotationX-this.slowRotationX)*0.05,0);
	this.newrotationmatrix.setRotationFromEuler(this.newrotation);
	this.newrotationmatrix.multiplySelf(this.mesh.matrix);
	this.mesh.rotation.setRotationFromMatrix(this.newrotationmatrix);

	if(this.noinertia) 
		this.targetRotationX = this.targetRotationY = 0;
	else {
		this.slowRotationX += (this.targetRotationX - this.slowRotationX)*0.02;
		this.slowRotationY += (this.targetRotationY - this.slowRotationY)*0.02;
	}
	
/*
	if(this.home) {
		this.mesh.rotation.setRotationFromMatrix(new THREE.Matrix4());
		this.home = false;
	}
*/

}

viewController.prototype.onMouseDown = function (event) {

   var vc = vc_byid[event.target.parentNode.id];

	event = event ? event : document.event;
	
	event.preventDefault();

	
	document.addEventListener('mouseup', vc.onMouseUp, false);
	document.addEventListener('mouseout', vc.onMouseUp, false);
	document.addEventListener('mousemove', vc.onMouseMove, false);

	
	if(event.pageX || event.pageY) {
		vc.mouseDownX = event.pageX;
		vc.mouseDownY = event.pageY;
	}
	else if(event.clientX || event.clientY) {
		vc.mouseDownX = event.clientX + document.body.scrollLeft;
		vc.mouseDownY = event.clientY + document.body.scrollTop;
	}
	
	vc.mouseDownY -= vc.windowHalfY;
	vc.mouseDownX -= vc.windowHalfX;
	
	if(event.which == 1) {
		vc.mouseDownRotationX = vc.targetRotationX;
		vc.mouseDownRotationY = vc.targetRotationY;
	}

}

viewController.prototype.onMouseMove = function (event) {

   var vc = vc_byid[event.target.parentNode.id];
	
	event = event ? event : document.event;
	
	event.preventDefault();
	
	if(event.pageX || event.pageY) {
		vc.mouseX = event.pageX;
		vc.mouseY = event.pageY;
	}
	else if(event.clientX || event.clientY) {
		vc.mouseX = event.clientX + document.body.scrollLeft;
		vc.mouseY = event.clientY + document.body.scrollTop;
	}
	
	vc.mouseX -= vc.windowHalfX;
	vc.mouseY -= vc.windowHalfY;
	if(event.which == 1) {
		if(vc.noinertia) {
			vc.targetRotationX = (vc.mouseX - vc.mouseDownX)*0.2;
			vc.targetRotationY = (vc.mouseY - vc.mouseDownY)*0.2;
			vc.mouseDownX = vc.mouseX;
			vc.mouseDownY = vc.mouseY;
		}
		else {
			vc.targetRotationX = vc.mouseDownRotationX + (vc.mouseX - vc.mouseDownX)*0.02;
			vc.targetRotationY = vc.mouseDownRotationY + (vc.mouseY - vc.mouseDownY)*0.02;
		}
	}
	else if(event.which == 3) {
		vc.camera.position.x -= (vc.mouseX - vc.mouseDownX)*0.2;
		vc.camera.position.y += (vc.mouseY - vc.mouseDownY)*0.2;
		vc.mouseDownX = vc.mouseX;
		vc.mouseDownY = vc.mouseY;
	}

}


viewController.prototype.onMouseUp = function (event) {

        var vc = vc_byid[event.target.parentNode.id];
	event = event ? event : document.event;
	
	event.preventDefault();
	vc.mesh.doubleSided = true;
	vc.mesh.material.wireframe = false;

	document.removeEventListener('mouseup', vc.onMouseUp, false);
	document.removeEventListener('mouseout', vc.onMouseUp, false);
	document.removeEventListener('mousemove', vc.onMouseMove, false);

}

function onMouseScroll(event) {
	
	event = event ? event : document.event;
	event.preventDefault();
	
	wheelData = event.detail ? event.detail * -1 : event.wheelDelta / 40;
	vslider.setValue(vslider.getValue() + (wheelData > 0 ? 0.05 : -0.05) * (vslider.getMaximum() - vslider.getMinimum()));
}

function onSliderChange() {
	
	camera.position.z = maxDimension*2 - this.getValue();
}

function onTouchStart(event) {
	
	event = event ? event: document.event;
	mesh.doubleSided = false;
	mesh.material.wireframe = true;
	event.preventDefault();
	if(event.touches.length == 1) {
		mouseDownY = event.touches[0].pageY - windowHalfY;
		mouseDownX = event.touches[0].pageX - windowHalfX;
		mouseDownRotationX = targetRotationX;
		mouseDownRotationY = targetRotationY;
	}
}

function onTouchMove(event) {
	
	event = event ? event: document.event;
	
	event.preventDefault();
	if(event.touches.length == 1) {
		mouseX = event.touches[0].pageX - windowHalfX;
		mouseY = event.touches[0].pageY - windowHalfY;
		targetRotationX = mouseDownRotationX + (mouseX - mouseDownX)*0.05;
		targetRotationY = mouseDownRotationY + (mouseY - mouseDownY)*0.05;
	}
	
}

function onTouchEnd(event) {
	
	event = event ? event: document.event;
	
	event.preventDefault();
	mesh.doubleSided = true;
	mesh.material.wireframe = false;
}
/*
function Inertia() {
	
	if(noinertia) {
		noinertia = 0;
		slowRotationX = slowRotationY = 0;
	}
	else {
		noinertia = 1;
		targetRotationX = targetRotationY = 0;
		slowRotationX = slowRotationY = 0;
	}
	
	mouseDownRotationX = mouseDownRotationY = mouseDownX = mouseDownY = mouseX = mouseY = 0;
}
*/
/*
function Home() {

	targetRotationX = targetRotationY = mouseDownRotationX = mouseDownRotationY = mouseDownX = mouseDownY = mouseX = mouseY = slowRotationX = slowRotationY = 0;
	//mesh.rotation.setRotationFromMatrix(new THREE.Matrix4());
	vslider.setValue(maxDimension*0.25);
	mesh.geometry.computeBoundingBox();
	var box = mesh.geometry.boundingBox;
	camera.position.x = box.x[0] + (box.x[1]-box.x[0])/2;
	camera.position.y = box.y[0] + (box.y[1]-box.y[0])/2;
	home = 1;
	
}
*/
/*
function loadCube() {
	scene.remove(mesh);
	if(mesh.geometry.faces.length == 6)
		loadMesh();
	else {
		mesh = new THREE.Mesh(new THREE.CubeGeometry(20,20,20), new THREE.MeshNormalMaterial());
		setParameters();
	}
}

function moveCamera(direction) {
	

	switch(direction) {
		
		case "up": camera.position.y -= CAMERA_MOVE; break;
		case "down": camera.position.y += CAMERA_MOVE; break;
		case "left": camera.position.x += CAMERA_MOVE; break;
		case "right": camera.position.x -= CAMERA_MOVE; break;
		default: break;
	}
}
*/
