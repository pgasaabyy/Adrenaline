CREATE DATABASE IF NOT EXISTS Adrenaline;
USE Adrenaline;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'personal', 'user') NOT NULL
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cargo VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE training_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    personal_trainer_id INT NOT NULL,
    user_id INT NOT NULL,
    plan_details TEXT,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (personal_trainer_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE training_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    training_plan_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    FOREIGN KEY (training_plan_id) REFERENCES training_plans(id) ON DELETE CASCADE
);

CREATE TABLE user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    training_plan_id INT NOT NULL,
    date DATE NOT NULL,
    progress_details TEXT,
    FOREIGN KEY (training_plan_id) REFERENCES training_plans(id) ON DELETE CASCADE
);

