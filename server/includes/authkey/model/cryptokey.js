/**
 * 
 */
'use strict';


class CryptoKey {
	static get ENCRYPTION_KEY() { return 0;}
	static get TRANSACTION_KEY() { return 1;}
	static get DEACTIVATED_ENCRYPTION_KEY() { return -10;}
	static get DEACTIVATED_TRANSACTION_KEY() { return -11;}

	constructor() {
		this.keyuuid = null;
		
		this.useruuid = null;

		this.type = null;
		
		this.address = null;
		this.public_key = null;
		this.private_key = null;
		this.rsa_public_key = null;
		
		this.description = null;
	}
	
	getKeyUUID() {
		return this.keyuuid;
	}
	
	setKeyUUID(uuid) {
		this.keyuuid = uuid;
	}
	
	getUserUUID() {
		return this.useruuid;
	}
	
	setUserUUID(useruuid) {
		this.useruuid = useruuid;
	}
	
	getType() {
		return this.type;
	}
	
	setType(type) {
		this.type = type;
	}
	
	getAddress() {
		return this.address;
	}
	
	setAddress(address) {
		this.address = (address ? address.trim().toLowerCase() : address);
	}
	
	getPublicKey() {
		return this.public_key;
	}
	
	setPublicKey(publickey) {
		this.public_key = (publickey ? publickey.trim().toLowerCase() : publickey);
	}
	
	getPrivateKey() {
		return this.private_key;
	}
	
	setPrivateKey(privkey) {
		this.private_key = (privkey ? privkey.trim().toLowerCase() : privkey);
	}
	
	getRsaPublicKey() {
		return this.rsa_public_key;
	}
	
	setRsaPublicKey(publickey) {
		this.rsa_public_key = (publickey ? publickey.trim().toLowerCase() : publickey);
	}
	
	getDescription() {
		return this.description;
	}
	
	setDescription(description) {
		this.description = description;
	}
	
	generatePrivateKey(session) {
		if (!session)
			throw "no session passed in argument";

		var global = session.getGlobalInstance();
		var cryptoservice = global.getServiceInstance('crypto');
		var cryptoserverinstance = cryptoservice.getCryptoServerInstance();
		
		this.private_key = cryptoserverinstance.generatePrivateKey(session);
	}

}


module.exports = CryptoKey;
