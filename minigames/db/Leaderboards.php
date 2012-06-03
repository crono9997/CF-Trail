<?php

//
// Leaderboards.php
// 
// Required files: config.php
//
// Samples (using $_GET for dev):
//      /Leaderboards.php?op=deleteUser&username=Glados
//      /Leaderboards.php?op=getScore&username=DeckardCain&gameID=theGame
//      /Leaderboards.php?op=setScore&username=Me&gameID=theGame&score=1000
//
// Table used:
// CREATE TABLE highscores (
//     username varchar(20),
//     gameID varchar(50),
//     score int,
//     PRIMARY KEY (username,gameID)
// )
//

include_once('config.php');

$con = mysql_connect( $host, $user, $password );
if (!$con) { die( "Unable to establish connection with server." ); }
@mysql_select_db( $database ) or die( "Unable to select database." );

$operation = $_GET['op'];

if ( $operation == 'setScore' )
{
    setScore( $_GET['username'], $_GET['gameID'], $_GET['score'] );
}
else if ( $operation == 'getScore' )
{
    getScore( $_GET['username'], $_GET['gameID'] );
}
else if ( $operation == 'getGameScores' )
{
    getGameScores( $_GET['gameID'] ); 
}
else if ( $operation == 'getNameScores' )
{
    getUserScores( $_GET['username'] );
}
else if ( $operation == 'deleteUser' )
{
    deleteUser( $_GET['username'] );
}
else if ( $operation == 'createTable' )
{
    createTable();
}

// updates a user's score, replacing any old score for the same game
function setScore( $username, $gameID, $score )
{
    $query= "REPLACE INTO highscores (username, gameID, score)
             VALUES ('$username', '$gameID', '$score')";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    echo $result;
}

// returns the recorded score of the given user for the given game
function getScore( $username, $gameID )
{
    $query = "SELECT * FROM highscores
              WHERE username='$username' AND gameID='$gameID'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    echo mysql_result( $result, 0, 'score' );
}

// gets all recorded scores for the given game, one per line, in descending
// order, in the format <name>,<score>
function getGameScores( $gameID )
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
    echo $output;
}

// gets all the scores associated with one user, one per line, with the form
// <gameID>,<score>
function getUserScores( $username )
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
    echo $output;
}

// deletes all score entries for a username
function deleteUser( $username )
{
    $query = "DELETE FROM highscores
              WHERE username='$username'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    echo $result;
}

// creates the highscore table
function createTable()
{
    $query = "CREATE TABLE highscores (
                  username varchar(20),
                  gameID varchar(50),
                  score int,
                  PRIMARY KEY (username,gameID)
              )";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    echo $result;
}

?>
