<?php
header('Content-Type: application/json');
error_reporting(0);
require_once '../config/db_config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    try {
        // Add comment
        $token = isset($_COOKIE['session_token']) ? $_COOKIE['session_token'] : null;
        $user = validateSession($token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Please login to comment']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO comments (post_id, username, text, is_dev) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['postId'],
            $user['username'],
            $data['text'],
            in_array($user['role'], ['admin', 'developer']) ? 1 : 0
        ]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>