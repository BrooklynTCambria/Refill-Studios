<?php
session_start();

// Clear session token from database if using
if (isset($_SESSION['session_token']) && isset($_SESSION['user_id'])) {
    try {
        require_once 'db.php';
        $stmt = $pdo->prepare("DELETE FROM sessions WHERE session_token = ?");
        $stmt->execute([$_SESSION['session_token']]);
    } catch (PDOException $e) {
        // Log error but continue with logout
        error_log("Logout cleanup error: " . $e->getMessage());
    }
}

// Destroy session
$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>