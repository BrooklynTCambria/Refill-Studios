<?php
// api/users.php - Clean version with timezone fix
error_reporting(E_ALL);
ini_set('display_errors', 0); // Turn off display errors to prevent HTML output
ini_set('log_errors', 1);

// Set timezone to fix warnings
date_default_timezone_set('Europe/London'); // Change to your timezone if needed

// Clean any output buffers
while (ob_get_level()) {
    ob_end_clean();
}
ob_start();

// Set JSON header
header('Content-Type: application/json');

// Function to generate random token (compatible with older PHP)
function generateRandomToken($length = 32) {
    if (function_exists('random_bytes')) {
        // PHP 7+
        return bin2hex(random_bytes($length));
    } elseif (function_exists('openssl_random_pseudo_bytes')) {
        // OpenSSL fallback
        return bin2hex(openssl_random_pseudo_bytes($length));
    } else {
        // Fallback for very old PHP
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $token = '';
        for ($i = 0; $i < $length; $i++) {
            $token .= $characters[mt_rand(0, strlen($characters) - 1)];
        }
        return $token;
    }
}

// Function to validate session (needs to be defined before use)
function validateSession($token) {
    if (!$token) return null;
    
    $pdo = getDBConnection();
    if (!$pdo) return null;
    
    $stmt = $pdo->prepare("
        SELECT u.* FROM users u 
        JOIN user_sessions s ON u.id = s.user_id 
        WHERE s.session_token = ? AND s.expires_at > NOW()
    ");
    $stmt->execute(array($token));
    return $stmt->fetch();
}

try {
    // Include database config
    require_once __DIR__ . '/../config/db_config.php';
    
    // Test if database connection works
    $pdo = getDBConnection();
    
    if (!$pdo) {
        throw new Exception('Database connection failed. Check your database settings.');
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        // Get POST data
        $input = file_get_contents('php://input');
        
        if (empty($input)) {
            throw new Exception('No input data received');
        }
        
        $data = json_decode($input, true);
        
        if (!$data) {
            throw new Exception('Invalid JSON data: ' . json_last_error_msg());
        }
        
        if (!isset($data['action'])) {
            throw new Exception('No action specified');
        }
        
        // Handle login
        if ($data['action'] === 'login') {
            $username = isset($data['username']) ? trim($data['username']) : '';
            $password = isset($data['password']) ? $data['password'] : '';
            
            if (empty($username) || empty($password)) {
                echo json_encode(array('success' => false, 'message' => 'Username and password are required'));
                exit();
            }
            
            // Find user by username or email
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
            $stmt->execute(array($username, $username));
            $user = $stmt->fetch();
            
            if (!$user) {
                echo json_encode(array('success' => false, 'message' => 'Invalid username or password'));
                exit();
            }
            
            // Verify password
            if (!password_verify($password, $user['password_hash'])) {
                echo json_encode(array('success' => false, 'message' => 'Invalid username or password'));
                exit();
            }
            
            // Delete old sessions
            $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE user_id = ?");
            $stmt->execute(array($user['id']));
            
            // Create new session
            $token = generateRandomToken(32);
            $expires = date('Y-m-d H:i:s', strtotime('+30 days'));
            
            $stmt = $pdo->prepare("INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)");
            $stmt->execute(array($user['id'], $token, $expires));
            
            // Set cookie
            setcookie('session_token', $token, time() + (30 * 24 * 60 * 60), '/', '', false, true);
            
            // Get profile picture
            $profilePic = $user['profile_pic'];
            if (empty($profilePic)) {
                $profilePic = 'images/account.png';
            }
            
            // Return success
            echo json_encode(array(
                'success' => true,
                'user' => array(
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'profile_pic' => $profilePic,
                    'isLoggedIn' => true
                )
            ));
            exit();
        }
        
        // Handle register
        elseif ($data['action'] === 'register') {
            $username = isset($data['username']) ? trim($data['username']) : '';
            $email = isset($data['email']) ? trim($data['email']) : '';
            $password = isset($data['password']) ? $data['password'] : '';
            
            // Validation
            $errors = array();
            if (empty($username)) $errors[] = 'Username is required';
            if (empty($email)) $errors[] = 'Email is required';
            if (empty($password)) $errors[] = 'Password is required';
            if (strlen($password) < 6) $errors[] = 'Password must be at least 6 characters';
            if (strlen($username) < 3) $errors[] = 'Username must be at least 3 characters';
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Invalid email address';
            
            if (!empty($errors)) {
                echo json_encode(array('success' => false, 'message' => implode(', ', $errors)));
                exit();
            }
            
            // Check if user exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute(array($username, $email));
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(array('success' => false, 'message' => 'Username or email already exists'));
                exit();
            }
            
            // Create user
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, role, profile_pic) VALUES (?, ?, ?, 'user', 'images/account.png')");
            
            if ($stmt->execute(array($username, $email, $hash))) {
                $userId = $pdo->lastInsertId();
                
                // Create session
                $token = generateRandomToken(32);
                $expires = date('Y-m-d H:i:s', strtotime('+30 days'));
                
                $stmt = $pdo->prepare("INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)");
                $stmt->execute(array($userId, $token, $expires));
                
                setcookie('session_token', $token, time() + (30 * 24 * 60 * 60), '/', '', false, true);
                
                echo json_encode(array(
                    'success' => true,
                    'user' => array(
                        'id' => $userId,
                        'username' => $username,
                        'email' => $email,
                        'role' => 'user',
                        'profile_pic' => 'images/account.png',
                        'isLoggedIn' => true
                    )
                ));
            } else {
                echo json_encode(array('success' => false, 'message' => 'Registration failed'));
            }
            exit();
        }
        
        // Handle logout
        elseif ($data['action'] === 'logout') {
            if (isset($_COOKIE['session_token'])) {
                $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE session_token = ?");
                $stmt->execute(array($_COOKIE['session_token']));
                setcookie('session_token', '', time() - 3600, '/');
            }
            echo json_encode(array('success' => true));
            exit();
        }
        
        else {
            echo json_encode(array('success' => false, 'message' => 'Unknown action: ' . $data['action']));
            exit();
        }
    }
    
    // Handle GET - check session
    elseif ($method === 'GET') {
        $token = isset($_COOKIE['session_token']) ? $_COOKIE['session_token'] : null;
        
        if ($token) {
            $stmt = $pdo->prepare("
                SELECT u.id, u.username, u.email, u.role, u.profile_pic 
                FROM users u 
                JOIN user_sessions s ON u.id = s.user_id 
                WHERE s.session_token = ? AND s.expires_at > NOW()
            ");
            $stmt->execute(array($token));
            $user = $stmt->fetch();
            
            if ($user) {
                $profilePic = $user['profile_pic'];
                if (empty($profilePic)) {
                    $profilePic = 'images/account.png';
                }
                
                echo json_encode(array(
                    'success' => true,
                    'user' => array(
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'role' => $user['role'],
                        'profile_pic' => $profilePic,
                        'isLoggedIn' => true
                    )
                ));
                exit();
            }
        }
        
        // Not logged in
        echo json_encode(array(
            'success' => true,
            'user' => array(
                'username' => 'Guest',
                'role' => 'user',
                'isLoggedIn' => false,
                'profile_pic' => 'images/account.png'
            )
        ));
        exit();
    }
    
    // Handle PUT - Update user settings (moved to correct location)
    elseif ($method === 'PUT') {
        $token = isset($_COOKIE['session_token']) ? $_COOKIE['session_token'] : null;
        $user = validateSession($token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(array('success' => false, 'message' => 'Not logged in'));
            exit();
        }
        
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) {
            echo json_encode(array('success' => false, 'message' => 'No data provided'));
            exit();
        }
        
        $updates = array();
        $params = array();
        
        if (isset($data['username'])) {
            $username = trim($data['username']);
            
            // Check if username is taken
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
            $stmt->execute(array($username, $user['id']));
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(array('success' => false, 'message' => 'Username already taken'));
                exit();
            }
            
            if (strlen($username) < 3) {
                echo json_encode(array('success' => false, 'message' => 'Username must be at least 3 characters'));
                exit();
            }
            
            if (strlen($username) > 20) {
                echo json_encode(array('success' => false, 'message' => 'Username cannot exceed 20 characters'));
                exit();
            }
            
            $updates[] = "username = ?";
            $params[] = $username;
        }
        
        if (isset($data['profile_pic'])) {
            $updates[] = "profile_pic = ?";
            $params[] = $data['profile_pic'];
        }
        
        if (count($updates) > 0) {
            $params[] = $user['id'];
            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            
            if ($stmt->execute($params)) {
                echo json_encode(array('success' => true, 'message' => 'Settings updated'));
            } else {
                echo json_encode(array('success' => false, 'message' => 'Failed to update settings'));
            }
        } else {
            echo json_encode(array('success' => true, 'message' => 'No changes to save'));
        }
        exit();
    }
    
    else {
        echo json_encode(array('success' => false, 'message' => 'Method not allowed'));
        exit();
    }
    
} catch (Exception $e) {
    // Log the error and return a clean response
    error_log("API Error in users.php: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    
    // For debugging - show the actual error
    echo json_encode(array(
        'success' => false, 
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ));
    exit();
}

// Clean output buffer
if (ob_get_level()) {
    ob_end_flush();
}
?>