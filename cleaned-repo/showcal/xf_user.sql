-- MySQL dump 10.13  Distrib 8.4.3, for macos15.1 (arm64)
--
-- Host: localhost    Database: xenforo_db
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `xf_user`
--

DROP TABLE IF EXISTS `xf_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `xf_user` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `username_date` int unsigned NOT NULL DEFAULT '0',
  `username_date_visible` int unsigned NOT NULL DEFAULT '0',
  `email` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `custom_title` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `language_id` int unsigned NOT NULL,
  `style_id` int unsigned NOT NULL COMMENT '0 = use system default',
  `timezone` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Example: ''Europe/London''',
  `visible` tinyint unsigned NOT NULL DEFAULT '1' COMMENT 'Show browsing activity to others',
  `activity_visible` tinyint unsigned NOT NULL DEFAULT '1',
  `user_group_id` int unsigned NOT NULL,
  `secondary_group_ids` varbinary(255) NOT NULL,
  `display_style_group_id` int unsigned NOT NULL DEFAULT '0' COMMENT 'User group ID that provides user styling',
  `permission_combination_id` int unsigned NOT NULL,
  `message_count` int unsigned NOT NULL DEFAULT '0',
  `question_solution_count` int unsigned NOT NULL DEFAULT '0',
  `conversations_unread` smallint unsigned NOT NULL DEFAULT '0',
  `register_date` int unsigned NOT NULL DEFAULT '0',
  `last_activity` int unsigned NOT NULL DEFAULT '0',
  `last_summary_email_date` int unsigned DEFAULT NULL,
  `trophy_points` int unsigned NOT NULL DEFAULT '0',
  `alerts_unviewed` smallint unsigned NOT NULL DEFAULT '0',
  `alerts_unread` smallint unsigned NOT NULL DEFAULT '0',
  `avatar_date` int unsigned NOT NULL DEFAULT '0',
  `avatar_width` smallint unsigned NOT NULL DEFAULT '0',
  `avatar_height` smallint unsigned NOT NULL DEFAULT '0',
  `avatar_highdpi` tinyint unsigned NOT NULL DEFAULT '0',
  `gravatar` varchar(120) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'If specified, this is an email address corresponding to the user''s ''Gravatar''',
  `user_state` enum('valid','email_confirm','email_confirm_edit','moderated','email_bounce','rejected','disabled') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'valid',
  `security_lock` enum('','change','reset') COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `is_moderator` tinyint unsigned NOT NULL DEFAULT '0',
  `is_admin` tinyint unsigned NOT NULL DEFAULT '0',
  `is_banned` tinyint unsigned NOT NULL DEFAULT '0',
  `reaction_score` int NOT NULL DEFAULT '0',
  `vote_score` int NOT NULL DEFAULT '0',
  `warning_points` int unsigned NOT NULL DEFAULT '0',
  `is_staff` tinyint unsigned NOT NULL DEFAULT '0',
  `secret_key` varbinary(32) NOT NULL,
  `privacy_policy_accepted` int unsigned NOT NULL DEFAULT '0',
  `terms_accepted` int unsigned NOT NULL DEFAULT '0',
  `xfmg_album_count` int unsigned NOT NULL DEFAULT '0',
  `xfmg_media_count` int unsigned NOT NULL DEFAULT '0',
  `xfmg_media_quota` int unsigned NOT NULL DEFAULT '0',
  `xfrm_resource_count` int unsigned NOT NULL DEFAULT '0',
  `xcu_event_post_count` int unsigned NOT NULL DEFAULT '0',
  `siropu_chat_room_id` int unsigned NOT NULL DEFAULT '1',
  `siropu_chat_conv_id` int unsigned NOT NULL DEFAULT '0',
  `siropu_chat_rooms` blob,
  `siropu_chat_conversations` blob,
  `siropu_chat_settings` blob,
  `siropu_chat_room_join_time` blob,
  `siropu_chat_status` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `siropu_chat_is_sanctioned` tinyint unsigned NOT NULL DEFAULT '0',
  `siropu_chat_message_count` int unsigned NOT NULL DEFAULT '0',
  `siropu_chat_last_activity` int NOT NULL DEFAULT '-1',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `email` (`email`),
  KEY `permission_combination_id` (`permission_combination_id`),
  KEY `user_state` (`user_state`),
  KEY `last_activity` (`last_activity`),
  KEY `last_summary_email_date` (`last_summary_email_date`),
  KEY `message_count` (`message_count`),
  KEY `trophy_points` (`trophy_points`),
  KEY `reaction_score` (`reaction_score`),
  KEY `register_date` (`register_date`),
  KEY `question_solution_count` (`question_solution_count`),
  KEY `vote_score` (`vote_score`),
  KEY `staff_username` (`is_staff`,`username`),
  KEY `xengallery_album_count` (`xfmg_album_count`),
  KEY `xengallery_media_count` (`xfmg_media_count`),
  KEY `resource_count` (`xfrm_resource_count`),
  KEY `event_post_count` (`xcu_event_post_count`),
  KEY `siropu_chat_room_id` (`siropu_chat_room_id`),
  KEY `siropu_chat_message_count` (`siropu_chat_message_count`),
  KEY `siropu_chat_last_activity` (`siropu_chat_last_activity`)
) ENGINE=InnoDB AUTO_INCREMENT=223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-09 14:20:35
