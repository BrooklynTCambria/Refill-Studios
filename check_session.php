<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

$response = [
    'loggedIn' => false,
    'user' => null
];

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    try {
        // Verify session token exists and is valid
        if (isset($_SESSION['session_token'])) {
            $stmt = $pdo->prepare("SELECT * FROM sessions WHERE session_token = ? AND expires_at > NOW()");
            $stmt->execute([$_SESSION['session_token']]);
            $session = $stmt->fetch();
            
            if ($session) {
                $response['loggedIn'] = true;
                $response['user'] = [
                    'id' => $_SESSION['user_id'],
                    'username' => $_SESSION['username'],
                    'email' => $_SESSION['email'],
                    'role' => $_SESSION['role'],
                    'profilePic' => $_SESSION['profile_pic'],
                    'isStaff' => $_SESSION['is_staff'] ?? false,
                    'staffRole' => $_SESSION['staff_role'] ?? null
                ];
            } else {
                // Session expired, clear it
                session_destroy();
            }
        }
    } catch (PDOException $e) {
        error_log("Session check error: " . $e->getMessage());
    }
}

echo json_encode($response);
?>