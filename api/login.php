<?php
// api/login.php
session_start();
header("Content-Type: application/json");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->username) || !isset($data->password)) {
    echo json_encode(['success' => false, 'message' => 'Username and password required']);
    exit;
}

$query = "SELECT id, username, role, profile_pic, password_hash FROM users WHERE username = :username";
$stmt = $db->prepare($query);
$stmt->bindParam(':username', $data->username);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (password_verify($data->password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['profile_pic'] = $user['profile_pic'];
        
        echo json_encode([
            'success' => true,
            'user' => [
                'username' => $user['username'],
                'role' => $user['role'],
                'profile_pic' => $user['profile_pic']
            ]
        ]);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
?>