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
            INSERT INTO comments (post_id, username, user_id, text, is_dev) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['postId'],
            $user['username'],
            $user['id'],
            $data['text'],
            in_array($user['role'], ['admin', 'developer']) ? 1 : 0
        ]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    try {
        // Delete a comment
        $token = isset($_COOKIE['session_token']) ? $_COOKIE['session_token'] : null;
        $user = validateSession($token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Please login']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $commentId = isset($data['commentId']) ? intval($data['commentId']) : 0;
        
        if (!$commentId) {
            echo json_encode(['error' => 'Comment ID required']);
            return;
        }
        
        // Check if user owns the comment or is admin
        $stmt = $pdo->prepare("SELECT user_id FROM comments WHERE id = ?");
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch();
        
        if (!$comment) {
            echo json_encode(['error' => 'Comment not found']);
            return;
        }
        
        // Allow if user is admin OR user owns the comment
        if ($user['role'] === 'admin' || $comment['user_id'] == $user['id']) {
            $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
            $stmt->execute([$commentId]);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'You can only delete your own comments']);
        }
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>