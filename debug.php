<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>🔍 REFILL STUDIOS DEBUG</h2>";

// 1. PHP Info
echo "<h3>1. PHP Version: " . phpversion() . "</h3>";

// 2. Session
session_start();
echo "<h3>2. Session</h3>";
echo "Session ID: " . (session_id() ?: 'None') . "<br>";
echo "Session Data: <pre>";
print_r($_SESSION);
echo "</pre>";

// 3. Database
echo "<h3>3. Database</h3>";
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "✅ Database connected<br>";
    
    // Check tables
    $tables = ['users', 'posts', 'comments'];
    foreach ($tables as $table) {
        $result = $db->query("SHOW TABLES LIKE '$table'");
        if ($result->rowCount() > 0) {
            $count = $db->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            echo "✅ Table '$table' exists - $count records<br>";
        } else {
            echo "❌ Table '$table' missing<br>";
        }
    }
} else {
    echo "❌ Database connection failed<br>";
}

// 4. API Files
echo "<h3>4. API Files</h3>";
$api_files = ['check-session.php', 'login.php', 'register.php', 'posts.php', 'comments.php', 'logout.php'];

foreach ($api_files as $file) {
    $path = 'api/' . $file;
    if (file_exists($path)) {
        echo "✅ $path exists<br>";
    } else {
        echo "❌ $path MISSING<br>";
    }
}

// 5. Test API
echo "<h3>5. Testing API</h3>";
echo "Try accessing: <a href='api/test.php'>api/test.php</a><br>";

// 6. Recommendations
echo "<h3>🔧 NEXT STEPS:</h3>";
echo "1. Run <a href='create_test_users.php'>create_test_users.php</a> to create test users<br>";
echo "2. Try logging in with:<br>";
echo "&nbsp;&nbsp;&nbsp;- Admin / admin123<br>";
echo "&nbsp;&nbsp;&nbsp;- DevUser / dev123<br>";
echo "&nbsp;&nbsp;&nbsp;- TestUser / test123<br>";
?>