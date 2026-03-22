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
            
            // Check if user is logged in
            if (!$user) {
                http_response_code(401);
                echo json_encode(['error' => 'Please login to create posts']);
                break;
            }
            
            // Check if user has permission to post (using can_post flag)
            // For backward compatibility, also check old role field
            $canPost = false;
            
            // Check new can_post flag
            if (isset($user['can_post']) && $user['can_post'] == 1) {
                $canPost = true;
            }
            // Check selected_role if can_post flag isn't set
            else if (isset($user['selected_role']) && $user['selected_role'] !== 'Default') {
                $canPost = true;
            }
            // Fallback: Check old role field for admin/developer
            else if (isset($user['role']) && in_array($user['role'], ['admin', 'developer'])) {
                $canPost = true;
            }
            
            if (!$canPost) {
                http_response_code(403);
                echo json_encode(['error' => 'You need to select a creative role (Artist, Programmer, Modeler, etc.) to create posts. Go to Account Settings to select your role.']);
                break;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (empty($data['header']) || empty($data['description'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Header and description are required']);
                break;
            }
            
            // Handle image data
            $imageData = null;
            if (isset($data['image']) && isset($data['image']['dataUrl'])) {
                $imageData = $data['image'];
            }
            
            // Determine the role to display (use selected_role if available, otherwise use old role)
            $displayRole = isset($user['selected_role']) ? $user['selected_role'] : $user['role'];
            
            $stmt = $pdo->prepare("
                INSERT INTO posts (header, description, author, author_role, author_role_display, user_id, image_data, image_name, image_type, image_size) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $data['header'],
                $data['description'],
                $user['username'],
                $displayRole, // Use the selected role as author_role
                $displayRole, // Store display role separately
                $user['id'],
                isset($imageData['dataUrl']) ? $imageData['dataUrl'] : null,
                isset($imageData['name']) ? $imageData['name'] : null,
                isset($imageData['type']) ? $imageData['type'] : null,
                isset($imageData['size']) ? $imageData['size'] : null
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
            
            // Check if user is admin (using old role or new selected_role)
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