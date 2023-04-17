/**
 * 
 */
'use strict';

class CryptoKey {
	constructor(session, address) {
		this.session = session;
		this.address = (address ? address.trim().toLowerCase() : address);

		const CryptoKeyEncryption = require('./interface/cryptokey-encryption.js');
		
		this.cryptoencryption = new CryptoKeyEncryption(session, this);
	}

	getAddress() {
		if (this.address)
			return this.address;
	}

	setAddress(address) {
		if (!this.areAddressesEqual(this.address, address)) {
			this.address = (address ? address.trim().toLowerCase() : address);
			
			this.private_key = null;
			this.public_key = null; // ECE public key
			this.rsa_public_key = null; // asymmetric
		}
	}

	getPrivateKey() {
		return this.private_key;
	}
	
	setPrivateKey(privkey) {
		this.private_key = (privkey ? privkey.trim().toLowerCase() : privkey);
		
		this.cryptoencryption.setPrivateKey(this.private_key);
	}
	
	isPrivateKeyValid() {
		if (!this.private_key)
			return false;

		return this.cryptoencryption.isValidPrivateKey(this.private_key);
	}
}
class CryptoServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
	}
	
	_test_generatePrivateKey(session) {
		// test calling common module in session's client-container
		var global = this.global;
		
		if (!session)
			throw 'no session object passed in argument';
		
		var clicontservice = global.getServiceInstance('client-container');
		var clicontainer = clicontservice.getClientContainer(session);
		
		var commonmodule = clicontainer.getModuleObject('common');
		var session = commonmodule.getSessionObject();
		
		var privatekey = session.generatePrivateKey();
		
		return privatekey;
	}
	
	generatePrivateKey(session) {
		var global = this.global;
		
		if (!session)
			throw 'no session object passed in argument';
		
		//return this._test_generatePrivateKey(session);
		
		var CryptoKeyEncryption = require('./interface/cryptokey-encryption.js');
		
		var cryptokey = [];
		var cryptokeyencryptionobject = new CryptoKeyEncryption(session, cryptokey);
		
		var privatekey = cryptokeyencryptionobject.generatePrivateKey();
		
		return privatekey;
	}
	
	_test_getPublicKeys(session, privatekey) {
		// test calling common module in session's client-container
		var global = this.global;
		
		if (!session)
			throw 'no session object passed in argument';
		
		var serversession = session;
		
		var private_key = (privatekey ? privatekey : this.generatePrivateKey());
		
		var clicontservice = global.getServiceInstance('client-container');
		var clicontainer = clicontservice.getClientContainer(serversession);
		
		var commonmodule = clicontainer.getModuleObject('common');
		var clientsession = commonmodule.getSessionObject();
		
		var cryptokey = commonmodule.createBlankCryptoKeyObject();
		
		cryptokey.setPrivateKey(private_key);

		global.log('address is: ' + cryptokey.getAddress());
		
		// return every keys
		var array = [];
		
		var public_key = cryptokey.getPublicKey();
		var address = cryptokey.getAddress();
		var rsa_public_key = cryptokey.getRsaPublicKey();
		
		array['private_key'] = private_key;
		array['public_key'] = public_key;
		array['address'] = address;
		array['rsa_public_key'] = rsa_public_key;
		
		return array;
	}
	
	getPublicKeys(session, privatekey) {
		var global = this.global;
		
		if (!session)
			throw 'no session object passed in argument';

		//return this._test_getPublicKeys(session, privatekey);

		var CryptoKeyEncryption = require('./interface/cryptokey-encryption.js');
		
		var cryptokey = [];
		var cryptokeyencryptionobject = new CryptoKeyEncryption(session, cryptokey);
		
		var array = [];

		if (privatekey && cryptokeyencryptionobject.isValidPrivateKey(privatekey)) {
			
			cryptokeyencryptionobject.setPrivateKey(privatekey);
			
			// return every keys
			
			array['private_key'] = cryptokey['private_key'];
			array['public_key'] = cryptokey['public_key'];
			array['address'] = cryptokey['address'];
			array['rsa_public_key'] = cryptokey['rsa_public_key'];
		}
		
		
		return array;
		
	}
	
	isValidPrivateKey(session, privatekey) {
		
		if (!session)
			throw 'no session object passed in argument';

		var CryptoKeyEncryption = require('./interface/cryptokey-encryption.js');
		
		var cryptokey = [];
		var cryptokeyencryptionobject = new CryptoKeyEncryption(session, cryptokey);
		
		try {
			return (privatekey && cryptokeyencryptionobject.isValidPrivateKey(privatekey));
		}
		catch(e) {
			return false;
		}
	}

	getStringHash(datastring, length) {
		var crypto = require('crypto');	

		var keystring = 'gktlwsm';
	
		var hashf = 'sha256';
		var data = Buffer.from(datastring);
		var key = Buffer.from(keystring);
		
		var hmac = crypto.createHmac(hashf, key);
		hmac.update(datastring); 

		var hash_hex_str = hmac.digest('hex');


		return hash_hex_str.substring(0, length);
	}

	getCryptoKeyEncyptionObject(session, address, private_key) {
		var CryptoKeyEncryption = require('./interface/cryptokey-encryption.js');
		
		var cryptokey = new CryptoKey(session, address);

		if (private_key) {
			cryptokey.setPrivateKey(private_key);
		}

		return cryptokey.cryptoencryption;
	}


}

module.exports = CryptoServer;