<?php
// models/Comment.php
class Comment {
    private $conn;
    private $table_name = "comments";

    public $id;
    public $post_id;
    public $user_id;
    public $username;
    public $text;
    public $is_dev;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create comment
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                (post_id, user_id, username, text, is_dev)
                VALUES (:post_id, :user_id, :username, :text, :is_dev)";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->post_id = htmlspecialchars(strip_tags($this->post_id));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->text = htmlspecialchars(strip_tags($this->text));
        $this->is_dev = $this->is_dev ? 1 : 0;

        // Bind
        $stmt->bindParam(":post_id", $this->post_id);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":text", $this->text);
        $stmt->bindParam(":is_dev", $this->is_dev);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get comments for a post
    public function getPostComments() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE post_id = :post_id 
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":post_id", $this->post_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Delete comment - FIXED VERSION
    public function delete($user_id, $is_admin = false) {
        // If user is admin, they can delete any comment
        if ($is_admin) {
            $query = "DELETE FROM " . $this->table_name . " 
                      WHERE id = :id";
        } else {
            // Regular users can only delete their own comments
            $query = "DELETE FROM " . $this->table_name . " 
                      WHERE id = :id AND user_id = :user_id";
        }

        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);
        
        if (!$is_admin) {
            $stmt->bindParam(":user_id", $user_id);
        }

        if($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }
        return false;
    }

    // Alternative delete method with different approach
    public function deleteComment($user_id, $user_role) {
        // Check if user is admin or the comment owner
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id = :id AND (user_id = :user_id OR :is_admin = 1)";

        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        $is_admin = ($user_role === 'admin') ? 1 : 0;
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":is_admin", $is_admin, PDO::PARAM_INT);

        if($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }
        return false;
    }

    // Get single comment
    public function getCommentById() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Update comment
    public function update($user_id, $is_admin = false) {
        if ($is_admin) {
            $query = "UPDATE " . $this->table_name . "
                     SET text = :text
                     WHERE id = :id";
        } else {
            $query = "UPDATE " . $this->table_name . "
                     SET text = :text
                     WHERE id = :id AND user_id = :user_id";
        }

        $stmt = $this->conn->prepare($query);

        $this->text = htmlspecialchars(strip_tags($this->text));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":text", $this->text);
        $stmt->bindParam(":id", $this->id);
        
        if (!$is_admin) {
            $stmt->bindParam(":user_id", $user_id);
        }

        if($stmt->execute()) {
            return $stmt->rowCount() > 0;
        }
        return false;
    }

    // Count comments for a post
    public function countPostComments() {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " 
                  WHERE post_id = :post_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":post_id", $this->post_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }

    // Get recent comments by user
    public function getUserComments($limit = 10) {
        $query = "SELECT c.*, p.header as post_title 
                  FROM " . $this->table_name . " c
                  LEFT JOIN posts p ON c.post_id = p.id
                  WHERE c.user_id = :user_id
                  ORDER BY c.created_at DESC
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>