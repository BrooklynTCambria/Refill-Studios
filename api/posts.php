<?php
header('Content-Type: application/json');
error_reporting(0);
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
                    SELECT c.*, u.username as author_name 
                    FROM comments c 
                    JOIN users u ON c.user_id = u.id
                    WHERE c.post_id = ? 
                    ORDER BY c.created_at DESC
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
            
            // Handle image data
            $imageData = null;
            if (isset($data['image']) && isset($data['image']['dataUrl'])) {
                $imageData = $data['image'];
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO posts (header, description, author, author_role, user_id, image_data, image_name, image_type, image_size) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $data['header'],
                $data['description'],
                $user['username'],
                $user['role'],
                $user['id'],
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
        
    case 'DELETE':
        try {
            // Delete a post
            $token = isset($_COOKIE['session_token']) ? $_COOKIE['session_token'] : null;
            $user = validateSession($token);
            
            if (!$user) {
                http_response_code(401);
                echo json_encode(['error' => 'Please login']);
                break;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            $postId = isset($data['postId']) ? intval($data['postId']) : 0;
            
            if (!$postId) {
                echo json_encode(['error' => 'Post ID required']);
                break;
            }
            
            // Check if user owns the post or is admin
            $stmt = $pdo->prepare("SELECT user_id, author FROM posts WHERE id = ?");
            $stmt->execute([$postId]);
            $post = $stmt->fetch();
            
            if (!$post) {
                echo json_encode(['error' => 'Post not found']);
                break;
            }
            
            // Allow if user is admin OR user owns the post
            if ($user['role'] === 'admin' || $post['user_id'] == $user['id']) {
                $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
                $stmt->execute([$postId]);
                echo json_encode(['success' => true]);
            } else {
                http_response_code(403);
                echo json_encode(['error' => 'You can only delete your own posts']);
            }
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>