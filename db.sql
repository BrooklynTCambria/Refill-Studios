CREATE DATABASE IF NOT EXISTS refill_studios;
USE refill_studios;

-- Regular users table (all users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255) DEFAULT 'images/account.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff table (only references users)
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Then add them to staff table
INSERT INTO staff (user_id, role) VALUES
((SELECT id FROM users WHERE username = 'Admin'), 'admin'),
((SELECT id FROM users WHERE username = 'Developer'), 'developer')
ON DUPLICATE KEY UPDATE role=VALUES(role);

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    FOREIGN KEY (userID) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uploaderID INT,
    header VARCHAR(100) UNIQUE NOT NULL,
    postDescription VARCHAR(255) UNIQUE NOT NULL,
    attachedImage VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaderID) REFERENCES staff(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uploaderID INT,
    commentDescription VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaderID) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);