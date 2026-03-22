-- Drop and recreate database
DROP DATABASE IF EXISTS refill_studios;
CREATE DATABASE refill_studios;
USE refill_studios;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    profile_pic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create posts table (with user_id foreign key)
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    header VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(50) NOT NULL,
    author_role VARCHAR(20) NOT NULL,
    user_id INT NOT NULL,
    image_data LONGTEXT,
    image_name VARCHAR(255),
    image_type VARCHAR(50),
    image_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create comments table (with user_id foreign key)
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    text TEXT NOT NULL,
    is_dev BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert a test user (password: "password")
-- To generate the hash, you can use: password_hash('password', PASSWORD_DEFAULT);
INSERT INTO users (username, email, password_hash, role, profile_pic) 
VALUES (
    'testuser',
    'test@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- This is "password" hashed
    'user',
    'images/account.png'
);

-- Insert an admin user
INSERT INTO users (username, email, password_hash, role, profile_pic) 
VALUES (
    'admin',
    'admin@refillstudios.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- This is "password" hashed
    'admin',
    'images/account.png'
);