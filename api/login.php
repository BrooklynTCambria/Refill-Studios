<?php
session_start();

// This essentially runs the script and makes variables available, in this case we need the database connection
require_once 'db.php';
header('Content-Type: application/json');

// Only allows POST requests, kinda useless since you probably only use post, but im not gonna change too much
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Gets the data sent over ohmahgah
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// If they are empty kill the user gruesomly
if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
    exit;
}

try {
    // Gets the matching user from the data, why the hell is it using username twice for username and email in the search? Is username email?
    // Let me check ... i dont know
    $stmt = $conn->prepare("SELECT id, username, email, password_hash, profile_pic FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        // Check if its staff or nah
        $staffStmt = $conn->prepare("SELECT role FROM staff WHERE user_id = ?");
        $staffStmt->bind_param("i", $user['id']);
        $staffStmt->execute();
        $staffResult = $staffStmt->get_result();
        $staff = $staffResult->fetch_assoc();
        
        $isStaff = ($staff !== null);
        $staffRole = $isStaff ? $staff['role'] : null;
        
        // Set session variables boi
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['profile_pic'] = $user['profile_pic'] ?? 'images/account.png';
        $_SESSION['logged_in'] = true;
        $_SESSION['is_staff'] = $isStaff;
        $_SESSION['staff_role'] = $staffRole;

        // send them back where they belong
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'username' => $user['username'],
                'email' => $user['email'],
                'profilePic' => $user['profile_pic'] ?? 'images/account.png',
                'isLoggedIn' => true,
                'isStaff' => $isStaff,
                'staffRole' => $staffRole
            ]
        ]);
    } else {
        // silly error if password doesnt match
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }

    $stmt->close();
    $staffStmt->close();
    $conn->close();

} catch (Exception $e) {
    // silly error if something explodes in the try statements
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Login failed. Please try again.']);
}
?>