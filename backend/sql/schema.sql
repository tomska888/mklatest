-- AM Automobile schema for MySQL (utf8mb4)
SET NAMES utf8mb4;
SET time_zone = '+00:00';
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(191) NOT NULL,
    name VARCHAR(191) NOT NULL,
    phone VARCHAR(64),
    role ENUM('owner', 'admin', 'employee', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    mileage INT DEFAULT 0,
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    body_type VARCHAR(50),
    color VARCHAR(50),
    vin VARCHAR(64),
    description TEXT,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    published TINYINT(1) NOT NULL DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_make(make),
    INDEX idx_model(model),
    INDEX idx_year(year),
    INDEX idx_price(price),
    INDEX idx_featured(featured),
    INDEX idx_published(published),
    CONSTRAINT fk_cars_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS car_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    type ENUM('image', 'video') NOT NULL,
    url VARCHAR(512) NOT NULL,
    filename VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_car_id(car_id),
    INDEX idx_display_order(display_order),
    CONSTRAINT fk_media_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    email_notifications TINYINT(1) NOT NULL DEFAULT 1,
    new_listings TINYINT(1) NOT NULL DEFAULT 1,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Safe migrations (MariaDB/MySQL compatible)
-- NOTE: Avoids ADD COLUMN IF NOT EXISTS and CHECK constraints for portability.

-- Add columns if missing (ignore "Duplicate column name" errors if already applied)
ALTER TABLE newsletter_subscribers ADD COLUMN email_notifications TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE newsletter_subscribers ADD COLUMN new_listings TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN phone VARCHAR(64) NULL AFTER name;
ALTER TABLE cars ADD COLUMN published TINYINT(1) NOT NULL DEFAULT 0 AFTER featured;
ALTER TABLE cars ADD INDEX idx_published(published);
ALTER TABLE car_media ADD COLUMN display_order INT DEFAULT 0;
ALTER TABLE car_media ADD INDEX idx_display_order(display_order);

CREATE TABLE IF NOT EXISTS company_info (
    id INT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(64),
    email VARCHAR(191),
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    about TEXT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Ensure single row (id=1)
INSERT INTO company_info (id, name, address, phone, email, lat, lng, about)
VALUES (
        1,
        'AM Automobile',
        'Your Street 1, 12345 Berlin, Germany',
        '+49 123 456789',
        'info@yourdomain.com',
        52.5200,
        13.4050,
        'About AM Automobile'
    )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  address = VALUES(address),
  phone = VALUES(phone),
  email = VALUES(email),
  lat = VALUES(lat),
  lng = VALUES(lng),
  about = VALUES(about);

-- Additional tables to support richer car admin (features, specs, documents)
CREATE TABLE IF NOT EXISTS car_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    url VARCHAR(512) NOT NULL,
    filename VARCHAR(255),
    doc_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_doc_car_id(car_id),
    CONSTRAINT fk_docs_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS car_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    name VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_car_feature (car_id, name),
    INDEX idx_feat_car_id(car_id),
    CONSTRAINT fk_feat_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS car_specs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_car_spec (car_id, `key`),
    INDEX idx_spec_car_id(car_id),
    CONSTRAINT fk_spec_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Per-user favorites. Rows auto-removed if either the user or car is deleted.
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, car_id),
    INDEX idx_fav_user(user_id),
    INDEX idx_fav_car(car_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;