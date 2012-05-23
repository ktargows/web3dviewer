<?php

$vertices = array();
$faces = array();
$nodesplits = array();

$offset = intval($_REQUEST['offset']);
$length = intval($_REQUEST['length']);
$mesh = $_REQUEST['mesh']);

$lines = file("meshes/$mesh.pgrid");

$lns = preg_grep( "/NodeSplit/", $lines);

$i=0;
foreach($lns as $ns) {
#    7485  NodeSplit    3   4   1   5   5   1.754387   5.206419   5.889408   
   $ns = trim($ns);
   $arr = preg_split( "/\s+/", $ns);
   $nsp = array( intval($arr[2])-1, intval($arr[3])-1, intval($arr[4])-1, intval($arr[5])-1, intval($arr[6])-1,
		 intval($arr[7]), intval($arr[8]),
                 doubleval($arr[9]), doubleval($arr[10]), doubleval($arr[11]) );

   if( $i>=$offset && $i < $offset+$length) { 
	   array_push($nodesplits, $nsp);
   }
   $i++;
}

echo json_encode($nodesplits);

?>
