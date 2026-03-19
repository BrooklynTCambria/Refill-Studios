CREATE DATABASE IF NOT EXISTS refill_studios;
USE refill_studios;

-- Regular users table (all users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255) DEFAULT 'images/account.png',
    role ENUM('user', 'admin', 'developer') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff table (only references users)
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create default staff accounts
-- First, insert the users (with proper password hashing - you'll need to replace these with actual hashes)
INSERT INTO users (username, email, password_hash, role) VALUES
('Admin', 'admin@refillstudios.com', '$2y$10$YourHashedPasswordHere', 'admin'),
('Developer', 'dev@refillstudios.com', '$2y$10$YourHashedPasswordHere', 'developer')
ON DUPLICATE KEY UPDATE id=id;

-- Then add them to staff table
INSERT INTO staff (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'Admin'), 'admin'),
((SELECT id FROM users WHERE username = 'Developer'), 'developer')
ON DUPLICATE KEY UPDATE role=VALUES(role);

-- Posts table (corrected syntax)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uploader_id INT NOT NULL,
    header VARCHAR(100) UNIQUE NOT NULL,
    post_description TEXT NOT NULL,
    attached_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Comments table (corrected syntax)
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uploader_id INT NOT NULL,
    post_id INT NOT NULL,
    comment_description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Sessions table for tracking user logins
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_created ON posts(created_at);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);