var splits = [];
var offset = 0;
var length = 10;
var error = false;

viewController.prototype.adjacentFaces = function(a) {
    var faces = [];
    var noFaces = this.mesh.geometry.faces.length;
    var faceIdx;
    
    for (faceIdx=0; faceIdx<noFaces; faceIdx++) {
        var p = this.mesh.geometry.faces[faceIdx].a;
        var q = this.mesh.geometry.faces[faceIdx].b;
        var r = this.mesh.geometry.faces[faceIdx].c;

        var commonNodes = 0;

        if (p == a) commonNodes++;
        if (q == a) commonNodes++;
        if (r == a) commonNodes++;

        if (commonNodes > 0) faces.push(faceIdx);
    }

    return faces;
}

viewController.prototype.reconnectNode = function(a, b) {
   for(var i=0; i<this.mesh.geometry.faces.length; i++) {
       if (this.mesh.geometry.faces[i].a == a) this.mesh.geometry.faces[i].a = b;
       if (this.mesh.geometry.faces[i].b == a) this.mesh.geometry.faces[i].b = b;
       if (this.mesh.geometry.faces[i].c == a) this.mesh.geometry.faces[i].c = b;
   }
}

viewController.prototype.swapNodes = function(a, b) {
   var tmp = this.mesh.geometry.vertices[a];
   this.mesh.geometry.vertices[a] = this.mesh.geometry.vertices[b];
   this.mesh.geometry.vertices[b] = tmp;
}

viewController.prototype.refine = function() {
	console.info("Refining " + splits.length + " splits");
	while (splits.length > 0) {
		console.info(""+splits.length+" splits left");
		var split = splits.pop();
		var fail = this.splitNode(split.a, split.b, split.c0, split.c1, split.d,
			  split.cfg0, split.cfg1, split.x, split.y, split.z);
		if (fail) {
			console.error("Error while splitting for " + this.id);
		        console.error("Turning off progressive loading for this component");
		        clearInterval(this.refiner);
			return;
		}
	}
	console.info("Done");
	setTimeout(this.refine.bind(this), 1000); // retry in 100ms
}

viewController.prototype.splitNode = function(a, b, c0, c1, d, cfg0, cfg1, x, y, z) {
    var faces = this.adjacentFaces(a);
    var n0idx = this.mesh.geometry.vertices.length;
    var f0idx = this.mesh.geometry.faces.length;
    var f1idx = this.mesh.geometry.faces.length+1; 
    
    this.reconnectNode(b, n0idx);
    
    this.mesh.geometry.vertices.push(new THREE.Vertex(new THREE.Vector3(0.0, 0.0, 0.0)));
    var face;
    switch(cfg0) {
        case 1: face = new THREE.Face3(a, b, c0);break;
        case 2: face = new THREE.Face3(b, c0, a);break;
        case 3: face = new THREE.Face3(c0, a, b);break;
        case 4: face = new THREE.Face3(a, c0, b);break;
        case 5: face = new THREE.Face3(c0, b, a);break;
        case 6: face = new THREE.Face3(b, a, c0);break;
    }
    this.mesh.geometry.faces.push(face);
    switch(cfg1) {
        case 1: face = new THREE.Face3(a, b, c1);break;
        case 2: face = new THREE.Face3(b, c1, a);break;
        case 3: face = new THREE.Face3(c1, a, b);break;
        case 4: face = new THREE.Face3(a, c1, b);break;
        case 5: face = new THREE.Face3(c1, b, a);break;
        case 6: face = new THREE.Face3(b, a, c1);break;
    }
    this.mesh.geometry.faces.push(face);

    this.swapNodes(b, n0idx);

    var tries = faces.length;
    var mi = c0;
    var ni = d;
    var nj = -1;
    while (tries > 0) {
        for (var i=0; i<faces.length; i++) {
            var index = -1;
            var njCandidate = -1; // nj
            var matchingNodes = 0;
            var face = this.mesh.geometry.faces[faces[i]];
            for (var j=0; j<3; j++) {
                var r;
		if (j == 0) r = face.a;
		if (j == 1) r = face.b;
		if (j == 2) r = face.c;
                if (r == ni) {
                    matchingNodes++;
                } else if (r == a) {
                    index = j;
                    matchingNodes++;
                } else {
                    njCandidate = r;
                }
            }

            if (matchingNodes == 2 && njCandidate == mi) {
		if (index == 0) face.a = b;
		if (index == 1) face.b = b;
		if (index == 2) face.c = b;
            } else if (matchingNodes == 2) {
                nj = njCandidate;
            }
        }

        tries--;

        if (ni == c1) {
            tries = 0;
        } else if (nj != -1) {
            mi = ni;
            ni = nj;
	    nj = 0;
        } else {
            tries = 0;
            console.error("Error while splitting");
	    return true;
        }
    }

    // get a-node position
    this.mesh.geometry.vertices[b].position.x = this.mesh.geometry.vertices[a].position.x - x;
    this.mesh.geometry.vertices[b].position.y = this.mesh.geometry.vertices[a].position.y - y;
    this.mesh.geometry.vertices[b].position.z = this.mesh.geometry.vertices[a].position.z - z;
    this.mesh.geometry.vertices[a].position.x += x;
    this.mesh.geometry.vertices[a].position.y += y;
    this.mesh.geometry.vertices[a].position.z += z;
}

viewController.prototype.initProgressive = function() {
	this.refiner = setInterval(function() {
		this.refineMesh(this.mesh_name, this.refineMeshSuccess.bind(this), this.refineMeshError.bind(this));
	}.bind(this), 1000);
	setTimeout(this.refine.bind(this), 2000)
}

viewController.prototype.refineMeshSuccess = function(response) { }
viewController.prototype.refineMeshError = function(response) {
	console.error("Error while fetching refinements for " + this.id);
	console.error("Turning off progressive loading for this component");
	clearInterval(this.refiner);
}

viewController.prototype.refineMesh = function (mesh, onsuccess, onerror) {
	console.info("Fetching refinements ");
	var http_request = new XMLHttpRequest();
	var url = "refine_mesh.php?mesh="+mesh+"&offset="+offset+"&length="+length; 
	var vc_id = ""+this.id;
	http_request.onreadystatechange = handle_json.bind(this);
	http_request.open("GET", url, true);
	http_request.send(null);
	function handle_json() {
		var vc = this;
		if (http_request.readyState == 4) {
			if (http_request.status == 200) {
				var json_data = http_request.responseText;
				var json = JSON.parse(json_data); 
				var i;
				var a, b, c0, c1, d, cfg0, cfg1, x, y, z;
				for (i = 0; i < json.length; i++ ) {
					a = json[i][0]; b = json[i][1]; c0 = json[i][2]; c1 = json[i][3]; d = json[i][4];
					cfg0 = json[i][5]; cfg1 = json[i][6]; x = json[i][7]; y = json[i][8]; z = json[i][9];
					splits.unshift({'a':a,'b':b,'c0':c0,'c1':c1,'d':d,'cfg0':cfg0,'cfg1':cfg1,'x':x,'y':y,'z':z});
				}

				if (json.length == 0)
					loaded = true;
				offset += json.length;
				onsuccess(http_request.responseText);
			} else {
				onerror(http_request.responseText);
				console.error("Error");
			}
			http_request = null;
		}
	}
}

