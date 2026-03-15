<?php
// $host = 'localhost';
// $dbname = 'refill_studios';
// $username = 'root';
// $password = 'root';

// try {
//     $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
//     $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//     $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
// } catch(PDOException $e) {
//     // Log error but don't expose details to users
//     error_log("Database connection failed: " . $e->getMessage());
//     die("Connection failed. Please try again later.");
// }

// I have no idea what you could have possibly been trying there

// We gon need this still
$host = 'localhost';
$dbname = 'refill_studios';
$username = 'root';
$password = 'root';

// This is what creates a server connection to the mysql database, you were overcomplicating your life with PDO since its made to work with multiple databases
$conn = new mysqli($host, $username, $password);

// Abort if the connection doesn't work blablabla I love boilerplate
if ($conn -> connect_error) {
    die("Connection error" . $conn->connect_error);
}

// This query is very tuff, it just looks within the schematics of mysql to check for any existing database which shares the same name as yours
$sql = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$dbname'";

// We send the query to mysql, this way it knows what its working on
$result = $conn -> query($sql);

// Now im gonna guess you dont want to wipe your database every time the script is called, so we check how many results actually popped up in the query

// We only recreate the database if theres 0 matches, cuz ofcourse
if ($result -> num_rows === 0) {
    // Get the contents of the sql file, so that you can execute it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    $initSQL = file_get_contents("init.sql");

    // Then you execute every command within the file (hence MULTI_query), and then check the result to see if it worked or not
    if ($conn -> multi_query($initSQL)) {
        // clear all the results
        while ($conn->more_results() && $conn->next_result()) {}

        // Select teh database
        $conn->select_db($dbname);

        // hash hash hash
        $adminPass = password_hash("admin123", PASSWORD_DEFAULT);
        $devPass = password_hash("dev123", PASSWORD_DEFAULT);

        // insert the users in
        $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");

        $username1 = "Admin";
        $email1 = "admin@refillstudios.com";
        $stmt->bind_param("sss", $username1, $email1, $adminPass);
        $stmt->execute();

        $username2 = "Developer";
        $email2 = "dev@refillstudios.com";
        $stmt->bind_param("sss", $username2, $email2, $devPass);
        $stmt->execute();


        echo "Database initialized";
    } else {
        echo "Error with database initialization blabla: " . $conn -> error;
    }
} else {
    echo "Database already exists rahhhhhhh";
}

// End the connection boi
$conn -> close();

// In any other script in which you need the database to do anything use:
// include_once "relative_path_to_this_file"
// then that way you can get $conn, in which you need to run any query blabla bleble
?>