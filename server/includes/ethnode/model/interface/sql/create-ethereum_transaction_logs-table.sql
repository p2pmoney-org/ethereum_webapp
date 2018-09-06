CREATE TABLE `webapp`.`webapp_ethereum_transactions_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ethereum_transaction_uuid` VARCHAR(36) NOT NULL,
  `UserId` INT NOT NULL,
  `method` VARCHAR(64) NOT NULL,
  `action` INT NOT NULL,
  `CreationDate` DATETIME NOT NULL,
  `log` TEXT NULL,
  PRIMARY KEY (`id`));