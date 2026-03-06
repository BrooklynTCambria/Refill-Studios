<?php
// api/update-profile.php
session_start();
header("Content-Type: application/json");

require_once '../config/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

$user_id = $_SESSION['user_id'];
$username = isset($data->username) ? trim($data->username) : null;
$profile_pic = isset($data->profile_pic) ? $data->profile_pic : null;

// Update username if provided
if ($username) {
    // Check if username is already taken
    $check_query = "SELECT id FROM users WHERE username = :username AND id != :user_id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':username', $username);
    $check_stmt->bindParam(':user_id', $user_id);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already taken']);
        exit;
    }
    
    // Update username
    $query = "UPDATE users SET username = :username WHERE id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    // Update session
    $_SESSION['username'] = $username;
}

// Update profile picture if provided
if ($profile_pic && strpos($profile_pic, 'data:image') === 0) {
    // Save image to file
    $upload_dir = '../uploads/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $image_parts = explode(";base64,", $profile_pic);
    $image_type_aux = explode("image/", $image_parts[0]);
    $image_type = $image_type_aux[1];
    $image_base64 = base64_decode($image_parts[1]);
    
    $file_name = 'profile_' . $user_id . '_' . time() . '.' . $image_type;
    $file_path = $upload_dir . $file_name;
    
    file_put_contents($file_path, $image_base64);
    
    // Update database with image path
    $image_url = 'uploads/' . $file_name;
    $query = "UPDATE users SET profile_pic = :profile_pic WHERE id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':profile_pic', $image_url);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $_SESSION['profile_pic'] = $image_url;
}

echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
?>