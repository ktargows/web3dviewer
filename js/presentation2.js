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
time = new Date().getTime(),
timedelay = 1000,
refinestep = 10,
timeLastRefine = new Date().getTime(),
loaded = false,
offset=0,
minfps = 1,
fps=0,
framescounter=0,

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
	alert("moglem uzyc webgl");
	return 1;
}

function init() {

//	if(webgl) {
	//	renderer = new THREE.WebGLRenderer({antialias: true});
	//	
	//}
	//else {
		renderer = new THREE.CanvasRenderer({antialias: true});
	//}
		
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColorHex(0xEEEEEE, 1.0);
	renderer.clear();
	
	camera = new THREE.PerspectiveCamera(
			   VIEW_ANGLE,
			   ASPECT,
			   NEAR,
			   FAR );
	
	camera.position.z = 30;
	camera.position.y = 0;
	scene = new THREE.Scene();
	scene.add(camera);
		
	scene.add( new THREE.AmbientLight( 0x505050, 2000 ) );
	var light1 = new THREE.PointLight( 0x707070, 1, 2000 );
	light1.position.x = 100;
	light1.position.z = 30;
	scene.add( light1 );
	
	var light2 = new THREE.PointLight( 0x707070, 1, 2000 );
	light2.position.x = -100;
	light2.position.z = 30;
	scene.add( light2 );
	
	loadMesh();

	document.body.appendChild( renderer.domElement );

	document.addEventListener('mousedown', onMouseDown, false);
	document.addEventListener('DOMMouseScroll', onMouseScroll, false);
	document.addEventListener('mousewheel', onMouseScroll, false);
	document.addEventListener('touchstart', Touchstart, false);
	document.addEventListener('touchmove', Touchmove, false);

}
 
function loadMesh() {
	
	mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({color: 0xffffff, shading: THREE.FlatShading}));
	loadBaseMesh();
	mesh.overdraw = true;
	mesh.doubleSided = true;
	mesh.name = 'mesh';
	scene.add(mesh);
/*	loader = new THREE.JSONLoader();

	loader.load('js/WaltHeadLo.js', function ( geometry ) {
		mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial( { overdraw: true } ) );
		mesh.doubleSided = true;
		scene.add( mesh );
	}); */
}

function animate() {

	requestAnimationFrame(animate);
	if(mesh) {
		rotateMesh();
		time = new Date().getTime();
		
		if((time - timeLastRefine) > timedelay) {
			var refine = true;
			if( framescounter < minfps*timedelay/1000 ){
				refine = false;
			} 
			if(refine && !loaded) {
				refineMesh();
			}
			timeLastRefine = time;
			framescounter = 0;
		}
		
		framescounter++;
		document.getElementById('slowRotationX').value = slowRotationX;
		document.getElementById('slowRotationY').value = slowRotationY;
		document.getElementById('targetRotationX').value = targetRotationX;
		document.getElementById('targetRotationY').value = targetRotationY;

	}
	renderer.render(scene, camera);
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
	mouseDownRotationX = targetRotationX;
	mouseDownRotationY = targetRotationY;
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
function onMouseUp(event) {
	
	event = event ? event : document.event;
	
	event.preventDefault();
	mesh.doubleSided = true;

	document.removeEventListener('mouseup', onMouseUp, false);
	document.removeEventListener('mouseout', onMouseUp, false);
	document.removeEventListener('mousemove', onMouseMove, false);

}

function onMouseScroll(event) {
	
	event = event ? event : document.event;
	
	event.preventDefault();
	
	wheelData = event.detail ? event.detail * -1 : event.wheelDelta / 40;
	moveCamera(wheelData*2);
}
function ZoomIn() {
	moveCamera(-10);
}

function ZoomOut() {
	moveCamera(10);
}

function moveCamera(howmuch) {
	
	//if(!(camera.position.z + howmuch > 1000) && !(camera.position.z + howmuch < 40))
		camera.position.z += howmuch;
	
}
function Touchstart(event) {
	
	event = event ? event: document.event;
	 
	 
	event.preventDefault();
	if(event.touches.length == 1) {
		mouseDownY = event.touches[0].pageY - windowHalfY;
		mouseDownX = event.touches[0].pageX - windowHalfX;
		mouseDownRotationX = targetRotationX;
		mouseDownRotationY = targetRotationY;
	}
}

function Touchmove(event) {
	
	event = event ? event: document.event;
	
	event.preventDefault();
	if(event.touches.length == 1) {
		mouseX = event.touches[0].pageX - windowHalfX;
		mouseY = event.touches[0].pageY - windowHalfY;
		targetRotationX = mouseDownRotationX + (mouseX - mouseDownX)*0.05;
		targetRotationY = mouseDownRotationY + (mouseY - mouseDownY)*0.05;
	}
	
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
	camera.position.z = 100;
	home = 1;
}

function changeMesh() {
	scene.remove(mesh);
	if(mesh.geometry.faces.length == 6)
		loadMesh();
	else {
		mesh = new THREE.Mesh(new THREE.CubeGeometry(20,20,20), new THREE.MeshNormalMaterial());
		scene.add(mesh);
	}
}

function WebGL() {
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColorHex(0xEEEEEE, 1.0);
	renderer.clear();
	document.body.appendChild( renderer.domElement );
}