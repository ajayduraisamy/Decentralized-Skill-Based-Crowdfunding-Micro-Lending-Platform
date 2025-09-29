-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2025 at 10:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `micro_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` int(11) NOT NULL,
  `borrower_id` int(11) NOT NULL,
  `lender_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `amount` decimal(18,8) NOT NULL,
  `repaid` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loans`
--

INSERT INTO `loans` (`id`, `borrower_id`, `lender_id`, `project_id`, `amount`, `repaid`, `created_at`) VALUES
(1, 3, 2, 1, 100.00000000, 1, '2025-09-27 12:12:41'),
(2, 3, 2, 1, 60.00000000, 1, '2025-09-27 12:40:27'),
(3, 3, 2, 1, 5.00000000, 1, '2025-09-27 12:42:22'),
(4, 3, 2, 1, 7.00000000, 1, '2025-09-27 12:42:30'),
(5, 3, 2, 1, 89.00000000, 0, '2025-09-27 12:43:19'),
(6, 1, 2, 2, 600.00000000, 0, '2025-09-28 07:28:24'),
(7, 3, 2, 1, 60.00000000, 0, '2025-09-28 07:30:39'),
(8, 3, 2, 1, 67.00000000, 0, '2025-09-28 07:31:12'),
(9, 3, 2, 1, 60.00000000, 0, '2025-09-28 07:31:53');

-- --------------------------------------------------------

--
-- Table structure for table `milestones`
--

CREATE TABLE `milestones` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `fund_amount` decimal(18,8) DEFAULT 0.00000000,
  `approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `milestones`
--

INSERT INTO `milestones` (`id`, `project_id`, `description`, `fund_amount`, `approved`, `created_at`) VALUES
(1, 1, 'Design Backend ', 100.00000000, 1, '2025-09-27 12:11:39'),
(2, 2, 'W e ave to build full stack mobile app', 7000.00000000, 1, '2025-09-28 06:03:13'),
(3, 1, 'Buying Components', 600.00000000, 1, '2025-09-28 06:08:36'),
(4, 1, 'Second stage', 60.00000000, 1, '2025-09-28 07:17:19'),
(5, 1, 'Website design', 600.00000000, 1, '2025-09-28 07:22:16'),
(6, 1, 'final stage', 60.00000000, 1, '2025-09-28 07:23:34'),
(7, 1, 'testing', 50.00000000, 1, '2025-09-28 07:25:27'),
(8, 2, '456', 345.00000000, 1, '2025-09-28 07:27:26'),
(9, 1, '69', 345.00000000, 0, '2025-09-28 07:27:44'),
(10, 1, '7', 4.00000000, 0, '2025-09-28 07:32:45');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `borrower_id` int(11) NOT NULL,
  `total_funded` decimal(18,8) DEFAULT 0.00000000,
  `current_milestone` varchar(250) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `borrower_id`, `total_funded`, `current_milestone`, `created_at`) VALUES
(1, 'Web Development First stage', 3, 1819.00000000, '6', '2025-09-27 12:11:17'),
(2, 'Build Mobile App', 1, 7345.00000000, '2', '2025-09-28 06:02:50'),
(3, 'hi', 3, 0.00000000, '0', '2025-09-28 07:33:29'),
(4, 'ti', 3, 0.00000000, '0', '2025-09-28 07:34:47');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `number` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('borrower','investor') NOT NULL,
  `blockchain_address` varchar(255) NOT NULL,
  `block_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `number`, `password`, `role`, `blockchain_address`, `block_hash`, `created_at`) VALUES
(1, 'Ajay', 'ajaycode@gmail.com', '7373327552', '147e7038e78fbde23e08959acc72f09a09ccc4fc4ba56d61dca73f3485fb62c9', 'borrower', '0x1b24DE19D885C6ea5F9D9E3cf3c8A1f4CD719d1A', 'a627b98bd66363d29e9ed4a118fd077fdc6e5eddcb24f10dc5aa699dd40f25cd', '2025-09-27 07:13:34'),
(2, 'Ajay', 'ajayduraisamy@gmail.com', '7373327552', '147e7038e78fbde23e08959acc72f09a09ccc4fc4ba56d61dca73f3485fb62c9', 'investor', '0x2467f19427E80Ae2f703f62f06A174cD427e8ce2', '7ff1124a2f4465c94eca2d9f7788c85e1d96e4866365e0ca71b6e4255a049a30', '2025-09-27 07:13:47'),
(3, 'test', 'test@gmail.com', '88776655', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'borrower', '0x2b8ce689E7F93940811e78fDE96FE127F4B1Ca88', '69b1338027e4d1b201aa74c19683b580280e4efed2e593940800a41497b899e6', '2025-09-27 10:49:28');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `milestones`
--
ALTER TABLE `milestones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `blockchain_address` (`blockchain_address`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `milestones`
--
ALTER TABLE `milestones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
