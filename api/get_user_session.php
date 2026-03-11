<?php 
session_start();

// set as null because that way we can use the ?? operator in the json encode
$role = null;

// if the user is a staff then set role to be the staff role
if (isset($_SESSION["is_staff"])) {
    if ($_SESSION["is_staff"]) {
        $role = $_SESSION["staff_role"];
    }
}

// essentially just send any session data, if any, so to update the little account icon in the top corner
// if there isnt anything then just send the defaults again
echo json_encode([
    "username" => $_SESSION["username"] ?? 'Guest',
    // if role is null it means there's either no logged in user or the user is not a staff member, so set it as normal user
    "role" => $role ?? 'user',
    "isLoggedIn" => $_SESSION["logged_in"] ?? false,
    "profilePic" => $_SESSION['profile_pic'] ?? 'images/account.png'
]);


?>