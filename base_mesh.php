<?php

$vertices = array();
$faces = array();
$mesh = $_REQUEST['mesh'];
#$lines = file("meshes/leg-surface.pgrid");
$lines = file("meshes/$mesh.pgrid");

$lv = preg_grep( "/\[\d+\]/", $lines);
$lf = preg_grep( "/ElmT3n2D/", $lines);

foreach($lv as $v) {
   preg_match( "/^.*\((.*)\).*$/", $v, $matches);
   $tmp = preg_split( "/,/", $matches[1]);
   $xyz = array( floatval($tmp[0]), floatval($tmp[1]), floatval($tmp[2]) );
   array_push($vertices, $xyz);
}

foreach($lf as $f) {
#      1  ElmT3n2D    1          2       3       4
   $f = trim($f);
   preg_match( "/^.*ElmT3n2D.*(\d)\).*$/", $f, $matches);
   $arr = preg_split( "/\s+/", $f);
   $fac = array( intval($arr[3])-1, intval($arr[4])-1, intval($arr[5])-1);
   array_push($faces, $fac);
}


#$vertices = array( array(1.0, 2.0, 3.3), array(2.0, 5, 4), array(1, 0.3, 4));
#$faces = array( array(1, 2, 3), array(2, 1, 2), array(1, 3, 4));

$json_object = array( 'vertices' => $vertices, 'faces' => $faces ); 


echo json_encode($json_object);

?>
