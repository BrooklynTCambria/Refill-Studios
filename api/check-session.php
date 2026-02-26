<?php
// api/check-session.php
session_start();
header("Content-Type: application/json");

if(isset($_SESSION['user_id'])) {
    echo json_encode([
        'loggedIn' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role'],
            'profile_pic' => $_SESSION['profile_pic'] ?? 'images/account.png'
        ]
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>