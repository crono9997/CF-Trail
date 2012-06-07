<?php

//
// Leaderboards.php
// 
// Required files: DBConnect.php, config.php
//
// <operation> - [ required variables ]
//  scoreExists - username, gameID
//  setScore - username, gameID, score
//  getScore - username, gameID
//  getGameScores - gameID
//  getUserScores - username
//  deleteUser - username
//  createTable - 

include_once('DBConnect.php');

$operation = $_POST['op'];
$username = $_POST['username'];
$gameID = $_POST['gameID'];
$score = $_POST['score'];

if ( $operation == 'scoreExists' )
{
    echo score_exists( $username, $gameID );
}
else if ( $operation == 'setScore' )
{
    echo set_score( $username, $gameID, $score );
}
else if ( $operation == 'getScore' )
{
    echo get_score( $username, $gameID );
}
else if ( $operation == 'getGameScores' )
{
    echo get_game_scores( $gameID ); 
}
else if ( $operation == 'getNameScores' )
{
    echo get_user_scores( $username );
}
else if ( $operation == 'deleteUser' )
{
    echo delete_user( $username );
}
else if ( $operation == 'createTable' )
{
    echo create_table();
}

// returns 1 if the given user has a score recorded for the given gameID, 0
// otherwise
function score_exists( $username, $gameID )
{
    $query = "SELECT * FROM highscores
              WHERE username='$username' AND gameID='$gameID'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    if ( mysql_num_rows( $result ) != 0 ) { return 1; }
    else { return 0; }
}

// updates a user's score, replacing any old score for the same game
function set_score( $username, $gameID, $score )
{
    if ( !(get_score( $username, $gameID ) < $score) ) { return 0; }
    $query= "REPLACE INTO highscores (username, gameID, score)
             VALUES ('$username', '$gameID', '$score')";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return $result;
}

// returns the recorded score of the given user for the given game
function get_score( $username, $gameID )
{
    $query = "SELECT * FROM highscores
              WHERE username='$username' AND gameID='$gameID'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return mysql_result( $result, 0, 'score' );
}

// gets all recorded scores for the given game, one per line, in descending
// order, in the format <name>,<score>
function get_game_scores( $gameID )
{
    $query = "SELECT * FROM highscores
              WHERE gameID = '$gameID'
              ORDER BY score DESC";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    $output = "";
    while( $row = mysql_fetch_array( $result ) )
    {
        $output .= $row['username'] . "," . $row['score'] . "<br />";
    }
    return $output;
}

// gets all the scores associated with one user, one per line, with the form
// <gameID>,<score>
function get_user_scores( $username )
{
    $query = "SELECT * FROM highscores
              WHERE username='$username'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    $output = "";
    while( $row = mysql_fetch_array( $result ) )
    {
        $output .= $rot['gameID'] . "," . $row['score'] . "<br />";
    }
    return $output;
}

// deletes all score entries for a username
function delete_user( $username )
{
    $query = "DELETE FROM highscores
              WHERE username='$username'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return $result;
}

// creates the highscore table
function create_table()
{
    $query = "CREATE TABLE highscores (
                  username varchar(20),
                  gameID varchar(50),
                  score int,
                  PRIMARY KEY (username,gameID)
              )";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return $result;
}

?>
