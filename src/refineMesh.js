function adjancentFaces(a) {
    var faces = [];
    var noFaces = mesh.geometry.faces.length;
    var faceIdx;
    
    for (faceIdx=0; faceIdx<noFaces; faceIdx++) {
        var p = mesh.geometry.faces[faceIdx].a;
        var q = mesh.geometry.faces[faceIdx].b;
        var r = mesh.geometry.faces[faceIdx].c;

        var commonNodes = 0;

        if (p == a) commonNodes++;
        if (q == a) commonNodes++;
        if (r == a) commonNodes++;

        if (commonNodes > 0) faces.push(faceIdx);
    }

    return faces;
}

function reconnectNode(a, b) {
   for(var i=0; i<mesh.geometry.faces.length; i++) {
       if (mesh.geometry.faces[i].a == a) mesh.geometry.faces[i].a = b;
       if (mesh.geometry.faces[i].b == a) mesh.geometry.faces[i].b = b;
       if (mesh.geometry.faces[i].c == a) mesh.geometry.faces[i].c = b;
   }
}

function swapNodes(a, b) {
   var tmp = mesh.geometry.vertices[a];
   mesh.geometry.vertices[a] = mesh.geometry.vertices[b];
   mesh.geometry.vertices[b] = tmp;
}

function splitNode(a, b, c0, c1, d, cfg0, cfg1, x, y, z) {
    var faces = adjancentFaces(a);
    var n0idx = mesh.geometry.vertices.length;
    var f0idx = mesh.geometry.faces.length;
    var f1idx = mesh.geometry.faces.length+1; 
    
    reconnectNode(b, n0idx);
    
    mesh.geometry.vertices.push(new THREE.Vertex(new THREE.Vector3(0.0, 0.0, 0.0)));
    var face;
    switch(cfg0) {
        case 1:
            face = new THREE.Face3(a, b, c0);
            break;
        case 2:
            face = new THREE.Face3(b, c0, a);
            break;
        case 3:
            face = new THREE.Face3(c0, a, b);
            break;
        case 4:
            face = new THREE.Face3(a, c0, b);
            break;
        case 5:
            face = new THREE.Face3(c0, b, a);
            break;
        case 6:
            face = new THREE.Face3(b, a, c0);
            break;
    }
    mesh.geometry.faces.push(face);
    switch(cfg1) {
        case 1:
            face = new THREE.Face3(a, b, c1);
            break;
        case 2:
            face = new THREE.Face3(b, c1, a);
            break;
        case 3:
            face = new THREE.Face3(c1, a, b);
            break;
        case 4:
            face = new THREE.Face3(a, c1, b);
            break;
        case 5:
            face = new THREE.Face3(c1, b, a);
            break;
        case 6:
            face = new THREE.Face3(b, a, c1);
            break;
    }
    mesh.geometry.faces.push(face);

    swapNodes(b, n0idx);

    var tries = faces.length;
    var mi = c0;
    var ni = d;
    var nj = -1;
    while (tries > 0) {
        for (var i=0; i<faces.length; i++) {
            var index = -1;
            var njCandidate = -1; // nj
            var matchingNodes = 0;
            var face = mesh.geometry.faces[faces[i]];
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
            window.alert("ERROR");
        }
    }

    // get a-node position
    mesh.geometry.vertices[b].position.x =
	mesh.geometry.vertices[a].position.x - x;
    mesh.geometry.vertices[b].position.y =
	mesh.geometry.vertices[a].position.y - y;
    mesh.geometry.vertices[b].position.z =
	mesh.geometry.vertices[a].position.z - z;
    mesh.geometry.vertices[a].position.x += x;
    mesh.geometry.vertices[a].position.y += y;
    mesh.geometry.vertices[a].position.z += z;
}

function refineMesh() {
	var http_request = new XMLHttpRequest();
	var url = "refine_mesh.php?offset="+offset+"&length="+refinestep; 
	
	http_request.onreadystatechange = handle_json;
	http_request.open("GET", url);
	http_request.send(null);
 
	function handle_json() {
		if (http_request.readyState == 4) {
			if (http_request.status == 200) {
				var json_data = http_request.responseText;
				var json = JSON.parse(json_data); 

				var i;
				for (i = 0; i< json.length; i++ ){ 
					splitNode(json[i][0],json[i][1],json[i][2],json[i][3],json[i][4],json[i][5],json[i][6],json[i][7],json[i][8],json[i][9],json[i][10]);
				}

				if( json.length == 0 ){
					loaded = true;
				}

				mesh.geometry.computeFaceNormals();
				mesh.geometry.computeCentroids();
				offset += refinestep;
			} else {
                      		alert('Server connection error.');
			}
		http_request = null;
		}
	}
}
