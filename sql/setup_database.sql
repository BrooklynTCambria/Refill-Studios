DROP DATABASE IF EXISTS refill_studios;
CREATE DATABASE refill_studios;
USE refill_studios;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    can_post BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0
);

INSERT INTO roles (role_name, can_post, is_admin, display_order) VALUES
('Default', FALSE, FALSE, 1),
('Artist', TRUE, FALSE, 2),
('Programmer', TRUE, FALSE, 3),
('Modeler', TRUE, FALSE, 4),
('Sound Designer', TRUE, FALSE, 5),
('Game Designer', TRUE, FALSE, 6),
('Writer', TRUE, FALSE, 7),
('Animator', TRUE, FALSE, 8),
('UI/UX Designer', TRUE, FALSE, 9),
('Admin', TRUE, TRUE, 99);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    selected_role VARCHAR(50) DEFAULT 'Default',
    can_post BOOLEAN DEFAULT FALSE,
    profile_pic LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    header VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(50) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    author_role_display VARCHAR(50),
    user_id INT NOT NULL,
    image_data LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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

-- Insert test user (password: "password")
INSERT INTO users (username, email, password_hash, selected_role, can_post, profile_pic) 
VALUES (
    'testuser',
    'test@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Default',
    FALSE,
    'images/account.png'
);

-- Insert admin user (password: "password")
INSERT INTO users (username, email, password_hash, selected_role, can_post, profile_pic) 
VALUES (
    'admin',
    'admin@refillstudios.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    TRUE,
    'images/account.png'
);

-- Insert sample creative user (password: "password")
INSERT INTO users (username, email, password_hash, selected_role, can_post, profile_pic) 
VALUES (
    'artist1',
    'artist@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Artist',
    TRUE,
    'images/account.png'
);

-- Insert sample posts
INSERT INTO posts (header, description, author, author_role, author_role_display, user_id) 
VALUES 
(
    'Welcome to Refill Studios!',
    'We are excited to announce our new community platform. Feel free to share your thoughts and feedback!',
    'admin',
    'Admin',
    'Admin',
    2
),
(
    'New Game Announcement',
    'We are working on an exciting new project. Stay tuned for more updates!',
    'artist1',
    'Artist',
    'Artist',
    3
);

-- Insert sample comments
INSERT INTO comments (post_id, username, user_id, text, is_dev) 
VALUES 
(
    1,
    'testuser',
    1,
    'Excited to be part of this community!',
    FALSE
),
(
    1,
    'admin',
    2,
    'Welcome! We are glad to have you here.',
    TRUE
),
(
    2,
    'testuser',
    1,
    'Looking forward to the new game!',
    FALSE
);

SELECT 'Database setup complete!' AS message;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_posts FROM posts;
SELECT COUNT(*) AS total_comments FROM comments;