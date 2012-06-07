<?php

// 
// SavedGames.php
//
// Required files: DBConnect.php, config.php
//
// Note: I figure since the minigames will be sequential, a progress of 1 will
// refer to someone who has beaten the first minigame, 2 for someone who has
// beaten the second minigame, etc.
//
// <operation> - [ required variables ]
//  saveExists - username
//  getSave - username
//  saveGame - username, progress
//  deleteSave - username
//  createTable - 

include_once( 'DBConnect.php' );

$operation = $_POST['op'];
$username = $_POST['username'];
$progress = $_POST['progress'];

if ( $operation == 'saveExists' )
{
    echo save_exists( $username );
}
else if ( $operation == 'getSave' )
{
    echo get_save( $username );
}
else if ( $operation == 'saveGame' )
{
    echo save_game( $username, $progress );
}
else if ( $operation == 'deleteSave' )
{
    echo delete_save( $username );
}
else if ( $operation == 'createTable' )
{
    echo create_table();
}

// returns 1 if the username has a saved progress associated with it, 0
// otherwise
function save_exists( $username )
{
    $query = "SELECT * FROM saves
              WHERE username='$username'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    if ( mysql_num_rows( $result ) != 0 ) { return 1; }
    else { return 0; }
}

// returns the progress level associated with the given username
function get_save( $username )
{
    $query = "SELECT * FROM saves
              WHERE username='$username'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return mysql_result( $result, 0, 'progress' );
}

// updates (or creates) the score associated with the given username if the
// progress is higher than what is already recorded.
function save_game( $username, $progress )
{
    if ( !( get_save( $username ) < $progress ) ) { return 0; }
    $query = "REPLACE INTO saves (username, progress)
              VALUES ('$username', '$progress')";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return $result;
}

// deletes the user from the saves table
function delete_save( $username )
{
    $query = "DELETE FROM saves
              WHERE username='$username'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return $result;
}

// creates the table used by methods in SavedGames.php
function create_table()
{
    $query = "CREATE TABLE saves (
                  username varchar(255) PRIMARY KEY,
                  progress int
              )";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return $result;
}

?>
