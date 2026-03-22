-- Drop and recreate database with correct structure
DROP DATABASE IF EXISTS refill_studios;
CREATE DATABASE refill_studios;
USE refill_studios;

-- Users table with all required columns
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'developer', 'admin') DEFAULT 'user',
    profile_pic TEXT DEFAULT 'images/account.png',
    notification_posts BOOLEAN DEFAULT TRUE,
    notification_replies BOOLEAN DEFAULT TRUE,
    notification_games BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    header VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(50) NOT NULL,
    author_role VARCHAR(20) NOT NULL,
    image_data LONGTEXT,
    image_name VARCHAR(255),
    image_type VARCHAR(50),
    image_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author) REFERENCES users(username) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    is_dev BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Sessions table
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create a test user (password: "password123")
INSERT INTO users (username, email, password_hash, role, profile_pic) 
VALUES (
    'testuser',
    'test@example.com',
    '$2y$10$YourHashHere', -- You'll need to generate this
    'user',
    'images/account.png'
);