function loadBaseMesh() {
	var http_request = new XMLHttpRequest();
	var url = "base_mesh.php"; 
	
	http_request.onreadystatechange = handle_json;
	http_request.open("GET", url, true);
	http_request.send(null);
 
	function handle_json() {
		if (http_request.readyState == 4) {
			if (http_request.status == 200) {

				var json_data = http_request.responseText;
				var json = JSON.parse(json_data); 
				var i;
				for (i = 0; i< json.vertices.length; i++ ){ 
					mesh.geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(json.vertices[i][0], json.vertices[i][1], json.vertices[i][2] )) );
				}
				for (i = 0; i< json.faces.length; i++ ){ 
					mesh.geometry.faces.push( new THREE.Face3( json.faces[i][0], json.faces[i][1], json.faces[i][2] ) );
				}

				mesh.geometry.computeCentroids();
				mesh.geometry.computeFaceNormals();
				mesh.geometry.computeBoundingBox();
				mesh.geometry.dynamic = true;
				
             			// Center mesh
				var offset_x = (mesh.geometry.boundingBox.x[0]+mesh.geometry.boundingBox.x[1])/2; 
				var offset_y = (mesh.geometry.boundingBox.y[0]+mesh.geometry.boundingBox.y[1])/2; 
				var offset_z = (mesh.geometry.boundingBox.z[0]+mesh.geometry.boundingBox.z[1])/2; 
				for (i = 0; i< json.vertices.length; i++ ){ 
					mesh.geometry.vertices[i].position.x -= offset_x;
					mesh.geometry.vertices[i].position.y -= offset_y;
					mesh.geometry.vertices[i].position.z -= offset_z;
				}
		
			setParameters();

			} else {
                      		alert('Server connection error.');
			}
		http_request = null;
		}
	}
}

