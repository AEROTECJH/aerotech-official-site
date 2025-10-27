-- =============================================
-- AEROTECH Database Backup (NOT REALLY)
-- =============================================
-- 
-- Nice try, hacker! 
-- There's no database here to steal.
-- 
-- But since you're here, check out:
-- /images/hacker meme.png
--
-- =============================================

DROP TABLE IF EXISTS `hackers`;
CREATE TABLE `hackers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT 'You',
  `status` varchar(255) DEFAULT 'Caught',
  `message` text DEFAULT 'Check /images/hacker meme.png',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `hackers` VALUES (1, 'Anonymous', 'Failed', 'Better luck next time!');
