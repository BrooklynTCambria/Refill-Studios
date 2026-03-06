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
    try {
        $query = "SELECT * FROM posts ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($posts);
    } catch (Exception $e) {
        error_log("Get posts error: " . $e->getMessage());
        echo json_encode([]);
    }
    exit;
}

if ($method === 'POST') {
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        exit;
    }
    
    // Check authorization
    if ($_SESSION['role'] !== 'admin' && $_SESSION['role'] !== 'developer') {
        echo json_encode(['success' => false, 'message' => 'Insufficient permissions']);
        exit;
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data || !isset($data->header) || !isset($data->description)) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }
    
    try {
        $query = "INSERT INTO posts (header, description, image_url, author_id, author_name, author_role) 
                  VALUES (:header, :description, :image_url, :author_id, :author_name, :author_role)";
        
        $stmt = $db->prepare($query);
        
        $header = htmlspecialchars(strip_tags($data->header));
        $description = htmlspecialchars(strip_tags($data->description));
        $image_url = isset($data->image_url) ? $data->image_url : null;
        
        $stmt->bindParam(':header', $header);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':author_id', $_SESSION['user_id']);
        $stmt->bindParam(':author_name', $_SESSION['username']);
        $stmt->bindParam(':author_role', $_SESSION['role']);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Post created successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to create post']);
        }
    } catch (Exception $e) {
        error_log("Create post error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Server error occurred']);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Method not allowed']);
?>