CREATE DATABASE IF NOT EXISTS hacker_news;
USE hacker_news;

CREATE TABLE IF NOT EXISTS stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    posted_at DATETIME NOT NULL,
    UNIQUE KEY unique_story (title(100), url(255))
);
