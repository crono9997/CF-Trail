<?php

include_once( 'config.php' );

$con = mysql_connect( $host, $user, $password );
if (!$con) { die( mysql_error() ); }
@mysql_select_db( $database ) or die( "Unable to select database." );

?>
