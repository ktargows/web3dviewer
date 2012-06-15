viewController.prototype.loadBaseMesh = function (mesh, onsuccess, onerror) {
	var http_request = new XMLHttpRequest();
	var url = "base_mesh.php?mesh="+mesh; 
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
				for (i = 0; i< json.vertices.length; i++ ){ 
					vc.mesh.geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(json.vertices[i][0], json.vertices[i][1], json.vertices[i][2] )) );
				}
				for (i = 0; i< json.faces.length; i++ ){ 
					vc.mesh.geometry.faces.push( new THREE.Face3( json.faces[i][0], json.faces[i][1], json.faces[i][2] ) );
				}
	
				vc.initView();
				onsuccess();
			} else {
				alert('Server connection error.');
				onerror();
			}
		http_request = null;
		}
	}
}
