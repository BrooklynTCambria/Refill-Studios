<?php
<<<<<<< HEAD
=======
// debug_everything.php - Run this ONCE
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>🔍 REFILL STUDIOS DEBUG</h2>";

<<<<<<< HEAD
// 1. PHP Info
echo "<h3>1. PHP Version: " . phpversion() . "</h3>";

// 2. Session
=======
// 1. Check PHP
echo "<h3>1. PHP Version: " . phpversion() . "</h3>";

// 2. Check Sessions
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
session_start();
echo "<h3>2. Session</h3>";
echo "Session ID: " . (session_id() ?: 'None') . "<br>";
echo "Session Data: <pre>";
print_r($_SESSION);
echo "</pre>";

<<<<<<< HEAD
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
=======
// 3. Check Database Connection
echo "<h3>3. Database Connection</h3>";
require_once 'config/database.php';
$database = new Database();
try {
    $db = $database->getConnection();
    if ($db) {
        echo "✅ Database connected<br>";
        
        // Check if tables exist
        $tables = ['users', 'posts', 'comments'];
        foreach ($tables as $table) {
            $result = $db->query("SHOW TABLES LIKE '$table'");
            if ($result->rowCount() > 0) {
                echo "✅ Table '$table' exists<br>";
                
                // Show count
                $count = $db->query("SELECT COUNT(*) FROM $table")->fetchColumn();
                echo "&nbsp;&nbsp;&nbsp;📊 $count records<br>";
            } else {
                echo "❌ Table '$table' MISSING<br>";
            }
        }
    } else {
        echo "❌ Database connection failed<br>";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
}

// 4. Test API files directly
echo "<h3>4. Testing API Files</h3>";
$api_files = ['check-session.php', 'login.php', 'posts.php', 'comments.php', 'logout.php'];
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7

foreach ($api_files as $file) {
    $path = 'api/' . $file;
    if (file_exists($path)) {
        echo "✅ $path exists<br>";
<<<<<<< HEAD
=======
        
        // Try to include it (but don't execute)
        $content = file_get_contents($path);
        if (strpos($content, '<?php') !== false) {
            echo "&nbsp;&nbsp;&nbsp;✅ Contains PHP code<br>";
        } else {
            echo "&nbsp;&nbsp;&nbsp;❌ No PHP code found<br>";
        }
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
    } else {
        echo "❌ $path MISSING<br>";
    }
}

<<<<<<< HEAD
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
=======
// 5. Check file permissions
echo "<h3>5. File Permissions</h3>";
$folders = ['', 'config', 'api', 'uploads'];
foreach ($folders as $folder) {
    $path = $folder ?: '.';
    if (is_writable($path)) {
        echo "✅ $path is writable<br>";
    } else {
        echo "⚠️ $path is NOT writable<br>";
    }
}

// 6. Test JSON output
echo "<h3>6. Testing JSON Output</h3>";
header("Content-Type: text/html"); // Switch back to HTML
echo "If you see this, JSON test would be: ";
$test_json = json_encode(['test' => 'success']);
echo "<pre>$test_json</pre>";

// 7. Direct API call test
echo "<h3>7. Attempting API Call</h3>";
echo "Trying to fetch check-session.php...<br>";
$ch = curl_init('http://localhost/refill-studios/api/check-session.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode<br>";
echo "Response: <pre>" . htmlspecialchars($response) . "</pre>";

echo "<hr>";
echo "<h3>🔧 NEXT STEPS:</h3>";
echo "1. Copy ALL the output above<br>";
echo "2. Paste it here so I can see what's REALLY happening<br>";
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
?>