-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 29, 2023 lúc 02:39 PM
-- Phiên bản máy phục vụ: 10.4.27-MariaDB
-- Phiên bản PHP: 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `chat`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cn_chat`
--

CREATE TABLE `cn_chat` (
  `id_chat` int(11) NOT NULL,
  `message` text NOT NULL,
  `user_id` int(11) NOT NULL,
  `id_group_chat` varchar(100) NOT NULL,
  `time_chat` varchar(100) NOT NULL,
  `who` varchar(200) NOT NULL,
  `img` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cn_chat`
--

INSERT INTO `cn_chat` (`id_chat`, `message`, `user_id`, `id_group_chat`, `time_chat`, `who`, `img`) VALUES
(133, 'ek', 8, 'long_lephu', '20:38 29/12/2023', 'long', ''),
(134, 'ek', 8, 'long_lephu', '20:38 29/12/2023', 'lephu', ''),
(135, 'mi ai do', 8, 'long_lephu', '20:38 29/12/2023', 'long', ''),
(136, 'mi ai do', 8, 'long_lephu', '20:38 29/12/2023', 'lephu', ''),
(137, 'hello pro', 7, 'long_lephu', '20:39 29/12/2023', 'long', ''),
(138, 'hello pro', 7, 'long_lephu', '20:39 29/12/2023', 'lephu', '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cn_friend`
--

CREATE TABLE `cn_friend` (
  `id` int(11) NOT NULL,
  `id_friend` int(11) NOT NULL,
  `id_group_chat` varchar(200) NOT NULL,
  `id_user` int(11) NOT NULL,
  `who` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cn_friend`
--

INSERT INTO `cn_friend` (`id`, `id_friend`, `id_group_chat`, `id_user`, `who`) VALUES
(17, 7, 'long_lephu', 8, 'long'),
(18, 7, 'long_lephu', 8, 'lephu');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cn_user`
--

CREATE TABLE `cn_user` (
  `id_user` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `username` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `img_profile` varchar(100) NOT NULL,
  `last_online` varchar(50) NOT NULL,
  `information` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cn_user`
--

INSERT INTO `cn_user` (`id_user`, `name`, `username`, `password`, `img_profile`, `last_online`, `information`) VALUES
(7, 'le  phu', 'lephu', '123', '/img/ak47/1703857042606517dcf364002f377701bd7d22450b29c.png', '', '?'),
(8, 'lelong', 'long', '12', '/img/ak47/1703857082701ede5bb6fdd5efe435427dab859eb81ee.jpg', '', '');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `cn_chat`
--
ALTER TABLE `cn_chat`
  ADD PRIMARY KEY (`id_chat`);

--
-- Chỉ mục cho bảng `cn_friend`
--
ALTER TABLE `cn_friend`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `cn_user`
--
ALTER TABLE `cn_user`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `cn_chat`
--
ALTER TABLE `cn_chat`
  MODIFY `id_chat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT cho bảng `cn_friend`
--
ALTER TABLE `cn_friend`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `cn_user`
--
ALTER TABLE `cn_user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
