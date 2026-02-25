<?php
// api/comments.php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/Comment.php';

$database = new Database();
$db = $database->getConnection();

$comment = new Comment($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get comments for a post
        if(isset($_GET['post_id'])) {
            $comment->post_id = $_GET['post_id'];
            $result = $comment->getPostComments();
            echo json_encode($result);
        }
        break;
        
    case 'POST':
        // Create new comment (requires login)
        if(!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(array("message" => "Unauthorized"));
            break;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        $comment->post_id = $data->post_id;
        $comment->user_id = $_SESSION['user_id'];
        $comment->username = $_SESSION['username'];
        $comment->text = $data->text;
        $comment->is_dev = ($_SESSION['role'] === 'developer' || $_SESSION['role'] === 'admin');
        
        if($comment->create()) {
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Comment added successfully"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to add comment"));
        }
        break;
        
    case 'DELETE':
        // Delete comment (requires login)
        if(!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(array("message" => "Unauthorized"));
            break;
        }
        
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(array("message" => "Comment ID required"));
            break;
        }
        
        $comment->id = $_GET['id'];
        $is_admin = ($_SESSION['role'] === 'admin');
        
        if($comment->delete($_SESSION['user_id'], $is_admin)) {
            echo json_encode(array(
                "success" => true,
                "message" => "Comment deleted successfully"
            ));
        } else {
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to delete comment or comment not found"
            ));
        }
        break;
        
    case 'PUT':
        // Update comment (requires login)
        if(!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(array("message" => "Unauthorized"));
            break;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if(!isset($data->id) || !isset($data->text)) {
            http_response_code(400);
            echo json_encode(array("message" => "Comment ID and text required"));
            break;
        }
        
        $comment->id = $data->id;
        $comment->text = $data->text;
        $is_admin = ($_SESSION['role'] === 'admin');
        
        if($comment->update($_SESSION['user_id'], $is_admin)) {
            echo json_encode(array(
                "success" => true,
                "message" => "Comment updated successfully"
            ));
        } else {
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to update comment or you don't have permission"
            ));
        }
        break;
}
?>