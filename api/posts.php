<?php
// api/posts.php
session_start();
header("Content-Type: application/json");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $query = "SELECT * FROM posts ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($posts);
    exit;
}

if ($method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        exit;
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data || !isset($data->header) || !isset($data->description)) {
        echo json_encode(['success' => false, 'message' => 'Missing data']);
        exit;
    }
    
    $query = "INSERT INTO posts (header, description, image_url, author_id, author_name, author_role) 
              VALUES (:header, :description, :image_url, :author_id, :author_name, :author_role)";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':header', $data->header);
    $stmt->bindParam(':description', $data->description);
    $stmt->bindParam(':image_url', $data->image_url);
    $stmt->bindParam(':author_id', $_SESSION['user_id']);
    $stmt->bindParam(':author_name', $_SESSION['username']);
    $stmt->bindParam(':author_role', $_SESSION['role']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Post created']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create post']);
    }
    exit;
}
?>