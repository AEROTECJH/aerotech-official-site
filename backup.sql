-- ═══════════════════════════════════════════════════════════════════════════════
-- AEROTECH DATABASE BACKUP
-- Created: 2025-10-27 (FAKE DATE, FAKE BACKUP)
-- WARNING: THIS IS A HONEYPOT FILE
-- ═══════════════════════════════════════════════════════════════════════════════

-- ⚠️ ALERT FOR HACKERS ⚠️
-- Если ты читаешь это, то ты проломился через наш honeypot! 
-- Но здесь нет никаких реальных данных - это просто ловушка! 🎣

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT=0;
START TRANSACTION;

-- ═══════════════════════════════════════════════════════════════════════════════

-- Table: hackers_caught
CREATE TABLE IF NOT EXISTS `hackers_caught` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(255) NOT NULL,
  `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
  `attempt_count` int(11) DEFAULT 1,
  `method_used` varchar(255) DEFAULT 'LOOKING_FOR_DEFAULTS',
  `success_rate` float DEFAULT 0,
  `hall_of_fame_status` varchar(255) DEFAULT 'ADDED_TODAY',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data: Hackers we caught!
INSERT INTO `hackers_caught` VALUES
(1, '192.168.1.100', '2025-10-27 10:15:32', 5, 'Default_Admin', 0.00, 'FAMOUS'),
(2, '10.0.0.50', '2025-10-27 10:20:15', 3, 'Common_Passwords', 0.00, 'LEGENDARY'),
(3, '172.16.0.20', '2025-10-27 10:25:48', 8, 'Brute_Force', 0.00, 'NOTORIOUS'),
(4, '[YOUR_IP_HERE]', NOW(), 1, 'Found_This_File', 0.00, 'TODAY_HERO');

-- ═══════════════════════════════════════════════════════════════════════════════

-- Table: fake_users (COMPLETELY FAKE)
CREATE TABLE IF NOT EXISTS `fake_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `notes` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- This data is 100% FAKE - don't believe it!
INSERT INTO `fake_users` VALUES
(1, 'admin', 'admin@fake.local', '$2y$10$N9qo8uLOickgxz0G39Jvee4NV4jonQcHDfvR3nEfxJ3.ZI8bv89SuUSA', 'Congratulations, you found a fake admin!'),
(2, 'developer', 'dev@fake.local', 'password123_its_obviously_fake', 'This password is intentionally weak for testing'),
(3, 'hacker', 'you@localhost', 'welcome_to_the_trap_you_found_us', 'Welcome to the honey pot gallery!');

-- ═══════════════════════════════════════════════════════════════════════════════

-- Table: security_metrics
CREATE TABLE IF NOT EXISTS `security_metrics` (
  `metric_id` int(11) NOT NULL AUTO_INCREMENT,
  `hack_attempts_today` int(11) DEFAULT 0,
  `successful_hacks` int(11) DEFAULT 0,
  `honeypot_triggers` int(11) DEFAULT 0,
  `hacker_satisfaction_rate` float DEFAULT 0.0,
  `aerotech_security_level` varchar(50) DEFAULT 'MAXIMUM_🛡️',
  PRIMARY KEY (`metric_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `security_metrics` VALUES
(1, 9999, 0, 9999, 0.0, 'IMPENETRABLE');

-- ═══════════════════════════════════════════════════════════════════════════════
-- IMPORTANT NOTES FOR HACKERS:
-- ═══════════════════════════════════════════════════════════════════════════════

-- 🎯 Факт 1: AEROTECH не использует MySQL базы данных в открытом доступе
-- 🎯 Факт 2: Все реальные данные защищены правильно
-- 🎯 Факт 3: Этот файл - просто приколы и ловушки
-- 🎯 Факт 4: Ты уже добавлен в нашу "Галерею Неудачников"™

-- Если ты хакер с хорошими намерениями - отправь нам CV!
-- Email: security@aerotech.local (тоже fake 😂)

-- ═══════════════════════════════════════════════════════════════════════════════

-- Final thoughts:
-- Security is not about hiding, it's about being smart.
-- AEROTECH is secure because:
-- 1. We don't store sensitive data in SQL databases accessible from outside
-- 2. We don't use common default credentials
-- 3. We don't leave backdoors open
-- 4. We have proper security architecture

-- You tried to hack us - RESPECT! 👊
-- But you only found our decoy... 🎭

COMMIT;
