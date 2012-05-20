
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
  this.slowRotationX = 0;
  this.slowRotationY = 0;
  this.home = false;
  this.maxDimension = 0;
  this.CAMERA_MOVE = 5;
  
  this.width = 300;
  this.height = 300;

}

viewController.prototype.init = function () {

	this.renderer = new THREE.CanvasRenderer({antialias: true});
		
	this.renderer.setSize(this.width, this.height);
	this.renderer.setClearColorHex(0xEEEEEE, 1.0);
	this.renderer.clear();
	
	this.camera = new THREE.PerspectiveCamera(
			   VIEW_ANGLE,
			   this.width/this.height,
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
	
	this.createPanel();
	
	this.loadMesh();
	this.setParameters();

	document.getElementById(this.id).appendChild( this.renderer.domElement );
	
	this.renderer.domElement.style.position = 'absolute';
	this.renderer.domElement.style.left = '10px';

	this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
	this.renderer.domElement.addEventListener('DOMMouseScroll', this.onMouseScroll.bind(this), false);
	this.renderer.domElement.addEventListener('mousewheel', this.onMouseScroll.bind(this), false);
	this.renderer.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
	this.renderer.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), false);
	this.renderer.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
	this.renderer.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this), false);


	
	this.render();
} 



viewController.prototype.loadMesh = function () {

	if(this.mesh_name == "cube") {
		this.mesh = new THREE.Mesh(new THREE.CubeGeometry(20,20,20), new THREE.MeshNormalMaterial());
	} else if(this.mesh_name == "disney") {
		this.mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({color: 0xffffff, shading: THREE.FlatShading}));
		loader = new THREE.JSONLoader();
		loader.load('meshes/WaltHeadLo.js', function ( geometry ) {
			this.mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial( { overdraw: true } ) );
			this.setParameters();
			}.bind(this) );
	} else {
		this.mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({color: 0xffffff, shading: THREE.FlatShading}));
		this.loadBaseMesh();
	}
		
	
} 

viewController.prototype.createPanel = function () {

	var container = document.createElement( 'div' );
	container.id = this.id+"_panel";
	container.className = "panel";
	container.style.cssText = 'z-index: 10; top: 0px; float: left; position: relative;';
	
	

	var tab1 = document.createElement('table');
	var tab2 = document.createElement('table');
	var tr1 = document.createElement('tr');
	var tr2 = document.createElement('tr');
	var td = document.createElement('td');
	var arrbutton = document.createElement('button');
	var divslider = document.createElement('div');
	var divsliderinput = document.createElement('input');
	
	divslider.className = "slider";
	divslider.id = "slider-vertical-"+this.id;
	
	divsliderinput.id = "slider-vertical-input-"+this.id;
	divsliderinput.className = "slider-input";
	divslider.appendChild(divsliderinput);
	
	td.appendChild(divslider);
	tr1.appendChild(td);
	
	td = document.createElement('td');
	tr2.appendChild(td);
	td = document.createElement('td');
	arrbutton.onclick = this.moveCamera;
	arrbutton.direction = 'up'; 
	arrbutton.innerHTML = "&uarr;";
	td.appendChild(arrbutton);
	tr2.appendChild(td);
	td = document.createElement('td');
	tr2.appendChild(td);
	tab2.appendChild(tr2);
	tr2 = document.createElement('tr');
	td = document.createElement('td');
	arrbutton = document.createElement('button');
	arrbutton.onclick = this.moveCamera;
	arrbutton.innerHTML = "&larr;";
	arrbutton.direction = 'left';
	td.appendChild(arrbutton);
	tr2.appendChild(td);
	td = document.createElement('td');
	tr2.appendChild(td);
	td = document.createElement('td');
	arrbutton = document.createElement('button');
	arrbutton.onclick = this.moveCamera;
	arrbutton.innerHTML = "&rarr;";
	arrbutton.direction = 'right';
	td.appendChild(arrbutton);
	tr2.appendChild(td);
	tab2.appendChild(tr2);
	tr2 = document.createElement('tr');
	td = document.createElement('td');
	tr2.appendChild(td);
	td = document.createElement('td');
	arrbutton = document.createElement('button');
	arrbutton.onclick = this.moveCamera;
	arrbutton.innerHTML = "&darr;";
	arrbutton.direction = 'down';
	td.appendChild(arrbutton);
	tr2.appendChild(td);
	td = document.createElement('td');
	tr2.appendChild(td);
	tab2.appendChild(tr2);
	
	td = document.createElement('td');
	td.appendChild(tab2);
	var home_button = document.createElement( 'button' );
	home_button.innerHTML="Reset view";
	home_button.style.cssText = 'color:#000000';
	home_button.onclick = this.Home;
	td.appendChild(home_button);
	tr1.appendChild(td);
	tab1.appendChild(tr1);
	
	container.appendChild( tab1);
	

	
	this.vslider = new Slider(divslider, divsliderinput, "vertical");
	this.vslider.onchange = this.onSliderChange.bind(this);

	document.getElementById(this.id).appendChild( container );

//<button onclick="Home(); return false;">Reset view</button><br />

}

viewController.prototype.setParameters = function () {
		
		this.mesh.doubleSided = true;
		this.mesh.geometry.computeBoundingBox();
		var box = this.mesh.geometry.boundingBox;
		if(box) {
			this.maxDimension = Math.max(box.x[1]-box.x[0], box.y[1]-box.y[0]);	
			this.maxDimension = Math.ceil(Math.max(this.maxDimension, box.z[1]-box.z[0]));
			if(this.vslider) {
				this.vslider.setMinimum(-1*this.maxDimension); 
				this.vslider.setMaximum(this.maxDimension*1.5);
				this.vslider.setValue(this.maxDimension*0.25);
			}
			this.camera.position.z = this.light.position.z = this.maxDimension*2;
			this.camera.position.x = box.x[0] + (box.x[1]-box.x[0])/2;
			this.camera.position.y = box.y[0] + (box.y[1]-box.y[0])/2;
		}
		this.scene.add(this.mesh);
}

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
	
	if(this.home) {
		this.mesh.rotation.setRotationFromMatrix(new THREE.Matrix4());
		this.home = false;
	}

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

	this.mesh.doubleSided = false;
	this.mesh.material.wireframe = true;

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


viewController.prototype.onMouseScroll = function (event) {

	var vc = vc_byid[event.target.parentNode.id];
	event = event ? event : document.event;
	event.preventDefault();
	
	vc.wheelData = event.detail ? event.detail * -1 : event.wheelDelta / 40;
	vc.vslider.setValue(vc.vslider.getValue() + (vc.wheelData > 0 ? 0.05 : -0.05) * (vc.vslider.getMaximum() - vc.vslider.getMinimum()));

}


viewController.prototype.onSliderChange = function (event) {
	
	this.camera.position.z = this.maxDimension*2 - this.vslider.getValue();

}



viewController.prototype.onTouchStart = function (event) {
	
	var vc = this;
	event = event ? event: document.event;
	vc.mesh.doubleSided = false;
	vc.mesh.material.wireframe = true;
	event.preventDefault();
	if(event.touches.length == 1) {
		vc.mouseDownY = event.touches[0].pageY - vc.windowHalfY;
		vc.mouseDownX = event.touches[0].pageX - vc.windowHalfX;
		vc.mouseDownRotationX = vc.targetRotationX;
		vc.mouseDownRotationY = vc.targetRotationY;
	}

}


viewController.prototype.onTouchMove = function (event) {
	
	var vc = this;
	event = event ? event: document.event;
	
	event.preventDefault();
	if(event.touches.length == 1) {
		vc.mouseX = event.touches[0].pageX - vc.windowHalfX;
		vc.mouseY = event.touches[0].pageY - vc.windowHalfY;
		vc.targetRotationX = vc.mouseDownRotationX + (vc.mouseX - vc.mouseDownX)*0.05;
		vc.targetRotationY = vc.mouseDownRotationY + (vc.mouseY - vc.mouseDownY)*0.05;
	}
	
}

viewController.prototype.onTouchEnd = function (event) {
	
	var vc = this;
	event = event ? event: document.event;
	
	event.preventDefault();
	vc.mesh.doubleSided = true;
	vc.mesh.material.wireframe = false;
}



viewController.prototype.onContextMenu = function (event) {
	
	event = event ? event : document.event;
	

	event.preventDefault();
	return false;
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


viewController.prototype.Home = function() {

	var vc = vc_byid[this.parentNode.parentNode.parentNode.parentNode.parentNode.id];
	vc.targetRotationX = vc.targetRotationY = vc.mouseDownRotationX = vc.mouseDownRotationY = vc.mouseDownX = vc.mouseDownY = vc.mouseX = vc.mouseY = vc.slowRotationX = vc.slowRotationY = 0;
	vc.mesh.rotation.setRotationFromMatrix(new THREE.Matrix4());
	vc.vslider.setValue(vc.maxDimension*0.25);
	vc.mesh.geometry.computeBoundingBox();
	var box = vc.mesh.geometry.boundingBox;
	vc.camera.position.x = box.x[0] + (box.x[1]-box.x[0])/2;
	vc.camera.position.y = box.y[0] + (box.y[1]-box.y[0])/2;
	vc.home = true;

}


viewController.prototype.moveCamera = function(direction) {

	var vc = vc_byid[this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id];//	alert("TU");
	switch(this.direction) {
		
		case "up": vc.camera.position.y -= vc.CAMERA_MOVE; break;
		case "down": vc.camera.position.y += vc.CAMERA_MOVE; break;
		case "left": vc.camera.position.x += vc.CAMERA_MOVE; break;
		case "right": vc.camera.position.x -= vc.CAMERA_MOVE; break;
		default: break;
	}
}

