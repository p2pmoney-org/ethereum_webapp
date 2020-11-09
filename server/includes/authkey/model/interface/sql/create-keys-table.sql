CREATE TABLE `webapp_keys` (
  `KeyId` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) DEFAULT NULL,
  `KeyUUID` varchar(36) NOT NULL,
  `UserUUID` varchar(36) DEFAULT NULL,
  `Type` int(11) NOT NULL,
  `PrivateKey` varchar(192) DEFAULT NULL,
  `Address` varchar(44) DEFAULT NULL,
  `PublicKey` varchar(132) DEFAULT NULL,
  `RsaPublicKey` varchar(132) DEFAULT NULL,
  `Description` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`KeyId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;