<?php
header('Content-Type: application/json');
error_reporting(0); // Disable HTML error output
require_once '../config/db_config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            // Get all posts with comments
            $stmt = $pdo->query("
                SELECT p.*, 
                       (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
                FROM posts p 
                ORDER BY p.created_at DESC
            ");
            $posts = $stmt->fetchAll();
            
            // Get comments for each post
            foreach ($posts as &$post) {
                $stmt = $pdo->prepare("
                    SELECT * FROM comments 
                    WHERE post_id = ? 
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$post['id']]);
                $post['comments'] = $stmt->fetchAll();
                
                // Format image data
                if ($post['image_data']) {
                    $post['image'] = [
                        'dataUrl' => $post['image_data'],
                        'name' => $post['image_name'],
                        'type' => $post['image_type'],
                        'size' => $post['image_size']
                    ];
                }
                unset($post['image_data']);
            }
            
            echo json_encode($posts);
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
        
    case 'POST':
        try {
            // Create new post
            $token = isset($_COOKIE['session_token']) ? $_COOKIE['session_token'] : null;
            $user = validateSession($token);
            
            if (!$user || !in_array($user['role'], ['admin', 'developer'])) {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized']);
                break;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                INSERT INTO posts (header, description, author, author_role, image_data, image_name, image_type, image_size) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $imageData = isset($data['image']) ? $data['image'] : null;

            $stmt->execute([
                $data['header'],
                $data['description'],
                $user['username'],
                $user['role'],
                isset($imageData['dataUrl']) ? $imageData['dataUrl'] : null,
                isset($imageData['name']) ? $imageData['name'] : null,
                isset($imageData['type']) ? $imageData['type'] : null,
                isset($imageData['size']) ? $imageData['size'] : null
            ]);
            
            echo json_encode([
                'success' => true,
                'id' => $pdo->lastInsertId()
            ]);
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>