-- MySQL dump 10.13  Distrib 8.0.33, for Linux (x86_64)
--
-- Host: localhost    Database: test
-- ------------------------------------------------------
-- Server version	8.0.33-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `event`
--

CREATE DATABASE IF NOT EXISTS test;

use test;

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `summary` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_event_id` (`user_id`),
  CONSTRAINT `fk_event_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=306 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (271,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:16:01'),(272,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:17:01'),(273,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:19:49'),(274,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:21:01'),(275,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:23:04'),(276,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:23:11'),(277,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:24:07'),(278,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:25:18'),(279,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:32:17'),(280,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:32:27'),(281,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:33:11'),(282,408,'friend_request',NULL,'Steven has accepted your friend request.',0,'2023-07-20 06:34:44'),(283,408,'friend_request',NULL,'David invited you to be friends.',0,'2023-07-20 06:39:35'),(284,408,'friend_request',NULL,'David invited you to be friends.',0,'2023-07-20 06:39:40'),(285,407,'friend_request',NULL,'David has accepted your friend request.',0,'2023-07-20 06:40:13'),(286,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:46:57'),(287,408,'friend_request',NULL,'Steven has accepted your friend request.',0,'2023-07-20 06:47:22'),(288,408,'friend_request',NULL,'David invited you to be friends.',0,'2023-07-20 06:58:00'),(289,407,'friend_request',NULL,'David has accepted your friend request.',0,'2023-07-20 06:58:15'),(290,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 06:59:03'),(291,408,'friend_request',NULL,'Steven has accepted your friend request.',0,'2023-07-20 06:59:45'),(292,408,'friend_request',NULL,'David invited you to be friends.',0,'2023-07-20 07:00:50'),(293,407,'friend_request',NULL,'David has accepted your friend request.',0,'2023-07-20 07:01:02'),(294,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-20 07:01:41'),(295,408,'friend_request',NULL,'David invited you to be friends.',1,'2023-07-20 07:02:00'),(296,409,'friend_request',NULL,'Steven has accepted your friend request.',1,'2023-07-20 07:03:03'),(297,410,'friend_request',NULL,'pj invited you to be friends.',0,'2023-07-20 09:00:19'),(298,410,'friend_request',NULL,'pj invited you to be friends.',0,'2023-07-20 09:00:27'),(299,410,'friend_request',NULL,'pj invited you to be friends.',0,'2023-07-20 09:00:43'),(300,411,'friend_request',NULL,'pj has accepted your friend request.',0,'2023-07-20 09:00:50'),(301,409,'friend_request',NULL,'Carol invited you to be friends.',0,'2023-07-21 05:49:23'),(302,407,'friend_request',NULL,'Carol has accepted your friend request.',0,'2023-07-21 05:49:39'),(303,409,'friend_request',NULL,'David has accepted your friend request.',0,'2023-07-24 07:40:35'),(304,407,'friend_request',NULL,'Steven invited you to be friends.',0,'2023-07-24 07:40:51'),(305,408,'friend_request',NULL,'Steven has accepted your friend request.',0,'2023-07-24 08:05:11');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friendship`
--

DROP TABLE IF EXISTS `friendship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friendship` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `status` enum('pending','requested','friend') DEFAULT NULL,
  `friend_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_friendship_id` (`user_id`),
  CONSTRAINT `fk_friendship_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=194 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friendship`
--

LOCK TABLES `friendship` WRITE;
/*!40000 ALTER TABLE `friendship` DISABLE KEYS */;
INSERT INTO `friendship` VALUES (188,408,'friend',409),(191,410,'friend',411),(192,409,'friend',407),(193,407,'friend',408);
/*!40000 ALTER TABLE `friendship` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `context` varchar(255) DEFAULT NULL,
  `summary` varchar(255) DEFAULT NULL,
  `like_count` int DEFAULT '0',
  `comment_count` int DEFAULT '0',
  `picture` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `comments` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_post_id` (`user_id`),
  CONSTRAINT `fk_post_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=347 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (333,407,'2023-07-24 07:30:55','貼文1',NULL,1,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(334,407,'2023-07-24 07:31:08','貼文2',NULL,0,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(335,407,'2023-07-24 07:34:31','貼文3',NULL,1,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(336,407,'2023-07-24 07:34:58','貼文4',NULL,0,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(337,407,'2023-07-24 07:38:48','貼文5',NULL,0,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(338,407,'2023-07-24 07:39:14','貼文6',NULL,0,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(339,409,'2023-07-24 07:39:40','貼文7',NULL,0,0,'https://13.54.210.189/static/picture-1689836555816','Carol',NULL),(340,409,'2023-07-24 07:40:00','貼文8',NULL,0,0,'https://13.54.210.189/static/picture-1689836555816','Carol',NULL),(341,408,'2023-07-24 07:41:27','貼文9',NULL,0,0,'https://13.54.210.189/static/picture-1689830063138','David',NULL),(342,407,'2023-07-24 07:42:23','貼文10',NULL,1,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(343,407,'2023-07-24 07:42:31','貼文11',NULL,0,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(344,407,'2023-07-24 07:42:36','貼文9',NULL,0,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(345,407,'2023-07-24 07:42:42','貼文10',NULL,0,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL),(346,407,'2023-07-24 07:42:47','貼文11',NULL,1,0,'https://13.54.210.189/static/picture-1689942992104','u-yuyxl',NULL);
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postcomment`
--

DROP TABLE IF EXISTS `postcomment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postcomment` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `text` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_user` (`user_id`),
  KEY `fk_post` (`post_id`),
  CONSTRAINT `fk_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postcomment`
--

LOCK TABLES `postcomment` WRITE;
/*!40000 ALTER TABLE `postcomment` DISABLE KEYS */;
/*!40000 ALTER TABLE `postcomment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postlike`
--

DROP TABLE IF EXISTS `postlike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postlike` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `user_id` (`user_id`,`post_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `postlike_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `postlike_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postlike`
--

LOCK TABLES `postlike` WRITE;
/*!40000 ALTER TABLE `postlike` DISABLE KEYS */;
INSERT INTO `postlike` VALUES (126,407,333),(125,407,335),(127,407,342),(128,407,346);
/*!40000 ALTER TABLE `postlike` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `friend_count` int DEFAULT NULL,
  `introduction` varchar(255) DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=446 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (407,'u-yuyxl','https://13.54.210.189/static/picture-1689942992104',2,'white bird','habit','Steven@gmail.com',NULL,'$2b$10$NEwUPSqTWU1dOr2m2noqJOG1Do0xcrAE66sdMGMxqvUXyUtXVpaNe'),(408,'David','https://13.54.210.189/static/picture-1689830063138',2,'藍色小鳥','','David@gmail.com',NULL,'$2b$10$2kfS6bdxekVyzcFY7BpF8ee9iW8v5DLgQO5qGcy2l45dGvzsGLcNO'),(409,'Carol','https://13.54.210.189/static/picture-1689836555816',2,'carol','carol','Carol@gmail.com',NULL,'$2b$10$e6mL/UX2GgXGO2w4lEw61eLZOtrhDfg5TjsHHZicHeh7lPAK6PBOy'),(410,'pj','https://13.54.210.189/static/picture-1689843450815',1,'123','','pj@gmail.com',NULL,'$2b$10$iwMO4B0XhQp0MSmumVsFWe/AbnWecfbBgYmLAt1Aw.5annhS.I0q.'),(411,'pj2','',1,'','','pj2@gmail.com',NULL,'$2b$10$B7u.TKTUFFOmZbkfRUB41.vRccJDLyyCoBOXYxY/PSG4BqzpifYIm'),(412,'wwqbmlqc','',0,'','','jacds@gmail.com',NULL,'$2b$10$PTScNgmJWQ4q0QXG.AEHk.ZxFRzizR/yKwMs4LqKag6OMu3ydJ5FS'),(413,'u-4tccmvxw','',0,'','','u-ciuhe@gmail.com',NULL,'$2b$10$kpKeImPCl/hE9HY2pSnzeOhxq.IC.hYLnnPOlV1o09kJyVBPDlMbe'),(414,'u-ex0nroc4','',0,'','','u-1gp76@gmail.com',NULL,'$2b$10$4SRlKtFCmnVlPHAdSt3mL.QcIJnzeO/OsIxYWRmNeYhE78ZYRu2ze'),(415,'u-dad7jbxv','',0,'','','u-iex0t@gmail.com',NULL,'$2b$10$P8pFN1O4n/j7Zime248Z0.RkN4piiqaMzeC64/lbGuMDYK3bQdkAm'),(416,'u-s33qcf23','',0,'','','u-i0ux4@gmail.com',NULL,'$2b$10$bpwSLtpNeMu7VboNtKZmXekNRy2fEuBfIkjP3QGBaFVqzynGRDy4q'),(417,'u-ofk4sczw','',0,'','','u-mtnvx@gmail.com',NULL,'$2b$10$D7XrJjuNziK7v79wkAIZwOsepMCDBiPOaLJowKIJTXGbS.hqgv0OW'),(418,'u-iyall3oq','',0,'','','u-ev71w@gmail.com',NULL,'$2b$10$UPdZVB.lzEhq5MxhffGw8exQOtZHZ7Coe1Ir3hLqpvEE3ifipOByK'),(419,'u-8oshmgix','',0,'','','u-zmzc1@gmail.com',NULL,'$2b$10$fxzl4Lvn0u1LxcBQOK/s6egWAwtXWwD4Z0vm8O2Gq/QsKuDJj1UIe'),(420,'u-1rkpeui9','',0,'','','u-inife@gmail.com',NULL,'$2b$10$A/97daJeyUmJ8d5l0OJuHOZqxxtGe11YTwFpKTbJd/2Bz45auVtdO'),(421,'u-h8jvjqst','',0,'','','u-chlzm@gmail.com',NULL,'$2b$10$osD/o8Oo8E/lxAJ1c4ei2uPvEMCwA16Qweh3t2xE5maI8s2SnIs6O'),(422,'u-zcc6bv8t','',0,'','','u-xsi59@gmail.com',NULL,'$2b$10$B9oLu2KnUNme9hUiOzsjpuE3FhF12C1h/EYDEOSA8sSTh6zle1X9.'),(423,'u-f7qhdqrs','',0,'','','u-h5nsj@gmail.com',NULL,'$2b$10$Su298M2zV/lS2DTdS67wKeTzdLNbJCvcCc1oEIaCTKKEhjm6GHSey'),(424,'u-t6ayafub','',0,'','','u-rptcg@gmail.com',NULL,'$2b$10$.8MFRo22x0xDJ6PoUS9Sce363obZjMAfzrV2FcDXU.Pm0Y4wCMYpm'),(425,'u-rxzdczfc','',0,'','','u-pcudq@gmail.com',NULL,'$2b$10$JcYHzQHRtN7lH6uOoOSJ/eBVUBpG.Kx8Mo5omJx7GqWX.BEtxV9IG'),(426,'u-3o7z4lbt','',0,'','','u-o0yi4@gmail.com',NULL,'$2b$10$I3fISxfutA8XXVkgxXwnkOjh6E//4TxmnnXRmcDP5JnO2jDuZ7JNe'),(427,'u-w2sfjb3g','',0,'','','u-2sp3p@gmail.com',NULL,'$2b$10$O7rPWOHot3aXdBob/.cXee9fNyQNGzBf/mdWL57.vk9cVdvjQuuoG'),(428,'u-pi586jq4','',0,'','','u-vmbqz@gmail.com',NULL,'$2b$10$dVjFgHP7Qnf8xDGIYAs2b..XQkoQfdFOEKUifyFzSp.WU50URTsom'),(429,'u-w5b60vre','',0,'','','u-07sat@gmail.com',NULL,'$2b$10$NmJYrUCpnf.zI.mSdVahPeyErL9agi3Emuepi/.rjDvPF.bjwFy9m'),(430,'u-93849bth','',0,'','','u-s9xjh@gmail.com',NULL,'$2b$10$E0Nd1QWnf4HXJFZZrF7SHuhb1sjpro42eWuQTDRK/X4JyVgLTnNFe'),(431,'u-ht5xjvt5','',0,'','','u-zecaa@gmail.com',NULL,'$2b$10$JCFqe0LCNbb9.n4xPS/.O.yuatXO9TF8DFOTzj8Jtl3INe/8UAYgC'),(432,'u-8p2xl2gb','',0,'','','u-lakrs@gmail.com',NULL,'$2b$10$O8uUXoACTlk/8QQlzPVlw.A7UJSGR/sAN1bXe4v8EjTgclSOyyELe'),(433,'u-89zffsir','',0,'','','u-0q80i@gmail.com',NULL,'$2b$10$/Dgn3BXKFeYduKIBo3fzH.oe2dM8IcuqdxPmv6JmwDUsOdr4Wkx4C'),(434,'u-16g63jms','',0,'','','u-n5s39@gmail.com',NULL,'$2b$10$JFml3vMRR.MJBoPddEonBerJz3diubzhHNvWakByAKoItfgPe3uza'),(435,'u-pop4vfe6','',0,'','','u-h2kxj@gmail.com',NULL,'$2b$10$JoxIM4kHIkcVgOPKI6Wofuo6xVadlMraTKcqr425TPJopJpWIe052'),(436,'u-8twioiif','',0,'','','u-ybv9c@gmail.com',NULL,'$2b$10$6nKY04bXHCaGza4JHMmFIOfYlHNg0/cXCoLxna/3NBEx7bjuBLkCa'),(437,'u-6ivdqxv1','',0,'','','u-818ow@gmail.com',NULL,'$2b$10$1wMwg0l72gi.3/cGJz/rgu5JdiXVnsbEjvTSjTlT2q2PG5Y7tfhc6'),(438,'u-sfs3a5bo','',0,'','','u-zj2fh@gmail.com',NULL,'$2b$10$5KOq1.JDWQ4AOV0Yf65iROUIefKPBDY8L9t/5JiO9fBrbJL5dIs8G'),(439,'u-u79oaxba','',0,'','','u-dfl2u@gmail.com',NULL,'$2b$10$qe1ZhM5u.l9cNZbx0tzy9.8s.HLsuBbT6A0ztEkfsNdM3GXxfkxNi'),(440,'u-zcbovkb8','',0,'','','u-sr3uo@gmail.com',NULL,'$2b$10$hO1JJ81QdD0.98SAs4T7jOXG5HqkSuc9tPxF7V8dofnRWK8qohi0G'),(441,'u-pmrwhx68','',0,'','','u-gq9nf@gmail.com',NULL,'$2b$10$BidsVB1/Wgpsw7X5Wb6dXuyTU2tRX6L/zWaOsOkrb67WFyfjIpZli'),(442,'u-egsb0m1b','',0,'','','u-dnv3e@gmail.com',NULL,'$2b$10$0YsnWYS8bV4AH.MP08.JgOO7gNVzigyw08JN5VDVxL8dMDu376YPO'),(443,'u-8fi9u1gg','',0,'','','u-yhphw@gmail.com',NULL,'$2b$10$lLVvsjf4eVnWpXae7jDs3uSO.BWQ9FIaMhsPSTSvbdkCu4dqIn2SW'),(444,'u-7tpo073q','',0,'','','u-fm49l@gmail.com',NULL,'$2b$10$.Ytmp.CEEs3zBw45EbE4huCbeiW.pB6fOhcvivVJu4pCfE13ZsQOq'),(445,'u-6npbtce8','',0,'','','u-vmwfo@gmail.com',NULL,'$2b$10$vpqBfkt/JV3nXf.J960hf.p5AnVbzPuEc1DvZdgj0nxM/tW//zcE2');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-08-06 17:34:46
