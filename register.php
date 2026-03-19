<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$email = trim($_POST['email'] ?? '');
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// Validation
if (empty($email) || empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
    exit;
}

if ($password !== $confirm_password) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
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
    // Check if username or email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    
    if ($stmt->rowCount() > 0) {
        $existing = $stmt->fetch();
        $checkStmt = $pdo->prepare("SELECT username FROM users WHERE username = ? UNION SELECT username FROM users WHERE email = ?");
        $checkStmt->execute([$username, $email]);
        $existingUser = $checkStmt->fetch();
        
        if ($existingUser && $existingUser['username'] === $username) {
            echo json_encode(['success' => false, 'message' => 'Username already exists']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email already registered']);
        }
        exit;
    }

    // Create new user
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (email, username, password_hash, profile_pic, role) VALUES (?, ?, ?, 'images/account.png', 'user')");
    
    if ($stmt->execute([$email, $username, $password_hash])) {
        $userId = $pdo->lastInsertId();
        
        // Generate session token
        $sessionToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
        
        // Store session
        $sessionStmt = $pdo->prepare("INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)");
        $sessionStmt->execute([
            $userId, 
            $sessionToken, 
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
            $expiresAt
        ]);
        
        // Auto-login after registration
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;
        $_SESSION['role'] = 'user';
        $_SESSION['profile_pic'] = 'images/account.png';
        $_SESSION['logged_in'] = true;
        $_SESSION['session_token'] = $sessionToken;
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful!',
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'role' => 'user',
                'profilePic' => 'images/account.png',
                'isLoggedIn' => true
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
    }
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}
?>