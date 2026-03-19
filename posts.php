<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'get_all':
        getAllPosts();
        break;
    case 'get_single':
        getSinglePost();
        break;
    case 'create':
        createPost();
        break;
    case 'delete':
        deletePost();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getAllPosts() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("
            SELECT p.*, u.username as author_name, u.role as author_role, s.role as staff_role
            FROM posts p
            JOIN staff s ON p.uploader_id = s.id
            JOIN users u ON s.user_id = u.id
            ORDER BY p.created_at DESC
        ");
        
        $posts = $stmt->fetchAll();
        
        // Get comment counts for each post
        foreach ($posts as &$post) {
            $countStmt = $pdo->prepare("SELECT COUNT(*) as count FROM comments WHERE post_id = ?");
            $countStmt->execute([$post['id']]);
            $post['comment_count'] = $countStmt->fetch()['count'];
        }
        
        echo json_encode(['success' => true, 'posts' => $posts]);
    } catch (PDOException $e) {
        error_log("Get posts error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to get posts']);
    }
}

function getSinglePost() {
    global $pdo;
    
    $postId = $_GET['id'] ?? 0;
    
    if (!$postId) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT p.*, u.username as author_name, u.role as author_role
            FROM posts p
            JOIN staff s ON p.uploader_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE p.id = ?
        ");
        $stmt->execute([$postId]);
        $post = $stmt->fetch();
        
        if ($post) {
            // Get comments for this post
            $commentStmt = $pdo->prepare("
                SELECT c.*, u.username, u.profile_pic, u.role
                FROM comments c
                JOIN users u ON c.uploader_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.created_at ASC
            ");
            $commentStmt->execute([$postId]);
            $post['comments'] = $commentStmt->fetchAll();
            
            echo json_encode(['success' => true, 'post' => $post]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Post not found']);
        }
    } catch (PDOException $e) {
        error_log("Get single post error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to get post']);
    }
}

function createPost() {
    global $pdo;
    
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        return;
    }
    
    if ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'developer') {
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        return;
    }
    
    $header = trim($_POST['header'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $attachedImage = $_POST['attached_image'] ?? null;
    
    if (empty($header) || empty($description)) {
        echo json_encode(['success' => false, 'message' => 'Header and description required']);
        return;
    }
    
    try {
        // Get staff ID for this user
        $stmt = $pdo->prepare("SELECT id FROM staff WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $staff = $stmt->fetch();
        
        if (!$staff) {
            echo json_encode(['success' => false, 'message' => 'Staff record not found']);
            return;
        }
        
        $insertStmt = $pdo->prepare("
            INSERT INTO posts (uploader_id, header, post_description, attached_image, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $insertStmt->execute([$staff['id'], $header, $description, $attachedImage]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Post created successfully',
            'post_id' => $pdo->lastInsertId()
        ]);
        
    } catch (PDOException $e) {
        error_log("Create post error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to create post']);
    }
}

function deletePost() {
    global $pdo;
    
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        return;
    }
    
    $postId = $_POST['post_id'] ?? 0;
    
    if (!$postId) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    try {
        // Check if user owns this post or is admin
        if ($_SESSION['role'] === 'admin') {
            // Admin can delete any post
            $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
            $stmt->execute([$postId]);
        } else {
            // Developer can only delete their own posts
            $staffStmt = $pdo->prepare("SELECT id FROM staff WHERE user_id = ?");
            $staffStmt->execute([$_SESSION['user_id']]);
            $staff = $staffStmt->fetch();
            
            if ($staff) {
                $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ? AND uploader_id = ?");
                $stmt->execute([$postId, $staff['id']]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Staff record not found']);
                return;
            }
        }
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Post deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Post not found or you do not have permission']);
        }
        
    } catch (PDOException $e) {
        error_log("Delete post error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to delete post']);
    }
}
?>