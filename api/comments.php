<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!isset($_GET['post_id'])) {
        echo json_encode([]);
        exit;
    }
    
    try {
        $query = "SELECT * FROM comments WHERE post_id = :post_id ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':post_id', $_GET['post_id']);
        $stmt->execute();
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($comments);
    } catch (Exception $e) {
        error_log("Get comments error: " . $e->getMessage());
        echo json_encode([]);
    }
    exit;
}

if ($method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        exit;
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data || !isset($data->post_id) || !isset($data->text)) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }
    
    try {
        $is_dev = ($_SESSION['role'] === 'admin' || $_SESSION['role'] === 'developer') ? 1 : 0;
        $text = htmlspecialchars(strip_tags($data->text));
        
        $query = "INSERT INTO comments (post_id, user_id, username, text, is_dev) 
                  VALUES (:post_id, :user_id, :username, :text, :is_dev)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':post_id', $data->post_id);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->bindParam(':username', $_SESSION['username']);
        $stmt->bindParam(':text', $text);
        $stmt->bindParam(':is_dev', $is_dev);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Comment added']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add comment']);
        }
    } catch (Exception $e) {
        error_log("Add comment error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Server error occurred']);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Method not allowed']);
?>