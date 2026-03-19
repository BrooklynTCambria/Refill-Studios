<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$profilePic = $_POST['profile_pic'] ?? null;

if (empty($username)) {
    echo json_encode(['success' => false, 'message' => 'Username cannot be empty']);
    exit;
}

if (strlen($username) < 3) {
    echo json_encode(['success' => false, 'message' => 'Username must be at least 3 characters']);
    exit;
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    echo json_encode(['success' => false, 'message' => 'Username can only contain letters, numbers, and underscores']);
    exit;
}

try {
    // Check if username is taken by another user
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
    $stmt->execute([$username, $_SESSION['user_id']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already taken']);
        exit;
    }
    
    // Update user
    if ($profilePic && $profilePic !== $_SESSION['profile_pic']) {
        $stmt = $pdo->prepare("UPDATE users SET username = ?, profile_pic = ? WHERE id = ?");
        $stmt->execute([$username, $profilePic, $_SESSION['user_id']]);
        $_SESSION['profile_pic'] = $profilePic;
    } else {
        $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
        $stmt->execute([$username, $_SESSION['user_id']]);
    }
    
    $_SESSION['username'] = $username;
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => [
            'username' => $username,
            'profilePic' => $_SESSION['profile_pic']
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Update profile error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
}
?>