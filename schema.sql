-- PlanetScale Database Schema for IMTTI Website
-- Run this in PlanetScale SQL editor

-- Create tables
CREATE TABLE IF NOT EXISTS centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    center_id INT,
    photo TEXT, -- Base64 encoded image
    registration_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id)
);

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INT,
    center_id INT,
    data JSON, -- Store application form data
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, returned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (center_id) REFERENCES centers(id)
);

CREATE TABLE IF NOT EXISTS marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject VARCHAR(255) NOT NULL,
    marks INT,
    grade VARCHAR(10),
    center_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (center_id) REFERENCES centers(id)
);

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin
INSERT INTO admins (name, email, password) 
VALUES ('IMTTI Administrator', 'admin@imtti.com', 'admin123')
ON DUPLICATE KEY UPDATE name = name;

-- Create indexes for better performance
CREATE INDEX idx_centers_email ON centers(email);
CREATE INDEX idx_students_center_id ON students(center_id);
CREATE INDEX idx_students_registration_id ON students(registration_id);
CREATE INDEX idx_applications_center_id ON applications(center_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_marks_student_id ON marks(student_id);
CREATE INDEX idx_marks_center_id ON marks(center_id);
