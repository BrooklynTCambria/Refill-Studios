<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, username, email, profile_pic, role, created_at FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if ($user) {
        // Check if user is staff
        $staffStmt = $pdo->prepare("SELECT role FROM staff WHERE user_id = ?");
        $staffStmt->execute([$user['id']]);
        $staff = $staffStmt->fetch();
        
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'profilePic' => $user['profile_pic'],
                'role' => $user['role'],
                'isStaff' => ($staff !== false),
                'staffRole' => $staff ? $staff['role'] : null,
                'memberSince' => $user['created_at']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} catch (PDOException $e) {
    error_log("Get user error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to get user data']);
}
?>