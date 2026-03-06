<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("Database connection failed!");
}

echo "<h2>🔧 Creating Test Users</h2>";

// Function to create user
function createUser($db, $username, $email, $password, $role) {
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $profile_pic = 'images/account.png';
    
    $query = "INSERT INTO users (username, email, password_hash, role, profile_pic) 
              VALUES (:username, :email, :password, :role, :profile_pic)
              ON DUPLICATE KEY UPDATE 
              password_hash = VALUES(password_hash),
              role = VALUES(role)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password_hash);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':profile_pic', $profile_pic);
    
    return $stmt->execute();
}

// Create admin
if (createUser($db, 'Admin', 'admin@refillstudios.com', 'admin123', 'admin')) {
    echo "✅ Admin user created/updated!<br>";
}

// Create developer
if (createUser($db, 'DevUser', 'dev@refillstudios.com', 'dev123', 'developer')) {
    echo "✅ Developer user created/updated!<br>";
}

// Create test user
if (createUser($db, 'TestUser', 'test@test.com', 'test123', 'user')) {
    echo "✅ Test user created/updated!<br>";
}

// Show all users
$query = "SELECT id, username, email, role, created_at FROM users";
$result = $db->query($query);

echo "<h3>📊 Current Users:</h3>";
echo "<table border='1' cellpadding='8' style='border-collapse: collapse;'>";
echo "<tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Created</th></tr>";

while($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "<tr>";
    echo "<td>" . $row['id'] . "</td>";
    echo "<td>" . $row['username'] . "</td>";
    echo "<td>" . $row['email'] . "</td>";
    echo "<td>" . $row['role'] . "</td>";
    echo "<td>" . $row['created_at'] . "</td>";
    echo "</tr>";
}
echo "</table>";

echo "<br><br>";
echo "<h3>🔑 Login Credentials:</h3>";
echo "<ul>";
echo "<li><strong>Admin</strong> / admin123</li>";
echo "<li><strong>DevUser</strong> / dev123</li>";
echo "<li><strong>TestUser</strong> / test123</li>";
echo "</ul>";

echo "<br>";
echo "<span style='color: red; font-weight: bold;'>⚠️ IMPORTANT: Delete this file now for security!</span>";
?>