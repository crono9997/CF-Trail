<?php

// Users.php
//
// Required files: DBConnect.php, config.php
//
// Password is hashed using md5. Raw password is never stored.
//
// Examples ($_GET used for dev):
//      Users.php?op=userExists&username=Bob
//      Users.php?op=setPassword&username=Bob&password=TheBuilder
//      Users.php?op=isCorrectPassword&username=Bob&password=wrongpassword

include_once( 'DBConnect.php' );

$operation = $_GET['op'];

if ( $operation == 'setPassword' )
{
    echo set_password( $_GET['username'], $_GET['password'] );
}
else if ( $operation == 'userExists' )
{
    echo user_exists( $_GET['username'] );
}
else if ( $operation == 'isCorrectPassword' )
{
    echo is_correct_password( $_GET['username'], $_GET['password'] );
}
else if ( $operation == 'deleteUser' )
{
    echo delete_user( $_GET['username'] );
}
else if ( $operation == 'createTable' )
{
    echo create_table();
}

// -----------------------

// returns 1 if password is correct, 0 if password is incorrect
function is_correct_password( $username, $password )
{
    if ( hash_password( $password ) == get_hashed_password( $username ) ) {
        return 1;
    } else {
        return 0;
    }
}

// returns 1
function set_password( $username, $password )
{
    $hashed = hash_password( $password );
    $query = "REPLACE INTO users (username, password)
              VALUES ('$username','$hashed')";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return $result;
}

// returns 1 if user exists, 0 if user does not exist
function user_exists( $username )
{
    $query = "SELECT * FROM users
              WHERE username='$username'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    if ( mysql_num_rows( $result ) != 0 ) { return 1; }
    else { return 0; }
}

// removes login information about a user from the database
function delete_user( $username )
{
    $query = "DELETE FROM users
              WHERE username='$username'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return $result;
}

// returns a 32-character string hashed from the given password (using md5)
function hash_password( $password )
{
    return hash( 'md5', $password );
}

// returns the hashed version of a user's password as recorded in the table
function get_hashed_password( $username )
{
    $query = "SELECT * FROM users
              WHERE username='$username'";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return mysql_result( $result, 0, 'password' );
}

// creates the users table required by the other functions
function create_table()
{
    $query = "CREATE TABLE users (
                  username varchar(255) PRIMARY KEY,
                  password varchar(32)
              )";
    $result = mysql_query( $query );
    if (!$result) { die( mysql_error() ); }
    return $result;
}

?>
