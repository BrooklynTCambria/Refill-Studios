<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'get':
        getComments();
        break;
    case 'add':
        addComment();
        break;
    case 'delete':
        deleteComment();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getComments() {
    global $pdo;
    
    $postId = $_GET['post_id'] ?? 0;
    
    if (!$postId) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT c.*, u.username, u.profile_pic, u.role
            FROM comments c
            JOIN users u ON c.uploader_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        ");
        $stmt->execute([$postId]);
        $comments = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'comments' => $comments]);
    } catch (PDOException $e) {
        error_log("Get comments error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to get comments']);
    }
}

function addComment() {
    global $pdo;
    
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        return;
    }
    
    $postId = $_POST['post_id'] ?? 0;
    $comment = trim($_POST['comment'] ?? '');
    
    if (!$postId) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    if (empty($comment)) {
        echo json_encode(['success' => false, 'message' => 'Comment cannot be empty']);
        return;
    }
    
    if (strlen($comment) > 500) {
        echo json_encode(['success' => false, 'message' => 'Comment too long (max 500 characters)']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO comments (uploader_id, post_id, comment_description, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        
        $stmt->execute([$_SESSION['user_id'], $postId, $comment]);
        
        // Get the newly created comment with user info
        $newStmt = $pdo->prepare("
            SELECT c.*, u.username, u.profile_pic, u.role
            FROM comments c
            JOIN users u ON c.uploader_id = u.id
            WHERE c.id = ?
        ");
        $newStmt->execute([$pdo->lastInsertId()]);
        $newComment = $newStmt->fetch();
        
        echo json_encode([
            'success' => true,
            'message' => 'Comment added successfully',
            'comment' => $newComment
        ]);
        
    } catch (PDOException $e) {
        error_log("Add comment error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to add comment']);
    }
}

function deleteComment() {
    global $pdo;
    
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        return;
    }
    
    $commentId = $_POST['comment_id'] ?? 0;
    
    if (!$commentId) {
        echo json_encode(['success' => false, 'message' => 'Comment ID required']);
        return;
    }
    
    try {
        if ($_SESSION['role'] === 'admin') {
            // Admin can delete any comment
            $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
            $stmt->execute([$commentId]);
        } else {
            // Regular users can only delete their own comments
            $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ? AND uploader_id = ?");
            $stmt->execute([$commentId, $_SESSION['user_id']]);
        }
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Comment deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Comment not found or you do not have permission']);
        }
        
    } catch (PDOException $e) {
        error_log("Delete comment error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to delete comment']);
    }
}
?>