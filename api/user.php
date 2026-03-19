<?php
header('Content-Type: application/json');
require_once '../db_config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get current user from session
        session_start();
        $token = $_COOKIE['session_token'] ?? null;
        $user = validateSession($token);
        
        if ($user) {
            unset($user['password_hash']);
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'user' => [
                'username' => 'Guest',
                'role' => 'user',
                'profile_pic' => 'images/account.png'
            ]]);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';
        
        if ($action === 'login') {
            // Login
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$data['username'], $data['username']]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($data['password'], $user['password_hash'])) {
                $token = createSession($user['id']);
                setcookie('session_token', $token, time() + (30 * 24 * 60 * 60), '/');
                
                unset($user['password_hash']);
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            }
        }
        elseif ($action === 'register') {
            // Register
            $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
            
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO users (username, email, password_hash, role, profile_pic) 
                    VALUES (?, ?, ?, 'user', 'images/account.png')
                ");
                $stmt->execute([$data['username'], $data['email'], $password_hash]);
                
                // Auto login after registration
                $userId = $pdo->lastInsertId();
                $token = createSession($userId);
                setcookie('session_token', $token, time() + (30 * 24 * 60 * 60), '/');
                
                echo json_encode(['success' => true, 'message' => 'Registration successful']);
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
            }
        }
        elseif ($action === 'logout') {
            // Logout
            $token = $_COOKIE['session_token'] ?? null;
            if ($token) {
                deleteSession($token);
                setcookie('session_token', '', time() - 3600, '/');
            }
            echo json_encode(['success' => true]);
        }
        break;
        
    case 'PUT':
        // Update user settings
        $data = json_decode(file_get_contents('php://input'), true);
        $token = $_COOKIE['session_token'] ?? null;
        $user = validateSession($token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            break;
        }
        
        if (isset($data['username'])) {
            $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
            $stmt->execute([$data['username'], $user['id']]);
        }
        
        if (isset($data['profile_pic'])) {
            $stmt = $pdo->prepare("UPDATE users SET profile_pic = ? WHERE id = ?");
            $stmt->execute([$data['profile_pic'], $user['id']]);
        }
        
        if (isset($data['notifications'])) {
            $stmt = $pdo->prepare("
                UPDATE users SET 
                    notification_posts = ?,
                    notification_replies = ?,
                    notification_games = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $data['notifications']['posts'],
                $data['notifications']['replies'],
                $data['notifications']['games'],
                $user['id']
            ]);
        }
        
        echo json_encode(['success' => true]);
        break;
}
?>