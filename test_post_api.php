<?php
// test_post_api.php
session_start();
require_once 'config/database.php';

echo "<h2>Post API Test</h2>";

// Check session
echo "<h3>Session Status:</h3>";
if (isset($_SESSION['user_id'])) {
    echo "✅ User ID: " . $_SESSION['user_id'] . "<br>";
    echo "✅ Username: " . $_SESSION['username'] . "<br>";
    echo "✅ Role: " . $_SESSION['role'] . "<br>";
} else {
    echo "❌ No user logged in<br>";
    echo "<p>Please <a href='account.html'>login first</a></p>";
    exit;
}

// Test database connection
$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "<h3>✅ Database connected</h3>";
    
    // Check posts table
    $query = "SHOW TABLES LIKE 'posts'";
    $stmt = $db->query($query);
    if ($stmt->rowCount() > 0) {
        echo "✅ Posts table exists<br>";
        
        // Show recent posts
        $query = "SELECT * FROM posts ORDER BY id DESC LIMIT 5";
        $stmt = $db->query($query);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<h3>Recent Posts:</h3>";
        if (count($posts) > 0) {
            foreach ($posts as $post) {
                echo "<div style='border:1px solid #ccc; padding:10px; margin:5px;'>";
                echo "<strong>" . htmlspecialchars($post['header']) . "</strong><br>";
                echo "By: " . htmlspecialchars($post['author_name']) . "<br>";
                echo "Date: " . $post['created_at'] . "<br>";
                echo "</div>";
            }
        } else {
            echo "No posts yet<br>";
        }
    } else {
        echo "❌ Posts table does not exist!<br>";
    }
}
?>