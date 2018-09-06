CREATE TABLE IF NOT EXISTS `webapp`.`webapp_roles` (
  `RoleId` int(11) NOT NULL,
  `RoleValue` int(11) NOT NULL,
  `RoleName` varchar(50) NOT NULL,
  PRIMARY KEY (`RoleId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;