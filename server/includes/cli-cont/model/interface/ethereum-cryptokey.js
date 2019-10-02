/**
 * 
 */
'use strict';


class CryptoKeyClient {
	constructor(clientcontainer) {
		this.clientcontainer = clientcontainer;
	}
	
	generatePrivateKey(serversession) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var privkey = clientsession.generatePrivateKey();		
		
		
		return privkey;
		
	}
	
	getPublicKeys(serversession, privatekey) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var account = clientsession.createBlankAccountObject();
		account.setPrivateKey(privatekey);

		
		var keys = {};
		
		keys['private_key'] = account.getPrivateKey();
		keys['public_key'] = account.getPublicKey();
		keys['address'] = account.getAddress();
		keys['rsa_public_key'] = account.getRsaPublicKey();
		
		return keys;
		
	}
	
	aesEncryptString(serversession, privatekey, plaintext) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var cryptokey = clientsession.createBlankCryptoKeyObject();
		cryptokey.setPrivateKey(privatekey);

		return cryptokey.aesEncryptString(plaintext);
		
	}
	
	aesDecryptString(serversession, privatekey, cyphertext) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var cryptokey = clientsession.createBlankCryptoKeyObject();
		cryptokey.setPrivateKey(privatekey);

		return cryptokey.aesDecryptString(cyphertext);
	}
}


module.exports = CryptoKeyClient;