/**
 * 
 */
'use strict';


class CryptoKey {
	constructor() {
		this.keyuuid = null;
		
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
	
	generatePrivateKey() {
		this.private_key = "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f";
	}

}


module.exports = CryptoKey;
