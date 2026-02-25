<?php
// models/Post.php
class Post {
    private $conn;
    private $table_name = "posts";

    public $id;
    public $header;
    public $description;
    public $image_url;
    public $author_id;
    public $author_name;
    public $author_role;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new post
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                (header, description, image_url, author_id, author_name, author_role)
                VALUES (:header, :description, :image_url, :author_id, :author_name, :author_role)";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->header = htmlspecialchars(strip_tags($this->header));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->image_url = htmlspecialchars(strip_tags($this->image_url));
        $this->author_id = htmlspecialchars(strip_tags($this->author_id));
        $this->author_name = htmlspecialchars(strip_tags($this->author_name));
        $this->author_role = htmlspecialchars(strip_tags($this->author_role));

        // Bind values
        $stmt->bindParam(":header", $this->header);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":image_url", $this->image_url);
        $stmt->bindParam(":author_id", $this->author_id);
        $stmt->bindParam(":author_name", $this->author_name);
        $stmt->bindParam(":author_role", $this->author_role);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Get all posts
    public function getAllPosts() {
        $query = "SELECT p.*, 
                  (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
                  FROM " . $this->table_name . " p
                  ORDER BY p.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get single post
    public function getPostById() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Update post
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET header = :header, description = :description, image_url = :image_url
                WHERE id = :id AND author_id = :author_id";

        $stmt = $this->conn->prepare($query);

        $this->header = htmlspecialchars(strip_tags($this->header));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->image_url = htmlspecialchars(strip_tags($this->image_url));
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->author_id = htmlspecialchars(strip_tags($this->author_id));

        $stmt->bindParam(":header", $this->header);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":image_url", $this->image_url);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":author_id", $this->author_id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Delete post
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id AND author_id = :author_id";

        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->author_id = htmlspecialchars(strip_tags($this->author_id));

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":author_id", $this->author_id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>