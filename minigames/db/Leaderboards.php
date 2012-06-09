<?php

/* Leaderboards.php
 * 
 * Required files: DBConnect.php, config.php
 *
 * <operation> - [ required variables ]
 *  scoreExists - username, gameID
 *  setScore - username, gameID, score
 *  getScore - username, gameID
 *  getGameScores - gameID
 *  getUserScores - username
 *  deleteUser - username
 *  createTable - 
 *
 * Example JS post, using jQuery:
 * $.post( "Leaderboards.php",
 *     {"op":"getGameScores", "gameID":"Shooter"},
 *     function( data ) {
 *         var result = "";
 *         for (row in data) {
 *             result += data[row].username + ": " + data[row].score + "\n";
 *         }
 *         alert( result );
 *     }, "json" );
 */  

include_once('DBConnect.php');

$operation = $_POST['op'];
$username = $_POST['username'];
$gameID = $_POST['gameID'];
$score = $_POST['score'];

switch ( $operation )
{
    case 'scoreExists':
        echo score_exists( $username, $gameID ); break;
    case 'setScore':
        set_score( $username, $gameID, $score ); break;
    case 'getScore':
        echo get_score( $username, $gameID ); break;
    case 'getGameScores':
        echo get_game_scores( $gameID ); break;
    case 'getUserScores':
        echo get_user_scores( $username, $gameID ); break;
    case 'deleteUser':
        delete_user( $username ); break;
    case 'createTable':
        create_table(); break;
    default: break;
}

// returns exists = TRUE if the given user has a score recorded for the given
// gameID, exists = FALSE otherwise.
function score_exists( $username, $gameID )
{
    $query = sprintf( "SELECT * FROM highscores
              WHERE username='%s' AND gameID='%s'",
              mysql_real_escape_string($username),
              mysql_real_escape_string($gameID) );
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    $arr = (mysql_num_rows( $result ) != 0) ?
        array( "exists" => TRUE ) : array( "exists" => FALSE );
    return json_encode( $arr );
}

// updates a user's score, replacing any old score for the same game
function set_score( $username, $gameID, $score )
{
    if ( !(get_score( $username, $gameID ) < $score) ) { return; }
    $query= sprintf( "REPLACE INTO highscores (username, gameID, score)
             VALUES ('%s', '%s', '%s')",
             mysql_real_escape_string($username),
             mysql_real_escape_string($gameID),
             mysql_real_escape_string($score) );
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
}

// returns the recorded score of the given user for the given game in an object
// with the 'score' field defined
function get_score( $username, $gameID )
{
    $query = sprintf( "SELECT * FROM highscores
              WHERE username='%s' AND gameID='%s'",
              mysql_real_escape_string($username),
              mysql_real_escape_string($gameID) );
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    $arr = array( "score" => mysql_result( $result, 0, 'score' ) );
    return json_encode( $arr );
}

// gets all recorded scores for the given game in an array of objects, where
// each object has 'username' and 'score' fields defined
function get_game_scores( $gameID )
{
    $query = sprintf( "SELECT * FROM highscores
              WHERE gameID = '%s'
              ORDER BY score DESC",
              mysql_real_escape_string($gameID) );
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    $arr = array();
    while( $row = mysql_fetch_array( $result ) )
    {
        $arr[] = array( "username" => $row['username'],
                        "score" => $row['score'] );
    }
    return json_encode( $arr );
}

// gets all the scores associated with one user in an array of objects, where
// each object has 'gameID' and 'score' fields defined
function get_user_scores( $username )
{
    $query = sprintf( "SELECT * FROM highscores
              WHERE username='%s'",
              mysql_real_escape_string($username) );
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    $arr = array();
    while( $row = mysql_fetch_array( $result ) )
    {
        $arr[] = array( "gameID" => $row['gameID'], "score" => $row['score'] );
    }
    return json_encode( $arr );
}

// deletes all score entries for a username
function delete_user( $username )
{
    $query = sprintf( "DELETE FROM highscores
              WHERE username='%s'",
              mysql_real_escape_string($username) );
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
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
}

?>
