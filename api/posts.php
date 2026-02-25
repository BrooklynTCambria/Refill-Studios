<?php
// api/posts.php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/Post.php';
include_once '../models/Comment.php';

$database = new Database();
$db = $database->getConnection();

$post = new Post($db);
$comment = new Comment($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get all posts or single post
        if(isset($_GET['id'])) {
            $post->id = $_GET['id'];
            $result = $post->getPostById();
            
            // Get comments for this post
            $comment->post_id = $_GET['id'];
            $comments = $comment->getPostComments();
            
            $result['comments'] = $comments;
            
            echo json_encode($result);
        } else {
            $result = $post->getAllPosts();
            echo json_encode($result);
        }
        break;
        
    case 'POST':
        // Create new post (requires login)
        if(!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(array("message" => "Unauthorized"));
            break;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        $post->header = $data->header;
        $post->description = $data->description;
        $post->image_url = $data->image_url ?? null;
        $post->author_id = $_SESSION['user_id'];
        $post->author_name = $_SESSION['username'];
        $post->author_role = $_SESSION['role'];
        
        if($post->create()) {
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Post created successfully",
                "post_id" => $post->id
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create post"));
        }
        break;
        
    case 'PUT':
        // Update post
        if(!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(array("message" => "Unauthorized"));
            break;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        $post->id = $data->id;
        $post->header = $data->header;
        $post->description = $data->description;
        $post->image_url = $data->image_url ?? null;
        $post->author_id = $_SESSION['user_id'];
        
        if($post->update()) {
            echo json_encode(array("success" => true, "message" => "Post updated"));
        } else {
            echo json_encode(array("success" => false, "message" => "Unable to update post"));
        }
        break;
        
    case 'DELETE':
        // Delete post
        if(!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(array("message" => "Unauthorized"));
            break;
        }
        
        $post->id = $_GET['id'];
        $post->author_id = $_SESSION['user_id'];
        
        if($post->delete()) {
            echo json_encode(array("success" => true, "message" => "Post deleted"));
        } else {
            echo json_encode(array("success" => false, "message" => "Unable to delete post"));
        }
        break;
}
?>