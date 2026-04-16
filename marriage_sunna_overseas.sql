-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 16, 2026 at 12:46 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.1.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `marriage_sunna_overseas`
--

-- --------------------------------------------------------

--
-- Table structure for table `Dislikes`
--

CREATE TABLE `Dislikes` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `target_user_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Guardians`
--

CREATE TABLE `Guardians` (
  `id` bigint(20) NOT NULL,
  `individual_id` bigint(20) NOT NULL,
  `guardian_id` bigint(20) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `relationship` varchar(255) DEFAULT NULL,
  `contact_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Interests`
--

CREATE TABLE `Interests` (
  `id` bigint(20) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `guardian_approved` tinyint(1) DEFAULT 0,
  `from_user` bigint(20) DEFAULT NULL,
  `to_user` bigint(20) DEFAULT NULL,
  `is_mutual` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_super_like` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Interests`
--

INSERT INTO `Interests` (`id`, `status`, `guardian_approved`, `from_user`, `to_user`, `is_mutual`, `created_at`, `updated_at`, `is_super_like`) VALUES
(189, 'pending', 0, 60, 1, 0, '2026-04-07 07:35:57', '2026-04-07 07:35:57', 0),
(190, 'pending', 0, 60, 3, 0, '2026-04-07 07:36:12', '2026-04-07 07:36:12', 0),
(191, 'pending', 0, 60, 4, 0, '2026-04-07 07:36:21', '2026-04-07 07:36:21', 0),
(192, 'pending', 0, 60, 5, 0, '2026-04-07 07:36:37', '2026-04-07 07:36:37', 0),
(193, 'pending', 0, 60, 2, 0, '2026-04-13 14:34:31', '2026-04-13 14:34:31', 0),
(194, 'pending', 0, 60, 6, 0, '2026-04-13 14:34:41', '2026-04-13 14:34:41', 0),
(195, 'pending', 0, 60, 7, 0, '2026-04-14 18:51:35', '2026-04-14 18:51:35', 0),
(196, 'pending', 0, 60, 8, 0, '2026-04-14 20:57:05', '2026-04-14 20:57:05', 0),
(197, 'pending', 0, 60, 9, 0, '2026-04-14 20:57:11', '2026-04-14 20:57:11', 0),
(198, 'pending', 0, 60, 10, 0, '2026-04-14 20:57:19', '2026-04-14 20:57:19', 0),
(199, 'pending', 0, 60, 11, 0, '2026-04-14 20:57:28', '2026-04-14 20:57:28', 0),
(200, 'pending', 0, 60, 12, 0, '2026-04-14 20:57:40', '2026-04-14 20:57:40', 0),
(201, 'pending', 0, 60, 13, 0, '2026-04-14 21:04:49', '2026-04-14 21:04:49', 0),
(202, 'pending', 0, 60, 14, 0, '2026-04-14 21:04:51', '2026-04-14 21:04:51', 0),
(203, 'pending', 0, 60, 16, 0, '2026-04-14 21:04:57', '2026-04-14 21:04:57', 0),
(204, 'pending', 0, 60, 17, 0, '2026-04-14 21:04:58', '2026-04-14 21:04:58', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Matches`
--

CREATE TABLE `Matches` (
  `id` bigint(20) NOT NULL,
  `user1` bigint(20) NOT NULL,
  `user2` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `interest_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Messages`
--

CREATE TABLE `Messages` (
  `id` bigint(20) NOT NULL,
  `sender_id` bigint(20) NOT NULL,
  `receiver_id` bigint(20) NOT NULL,
  `message` text NOT NULL,
  `interest_id` bigint(20) DEFAULT NULL,
  `is_seen` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Messages`
--

INSERT INTO `Messages` (`id`, `sender_id`, `receiver_id`, `message`, `interest_id`, `is_seen`, `created_at`, `updated_at`) VALUES
(65, 5, 2, 'Hi! 👋', NULL, 0, '2026-03-09 01:38:13', '2026-03-09 01:38:13'),
(66, 6, 2, 'Hi! 👋', NULL, 0, '2026-03-09 02:01:08', '2026-03-09 02:01:08'),
(67, 6, 2, 'hi', NULL, 0, '2026-03-09 02:01:18', '2026-03-09 02:01:18'),
(68, 2, 5, 'yesh', NULL, 0, '2026-03-09 02:01:53', '2026-03-09 02:01:53'),
(69, 6, 2, 'iuhiuhiuhi', NULL, 0, '2026-03-09 02:03:13', '2026-03-09 02:03:13'),
(70, 2, 5, 'Hi! 👋', NULL, 0, '2026-03-09 22:47:31', '2026-03-09 22:47:31'),
(71, 60, 5, 'hi', NULL, 0, '2026-03-13 03:24:50', '2026-03-13 03:24:50'),
(72, 60, 1, 'hi', NULL, 0, '2026-03-13 03:25:46', '2026-03-13 03:25:46'),
(73, 60, 10, 'hi', NULL, 0, '2026-03-13 03:26:10', '2026-03-13 03:26:10'),
(74, 60, 26, 'hi', NULL, 1, '2026-03-18 00:32:00', '2026-03-18 00:32:43'),
(75, 60, 26, 'how are you', NULL, 1, '2026-03-18 00:32:24', '2026-03-18 00:32:43'),
(76, 60, 26, 'whatsa upp', NULL, 1, '2026-03-18 00:32:32', '2026-03-18 00:32:43'),
(77, 60, 26, 'are you there', NULL, 1, '2026-03-18 00:32:51', '2026-03-18 00:34:30'),
(78, 26, 60, 'hi', NULL, 1, '2026-03-18 00:45:54', '2026-03-18 02:30:03'),
(79, 60, 8, 'hi', NULL, 0, '2026-03-18 00:47:01', '2026-03-18 00:47:01'),
(80, 60, 26, 'hi', NULL, 1, '2026-03-18 02:30:21', '2026-03-18 02:34:40'),
(81, 60, 26, 'kider ho', NULL, 1, '2026-03-18 02:30:28', '2026-03-18 02:34:40'),
(82, 60, 26, 'what are you doing', NULL, 1, '2026-03-18 02:30:39', '2026-03-18 02:34:40'),
(83, 60, 26, 'are you kiding me', NULL, 1, '2026-03-18 02:35:20', '2026-03-18 02:35:46'),
(84, 26, 60, 'no I am not', NULL, 1, '2026-03-18 02:38:53', '2026-03-18 02:40:38'),
(85, 60, 26, 'how', NULL, 1, '2026-03-18 02:40:41', '2026-03-18 02:41:44'),
(86, 60, 26, 'hi', NULL, 1, '2026-03-18 02:40:47', '2026-03-18 02:41:44'),
(87, 60, 26, 'are you there', NULL, 1, '2026-03-18 02:40:54', '2026-03-18 02:41:44'),
(88, 60, 26, 'hi', NULL, 1, '2026-03-18 02:42:12', '2026-03-18 02:51:01'),
(89, 60, 26, 'hi', NULL, 1, '2026-03-18 02:42:24', '2026-03-18 02:51:01'),
(90, 60, 26, 'how', NULL, 1, '2026-03-18 02:42:29', '2026-03-18 02:51:01'),
(91, 60, 26, 'are you', NULL, 1, '2026-03-18 02:42:36', '2026-03-18 02:51:01'),
(92, 60, 26, 'hi', NULL, 1, '2026-03-18 02:52:21', '2026-03-18 03:06:51'),
(93, 60, 26, 'hi', NULL, 1, '2026-03-18 02:54:31', '2026-03-18 03:06:51'),
(94, 60, 26, 'how are', NULL, 1, '2026-03-18 02:54:36', '2026-03-18 03:06:51'),
(95, 60, 26, 's', NULL, 1, '2026-03-18 02:56:08', '2026-03-18 03:06:51'),
(96, 60, 26, 'hi', NULL, 1, '2026-03-18 02:59:32', '2026-03-18 03:06:51'),
(97, 60, 26, 'sd', NULL, 1, '2026-03-18 02:59:53', '2026-03-18 03:06:51'),
(98, 60, 26, 'hi', NULL, 1, '2026-03-18 03:01:01', '2026-03-18 03:06:51'),
(99, 60, 1, 'hi', NULL, 0, '2026-03-18 03:02:16', '2026-03-18 03:02:16'),
(100, 60, 1, 'd', NULL, 0, '2026-03-18 03:06:03', '2026-03-18 03:06:03'),
(101, 26, 60, 'hi', NULL, 1, '2026-03-18 03:06:56', '2026-03-18 03:11:48'),
(102, 26, 60, 'hi', NULL, 1, '2026-03-18 03:07:27', '2026-03-18 03:11:48'),
(103, 60, 1, 'jo', NULL, 0, '2026-03-18 03:10:57', '2026-03-18 03:10:57'),
(104, 60, 1, 'hi', NULL, 0, '2026-03-18 03:11:02', '2026-03-18 03:11:02'),
(105, 60, 1, 'hi', NULL, 0, '2026-03-18 03:11:08', '2026-03-18 03:11:08'),
(106, 60, 1, 'hi', NULL, 0, '2026-03-18 03:11:14', '2026-03-18 03:11:14'),
(107, 60, 1, 'hi', NULL, 0, '2026-03-18 03:11:44', '2026-03-18 03:11:44'),
(108, 60, 26, 'hi', NULL, 1, '2026-03-18 03:11:50', '2026-03-18 03:12:40'),
(109, 60, 26, 'ji', NULL, 1, '2026-03-18 03:12:03', '2026-03-18 03:12:40'),
(110, 60, 26, 'hi', NULL, 1, '2026-03-18 03:12:28', '2026-03-18 03:12:40'),
(111, 60, 26, 'ji', NULL, 1, '2026-03-18 03:12:34', '2026-03-18 03:12:40'),
(112, 60, 26, 'jo', NULL, 1, '2026-03-18 03:12:44', '2026-03-18 03:13:44'),
(113, 60, 26, 'asas', NULL, 1, '2026-03-18 03:13:01', '2026-03-18 03:13:44'),
(114, 26, 60, 'hoas', NULL, 1, '2026-03-18 03:13:15', '2026-03-18 03:13:20'),
(115, 60, 26, 'ds', NULL, 1, '2026-03-18 03:17:35', '2026-03-18 03:17:44'),
(116, 60, 26, 'df', NULL, 1, '2026-03-18 03:17:49', '2026-03-18 03:24:18'),
(117, 60, 26, 'hi', NULL, 1, '2026-03-18 03:24:43', '2026-03-18 03:27:03'),
(118, 60, 26, 'helo', NULL, 1, '2026-03-18 03:24:50', '2026-03-18 03:27:03'),
(119, 26, 60, 'hi', NULL, 1, '2026-03-18 03:29:54', '2026-03-18 03:31:27'),
(120, 26, 60, 'how are you', NULL, 1, '2026-03-18 03:30:01', '2026-03-18 03:31:27'),
(121, 26, 60, 'hi', NULL, 1, '2026-03-18 03:30:24', '2026-03-18 03:31:27'),
(122, 26, 60, 'as', NULL, 1, '2026-03-18 03:30:26', '2026-03-18 03:31:27'),
(123, 26, 60, 'jo', NULL, 1, '2026-03-18 03:31:35', '2026-03-18 03:31:35'),
(124, 26, 60, 'ad', NULL, 1, '2026-03-18 03:31:38', '2026-03-18 03:31:38'),
(125, 26, 60, 'my', NULL, 1, '2026-03-18 03:31:40', '2026-03-18 03:31:40'),
(126, 26, 60, 'type sdasdasdsad', NULL, 1, '2026-03-18 03:31:44', '2026-03-18 03:31:44'),
(127, 60, 26, 'hi', NULL, 1, '2026-03-18 03:31:58', '2026-03-18 03:31:58'),
(128, 60, 26, 'what are you doing', NULL, 1, '2026-03-18 03:32:04', '2026-03-18 03:32:04'),
(129, 60, 26, 'hi', NULL, 1, '2026-03-18 03:51:31', '2026-03-18 03:51:39'),
(130, 60, 26, 'where are you', NULL, 1, '2026-03-18 03:51:49', '2026-03-18 03:52:02'),
(131, 60, 26, 'hi', NULL, 1, '2026-03-18 03:52:57', '2026-03-18 03:52:57'),
(132, 26, 60, 'how are you', NULL, 1, '2026-03-18 03:53:02', '2026-03-18 03:53:02'),
(133, 26, 60, 'how are you', NULL, 1, '2026-03-18 03:54:29', '2026-03-18 03:54:29'),
(134, 60, 26, 'hi', NULL, 1, '2026-03-18 03:54:40', '2026-03-18 03:54:40'),
(135, 60, 26, 'how', NULL, 1, '2026-03-18 03:55:04', '2026-03-18 03:55:04'),
(136, 60, 26, 'hi', NULL, 1, '2026-03-18 03:57:10', '2026-03-18 03:58:24'),
(137, 60, 26, 'how are you', NULL, 1, '2026-03-18 03:57:14', '2026-03-18 03:58:24'),
(138, 60, 26, 'my name is waqar ahmed', NULL, 1, '2026-03-18 03:57:27', '2026-03-18 03:58:24'),
(139, 60, 26, 'http://localhost:5173/chats?receiver_id=26http://localhost:5173/chats?receiver_id=26http://localhost:5173/chats?receiver_id=26http://localhost:5173/chats?receiver_id=26http://localhost:5173/chats?receiver_id=26http://localhost:5173/chats?receiver_id=26', NULL, 1, '2026-03-18 03:57:36', '2026-03-18 03:58:24'),
(140, 60, 26, 'hi', NULL, 1, '2026-03-18 03:58:38', '2026-03-18 03:58:38'),
(141, 60, 26, 'hi', NULL, 1, '2026-03-18 03:58:50', '2026-03-18 03:58:50'),
(142, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:26:52', '2026-03-18 06:09:49'),
(143, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:27:10', '2026-03-18 06:09:49'),
(144, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:28:01', '2026-03-18 06:09:49'),
(145, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:30:54', '2026-03-18 06:09:49'),
(146, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:35:32', '2026-03-18 06:09:49'),
(147, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:35:38', '2026-03-18 06:09:49'),
(148, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:35:47', '2026-03-18 06:09:49'),
(149, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:36:32', '2026-03-18 06:09:49'),
(150, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:53:15', '2026-03-18 06:09:49'),
(151, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:57:39', '2026-03-18 06:09:49'),
(152, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 05:58:11', '2026-03-18 06:09:49'),
(153, 60, 26, 'hi', NULL, 1, '2026-03-18 06:09:39', '2026-03-18 06:09:49'),
(154, 26, 60, 'yes', NULL, 1, '2026-03-18 06:09:53', '2026-03-18 06:09:53'),
(155, 60, 26, 'what', NULL, 1, '2026-03-18 06:10:09', '2026-03-18 06:10:09'),
(156, 26, 60, 'ok', NULL, 1, '2026-03-18 06:10:35', '2026-03-18 06:10:35'),
(157, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 06:10:49', '2026-03-18 06:21:45'),
(158, 60, 26, 'Hi! 👋', NULL, 1, '2026-03-18 06:13:27', '2026-03-18 06:21:45'),
(159, 26, 60, 'Hi! 👋', NULL, 1, '2026-03-18 06:21:45', '2026-03-18 06:21:48'),
(160, 60, 26, 'Hi! 👋', NULL, 0, '2026-03-18 06:21:48', '2026-03-18 06:21:48'),
(161, 60, 26, 'Hi! 👋', NULL, 0, '2026-03-19 03:17:46', '2026-03-19 03:17:46'),
(162, 60, 26, 'Hi! 👋', NULL, 0, '2026-03-19 04:06:39', '2026-03-19 04:06:39'),
(163, 60, 26, 'Hi! 👋', NULL, 0, '2026-03-19 06:13:18', '2026-03-19 06:13:18'),
(164, 60, 26, 'Hi! 👋', NULL, 0, '2026-03-19 15:05:42', '2026-03-19 15:05:42'),
(165, 60, 26, 'Hi! 👋', NULL, 0, '2026-03-19 21:51:46', '2026-03-19 21:51:46'),
(166, 60, 26, 'Hi! 👋', NULL, 0, '2026-03-20 04:15:00', '2026-03-20 04:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `Otps`
--

CREATE TABLE `Otps` (
  `id` bigint(20) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Otps`
--

INSERT INTO `Otps` (`id`, `otp`, `expires_at`, `user_id`, `created_at`, `updated_at`) VALUES
(7, '765963', '2026-02-26 20:43:54', 60, '2026-02-26 20:38:54', '2026-02-26 20:38:54'),
(8, '640433', '2026-02-26 20:51:22', 60, '2026-02-26 20:46:22', '2026-02-26 20:46:22'),
(9, '195261', '2026-02-26 20:56:15', 60, '2026-02-26 20:51:15', '2026-02-26 20:51:15'),
(10, '713799', '2026-02-26 21:29:09', 60, '2026-02-26 21:24:09', '2026-02-26 21:24:09'),
(11, '495980', '2026-02-26 21:32:25', 60, '2026-02-26 21:27:25', '2026-02-26 21:27:25'),
(12, '561243', '2026-02-26 21:34:22', 60, '2026-02-26 21:29:22', '2026-02-26 21:29:22'),
(13, '907885', '2026-02-26 21:45:24', 60, '2026-02-26 21:40:24', '2026-02-26 21:40:24'),
(14, '114002', '2026-02-26 21:48:59', 60, '2026-02-26 21:43:59', '2026-02-26 21:43:59'),
(15, '773141', '2026-02-26 21:52:15', 60, '2026-02-26 21:47:15', '2026-02-26 21:47:15'),
(16, '425667', '2026-02-26 22:58:29', 60, '2026-02-26 22:53:29', '2026-02-26 22:53:29'),
(20, '782730', '2026-02-28 01:16:01', 60, '2026-02-28 01:11:01', '2026-02-28 01:11:01'),
(21, '835345', '2026-02-28 21:27:19', 60, '2026-02-28 21:22:19', '2026-02-28 21:22:19'),
(22, '425717', '2026-02-28 21:56:54', 60, '2026-02-28 21:51:54', '2026-02-28 21:51:54'),
(23, '714254', '2026-03-01 00:26:36', 60, '2026-03-01 00:21:36', '2026-03-01 00:21:36'),
(24, '189817', '2026-03-01 21:20:51', 60, '2026-03-01 21:15:51', '2026-03-01 21:15:51'),
(25, '178410', '2026-03-02 19:58:11', 60, '2026-03-02 19:53:11', '2026-03-02 19:53:11'),
(26, '956475', '2026-03-02 20:46:41', 60, '2026-03-02 20:41:41', '2026-03-02 20:41:41'),
(27, '949744', '2026-03-02 21:03:40', 60, '2026-03-02 20:58:40', '2026-03-02 20:58:40'),
(28, '223856', '2026-03-02 21:15:04', 60, '2026-03-02 21:10:04', '2026-03-02 21:10:04'),
(29, '611200', '2026-03-02 21:35:19', 60, '2026-03-02 21:30:19', '2026-03-02 21:30:19'),
(30, '503922', '2026-03-02 21:59:22', 60, '2026-03-02 21:54:22', '2026-03-02 21:54:22'),
(31, '456575', '2026-03-02 22:00:06', 60, '2026-03-02 21:55:06', '2026-03-02 21:55:06'),
(32, '897622', '2026-03-02 22:04:48', 60, '2026-03-02 21:59:48', '2026-03-02 21:59:48'),
(33, '197788', '2026-03-02 22:09:34', 60, '2026-03-02 22:04:34', '2026-03-02 22:04:34'),
(34, '553319', '2026-03-02 22:10:23', 60, '2026-03-02 22:05:23', '2026-03-02 22:05:23'),
(35, '300149', '2026-03-02 22:13:43', 60, '2026-03-02 22:08:43', '2026-03-02 22:08:43'),
(36, '225440', '2026-03-02 22:16:35', 60, '2026-03-02 22:11:35', '2026-03-02 22:11:35'),
(37, '925480', '2026-03-02 22:17:06', 60, '2026-03-02 22:12:06', '2026-03-02 22:12:06'),
(38, '171210', '2026-03-02 22:19:50', 60, '2026-03-02 22:14:50', '2026-03-02 22:14:50'),
(39, '387358', '2026-03-02 22:30:55', 60, '2026-03-02 22:25:55', '2026-03-02 22:25:55'),
(40, '343040', '2026-03-02 22:43:27', 60, '2026-03-02 22:38:27', '2026-03-02 22:38:27'),
(41, '704597', '2026-03-02 22:45:27', 60, '2026-03-02 22:40:27', '2026-03-02 22:40:27'),
(42, '396711', '2026-03-02 22:50:59', 60, '2026-03-02 22:45:59', '2026-03-02 22:45:59'),
(43, '995040', '2026-03-02 22:54:38', 60, '2026-03-02 22:49:38', '2026-03-02 22:49:38'),
(44, '978333', '2026-03-02 22:58:05', 60, '2026-03-02 22:53:05', '2026-03-02 22:53:05'),
(45, '331885', '2026-03-02 23:02:23', 60, '2026-03-02 22:57:23', '2026-03-02 22:57:23'),
(46, '105082', '2026-03-02 23:03:46', 60, '2026-03-02 22:58:46', '2026-03-02 22:58:46'),
(47, '173956', '2026-03-02 23:09:19', 60, '2026-03-02 23:04:19', '2026-03-02 23:04:19'),
(48, '648701', '2026-03-02 23:09:56', 60, '2026-03-02 23:04:56', '2026-03-02 23:04:56'),
(49, '364735', '2026-03-02 23:11:12', 60, '2026-03-02 23:06:12', '2026-03-02 23:06:12'),
(50, '824391', '2026-03-02 23:14:13', 60, '2026-03-02 23:09:13', '2026-03-02 23:09:13'),
(51, '847068', '2026-03-02 23:18:50', 60, '2026-03-02 23:13:50', '2026-03-02 23:13:50'),
(52, '128671', '2026-03-02 23:48:53', 60, '2026-03-02 23:43:53', '2026-03-02 23:43:53'),
(53, '568365', '2026-03-02 23:50:33', 60, '2026-03-02 23:45:33', '2026-03-02 23:45:33'),
(54, '346125', '2026-03-02 23:51:07', 60, '2026-03-02 23:46:07', '2026-03-02 23:46:07'),
(55, '992427', '2026-03-02 23:52:12', 60, '2026-03-02 23:47:12', '2026-03-02 23:47:12'),
(56, '507693', '2026-03-02 23:52:49', 60, '2026-03-02 23:47:49', '2026-03-02 23:47:49'),
(57, '213067', '2026-03-02 23:55:22', 60, '2026-03-02 23:50:22', '2026-03-02 23:50:22'),
(58, '806977', '2026-03-02 23:58:05', 60, '2026-03-02 23:53:05', '2026-03-02 23:53:05'),
(59, '298712', '2026-03-03 00:01:24', 60, '2026-03-02 23:56:24', '2026-03-02 23:56:24'),
(60, '750875', '2026-03-03 00:04:52', 60, '2026-03-02 23:59:52', '2026-03-02 23:59:52'),
(61, '728607', '2026-03-03 00:05:57', 60, '2026-03-03 00:00:57', '2026-03-03 00:00:57'),
(62, '527915', '2026-03-03 00:08:33', 60, '2026-03-03 00:03:33', '2026-03-03 00:03:33'),
(63, '297599', '2026-03-03 00:08:53', 60, '2026-03-03 00:03:53', '2026-03-03 00:03:53'),
(64, '190886', '2026-03-03 01:27:41', 60, '2026-03-03 01:22:41', '2026-03-03 01:22:41'),
(65, '633885', '2026-03-03 16:08:19', 60, '2026-03-03 16:03:19', '2026-03-03 16:03:19'),
(66, '340641', '2026-03-03 16:08:35', 60, '2026-03-03 16:03:35', '2026-03-03 16:03:35'),
(67, '613738', '2026-03-04 20:33:10', 60, '2026-03-04 20:28:10', '2026-03-04 20:28:10'),
(68, '208207', '2026-03-04 20:34:06', 60, '2026-03-04 20:29:06', '2026-03-04 20:29:06'),
(69, '816060', '2026-03-04 20:34:35', 60, '2026-03-04 20:29:35', '2026-03-04 20:29:35'),
(70, '929683', '2026-03-04 20:35:00', 60, '2026-03-04 20:30:00', '2026-03-04 20:30:00'),
(71, '771450', '2026-03-04 20:37:49', 60, '2026-03-04 20:32:49', '2026-03-04 20:32:49'),
(72, '912794', '2026-03-04 20:38:45', 60, '2026-03-04 20:33:45', '2026-03-04 20:33:45'),
(73, '883184', '2026-03-04 20:43:04', 60, '2026-03-04 20:38:04', '2026-03-04 20:38:04'),
(74, '861973', '2026-03-04 20:44:56', 60, '2026-03-04 20:39:56', '2026-03-04 20:39:56'),
(75, '911424', '2026-03-04 20:53:00', 60, '2026-03-04 20:48:00', '2026-03-04 20:48:00'),
(76, '593951', '2026-03-04 20:53:35', 60, '2026-03-04 20:48:35', '2026-03-04 20:48:35'),
(77, '531050', '2026-03-04 20:55:25', 60, '2026-03-04 20:50:25', '2026-03-04 20:50:25'),
(78, '325484', '2026-03-04 20:55:45', 60, '2026-03-04 20:50:45', '2026-03-04 20:50:45'),
(79, '730185', '2026-03-04 20:56:24', 60, '2026-03-04 20:51:24', '2026-03-04 20:51:24'),
(80, '246001', '2026-03-04 20:56:26', 60, '2026-03-04 20:51:26', '2026-03-04 20:51:26'),
(81, '129534', '2026-03-04 23:17:25', 60, '2026-03-04 23:12:25', '2026-03-04 23:12:25'),
(82, '796857', '2026-03-04 23:17:28', 60, '2026-03-04 23:12:28', '2026-03-04 23:12:28'),
(85, '355290', '2026-03-05 00:54:31', 60, '2026-03-05 00:49:31', '2026-03-05 00:49:31'),
(86, '694244', '2026-03-05 00:54:58', 60, '2026-03-05 00:49:58', '2026-03-05 00:49:58'),
(89, '766000', '2026-03-05 01:50:46', 60, '2026-03-05 01:45:46', '2026-03-05 01:45:46'),
(90, '593315', '2026-03-05 01:50:49', 60, '2026-03-05 01:45:49', '2026-03-05 01:45:49'),
(94, '990139', '2026-03-06 21:00:35', 60, '2026-03-06 20:55:35', '2026-03-06 20:55:35'),
(95, '441280', '2026-03-07 02:18:37', 60, '2026-03-07 02:13:37', '2026-03-07 02:13:37'),
(96, '932993', '2026-03-07 04:09:22', 60, '2026-03-07 04:04:22', '2026-03-07 04:04:22'),
(97, '627053', '2026-03-07 04:11:14', 60, '2026-03-07 04:06:14', '2026-03-07 04:06:14'),
(98, '290687', '2026-03-07 04:13:08', 60, '2026-03-07 04:08:08', '2026-03-07 04:08:08'),
(99, '881577', '2026-03-07 04:13:34', 60, '2026-03-07 04:08:34', '2026-03-07 04:08:34'),
(100, '796455', '2026-03-07 04:13:52', 60, '2026-03-07 04:08:52', '2026-03-07 04:08:52'),
(101, '245024', '2026-03-07 04:14:35', 60, '2026-03-07 04:09:35', '2026-03-07 04:09:35'),
(102, '212689', '2026-03-07 04:15:01', 60, '2026-03-07 04:10:01', '2026-03-07 04:10:01'),
(103, '887421', '2026-03-07 04:15:23', 60, '2026-03-07 04:10:23', '2026-03-07 04:10:23'),
(104, '205989', '2026-03-07 04:15:48', 60, '2026-03-07 04:10:48', '2026-03-07 04:10:48'),
(105, '972692', '2026-03-07 04:20:36', 60, '2026-03-07 04:15:36', '2026-03-07 04:15:36'),
(106, '926306', '2026-03-07 04:20:39', 60, '2026-03-07 04:15:39', '2026-03-07 04:15:39'),
(107, '184245', '2026-03-07 21:53:12', 60, '2026-03-07 21:48:12', '2026-03-07 21:48:12'),
(108, '352009', '2026-03-07 21:53:19', 60, '2026-03-07 21:48:19', '2026-03-07 21:48:19'),
(109, '808301', '2026-03-08 21:56:52', 5, '2026-03-08 21:51:52', '2026-03-08 21:51:52'),
(110, '613726', '2026-03-08 21:57:06', 5, '2026-03-08 21:52:06', '2026-03-08 21:52:06'),
(111, '890969', '2026-03-08 22:00:27', 6, '2026-03-08 21:55:27', '2026-03-08 21:55:27'),
(112, '551834', '2026-03-08 22:00:29', 6, '2026-03-08 21:55:29', '2026-03-08 21:55:29'),
(113, '496664', '2026-03-09 01:35:34', 2, '2026-03-09 01:30:34', '2026-03-09 01:30:34'),
(114, '523028', '2026-03-09 01:35:38', 2, '2026-03-09 01:30:38', '2026-03-09 01:30:38'),
(115, '396343', '2026-03-12 21:58:01', 60, '2026-03-12 21:53:01', '2026-03-12 21:53:01'),
(116, '107369', '2026-03-12 21:58:13', 60, '2026-03-12 21:53:13', '2026-03-12 21:53:13'),
(117, '951161', '2026-03-13 00:36:48', 60, '2026-03-13 00:31:48', '2026-03-13 00:31:48'),
(118, '857324', '2026-03-13 00:38:00', 60, '2026-03-13 00:33:00', '2026-03-13 00:33:00'),
(119, '229958', '2026-03-13 00:38:01', 60, '2026-03-13 00:33:01', '2026-03-13 00:33:01'),
(120, '512216', '2026-03-13 00:46:05', 60, '2026-03-13 00:41:05', '2026-03-13 00:41:05'),
(121, '207147', '2026-03-13 00:46:13', 60, '2026-03-13 00:41:13', '2026-03-13 00:41:13'),
(122, '468406', '2026-03-14 21:56:54', 60, '2026-03-14 21:51:54', '2026-03-14 21:51:54'),
(123, '534001', '2026-03-15 01:32:11', 60, '2026-03-15 01:27:11', '2026-03-15 01:27:11'),
(124, '400367', '2026-03-15 01:34:40', 60, '2026-03-15 01:29:40', '2026-03-15 01:29:40'),
(125, '869081', '2026-03-16 20:59:32', 60, '2026-03-16 20:54:32', '2026-03-16 20:54:32'),
(126, '174964', '2026-03-16 21:00:13', 60, '2026-03-16 20:55:13', '2026-03-16 20:55:13'),
(127, '769401', '2026-03-16 21:00:17', 60, '2026-03-16 20:55:17', '2026-03-16 20:55:17'),
(128, '876118', '2026-03-16 21:51:01', 60, '2026-03-16 21:46:01', '2026-03-16 21:46:01'),
(129, '183305', '2026-03-16 21:51:02', 60, '2026-03-16 21:46:02', '2026-03-16 21:46:02'),
(130, '329060', '2026-03-16 22:23:13', 60, '2026-03-16 22:18:13', '2026-03-16 22:18:13'),
(131, '351852', '2026-03-16 22:29:49', 60, '2026-03-16 22:24:49', '2026-03-16 22:24:49'),
(132, '440741', '2026-03-16 22:34:42', 60, '2026-03-16 22:29:42', '2026-03-16 22:29:42'),
(133, '549949', '2026-03-16 22:38:38', 60, '2026-03-16 22:33:38', '2026-03-16 22:33:38'),
(134, '403010', '2026-03-16 22:40:37', 60, '2026-03-16 22:35:37', '2026-03-16 22:35:37'),
(135, '143420', '2026-03-16 22:41:49', 60, '2026-03-16 22:36:49', '2026-03-16 22:36:49'),
(136, '621235', '2026-03-16 22:45:07', 60, '2026-03-16 22:40:07', '2026-03-16 22:40:07'),
(137, '902937', '2026-03-16 22:45:16', 60, '2026-03-16 22:40:16', '2026-03-16 22:40:16'),
(138, '754066', '2026-03-16 22:49:18', 60, '2026-03-16 22:44:18', '2026-03-16 22:44:18'),
(139, '619011', '2026-03-18 00:34:51', 26, '2026-03-18 00:29:51', '2026-03-18 00:29:51'),
(140, '559086', '2026-03-18 00:34:59', 26, '2026-03-18 00:29:59', '2026-03-18 00:29:59'),
(141, '782194', '2026-04-07 07:39:03', 60, '2026-04-07 07:34:03', '2026-04-07 07:34:03'),
(142, '413535', '2026-04-07 07:39:37', 60, '2026-04-07 07:34:37', '2026-04-07 07:34:37'),
(143, '961668', '2026-04-07 08:33:57', 60, '2026-04-07 08:28:57', '2026-04-07 08:28:57'),
(144, '674773', '2026-04-07 08:37:49', 60, '2026-04-07 08:32:49', '2026-04-07 08:32:49'),
(145, '850877', '2026-04-07 08:38:04', 60, '2026-04-07 08:33:04', '2026-04-07 08:33:04'),
(146, '238676', '2026-04-07 08:38:31', 60, '2026-04-07 08:33:31', '2026-04-07 08:33:31'),
(147, '110925', '2026-04-07 08:38:36', 60, '2026-04-07 08:33:36', '2026-04-07 08:33:36'),
(148, '270747', '2026-04-07 08:43:42', 60, '2026-04-07 08:38:42', '2026-04-07 08:38:42'),
(149, '156263', '2026-04-07 08:45:55', 60, '2026-04-07 08:40:55', '2026-04-07 08:40:55'),
(150, '656497', '2026-04-13 14:13:14', 60, '2026-04-13 14:08:14', '2026-04-13 14:08:14'),
(151, '983069', '2026-04-13 14:54:05', 60, '2026-04-13 14:49:05', '2026-04-13 14:49:05'),
(152, '955066', '2026-04-13 15:02:06', 60, '2026-04-13 14:57:06', '2026-04-13 14:57:06');

-- --------------------------------------------------------

--
-- Table structure for table `Prefs`
--

CREATE TABLE `Prefs` (
  `id` bigint(20) NOT NULL,
  `individual_id` bigint(20) NOT NULL,
  `pref_gender` varchar(255) DEFAULT NULL,
  `pref_age_min` int(11) DEFAULT NULL,
  `pref_age_max` int(11) DEFAULT NULL,
  `pref_marital_status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pref_marital_status`)),
  `pref_nationality` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pref_nationality`)),
  `pref_country` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pref_country`)),
  `pref_city` varchar(255) DEFAULT NULL,
  `pref_religion` enum('Islam','Christian','Hindu','Other') DEFAULT NULL,
  `pref_sect` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pref_sect`)),
  `pref_religious_practice_level` varchar(255) DEFAULT NULL,
  `pref_height_min_inches` tinyint(3) UNSIGNED DEFAULT NULL,
  `pref_height_max_inches` tinyint(3) UNSIGNED DEFAULT NULL,
  `pref_body_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pref_body_type`)),
  `pref_caste` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pref_caste`)),
  `pref_mother_tongue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pref_mother_tongue`)),
  `pref_education` varchar(255) DEFAULT NULL,
  `pref_employment_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pref_employment_type`)),
  `pref_monthly_salary` enum('No preference','Less than PKR 100,000','PKR 100,000 – PKR 200,000','PKR 200,000 – PKR 600,000','PKR 600,000 – PKR 1,000,000','PKR 1,000,000+') DEFAULT NULL,
  `pref_has_children` enum('No Children','Has Children','No Preference') DEFAULT NULL,
  `pref_willing_to_relocate` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Prefs`
--

INSERT INTO `Prefs` (`id`, `individual_id`, `pref_gender`, `pref_age_min`, `pref_age_max`, `pref_marital_status`, `pref_nationality`, `pref_country`, `pref_city`, `pref_religion`, `pref_sect`, `pref_religious_practice_level`, `pref_height_min_inches`, `pref_height_max_inches`, `pref_body_type`, `pref_caste`, `pref_mother_tongue`, `pref_education`, `pref_employment_type`, `pref_monthly_salary`, `pref_has_children`, `pref_willing_to_relocate`, `created_at`, `updated_at`) VALUES
(1, 2, 'Male', 19, 22, '[\"Never Married\"]', '[\"Pakistani\"]', '[\"Pakistan\"]', NULL, 'Islam', '[\"Sunni\"]', 'Very Religious', 68, 63, '[\"Slim\"]', '[\"Abbasi\",\"Kamboh\",\"Memon\",\"Niazi\"]', '[]', 'Intermediate', '[\"Business Owner\"]', 'PKR 200,000 – PKR 600,000', 'No Children', NULL, '2026-04-13 20:54:12', '2026-04-14 13:58:55');

-- --------------------------------------------------------

--
-- Table structure for table `Profiles`
--

CREATE TABLE `Profiles` (
  `id` bigint(20) NOT NULL,
  `individual_id` bigint(20) NOT NULL,
  `guardian_id` bigint(20) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `marital_status` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `education` varchar(255) DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `religious_practice_level` varchar(255) DEFAULT 'Moderately Religious',
  `family_background` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `interests` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[   "Reading",   "Traveling",   "Cooking",   "Fitness",   "Cricket", ]',
  `relationship` varchar(255) DEFAULT NULL,
  `contact_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_seen` datetime DEFAULT NULL,
  `images` text DEFAULT NULL,
  `guardian_name` varchar(255) DEFAULT '---',
  `guardian_phone` varchar(50) DEFAULT '---',
  `guardian_email` varchar(255) DEFAULT '---',
  `guardian_relationship` varchar(100) DEFAULT '---',
  `is_guardian_required` tinyint(1) NOT NULL DEFAULT 1,
  `phone` varchar(20) DEFAULT NULL,
  `religion` enum('Islam','Christian','Hindu','Other') DEFAULT 'Other',
  `sect` enum('Sunni','Shia','Deobandi','Barelvi','Ahmadi','Other') DEFAULT 'Other',
  `height_inches` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'Total inches e.g. 68 = 5ft 8in',
  `body_type` enum('Slim','Athletic','Average','Curvy','Heavy') DEFAULT 'Average',
  `caste` varchar(60) DEFAULT NULL,
  `mother_tongue` enum('Urdu','Pashto','Punjabi','Sindhi','Balochi','English','Arabic','Other') DEFAULT 'Other',
  `employment_type` enum('Government','Private','Self-Employed','Business Owner','Student','Unemployed') DEFAULT 'Private',
  `monthly_salary` enum('No preference','Less than PKR 100,000','PKR 100,000 – PKR 200,000','PKR 200,000 – PKR 600,000','PKR 600,000 – PKR 1,000,000','PKR 1,000,000+') DEFAULT NULL,
  `has_children` tinyint(4) DEFAULT 0,
  `willing_to_relocate` tinyint(1) DEFAULT 0,
  `is_profile_completed` tinyint(1) NOT NULL DEFAULT 0,
  `is_pro` tinyint(1) DEFAULT 0,
  `front_id` varchar(255) DEFAULT NULL,
  `back_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Profiles`
--

INSERT INTO `Profiles` (`id`, `individual_id`, `guardian_id`, `name`, `gender`, `date_of_birth`, `age`, `marital_status`, `country`, `city`, `nationality`, `education`, `profession`, `religious_practice_level`, `family_background`, `bio`, `interests`, `relationship`, `contact_hidden`, `created_at`, `updated_at`, `last_seen`, `images`, `guardian_name`, `guardian_phone`, `guardian_email`, `guardian_relationship`, `is_guardian_required`, `phone`, `religion`, `sect`, `height_inches`, `body_type`, `caste`, `mother_tongue`, `employment_type`, `monthly_salary`, `has_children`, `willing_to_relocate`, `is_profile_completed`, `is_pro`, `front_id`, `back_id`) VALUES
(2, 60, NULL, 'asdsd', 'Male', '0002-02-22', 2024, 'Divorced', 'UAE', 'Bhimber', 'Emirati', 'Bachelor\'s', '', 'Moderately Religious', '', '', '[]', '', 0, '2026-02-26 20:14:28', '2026-04-14 21:13:48', '2026-04-14 21:13:48', '[\"/uploads/profiles/profile_60_1772854402023.png\",\"/uploads/profiles/profile_60_1772851323846.jpg\",\"/uploads/profiles/profile_60_1772854427691.jpg\",\"/uploads/profiles/profile_60_1772854438303.webp\"]', '', '', '', '', 0, '', 'Islam', 'Ahmadi', 61, 'Athletic', 'Awan', 'Balochi', 'Self-Employed', 'PKR 100,000 – PKR 200,000', 0, 1, 1, 0, NULL, NULL),
(49, 1, 101, 'Aisha Khan', 'female', '1998-03-15', 26, 'single', 'United Kingdom', 'London', 'Pakistani', 'masters', 'Doctor', 'very_practicing', 'conservative', 'Assalamu Alaikum! I am a medical professional who loves cooking and reading Quran. Looking for a kind and practicing partner to build a beautiful family.', '[\"Cooking\",\"Quran\",\"Reading\",\"Travelling\",\"Volunteering\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:04', '2026-03-08 01:43:18', '[\"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop\"]', 'Muhammad Khan', '+447700200001', 'mkhan@gmail.com', 'Father', 1, '+447700100001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(50, 2, 102, 'Fatima Ali', 'female', '1999-07-22', 25, 'single', 'United Kingdom', 'Manchester', 'British', 'bachelors', 'Teacher', 'practicing', 'moderate', 'Alhamdulillah for everything. I am a primary school teacher passionate about education and community work. Seeking a sincere and responsible husband.', '[\"Teaching\",\"Baking\",\"Gardening\",\"Reading\",\"Charity\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-10 02:03:58', '2026-03-10 02:03:58', '[\"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop\",\"/uploads/profiles/profile_2_1773020509186.jpg\"]', 'Ahmed Ali', '+447700200002', 'aali@gmail.com', 'Father', 1, '+447700100002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(51, 3, 103, 'Zara Mahmood', 'female', '1997-11-08', 27, 'single', 'United Kingdom', 'Birmingham', 'Pakistani', 'masters', 'Pharmacist', 'very_practicing', 'conservative', 'Bismillah. A pharmacist with a love for learning and nature walks. I value honesty, faith, and family above all else. Ready for the next chapter inshAllah.', '[\"Nature\",\"Hiking\",\"Cooking\",\"Islamic Studies\",\"Fitness\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 09:53:55', '2026-03-08 01:48:18', '[\"https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&h=600&fit=crop\"]', 'Tariq Mahmood', '+447700200003', 'tmahmood@gmail.com', 'Father', 1, '+447700100003', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(52, 4, 104, 'Noor Hussain', 'female', '2000-05-30', 24, 'single', 'United Kingdom', 'Leeds', 'British', 'bachelors', 'Nurse', 'practicing', 'moderate', 'JazakAllah Khair for visiting my profile. I am a compassionate nurse who enjoys family time and cooking. Looking for someone who shares my values and faith.', '[\"Cooking\",\"Family\",\"Fitness\",\"Volunteering\",\"Travel\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:04', '2026-03-07 01:53:18', '[\"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=400&h=600&fit=crop\"]', 'Hussain Raza', '+447700200004', 'hraza@gmail.com', 'Father', 1, '+447700100004', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(53, 5, 105, 'Sara Ahmed', 'female', '1996-09-14', 28, 'divorced', 'United Kingdom', 'London', 'Pakistani', 'masters', 'Lawyer', 'practicing', 'moderate', 'MashAllah, life has given me wisdom and strength. I am a lawyer seeking a mature, understanding partner who values growth and a loving home.', '[\"Law\",\"Reading\",\"Cooking\",\"Yoga\",\"Arts\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-09 01:56:59', '2026-03-09 01:56:59', '[\"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop\"]', 'Usman Ahmed', '+447700200005', 'uahmed@gmail.com', 'Brother', 1, '+447700100005', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(54, 6, 106, 'Hana Malik', 'female', '1999-01-25', 25, 'single', 'United Kingdom', 'Sheffield', 'British', 'bachelors', 'Graphic Designer', 'moderately_practicing', 'moderate', 'Assalamu Alaikum! Creative soul, graphic designer by day and home baker by night. Looking for someone kind, funny, and God-conscious to share life with.', '[\"Design\",\"Baking\",\"Photography\",\"Travel\",\"Quran\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-09 22:35:28', '2026-03-09 22:35:28', '[\"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop\"]', 'Malik Iqbal', '+447700200006', 'miqbal@gmail.com', 'Father', 1, '+447700100006', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(55, 7, 107, 'Maryam Shah', 'female', '1998-06-19', 26, 'single', 'United Kingdom', 'Liverpool', 'Pakistani', 'phd', 'Researcher', 'very_practicing', 'conservative', 'SubhanAllah, seeking knowledge is part of my deen. I am a PhD researcher in biochemistry. I want a husband who encourages my growth while building a pious home.', '[\"Research\",\"Islamic History\",\"Cooking\",\"Reading\",\"Cycling\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:38:18', '[\"https://images.unsplash.com/photo-1488508872907-592763824245?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=400&h=600&fit=crop\"]', 'Shah Nawaz', '+447700200007', 'snawaz@gmail.com', 'Father', 1, '+447700100007', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(56, 8, 108, 'Layla Qureshi', 'female', '2001-02-11', 23, 'single', 'United Kingdom', 'Bristol', 'British', 'bachelors', 'Accountant', 'practicing', 'moderate', 'Alhamdulillah for this platform. I am a young accountant who loves weekend hikes and trying new recipes. Looking for my best friend in life, inshAllah.', '[\"Hiking\",\"Cooking\",\"Finance\",\"Volunteering\",\"Reading\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-06 01:53:18', '[\"https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1523264939339-c89f9dadde2e?w=400&h=600&fit=crop\"]', 'Qureshi Sahab', '+447700200008', 'qureshi@gmail.com', 'Father', 1, '+447700100008', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(57, 9, 109, 'Amira Siddiq', 'female', '1997-08-03', 27, 'single', 'United Kingdom', 'Edinburgh', 'Pakistani', 'masters', 'Dentist', 'very_practicing', 'conservative', 'Bismillah. I am a dentist who believes in balancing deen and dunya. I love to travel, cook, and spend quality time with family. Seeking a kind, religious partner.', '[\"Dentistry\",\"Travel\",\"Cooking\",\"Family\",\"Quran\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:33:18', '[\"https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop\"]', 'Siddiq Hussain', '+447700200009', 'shussain@gmail.com', 'Father', 1, '+447700100009', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(58, 10, 110, 'Ruqayyah Omar', 'female', '1995-12-27', 29, 'divorced', 'United Kingdom', 'London', 'British', 'masters', 'Social Worker', 'practicing', 'moderate', 'MashAllah, I have grown so much through lifes journey. Social worker, mother figure, and community volunteer. Looking for a mature and understanding partner.', '[\"Community Work\",\"Reading\",\"Cooking\",\"Nature\",\"Charity\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 21:53:18', '[\"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop\"]', 'Omar Abdullah', '+447700200010', 'oabdullah@gmail.com', 'Brother', 1, '+447700100010', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(59, 11, 111, 'Khadija Naz', 'female', '1999-04-16', 25, 'single', 'United Kingdom', 'London', 'Pakistani', 'bachelors', 'Physiotherapist', 'very_practicing', 'conservative', 'Assalamu Alaikum! I am a physiotherapist who enjoys outdoor activities and Islamic lectures. Wanting to meet someone who is kind, ambitious, and God-fearing.', '[\"Fitness\",\"Islamic Lectures\",\"Hiking\",\"Cooking\",\"Reading\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:45:18', '[\"https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=400&h=600&fit=crop\"]', 'Naz Khan', '+447700200011', 'nkhan@gmail.com', 'Father', 1, '+447700100011', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(60, 12, 112, 'Sumaya Iqbal', 'female', '2000-10-09', 24, 'single', 'United Kingdom', 'Birmingham', 'British', 'bachelors', 'Marketing Manager', 'moderately_practicing', 'moderate', 'JazakAllah for stopping by! Marketing manager with a passion for creativity and travel. Seeking a partner who is supportive, kind, and has a great sense of humour.', '[\"Marketing\",\"Travel\",\"Photography\",\"Cooking\",\"Fitness\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 19:53:18', '[\"https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1521252659862-eec69941b071?w=400&h=600&fit=crop\"]', 'Iqbal Hussain', '+447700200012', 'ihussain@gmail.com', 'Father', 1, '+447700100012', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(61, 13, 113, 'Hafsa Raza', 'female', '1998-07-21', 26, 'single', 'United Kingdom', 'Manchester', 'Pakistani', 'masters', 'Engineer', 'very_practicing', 'conservative', 'SubhanAllah, engineering is my passion and Islam is my guide. I am looking for a practicing Muslim man who values education, family, and the sunnah.', '[\"Engineering\",\"Quran\",\"Cooking\",\"Reading\",\"Travel\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:08:18', '[\"https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop\"]', 'Raza Shah', '+447700200013', 'rshah@gmail.com', 'Father', 1, '+447700100013', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(62, 14, 114, 'Asma Baig', 'female', '1996-03-04', 28, 'single', 'United Kingdom', 'Leeds', 'British', 'phd', 'University Lecturer', 'practicing', 'moderate', 'Alhamdulillah I have been blessed with knowledge. I teach at university and love to cook, read, and explore new places. Seeking a calm and intellectual partner.', '[\"Academia\",\"Cooking\",\"Travel\",\"Reading\",\"Yoga\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 00:53:18', '[\"https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1504199367641-aba8151af406?w=400&h=600&fit=crop\"]', 'Baig Sahib', '+447700200014', 'baig@gmail.com', 'Father', 1, '+447700100014', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(63, 15, 115, 'Sadia Chaudry', 'female', '2001-09-17', 23, 'single', 'United Kingdom', 'Sheffield', 'Pakistani', 'bachelors', 'IT Analyst', 'practicing', 'moderate', 'Bismillah. Tech-savvy and family-oriented. I work in IT but my real passion is cooking and volunteering at the local masjid. Looking for a warm-hearted partner.', '[\"Technology\",\"Cooking\",\"Volunteering\",\"Fitness\",\"Games\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:28:18', '[\"https://images.unsplash.com/photo-1496360166961-10a51d5f367a?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400&h=600&fit=crop\"]', 'Chaudry Sahib', '+447700200015', 'chaudry@gmail.com', 'Father', 1, '+447700100015', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(64, 16, 116, 'Naila Butt', 'female', '1999-12-01', 25, 'single', 'United Kingdom', 'Bristol', 'British', 'bachelors', 'Optometrist', 'moderately_practicing', 'moderate', 'MashAllah, eyes are my profession and kindness is my nature. I am an optometrist who loves reading, cooking, and weekend getaways. Looking for genuine connection.', '[\"Health\",\"Reading\",\"Cooking\",\"Travel\",\"Gardening\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-05 01:53:18', '[\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop\"]', 'Butt Sahib', '+447700200016', 'butt@gmail.com', 'Brother', 1, '+447700100016', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(65, 17, 117, 'Inaya Mirza', 'female', '1997-05-13', 27, 'single', 'United Kingdom', 'London', 'Pakistani', 'masters', 'Psychologist', 'very_practicing', 'conservative', 'Assalamu Alaikum! I am a psychologist passionate about mental wellness and Islamic spirituality. Seeking an emotionally intelligent, practicing Muslim partner.', '[\"Psychology\",\"Islamic Art\",\"Reading\",\"Meditation\",\"Travel\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:41:18', '[\"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop\"]', 'Mirza Sahib', '+447700200017', 'mirza@gmail.com', 'Father', 1, '+447700100017', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(66, 18, 118, 'Tasneem Jan', 'female', '2000-08-26', 24, 'single', 'United Kingdom', 'Birmingham', 'British', 'bachelors', 'Journalist', 'practicing', 'moderate', 'JazakAllah for reading this. I am a journalist who believes in truth and purpose. I love to write, cook, and travel. Looking for someone sincere and ambitious.', '[\"Journalism\",\"Writing\",\"Travel\",\"Cooking\",\"Photography\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 20:53:18', '[\"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop\"]', 'Jan Sahib', '+447700200018', 'jan@gmail.com', 'Father', 1, '+447700100018', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(67, 19, 119, 'Bushra Nawaz', 'female', '1998-01-07', 26, 'single', 'United Kingdom', 'Liverpool', 'Pakistani', 'masters', 'Architect', 'very_practicing', 'conservative', 'SubhanAllah, I design buildings and dream of building a righteous family. I am an architect who values creativity, faith, and community. Looking for my partner.', '[\"Architecture\",\"Design\",\"Quran\",\"Hiking\",\"Cooking\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:35:18', '[\"https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop\"]', 'Nawaz Sahib', '+447700200019', 'nawaz@gmail.com', 'Father', 1, '+447700100019', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(68, 20, 120, 'Rabia Anwar', 'female', '1995-06-30', 29, 'divorced', 'United Kingdom', 'Edinburgh', 'British', 'masters', 'Financial Analyst', 'practicing', 'moderate', 'Alhamdulillah for second chances. I am a financial analyst, strong in faith and in character. Looking for a mature, understanding man ready to build something real.', '[\"Finance\",\"Cooking\",\"Travel\",\"Reading\",\"Charity\"]', 'single', 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 18:53:18', '[\"https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop\"]', 'Anwar Sahib', '+447700200020', 'anwar@gmail.com', 'Brother', 1, '+447700100020', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(69, 21, 121, 'Omar Khan', 'male', '1995-04-12', 29, 'single', 'United Kingdom', 'London', 'Pakistani', 'masters', 'Software Engineer', 'very_practicing', 'conservative', 'Assalamu Alaikum! Software engineer by profession, Muslim by identity. I love technology, football, and spending time with family. Seeking a pious, caring wife.', '[\"Technology\",\"Football\",\"Quran\",\"Cooking\",\"Travel\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:48:18', '[\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop\"]', 'Khan Senior', '+447700200021', 'ksenior@gmail.com', 'Father', 1, '+447700100021', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(70, 22, 122, 'Ali Hassan', 'male', '1997-09-18', 27, 'single', 'United Kingdom', 'Manchester', 'British', 'bachelors', 'Doctor', 'practicing', 'moderate', 'JazakAllah for visiting. I am a junior doctor who values family, faith, and fun. I enjoy hiking, reading Seerah, and cooking. Looking for a kind and practicing wife.', '[\"Medicine\",\"Hiking\",\"Seerah\",\"Cooking\",\"Fitness\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 23:53:18', '[\"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop\"]', 'Hassan Ali', '+447700200022', 'hali@gmail.com', 'Father', 1, '+447700100022', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(71, 23, 123, 'Yusuf Malik', 'male', '1994-02-25', 30, 'single', 'United Kingdom', 'Birmingham', 'Pakistani', 'masters', 'Lawyer', 'very_practicing', 'conservative', 'Bismillah. A lawyer who believes justice starts at home. I am well-settled, family-oriented, and deeply committed to my deen. Looking for a practising Muslim wife.', '[\"Law\",\"Reading\",\"Islamic Studies\",\"Travel\",\"Football\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:43:18', '[\"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=600&fit=crop\"]', 'Malik Sahib', '+447700200023', 'msahib@gmail.com', 'Father', 1, '+447700100023', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(72, 24, 124, 'Ibrahim Shah', 'male', '1999-07-07', 25, 'single', 'United Kingdom', 'Leeds', 'British', 'bachelors', 'Accountant', 'practicing', 'moderate', 'Alhamdulillah for this opportunity. I am a young accountant with big dreams. I love sports, cooking, and volunteering. Looking for a wife who shares my values.', '[\"Finance\",\"Sports\",\"Cooking\",\"Volunteering\",\"Reading\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 01:53:18', '[\"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&h=600&fit=crop\"]', 'Shah Sahib', '+447700200024', 'ssahib@gmail.com', 'Father', 1, '+447700100024', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(73, 25, 125, 'Adam Ahmed', 'male', '1996-11-30', 28, 'single', 'United Kingdom', 'London', 'Pakistani', 'phd', 'University Lecturer', 'very_practicing', 'conservative', 'SubhanAllah, seeking knowledge never ends. I teach Islamic studies and love outdoor sports. Looking for an educated, practicing wife to build a blessed home with.', '[\"Islamic Studies\",\"Sports\",\"Research\",\"Travel\",\"Cooking\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:33:18', '[\"https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop\"]', 'Ahmed Sahib', '+447700200025', 'asahib@gmail.com', 'Father', 1, '+447700100025', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(74, 26, 126, 'Bilal Qureshi', 'male', '1998-05-14', 26, 'single', 'United Kingdom', 'Sheffield', 'British', 'bachelors', 'Civil Engineer', 'practicing', 'moderate', 'MashAllah, I build bridges and want to build a family. Civil engineer who loves cricket, cooking, and community work. Looking for a kind and warm-hearted wife.', '[\"Engineering\",\"Cricket\",\"Cooking\",\"Community\",\"Travel\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-19 07:48:03', '2026-03-19 07:48:03', '[\"https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=600&fit=crop\"]', 'Qureshi Senior', '+447700200026', 'qsenior@gmail.com', 'Father', 1, '+447700100026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(75, 27, 127, 'Zaid Hussain', 'male', '1993-08-22', 31, 'divorced', 'United Kingdom', 'Liverpool', 'Pakistani', 'masters', 'Pharmacist', 'very_practicing', 'conservative', 'Alhamdulillah, I have learned patience through lifes tests. I am a pharmacist who values honesty and piety above all. Looking for a mature, understanding wife.', '[\"Pharmacy\",\"Reading\",\"Quran\",\"Fitness\",\"Cooking\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:38:18', '[\"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop\"]', 'Hussain Senior', '+447700200027', 'hsenior@gmail.com', 'Father', 1, '+447700100027', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(76, 28, 128, 'Hamza Ali', 'male', '2000-01-05', 24, 'single', 'United Kingdom', 'Bristol', 'British', 'bachelors', 'IT Consultant', 'moderately_practicing', 'moderate', 'Bismillah, technology shapes our world. I am an IT consultant who enjoys gaming, cooking, and volunteering at the masjid. Seeking a fun, family-oriented wife.', '[\"Technology\",\"Gaming\",\"Cooking\",\"Masjid\",\"Football\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-06 01:53:18', '[\"https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop\"]', 'Ali Senior', '+447700200028', 'alisen@gmail.com', 'Father', 1, '+447700100028', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(77, 29, 129, 'Tariq Noor', 'male', '1995-10-19', 29, 'single', 'United Kingdom', 'Edinburgh', 'Pakistani', 'masters', 'Business Analyst', 'very_practicing', 'conservative', 'JazakAllah for reading. I am a business analyst who is ambitious, family-oriented, and deeply rooted in my faith. I enjoy travel, sports, and Islamic podcasts.', '[\"Business\",\"Travel\",\"Sports\",\"Islamic Podcasts\",\"Cooking\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:23:18', '[\"https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop\"]', 'Noor Senior', '+447700200029', 'nsenior@gmail.com', 'Father', 1, '+447700100029', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(78, 30, 130, 'Saad Butt', 'male', '1997-03-28', 27, 'single', 'United Kingdom', 'London', 'British', 'bachelors', 'Graphic Designer', 'practicing', 'moderate', 'Assalamu Alaikum! Creative and calm, I design brands and dream of a loving family. I cook, play football, and volunteer. Looking for a caring and God-fearing wife.', '[\"Design\",\"Football\",\"Cooking\",\"Volunteering\",\"Photography\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 21:53:18', '[\"https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop\"]', 'Butt Senior', '+447700200030', 'bsenior@gmail.com', 'Father', 1, '+447700100030', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(79, 31, 131, 'Usman Raza', 'male', '1994-06-11', 30, 'single', 'United Kingdom', 'Birmingham', 'Pakistani', 'masters', 'Surgeon', 'very_practicing', 'conservative', 'SubhanAllah, I am blessed to save lives. I am a surgeon seeking a pious, educated wife who appreciates both deen and ambition. Family is everything to me.', '[\"Surgery\",\"Islamic History\",\"Travel\",\"Reading\",\"Fitness\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:45:18', '[\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop\"]', 'Raza Senior', '+447700200031', 'rsenior@gmail.com', 'Father', 1, '+447700100031', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(80, 32, 132, 'Faisal Baig', 'male', '1999-12-24', 25, 'single', 'United Kingdom', 'Manchester', 'British', 'bachelors', 'Nurse', 'practicing', 'moderate', 'Alhamdulillah I chose a caring profession. I am a male nurse who loves football, cooking, and spending time with family. Seeking a warm and practicing wife.', '[\"Healthcare\",\"Football\",\"Cooking\",\"Family\",\"Travel\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 19:53:18', '[\"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=600&fit=crop\"]', 'Baig Senior', '+447700200032', 'baigsn@gmail.com', 'Father', 1, '+447700100032', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(81, 33, 133, 'Hassan Iqbal', 'male', '1996-04-03', 28, 'single', 'United Kingdom', 'Leeds', 'Pakistani', 'masters', 'Data Scientist', 'very_practicing', 'conservative', 'Bismillah, data tells stories and I love mine. Data scientist who prays 5 times, loves cricket, and cooks well. Seeking a pious and educated Muslim wife.', '[\"Data Science\",\"Cricket\",\"Cooking\",\"Quran\",\"Fitness\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:08:18', '[\"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop\"]', 'Iqbal Senior', '+447700200033', 'iqbalsr@gmail.com', 'Father', 1, '+447700100033', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(82, 34, 134, 'Danish Mirza', 'male', '1993-10-16', 31, 'divorced', 'United Kingdom', 'Sheffield', 'British', 'phd', 'Researcher', 'practicing', 'moderate', 'MashAllah, my research shapes the future. I am a widowed researcher looking for a second chance at love. I value honesty, patience, and a strong connection to Allah.', '[\"Research\",\"Reading\",\"Travel\",\"Cooking\",\"Sports\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 00:53:18', '[\"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&h=600&fit=crop\"]', 'Mirza Senior', '+447700200034', 'mirzasr@gmail.com', 'Father', 1, '+447700100034', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(83, 35, 135, 'Kamran Jan', 'male', '1998-07-29', 26, 'single', 'United Kingdom', 'Bristol', 'Pakistani', 'bachelors', 'Marketing Manager', 'moderately_practicing', 'moderate', 'Assalamu Alaikum! Marketing manager, cricket enthusiast, and decent cook. I am looking for a fun, caring, and God-conscious wife to build a happy home with.', '[\"Marketing\",\"Cricket\",\"Cooking\",\"Gaming\",\"Travel\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:28:18', '[\"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop\"]', 'Jan Senior', '+447700200035', 'jansr@gmail.com', 'Father', 1, '+447700100035', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(84, 36, 136, 'Imran Chaudry', 'male', '1995-02-08', 29, 'single', 'United Kingdom', 'Liverpool', 'British', 'masters', 'Architect', 'very_practicing', 'conservative', 'JazakAllah, architecture is my art and Islam is my foundation. I design beautiful spaces and hope to design a beautiful life. Seeking a practicing and ambitious wife.', '[\"Architecture\",\"Design\",\"Quran\",\"Travel\",\"Football\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-05 01:53:18', '[\"https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=600&fit=crop\"]', 'Chaudry Senior', '+447700200036', 'chaudrys@gmail.com', 'Father', 1, '+447700100036', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(85, 37, 137, 'Raheel Nawaz', 'male', '1997-05-21', 27, 'single', 'United Kingdom', 'Edinburgh', 'Pakistani', 'bachelors', 'Teacher', 'practicing', 'moderate', 'SubhanAllah, teaching is a sadaqah jariyah. I am a secondary school teacher who loves outdoor adventures and cooking. Looking for a kind and faith-driven wife.', '[\"Teaching\",\"Hiking\",\"Cooking\",\"Reading\",\"Community\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:41:18', '[\"https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop\"]', 'Nawaz Senior', '+447700200037', 'nawazsr@gmail.com', 'Father', 1, '+447700100037', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(86, 38, 138, 'Junaid Anwar', 'male', '2000-09-04', 24, 'single', 'United Kingdom', 'London', 'British', 'bachelors', 'Financial Analyst', 'moderately_practicing', 'moderate', 'Alhamdulillah, numbers are my thing. I am a young financial analyst who is ambitious and funny. I love food, travel, and sports. Looking for a supportive life partner.', '[\"Finance\",\"Travel\",\"Sports\",\"Cooking\",\"Photography\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 20:53:18', '[\"https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop\"]', 'Anwar Senior', '+447700200038', 'anwarsr@gmail.com', 'Father', 1, '+447700100038', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(87, 39, 139, 'Waseem Siddiq', 'male', '1996-01-17', 28, 'single', 'United Kingdom', 'Birmingham', 'Pakistani', 'masters', 'Physiotherapist', 'very_practicing', 'conservative', 'Bismillah, health is wealth. I am a physiotherapist passionate about wellbeing and Islam. I enjoy cooking, reading Seerah, and volunteering. Seeking a pious wife.', '[\"Physiotherapy\",\"Seerah\",\"Cooking\",\"Fitness\",\"Charity\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-08 01:35:18', '[\"https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&h=600&fit=crop\"]', 'Siddiq Senior', '+447700200039', 'siddiqsr@gmail.com', 'Father', 1, '+447700100039', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL),
(88, 40, 140, 'Noman Omar', 'male', '1994-11-09', 30, 'single', 'United Kingdom', 'Manchester', 'British', 'phd', 'Psychologist', 'practicing', 'moderate', 'JazakAllah. I am a psychologist who believes in self-growth and community. I enjoy cooking, hiking, and Islamic philosophy. Seeking a warm, educated, and pious wife.', '[\"Psychology\",\"Hiking\",\"Cooking\",\"Philosophy\",\"Travel\"]', NULL, 0, '2026-03-08 01:53:18', '2026-03-08 01:56:05', '2026-03-07 18:53:18', '[\"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop\",\"https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop\"]', 'Omar Senior', '+447700200040', 'omarsr@gmail.com', 'Father', 1, '+447700100040', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL);

--
-- Triggers `Profiles`
--
DELIMITER $$
CREATE TRIGGER `after_profile_insert` AFTER INSERT ON `Profiles` FOR EACH ROW BEGIN
  INSERT INTO `Prefs` (`profile_id`) VALUES (NEW.id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `SequelizeMeta`
--

CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `SequelizeMeta`
--

INSERT INTO `SequelizeMeta` (`name`) VALUES
('20260210172011-create-user.js'),
('20260210172223-create-profile.js'),
('20260210172342-create-otp.js'),
('20260210172420-create-message.js'),
('20260210172529-create-match.js'),
('20260210172647-create-interest.js'),
('20260210172725-create-guardian.js'),
('20260218002951-add_missing_user_flags.js'),
('20260218003219-add_missing_interest_fields.js'),
('20260218003524-create_dislikes_table.js'),
('20260218004925-edit_existing_tables.js'),
('20260218005257-edit_existing_tables.js'),
('20260218010238-create_guardians_table.js'),
('20260218011742-create_dislikes_table.js'),
('20260218012022-create_matches_table.js'),
('20260218012248-create_messages_table.js'),
('20260218012309-create_messages_table.js'),
('20260218013231-create_otps_table.js'),
('20260218014155-create-profiles.js'),
('20260218015716-update-users-table.js'),
('20260226023822-create-guardians.js'),
('20260226023907-create-profiles.js');

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` bigint(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('individual','guardian','admin') NOT NULL,
  `is_online` tinyint(1) NOT NULL DEFAULT 0,
  `is_suspended` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_premium` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `email`, `mobile`, `password_hash`, `role`, `is_online`, `is_suspended`, `is_deleted`, `is_verified`, `is_premium`, `created_at`, `updated_at`) VALUES
(1, 'aisha.khan@gmail.com', '+447700100001', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(2, 'fatima.ali@gmail.com', '+447700100002', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(3, 'zara.mahmood@gmail.com', '+447700100003', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(4, 'noor.hussain@gmail.com', '+447700100004', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 0, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(5, 'sara.ahmed@gmail.com', '+447700100005', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(6, 'hana.malik@gmail.com', '+447700100006', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(7, 'maryam.shah@gmail.com', '+447700100007', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(8, 'layla.qureshi@gmail.com', '+447700100008', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 0, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(9, 'amira.siddiq@gmail.com', '+447700100009', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(10, 'ruqayyah.omar@gmail.com', '+447700100010', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(11, 'khadija.naz@gmail.com', '+447700100011', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(12, 'sumaya.iqbal@gmail.com', '+447700100012', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 0, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(13, 'hafsa.raza@gmail.com', '+447700100013', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(14, 'asma.baig@gmail.com', '+447700100014', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(15, 'sadia.chaudry@gmail.com', '+447700100015', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(16, 'naila.butt@gmail.com', '+447700100016', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 0, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(17, 'inaya.mirza@gmail.com', '+447700100017', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(18, 'tasneem.jan@gmail.com', '+447700100018', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(19, 'bushra.nawaz@gmail.com', '+447700100019', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(20, 'rabia.anwar@gmail.com', '+447700100020', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(21, 'omar.khan@gmail.com', '+447700100021', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(22, 'ali.hassan@gmail.com', '+447700100022', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(23, 'yusuf.malik@gmail.com', '+447700100023', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(24, 'ibrahim.shah@gmail.com', '+447700100024', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 0, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(25, 'adam.ahmed@gmail.com', '+447700100025', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(26, 'bilal.qureshi@gmail.com', '+447700100026', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(27, 'zaid.hussain@gmail.com', '+447700100027', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(28, 'hamza.ali@gmail.com', '+447700100028', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 0, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(29, 'tariq.noor@gmail.com', '+447700100029', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(30, 'saad.butt@gmail.com', '+447700100030', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(31, 'usman.raza@gmail.com', '+447700100031', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(32, 'faisal.baig@gmail.com', '+447700100032', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 0, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(33, 'hassan.iqbal@gmail.com', '+447700100033', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(34, 'danish.mirza@gmail.com', '+447700100034', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(35, 'kamran.jan@gmail.com', '+447700100035', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(36, 'imran.chaudry@gmail.com', '+447700100036', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 0, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(37, 'raheel.nawaz@gmail.com', '+447700100037', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(38, 'junaid.anwar@gmail.com', '+447700100038', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(39, 'waseem.siddiq@gmail.com', '+447700100039', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 1, 0, 0, 1, 0, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(40, 'noman.omar@gmail.com', '+447700100040', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 1, 1, '2026-03-08 01:49:08', '2026-03-08 01:49:08'),
(60, 'waqarcoding@gmail.com', '03001234567', '$2b$10$LkRWeIF/f/dnEev8hAgSpubNG4usEfD24lISlZbc7JkBXu2w8w/E2', 'individual', 0, 0, 0, 0, 0, '2026-02-26 20:14:28', '2026-04-15 01:30:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Dislikes`
--
ALTER TABLE `Dislikes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_target_dislike` (`user_id`,`target_user_id`),
  ADD KEY `fk_dislikes_target_user` (`target_user_id`);

--
-- Indexes for table `Guardians`
--
ALTER TABLE `Guardians`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_individual_guardian` (`individual_id`,`guardian_id`),
  ADD KEY `fk_guardians_guardian` (`guardian_id`);

--
-- Indexes for table `Interests`
--
ALTER TABLE `Interests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_from_user` (`from_user`),
  ADD KEY `fk_to_user` (`to_user`);

--
-- Indexes for table `Matches`
--
ALTER TABLE `Matches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_match_pair` (`user1`,`user2`),
  ADD UNIQUE KEY `unique_match` (`user1`,`user2`),
  ADD KEY `fk_matches_user2` (`user2`),
  ADD KEY `interest_id` (`interest_id`);

--
-- Indexes for table `Messages`
--
ALTER TABLE `Messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_messages_sender` (`sender_id`),
  ADD KEY `fk_messages_receiver` (`receiver_id`),
  ADD KEY `fk_messages_interest` (`interest_id`);

--
-- Indexes for table `Otps`
--
ALTER TABLE `Otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_otps_user` (`user_id`);

--
-- Indexes for table `Prefs`
--
ALTER TABLE `Prefs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `profile_id` (`individual_id`);

--
-- Indexes for table `Profiles`
--
ALTER TABLE `Profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_profiles_individual` (`individual_id`),
  ADD KEY `fk_profiles_guardian` (`guardian_id`);

--
-- Indexes for table `SequelizeMeta`
--
ALTER TABLE `SequelizeMeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `mobile` (`mobile`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Dislikes`
--
ALTER TABLE `Dislikes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `Guardians`
--
ALTER TABLE `Guardians`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `Interests`
--
ALTER TABLE `Interests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=205;

--
-- AUTO_INCREMENT for table `Matches`
--
ALTER TABLE `Matches`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `Messages`
--
ALTER TABLE `Messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=167;

--
-- AUTO_INCREMENT for table `Otps`
--
ALTER TABLE `Otps`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=153;

--
-- AUTO_INCREMENT for table `Prefs`
--
ALTER TABLE `Prefs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Profiles`
--
ALTER TABLE `Profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Dislikes`
--
ALTER TABLE `Dislikes`
  ADD CONSTRAINT `fk_dislikes_target_user` FOREIGN KEY (`target_user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dislikes_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Guardians`
--
ALTER TABLE `Guardians`
  ADD CONSTRAINT `fk_guardians_guardian` FOREIGN KEY (`guardian_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_guardians_individual` FOREIGN KEY (`individual_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Interests`
--
ALTER TABLE `Interests`
  ADD CONSTRAINT `fk_from_user` FOREIGN KEY (`from_user`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_to_user` FOREIGN KEY (`to_user`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Matches`
--
ALTER TABLE `Matches`
  ADD CONSTRAINT `fk_match_interest` FOREIGN KEY (`interest_id`) REFERENCES `Interests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_matches_user1` FOREIGN KEY (`user1`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_matches_user2` FOREIGN KEY (`user2`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Messages`
--
ALTER TABLE `Messages`
  ADD CONSTRAINT `fk_messages_interest` FOREIGN KEY (`interest_id`) REFERENCES `Interests` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Otps`
--
ALTER TABLE `Otps`
  ADD CONSTRAINT `fk_otps_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Prefs`
--
ALTER TABLE `Prefs`
  ADD CONSTRAINT `fk_prefs_profile` FOREIGN KEY (`individual_id`) REFERENCES `Profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Profiles`
--
ALTER TABLE `Profiles`
  ADD CONSTRAINT `fk_profiles_guardian` FOREIGN KEY (`guardian_id`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_profiles_individual` FOREIGN KEY (`individual_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
