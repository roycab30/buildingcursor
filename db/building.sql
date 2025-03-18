-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 16, 2025 at 11:59 AM
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
-- Database: `building`
--

-- --------------------------------------------------------

--
-- Table structure for table `bids`
--

CREATE TABLE `bids` (
  `bid_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `tradesperson_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `estimated_completion_date` date DEFAULT NULL,
  `status` enum('pending','accepted','rejected','withdrawn') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bids`
--

INSERT INTO `bids` (`bid_id`, `project_id`, `tradesperson_id`, `amount`, `description`, `estimated_completion_date`, `status`, `created_at`, `updated_at`) VALUES
(10, 41, 10, 0.00, NULL, NULL, 'pending', '2025-03-11 11:13:51', '2025-03-11 11:19:22');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `sender_id` bigint(20) NOT NULL,
  `receiver_id` bigint(20) NOT NULL,
  `message_text` text NOT NULL,
  `read_status` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `new_users`
--

CREATE TABLE `new_users` (
  `user_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `user_type` enum('property_owner','tradesperson','admin') NOT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `new_users`
--

INSERT INTO `new_users` (`user_id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `address`, `city`, `postal_code`, `user_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'john.smith@email.com', '12345', 'John', 'Smith', '0412345678', '123 Main Street', 'Sydney', '2000', 'property_owner', 'active', '2025-02-21 02:33:48', '2025-02-21 02:34:36'),
(2, 'sarah.jones@email.com', '12345\r\n', 'Sarah', 'Jones', '0423456789', '456 Park Road', 'Melbourne', '3000', 'tradesperson', 'active', '2025-02-21 02:33:48', '2025-02-21 02:34:48'),
(3, 'admin@buildingsite.com', '12345', 'admin', 'User', '0434567890', '789 Admin Street', 'Brisbane', '4000', 'admin', 'active', '2025-02-21 02:33:48', '2025-02-21 02:35:19');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `project_id` bigint(20) NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `budget_min` decimal(10,2) DEFAULT NULL,
  `budget_max` decimal(10,2) DEFAULT NULL,
  `location` text NOT NULL,
  `status` enum('draft','open','in_progress','completed','cancelled') DEFAULT 'draft',
  `required_completion_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`project_id`, `owner_id`, `category_id`, `title`, `description`, `budget_min`, `budget_max`, `location`, `status`, `required_completion_date`, `created_at`, `updated_at`) VALUES
(4, 2, 100, 'Reroofing at 123456', 'Reroofing', 25000.00, 35000.00, 'Wellington, NZL', 'open', '2025-03-30', '2025-02-07 10:38:33', '2025-03-11 10:28:46'),
(38, 1, 1, 'Bathroom Renovation', 'Complete remodel of master bathroom including new fixtures', 8000.00, 12000.00, '123 Main St, Sydney', 'open', '2024-06-15', '2025-02-21 03:23:04', '2025-03-11 13:10:54'),
(39, 4, 2, 'Kitchen Rewiring', 'Update electrical system in kitchen, add new outlets', 3000.00, 5000.00, '456 Park Ave, Melbourne', 'open', '2024-05-20', '2025-02-21 03:23:04', '2025-03-11 12:44:58'),
(40, 2, 3, 'Deck Construction', 'Build new 20x15 wooden deck with stairs', 6000.00, 9000.00, '789 Beach Rd, Brisbane', 'open', '2024-07-01', '2025-02-21 03:23:04', '2025-02-21 03:23:04'),
(41, 2, 100, 'Roof Repair', 'Fix leaking roof and replace damaged tiles', 4000.00, 7000.00, '321 Hill St, Perth', 'open', '2024-05-30', '2025-02-21 03:23:04', '2025-03-11 11:20:12'),
(42, 100, 2, 'Home Security System', 'Install comprehensive security system with cameras', 2500.00, 4500.00, '654 Valley Rd, Adelaide', 'open', '2024-06-10', '2025-02-21 03:23:04', '2025-03-11 12:47:00'),
(43, 100, 3, 'Garden Landscaping', 'Complete backyard redesign with irrigation system', 7000.00, 10000.00, '987 River St, Hobart', 'open', '2024-07-15', '2025-02-21 03:23:04', '2025-02-21 09:32:09'),
(44, 200, 1, 'Window Replacement', 'Replace all windows with energy-efficient models', 9000.00, 15000.00, '147 Oak Ave, Darwin', 'open', '2024-08-01', '2025-02-21 03:23:04', '2025-03-11 12:45:22'),
(45, 2, 2, 'Basement Waterproofing', 'Waterproof basement and install drainage system', 5000.00, 8000.00, '258 Pine St, Canberra', 'open', '2024-06-30', '2025-02-21 03:23:04', '2025-02-21 03:23:04'),
(46, 1001, 3, 'Solar Panel Installation', 'Install 5kW solar system with battery storage', 10000.00, 18000.00, '369 Sun Rd, Gold Coast', 'open', '2024-07-30', '2025-02-21 03:23:04', '2025-03-11 12:47:17'),
(47, 2, 100, 'Roofing', 'asdfa', 30000.00, 35000.00, 'Wellington, NZL', 'open', '2025-03-15', '2025-02-21 09:30:22', '2025-03-11 11:29:02'),
(48, 1, 100, 'leak Fix at 296', '', 10000.00, 15000.00, 'Wellington, NZL', 'open', '2025-03-15', '2025-03-11 11:27:21', '2025-03-11 13:11:16'),
(49, 100, 200, 'fence', 'make fence', 1000.00, 2000.00, 'auckland', 'open', '2025-03-15', '2025-03-13 10:53:21', '2025-03-13 10:53:21');

-- --------------------------------------------------------

--
-- Table structure for table `project_attachments`
--

CREATE TABLE `project_attachments` (
  `attachment_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_path` text NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `subscription_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `plan_type` enum('free','premium','professional') DEFAULT 'free',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','cancelled','expired') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tradesperson_categories`
--

CREATE TABLE `tradesperson_categories` (
  `tradesperson_id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tradesperson_profiles`
--

CREATE TABLE `tradesperson_profiles` (
  `profile_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `business_number` varchar(50) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `insurance_info` text DEFAULT NULL,
  `years_experience` int(11) DEFAULT NULL,
  `service_radius` int(11) DEFAULT NULL,
  `availability_status` enum('available','busy','unavailable') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tradesperson_profiles`
--

INSERT INTO `tradesperson_profiles` (`profile_id`, `user_id`, `business_name`, `business_number`, `license_number`, `insurance_info`, `years_experience`, `service_radius`, `availability_status`) VALUES
(10, 2, 'Roofer', '1001', 'LBP58695', 'AA Insurance', 15, 50, 'available');

-- --------------------------------------------------------

--
-- Table structure for table `trade_categories`
--

CREATE TABLE `trade_categories` (
  `category_id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trade_categories`
--

INSERT INTO `trade_categories` (`category_id`, `name`, `description`, `status`) VALUES
(1, 'Plumbing', 'All plumbing services including repairs, installations, and maintenance of water systems', 'active'),
(2, 'Electrical', 'Electrical installations, repairs, and maintenance for residential and commercial properties', 'active'),
(3, 'Carpentry', 'Woodworking, structural repairs, custom furniture, and general carpentry services', 'active'),
(100, 'Roofing', 'Re-roof', 'active'),
(200, 'Building', 'Build and Extension Room', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `payer_id` bigint(20) NOT NULL,
  `payee_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_type` enum('deposit','payment','refund','fee') NOT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `user_type` enum('property_owner','tradesperson','admin') NOT NULL DEFAULT 'property_owner',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password`, `first_name`, `last_name`, `phone`, `address`, `city`, `postal_code`, `user_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'admin@buildingsite.com', '$2b$10$pccmUSqr1ITEj7BOZgESl.3KIR2KT1XmhV41h57SEpp1OFANCHV8K', 'Admin', 'User', '0434567890', '789 Admin Street', 'Brisbane', '4000', 'admin', 'active', '2025-02-21 03:10:00', '2025-03-16 06:11:36'),
(2, 'sarah.jones@email.com', '$2b$10$pccmUSqr1ITEj7BOZgESl.3KIR2KT1XmhV41h57SEpp1OFANCHV8K', 'Sarah', 'Jones', '0423456789', '456 Park Road', 'Melbourne', '3000', 'tradesperson', 'active', '2025-02-21 03:10:00', '2025-02-21 08:47:59'),
(4, 'lito@gmail.com', '$2b$10$pccmUSqr1ITEj7BOZgESl.3KIR2KT1XmhV41h57SEpp1OFANCHV8K', 'Lito', 'Malcolm', '0423456789', 'Stokes Valley', 'Wellington', '6125', 'tradesperson', 'inactive', '2025-03-11 11:02:49', '2025-03-13 10:11:29'),
(50, 'peter@gmail.com', '$2b$10$pccmUSqr1ITEj7BOZgESl.3KIR2KT1XmhV41h57SEpp1OFANCHV8K', 'Peter', 'Holden', '2231656', NULL, NULL, NULL, 'property_owner', 'active', '2025-02-21 03:04:22', '2025-02-21 08:48:34'),
(100, 'roy@dgventures.net', '$2b$10$pccmUSqr1ITEj7BOZgESl.3KIR2KT1XmhV41h57SEpp1OFANCHV8K', 'roy', 'cabauatan', '0225692481', NULL, NULL, NULL, 'property_owner', 'active', '2025-02-21 03:04:22', '2025-02-21 08:48:52'),
(200, 'john@gmail.com', '$2b$10$pccmUSqr1ITEj7BOZgESl.3KIR2KT1XmhV41h57SEpp1OFANCHV8K', 'John', 'Clement', '2231656', NULL, NULL, NULL, 'property_owner', 'active', '2025-02-21 03:04:22', '2025-02-21 08:49:06'),
(333, 'john.smith@email.com', '$2b$10$pccmUSqr1ITEj7BOZgESl.3KIR2KT1XmhV41h57SEpp1OFANCHV8K', 'John', 'Smith', '0412345678', '123 Main Street', 'Sydney', '2000', 'property_owner', 'inactive', '2025-02-21 03:10:00', '2025-03-13 19:52:45'),
(1001, 'aziz@gmail.com', '$2b$10$pccmUSqr1ITEj7BOZgESl.3KIR2KT1XmhV41h57SEpp1OFANCHV8K', 'aziz', 'k', NULL, NULL, NULL, NULL, 'property_owner', 'active', '2025-02-21 08:19:48', '2025-02-21 08:19:48'),
(1501, 'jerome@gmail.com', '$2b$10$OM6URYJDUwdygK9lS7L3weRMw/pcyZea1Bbh2HLMazrFpPDtmOZZu', 'Jerome', 'Peters', NULL, NULL, NULL, NULL, 'tradesperson', 'active', '2025-03-11 11:50:41', '2025-03-11 11:50:41'),
(1508, 'grace@gmail.com', '$2b$10$gVQlCriOeRIsgs6miEQgc.7vPbtVQDm2.cIc4YI35ABDB9nGrRgIG', 'grace', 'peters', NULL, NULL, NULL, NULL, 'tradesperson', 'active', '2025-03-13 11:54:43', '2025-03-13 11:54:43'),
(1514, 'fred@gmail.com', '$2b$10$YfuCgI.7GhdH8QgQOpfhperb99WZfmdoyHLrgp4AANvuDBYmxVUi6', 'fred', 'panopio', NULL, NULL, NULL, NULL, 'property_owner', 'active', '2025-03-16 06:14:52', '2025-03-16 06:14:52'),
(1516, 'Paulo@gmail.com', '$2b$10$KIntD/d4BQdeYj2Ixif0xeyKlDpsGMgdsOGYRMCDcdN0/UB4PMGBi', 'Paulo', 'Conto', NULL, NULL, NULL, NULL, 'property_owner', 'active', '2025-03-16 08:58:59', '2025-03-16 08:58:59'),
(1517, 'jose@gmail.com', '$2b$10$fpNvMKe0sF7lYHLflYqh5ed5nuPrUyEiS7Uj8wPJUO.cBYw.5Ja92', 'Jose', 'Casa', NULL, NULL, NULL, NULL, 'tradesperson', 'active', '2025-03-16 09:13:09', '2025-03-16 09:13:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bids`
--
ALTER TABLE `bids`
  ADD PRIMARY KEY (`bid_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `tradesperson_id` (`tradesperson_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `new_users`
--
ALTER TABLE `new_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `project_attachments`
--
ALTER TABLE `project_attachments`
  ADD PRIMARY KEY (`attachment_id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`subscription_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tradesperson_categories`
--
ALTER TABLE `tradesperson_categories`
  ADD PRIMARY KEY (`tradesperson_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `tradesperson_profiles`
--
ALTER TABLE `tradesperson_profiles`
  ADD PRIMARY KEY (`profile_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `trade_categories`
--
ALTER TABLE `trade_categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `payer_id` (`payer_id`),
  ADD KEY `payee_id` (`payee_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bids`
--
ALTER TABLE `bids`
  MODIFY `bid_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `new_users`
--
ALTER TABLE `new_users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `project_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `project_attachments`
--
ALTER TABLE `project_attachments`
  MODIFY `attachment_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `subscription_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tradesperson_profiles`
--
ALTER TABLE `tradesperson_profiles`
  MODIFY `profile_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `trade_categories`
--
ALTER TABLE `trade_categories`
  MODIFY `category_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=201;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1519;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bids`
--
ALTER TABLE `bids`
  ADD CONSTRAINT `bids_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `bids_ibfk_2` FOREIGN KEY (`tradesperson_id`) REFERENCES `tradesperson_profiles` (`profile_id`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `trade_categories` (`category_id`);

--
-- Constraints for table `project_attachments`
--
ALTER TABLE `project_attachments`
  ADD CONSTRAINT `project_attachments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `tradesperson_categories`
--
ALTER TABLE `tradesperson_categories`
  ADD CONSTRAINT `tradesperson_categories_ibfk_1` FOREIGN KEY (`tradesperson_id`) REFERENCES `tradesperson_profiles` (`profile_id`),
  ADD CONSTRAINT `tradesperson_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `trade_categories` (`category_id`);

--
-- Constraints for table `tradesperson_profiles`
--
ALTER TABLE `tradesperson_profiles`
  ADD CONSTRAINT `tradesperson_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`),
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`payer_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`payee_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
