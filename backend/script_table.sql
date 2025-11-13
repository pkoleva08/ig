CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE, //уникално потребителско име
    email VARCHAR(100) NOT NULL UNIQUE, //уникален имейл
    password VARCHAR(255) NOT NULL, //хеширана парола
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avg_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    score_test1 FLOAT NOT NULL,
    score_test2 FLOAT NOT NULL,
    average_score FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Ако колоната student_name липсва, добавете я
ALTER TABLE avg_scores
  ADD COLUMN student_name VARCHAR(100) NOT NULL AFTER user_id;