<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
    exit;
}

try {
    // Get user info with role from users table
    $stmt = $pdo->prepare("SELECT id, username, email, password_hash, profile_pic, role FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Check if user is staff (for backward compatibility)
        $staffStmt = $pdo->prepare("SELECT role FROM staff WHERE user_id = ?");
        $staffStmt->execute([$user['id']]);
        $staff = $staffStmt->fetch();
        
        $isStaff = ($staff !== false);
        $staffRole = $isStaff ? $staff['role'] : null;
        
        // Generate session token
        $sessionToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
        
        // Store session
        $sessionStmt = $pdo->prepare("INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)");
        $sessionStmt->execute([
            $user['id'], 
            $sessionToken, 
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
            $expiresAt
        ]);
        
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['profile_pic'] = $user['profile_pic'] ?? 'images/account.png';
        $_SESSION['logged_in'] = true;
        $_SESSION['role'] = $user['role'];
        $_SESSION['is_staff'] = $isStaff;
        $_SESSION['staff_role'] = $staffRole;
        $_SESSION['session_token'] = $sessionToken;

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'profilePic' => $user['profile_pic'] ?? 'images/account.png',
                'isLoggedIn' => true,
                'role' => $user['role'],
                'isStaff' => $isStaff,
                'staffRole' => $staffRole
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Login failed. Please try again.']);
}
?>