<?php
// create_test_users.php - Run once, then delete!
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

// Check if connection worked
if(!$db) {
    die("Database connection failed!");
}

echo "<h2>🔧 Creating Test Users</h2>";

// Create admin user
$admin_username = 'Admin';
$admin_password = password_hash('admin123', PASSWORD_DEFAULT);
$admin_email = 'admin@refillstudios.com';

$query = "INSERT INTO users (username, email, password_hash, role) 
          VALUES (:username, :email, :password, 'admin')
          ON DUPLICATE KEY UPDATE password_hash = :password";

$stmt = $db->prepare($query);
$stmt->bindParam(':username', $admin_username);
$stmt->bindParam(':email', $admin_email);
$stmt->bindParam(':password', $admin_password);

if($stmt->execute()) {
    echo "✅ Admin user created/updated!<br>";
} else {
    echo "❌ Failed to create admin user<br>";
}

// Create dev user
$dev_username = 'DevUser';
$dev_password = password_hash('dev123', PASSWORD_DEFAULT);
$dev_email = 'dev@refillstudios.com';

$stmt->bindParam(':username', $dev_username);
$stmt->bindParam(':email', $dev_email);
$stmt->bindParam(':password', $dev_password);

if($stmt->execute()) {
    echo "✅ Dev user created/updated!<br>";
} else {
    echo "❌ Failed to create dev user<br>";
}

// Create test user
$test_username = 'TestUser';
$test_password = password_hash('test123', PASSWORD_DEFAULT);
$test_email = 'test@test.com';

$stmt->bindParam(':username', $test_username);
$stmt->bindParam(':email', $test_email);
$stmt->bindParam(':password', $test_password);

if($stmt->execute()) {
    echo "✅ Test user created/updated!<br>";
} else {
    echo "❌ Failed to create test user<br>";
}

// Show all users in database
$query = "SELECT id, username, email, role FROM users";
$result = $db->query($query);

echo "<h3>📊 Current Users in Database:</h3>";
echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
echo "<tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr>";

while($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "<tr>";
    echo "<td>" . $row['id'] . "</td>";
    echo "<td>" . $row['username'] . "</td>";
    echo "<td>" . $row['email'] . "</td>";
    echo "<td>" . $row['role'] . "</td>";
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