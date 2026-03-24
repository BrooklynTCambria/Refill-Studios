<?php
header('Content-Type: application/json');
error_reporting(0);
require_once '../config/db_config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            // Get all posts with author info from users table
            $stmt = $pdo->query("
                SELECT p.*, 
                    u.username as author,
                    u.selected_role as author_role,
                    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
                FROM posts p 
                JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC
            ");
            $posts = $stmt->fetchAll();
            
            // Get comments for each post
            foreach ($posts as &$post) {
                $stmt = $pdo->prepare("
                    SELECT c.*, u.username, u.selected_role as user_role
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
        $token = isset($_COOKIE['session_token']) ? $_COOKIE['session_token'] : null;
        $user = validateSession($token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Please login to create posts']);
            break;
        }
        
        // Check if user has permission to post
        $canPost = ($user['selected_role'] !== 'Default' && $user['selected_role'] !== 'Admin') || 
                   ($user['selected_role'] === 'Admin');
        
        if (!$canPost) {
            http_response_code(403);
            echo json_encode(['error' => 'You need to select a creative role to create posts']);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['header']) || empty($data['description'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Header and description are required']);
            break;
        }
        
        // Handle image data
        $imageData = null;
        if (isset($data['image']) && isset($data['image']['dataUrl'])) {
            $imageData = $data['image']['dataUrl'];
        }
        
        // Insert post using user_id only (no author field)
        $stmt = $pdo->prepare("
            INSERT INTO posts (header, description, user_id, image_data, author_role, author_role_display) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['header'],
            $data['description'],
            $user['id'],
            $imageData,
            $user['selected_role'],
            $user['selected_role']
        ]);
        
        echo json_encode([
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'message' => 'Post created successfully'
        ]);
    } catch (Exception $e) {
        error_log("Error creating post: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create post: ' . $e->getMessage()]);
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
            
            // Check if user is admin
            $isAdmin = false;
            if (isset($user['role']) && $user['role'] === 'admin') {
                $isAdmin = true;
            }
            if (isset($user['selected_role']) && $user['selected_role'] === 'Admin') {
                $isAdmin = true;
            }
            
            // Allow if user is admin OR user owns the post
            if ($isAdmin || $post['user_id'] == $user['id']) {
                $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
                $stmt->execute([$postId]);
                echo json_encode(['success' => true, 'message' => 'Post deleted successfully']);
            } else {
                http_response_code(403);
                echo json_encode(['error' => 'You can only delete your own posts']);
            }
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>