CREATE TABLE IF NOT EXISTS `webapp`.`webapp_keys` (
  `KeyId` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) DEFAULT NULL,
  `KeyUUID` varchar(36) NOT NULL,
  `PrivateKey` varchar(68) DEFAULT NULL,
  PRIMARY KEY (`KeyId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
