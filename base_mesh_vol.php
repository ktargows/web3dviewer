<?php

$vertices = array();
$faces = array();

$lines = file("meshes/cylsphere-base.vol");

foreach($lines as $l) {
   $l = trim($l);   
   $arr = preg_split( "/\s+/", $l);
   if( count($arr) == 3 ){
     $xyz = array( floatval($arr[0]), floatval($arr[1]), floatval($arr[2]) );
     array_push($vertices, $xyz);
   }
   if( count($arr) == 11 ){
     $fac = array( intval($arr[5])-1, intval($arr[6])-1, intval($arr[7])-1 );
     array_push($faces, $fac);
   }
}

$json_object = array( 'vertices' => $vertices, 'faces' => $faces ); 


echo json_encode($json_object);

?>
