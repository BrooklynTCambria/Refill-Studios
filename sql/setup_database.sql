-- ============================================
-- DATABASE: refill_studios
-- ============================================

DROP DATABASE IF EXISTS refill_studios;
CREATE DATABASE refill_studios;
USE refill_studios;

-- ============================================
-- TABLE: roles
-- ============================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,  -- role_name is UNIQUE
    can_post BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0
);

-- Insert roles
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

-- ============================================
-- TABLE: users (FIXED - removed problematic foreign key)
-- ============================================
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
    
    -- Removed foreign key constraint to avoid issues
    -- We'll handle role validation in PHP instead
);

-- ============================================
-- TABLE: sessions
-- ============================================
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: posts (UPDATED - NO author column)
-- ============================================
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    header VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    user_id INT NOT NULL,                    -- References users.id
    author_role VARCHAR(50) DEFAULT 'Default', -- Role at time of posting
    author_role_display VARCHAR(50),           -- Display role
    image_data LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    -- Removed author_role foreign key to avoid issues
);

-- ============================================
-- TABLE: comments (UPDATED - NO username column)
-- ============================================
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,                    -- References users.id (replaces username)
    text TEXT NOT NULL,
    is_dev BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert test users (password: "password" for all)
INSERT INTO users (username, email, password_hash, selected_role, can_post, profile_pic) 
VALUES (
    'testuser',
    'test@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Default',
    FALSE,
    'images/account.png'
);

INSERT INTO users (username, email, password_hash, selected_role, can_post, profile_pic) 
VALUES (
    'admin',
    'admin@refillstudios.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    TRUE,
    'images/account.png'
);

INSERT INTO users (username, email, password_hash, selected_role, can_post, profile_pic) 
VALUES (
    'artist1',
    'artist@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Artist',
    TRUE,
    'images/account.png'
);

-- Insert sample posts (using user_id instead of author)
INSERT INTO posts (header, description, user_id, author_role, author_role_display) 
VALUES 
(
    'Welcome to Refill Studios!',
    'We are excited to announce our new community platform. Feel free to share your thoughts and feedback!',
    2,  -- user_id for admin
    'Admin',
    'Admin'
),
(
    'New Game Announcement',
    'We are working on an exciting new project. Stay tuned for more updates!',
    3,  -- user_id for artist1
    'Artist',
    'Artist'
);

-- Insert sample comments (using user_id instead of username)
INSERT INTO comments (post_id, user_id, text, is_dev) 
VALUES 
(
    1,  -- post_id
    1,  -- user_id for testuser
    'Excited to be part of this community!',
    FALSE
),
(
    1,  -- post_id
    2,  -- user_id for admin
    'Welcome! We are glad to have you here.',
    TRUE
),
(
    2,  -- post_id
    1,  -- user_id for testuser
    'Looking forward to the new game!',
    FALSE
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show all users
SELECT '=== USERS ===' as '';
SELECT id, username, email, selected_role, can_post FROM users;

-- Show all posts with author info (joined)
SELECT '=== POSTS WITH AUTHORS ===' as '';
SELECT p.id, p.header, u.username as author, p.author_role, p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- Show all comments with user info (joined)
SELECT '=== COMMENTS WITH USERS ===' as '';
SELECT c.id, c.text, u.username, u.selected_role, c.created_at
FROM comments c
JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

-- Show database summary
SELECT '=== DATABASE SUMMARY ===' as '';
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_posts FROM posts;
SELECT COUNT(*) AS total_comments FROM comments;