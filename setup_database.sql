-- Create database
CREATE DATABASE IF NOT EXISTS refill_studios;
USE refill_studios;

-- Users table (combining both user systems)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'developer', 'admin') DEFAULT 'user',
    profile_pic TEXT,
    member_since DATETIME DEFAULT CURRENT_TIMESTAMP,
    notification_posts BOOLEAN DEFAULT TRUE,
    notification_replies BOOLEAN DEFAULT TRUE,
    notification_games BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
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
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    is_dev BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Sessions table for login persistence
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create default admin/developer accounts
INSERT INTO users (username, email, password_hash, role) VALUES
('Admin', 'admin@refillstudios.com', '$2y$10$YourHashHere', 'admin'),
('Developer', 'dev@refillstudios.com', '$2y$10$YourHashHere', 'developer')
ON DUPLICATE KEY UPDATE id=id;