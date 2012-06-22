
viewController = function(id, mesh_name, master) {
  this.id = id;
  this.mesh_name = mesh_name;
  this.master = master;
  this.children = [];
  this.progressive = true;
  this.noinertia = false;
  this.view = "front";
  this.viewtmp = "front";
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
  this.newrotationmatrix;
  this.newrotation;
  this.slowRotationX = 0;
  this.slowRotationY = 0;
  this.home = false;
  this.maxDimension = 0;
  this.width = 300;
  this.height = 300;
  this.view_angle = 60,
  this.near = 0.1,
  this.far = 200,
  this.info_msg;


}

viewController.prototype.init = function () {

	this.renderer = new THREE.CanvasRenderer({antialias: true});
		
	this.renderer.setSize(this.width, this.height);
	this.renderer.setClearColorHex(0xEEEEEE, 1.0);
	this.renderer.clear();
	
	this.camera = new THREE.PerspectiveCamera(
			   this.view_angle,
			   this.width/this.height,
			   this.near,
			   this.far );
	
/*	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
	this.stats.domElement.style.left = '0px';
	document.getElementById(this.id).appendChild( this.stats.domElement );
*/	
	
	this.scene = new THREE.Scene();
	this.scene.add(this.camera);
	this.scene.add( new THREE.AmbientLight( 0x505050, 2000 ) );
	this.light = new THREE.PointLight( 0x707070, 1, 2000 );
	this.scene.add( this.light );
	
	this.createPanel();
	
	this.initMesh();

	this.scene.add(this.mesh);

	this.initView();

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

viewController.prototype.centerMesh = function() {
	var vc = this;
	var offset_x = (vc.mesh.geometry.boundingBox.x[0]+vc.mesh.geometry.boundingBox.x[1])/2; 
	var offset_y = (vc.mesh.geometry.boundingBox.y[0]+vc.mesh.geometry.boundingBox.y[1])/2; 
	var offset_z = (vc.mesh.geometry.boundingBox.z[0]+vc.mesh.geometry.boundingBox.z[1])/2; 
	for (i = 0; i< vc.mesh.geometry.vertices.length; i++ ){ 
		vc.mesh.geometry.vertices[i].position.x -= offset_x;
		vc.mesh.geometry.vertices[i].position.y -= offset_y;
		vc.mesh.geometry.vertices[i].position.z -= offset_z;
	}
}

viewController.prototype.updateMesh = function() {
	var vc = this;
	vc.mesh.geometry.computeCentroids();
	vc.mesh.geometry.computeFaceNormals();
	vc.mesh.geometry.computeBoundingBox();
	vc.mesh.geometry.dynamic = true;
}

viewController.prototype.loadMeshSuccess = function() {
	console.info("Mesh loaded " + this.mesh.geometry.vertices.length + " vertices");
	console.info("" + this.id + " is progressive? " + this.progressive);
	
	this.updateChildren(this, function(child, master) {
		child.updateMesh();
		child.centerMesh();
		child.initView();
	}.bind(this));
	if (this.progressive)
		this.initProgressive();
}

viewController.prototype.loadMeshError = function() {
	console.error("Error while fetching base mesh for " + this.id);
}

viewController.prototype.initMesh = function () {
	this.mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({color: 0xffffff, shading: THREE.FlatShading}));
	
	if(this.master){
		this.mesh.geometry = vc_byid[this.master].mesh.geometry;
	} else {
		this.loadBaseMesh(this.mesh_name, this.loadMeshSuccess.bind(this), this.loadMeshError.bind(this));
	}
} 

viewController.prototype.createPanel = function () {

	var container = document.createElement( 'div' );
	container.id = this.id+"_panel";
	container.className = "panel";
	container.style.cssText = 'z-index: 10; top: 0px; float: left; position: relative;';
	
	var divslider = document.createElement('div');
	var divsliderinput = document.createElement('input');
	
	divslider.className = "slider";
	divslider.id = "slider-vertical-"+this.id;
	divslider.style.height = document.getElementById(this.id).style.height;

	divsliderinput.id = "slider-vertical-input-"+this.id;
	divsliderinput.className = "slider-input";
	divslider.appendChild(divsliderinput);
	container.appendChild(divslider);
	this.vslider = new Slider(divslider, divsliderinput, "vertical");
	this.vslider.onchange = this.onSliderChange.bind(this);
	document.getElementById(this.id).appendChild( container );
	
	var arrbutton;
	arrbutton = document.createElement('button');
	arrbutton.onclick = this.moveCamera;
	arrbutton.direction = 'up';
	arrbutton.innerHTML = "&uarr;";
	arrbutton.style.cssText='z-index: 10; position: absolute; top: 0px; left: 45%; width: 50px;';
	document.getElementById(this.id).appendChild(arrbutton); 
	
	arrbutton = document.createElement('button');
	arrbutton.onclick = this.moveCamera;
	arrbutton.direction = 'down';
	arrbutton.innerHTML = "&darr;";
	arrbutton.style.cssText='z-index: 10; position: absolute; bottom: 0px; left: 45%; width: 50px;';
	document.getElementById(this.id).appendChild(arrbutton);
	arrbutton = document.createElement('button');
	arrbutton.onclick = this.moveCamera;
	arrbutton.direction = 'left';
	arrbutton.innerHTML = "&larr;";
	arrbutton.style.cssText='z-index: 10; position: absolute; left: 30px; top: 45%; height: 50px;';
	document.getElementById(this.id).appendChild(arrbutton);
	
	arrbutton = document.createElement('button');
	arrbutton.onclick = this.moveCamera;
	arrbutton.direction = 'right';
	arrbutton.innerHTML = "&rarr;";
	arrbutton.style.cssText='z-index: 10; position: absolute; top: 45%; right: 0px; height: 50px;';
	document.getElementById(this.id).appendChild(arrbutton);
	
	var home_button = document.createElement( 'button' );
	home_button.innerHTML="Reset view";
	home_button.style.cssText = 'color:#000000; position: absolute; top: 0px; right: 0px; z-index: 10;';
	home_button.onclick = this.Home;
	document.getElementById(this.id).appendChild(home_button);

	this.info_msg = document.createElement( 'span' );
	this.info_msg.innerHTML="";
	this.info_msg.style.cssText = 'font-size: 80%; color:#303030; position: absolute; right: 0px; bottom: 0px; z-index: 10;';
	document.getElementById(this.id).appendChild(this.info_msg);
	
	
}

viewController.prototype.initView = function () {
		console.info("Initiated view (" + this.id + ")");
		this.mesh.doubleSided = false;
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
		this.viewtmp = this.view;
}

viewController.prototype.render = function () {
	if(this.mesh) {
		this.rotateMesh();
	}
	this.renderer.render(this.scene, this.camera);
	this.info_msg.innerHTML= this.mesh.geometry.faces.length+ " faces loaded";
//	this.stats.update();
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
	
	if(this.viewtmp)
	{
		this.newrotationmatrix = new THREE.Matrix4();
		switch(this.view) {
			case 'front': this.newrotation = new THREE.Vector3(0,0,0); break;
			case 'left': this.newrotation = new THREE.Vector3(0,-1.571,0);break;
			case 'right':this.newrotation = new THREE.Vector3(0,1.571,0); break;
			case 'top':this.newrotation = new THREE.Vector3(1.571,0,0);break;
			case 'bottom':this.newrotation = new THREE.Vector3(-1.571,0,0);break;
			default: break;
		}
		this.newrotationmatrix.setRotationFromEuler(this.newrotation);
		this.mesh.rotation.setRotationFromMatrix(this.newrotationmatrix);
		this.viewtmp = 0;
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
			
			if(vc.master || vc.children.length>0){
				vc.updateChildrenRotation(vc);
			}
		}
		else {
			vc.targetRotationX = vc.mouseDownRotationX + (vc.mouseX - vc.mouseDownX)*0.02;
			vc.targetRotationY = vc.mouseDownRotationY + (vc.mouseY - vc.mouseDownY)*0.02;
		}
	}
	else if(event.which == 3) {
		vc.camera.position.x -= (vc.mouseX - vc.mouseDownX)*(vc.maxDimension/vc.windowHalfX);
		vc.camera.position.y += (vc.mouseY - vc.mouseDownY)*(vc.maxDimension/vc.windowHalfX);
		vc.mouseDownX = vc.mouseX;
		vc.mouseDownY = vc.mouseY;
	}

}

viewController.prototype.updateChildren = function (vc, action) {
        //console.info("Updating children for " + vc.id + " with " + vc.children.length + " children");
	if (vc.master) {
		vc_master = vc_byid[vc.master];
	} else {
		vc_master = vc;
	}

	var children = vc_master.children.concat([vc_master.id]);
	for (var i in children) {
		var vc_child = vc_byid[children[i]];
		action(vc_child, vc);
	}
}

viewController.prototype.updateChildrenRotation = function (vc) {

	if( vc.children.length == 0){
		vc_master = vc_byid[vc.master];
	} else {
		vc_master = vc;
	}

	vc_master.targetRotationX = vc.targetRotationX;
	vc_master.targetRotationY = vc.targetRotationY;

	for (var i in vc_master.children){
		var vc_child = vc_byid[vc_master.children[i]];
		vc_child.targetRotationX = vc.targetRotationX;
		vc_child.targetRotationY = vc.targetRotationY;
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
	var step = (vc.maxDimension/vc.windowHalfX)*100;

	vc.vslider.setValue(vc.vslider.getValue() + (vc.wheelData > 0 ? step : -step) );

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

	var vc = vc_byid[this.parentNode.id];
	vc.targetRotationX = vc.targetRotationY = vc.mouseDownRotationX = vc.mouseDownRotationY = vc.mouseDownX = vc.mouseDownY = vc.mouseX = vc.mouseY = vc.slowRotationX = vc.slowRotationY = 0;
	vc.mesh.rotation.setRotationFromMatrix(new THREE.Matrix4());
	vc.vslider.setValue(vc.maxDimension*0.25);
	vc.mesh.geometry.computeBoundingBox();
	var box = vc.mesh.geometry.boundingBox;
	vc.camera.position.x = box.x[0] + (box.x[1]-box.x[0])/2;
	vc.camera.position.y = box.y[0] + (box.y[1]-box.y[0])/2;
	vc.home = true;

	if(vc.view){ 
		vc.viewtmp = vc.view;
	}

	vc.updateChildren(vc, function(child, master) {
		child.viewtmp = child.view;
	}.bind(vc));
}


viewController.prototype.moveCamera = function(direction) {

	var vc = vc_byid[this.parentNode.id];

	switch(this.direction) {
		
		case "up": vc.camera.position.y -= (vc.maxDimension/10); break;
		case "down": vc.camera.position.y += (vc.maxDimension/10); break;
		case "left": vc.camera.position.x += (vc.maxDimension/10); break;
		case "right": vc.camera.position.x -= (vc.maxDimension/10); break;
		default: break;
	}
}

