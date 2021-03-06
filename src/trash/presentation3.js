const CAMERA_MOVE = 5;

//Vars
var mouseDownX = 0, 
mouseDownY = 0,
windowHalfX = window.innerWidth/2, 
windowHalfY = window.innerHeight/2, 
mouseX = 0,
mouseY = 0,
targetRotationX = 0, 
targetRotationY = 0,
mouseDownRotationX = 0,
mouseDownRotationY = 0,
wheelData = 0,
noinertia = 0,
newrotationmatrix,
newrotation,
slowRotationX=0,
slowRotationY=0,
home,
maxDimension,
stats,
vslider,

//Renderer
WIDTH = window.innerWidth,
HEIGHT = window.innerHeight,

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
mesh;

init();
animate();

function isWebGLSupported() {
	try { 
	 !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); 
	} catch( e ) { 
		return 0;
	}
	return 1;
}

function init() {

	if(webgl) {
		renderer = new THREE.WebGLRenderer({antialias: true});
		
	}
	else {
		renderer = new THREE.CanvasRenderer({antialias: true});
	}
		
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColorHex(0xEEEEEE, 1.0);
	renderer.clear();
	
	camera = new THREE.PerspectiveCamera(
			   VIEW_ANGLE,
			   ASPECT,
			   NEAR,
			   FAR );
	
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	document.body.appendChild( stats.domElement );
	
	
	scene = new THREE.Scene();
	scene.add(camera);
	
	loadMesh();

	document.body.appendChild( renderer.domElement );
	
	vslider = new Slider(document.getElementById("slider-vertical"), document.getElementById("slider-vertical-input"), "vertical");
	
	vslider.onchange = onSliderChange;
	
	renderer.domElement.addEventListener('mousedown', onMouseDown, false);
	renderer.domElement.addEventListener('DOMMouseScroll', onMouseScroll, false);
	renderer.domElement.addEventListener('mousewheel', onMouseScroll, false);
	renderer.domElement.addEventListener('touchstart', onTouchStart, false);
	renderer.domElement.addEventListener('touchmove', onTouchMove, false);
	renderer.domElement.addEventListener('touchend', onTouchEnd, false);
	renderer.domElement.addEventListener('contextmenu', onContextMenu, false);

}

function onContextMenu(event) {
	
	event = event ? event : document.event;
	
	event.preventDefault();
	return false;
}
function loadMesh() {
	
	loader = new THREE.JSONLoader();
	loader.load('js/WaltHeadLo.js', function ( geometry ) {
		mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial( { overdraw: true } ) );
		setParameters();
	}); 
	
}

function setParameters() {
		
		mesh.doubleSided = true;
		mesh.geometry.computeBoundingBox();
		var box = mesh.geometry.boundingBox;
		maxDimension = Math.max(box.x[1]-box.x[0], box.y[1]-box.y[0]);
		maxDimension = Math.ceil(Math.max(maxDimension, box.z[1]-box.z[0]));
		camera.position.z = maxDimension*2;
		camera.position.x = box.x[0] + (box.x[1]-box.x[0])/2;
		camera.position.y = box.y[0] + (box.y[1]-box.y[0])/2;
		
		vslider.setMinimum(-maxDimension);
		vslider.setMaximum(maxDimension*1.5);
		vslider.setValue(maxDimension*0.25);
	
		scene.add(mesh);
}

function animate() {

	requestAnimationFrame(animate);
	if(mesh) {
		rotateMesh();
	}
	renderer.render(scene, camera);
	stats.update();
}

function rotateMesh() {
	
	newrotationmatrix = new THREE.Matrix4();
	newrotation = new THREE.Vector3((targetRotationY-slowRotationY)*0.05,(targetRotationX-slowRotationX)*0.05,0);
	newrotationmatrix.setRotationFromEuler(newrotation);
	newrotationmatrix.multiplySelf(mesh.matrix);
	mesh.rotation.setRotationFromMatrix(newrotationmatrix);

	if(noinertia) 
		targetRotationX = targetRotationY = 0;
	else {
		slowRotationX += (targetRotationX - slowRotationX)*0.02;
		slowRotationY += (targetRotationY - slowRotationY)*0.02;
	}
	
	if(home) {
		mesh.rotation.setRotationFromMatrix(new THREE.Matrix4());
		home = 0;
	}
}
function onMouseDown(event) {
	
	event = event ? event : document.event;
	
	event.preventDefault();

	mesh.doubleSided = false;
	mesh.material.wireframe = true;

	document.addEventListener('mouseup', onMouseUp, false);
	document.addEventListener('mouseout', onMouseUp, false);
	document.addEventListener('mousemove', onMouseMove, false);

	
	if(event.pageX || event.pageY) {
		mouseDownX = event.pageX;
		mouseDownY = event.pageY;
	}
	else if(event.clientX || event.clientY) {
		mouseDownX = event.clientX + document.body.scrollLeft;
		mouseDownY = event.clientY + document.body.scrollTop;
	}
	
	mouseDownY -= windowHalfY;
	mouseDownX -= windowHalfX;
	
	if(event.which == 1) {
		mouseDownRotationX = targetRotationX;
		mouseDownRotationY = targetRotationY;
	}
}

function onMouseMove(event) {
	
	event = event ? event : document.event;
	
	event.preventDefault();
	
	if(event.pageX || event.pageY) {
		mouseX = event.pageX;
		mouseY = event.pageY;
	}
	else if(event.clientX || event.clientY) {
		mouseX = event.clientX + document.body.scrollLeft;
		mouseY = event.clientY + document.body.scrollTop;
	}
	
	mouseX -= windowHalfX;
	mouseY -= windowHalfY;
	if(event.which == 1) {
		if(noinertia) {
			targetRotationX = (mouseX - mouseDownX)*0.2;
			targetRotationY = (mouseY - mouseDownY)*0.2;
			mouseDownX = mouseX;
			mouseDownY = mouseY;
		}
		else {
			targetRotationX = mouseDownRotationX + (mouseX - mouseDownX)*0.02;
			targetRotationY = mouseDownRotationY + (mouseY - mouseDownY)*0.02;
		}
	}
	else if(event.which == 3) {
		camera.position.x -= (mouseX - mouseDownX)*0.2;
		camera.position.y += (mouseY - mouseDownY)*0.2;
		mouseDownX = mouseX;
		mouseDownY = mouseY;
	}
}

function onMouseUp(event) {
	
	event = event ? event : document.event;
	
	event.preventDefault();
	mesh.doubleSided = true;
	mesh.material.wireframe = false;

	document.removeEventListener('mouseup', onMouseUp, false);
	document.removeEventListener('mouseout', onMouseUp, false);
	document.removeEventListener('mousemove', onMouseMove, false);

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

function Home() {

	targetRotationX = targetRotationY = mouseDownRotationX = mouseDownRotationY = mouseDownX = mouseDownY = mouseX = mouseY = slowRotationX = slowRotationY = 0;
	mesh.rotation.setRotationFromMatrix(new THREE.Matrix4());
	vslider.setValue(maxDimension*0.25);
	var box = mesh.geometry.boundingBox;
	camera.position.x = box.x[0] + (box.x[1]-box.x[0])/2;
	camera.position.y = box.y[0] + (box.y[1]-box.y[0])/2;
	home = 1;
	
}

function changeMesh() {
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