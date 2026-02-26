<?php
// create_test_users.php - Run once, then delete!
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

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
$stmt->execute();

echo "Admin user created/updated!<br>";

// Create dev user
$dev_username = 'DevUser';
$dev_password = password_hash('dev123', PASSWORD_DEFAULT);
$dev_email = 'dev@refillstudios.com';

$stmt->bindParam(':username', $dev_username);
$stmt->bindParam(':email', $dev_email);
$stmt->bindParam(':password', $dev_password);
$stmt->execute();

echo "Dev user created/updated!<br>";

// Create test user
$test_username = 'TestUser';
$test_password = password_hash('test123', PASSWORD_DEFAULT);
$test_email = 'test@test.com';

$stmt->bindParam(':username', $test_username);
$stmt->bindParam(':email', $test_email);
$stmt->bindParam(':password', $test_password);
$stmt->execute();

echo "Test user created/updated!<br>";

echo "<br><strong>Login credentials:</strong><br>";
echo "Admin / admin123<br>";
echo "DevUser / dev123<br>";
echo "TestUser / test123<br>";
?>