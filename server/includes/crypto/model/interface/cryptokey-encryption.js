'use strict';


class CryptoKeyEncryption {
	constructor(session, cryptokey) {
		this.session = session;
		this.cryptokey = cryptokey;
	}
	
	getSessionObject() {
		return this.session;
	}
	
	getCryptoKeyObject() {
		return this.cryptokey;
	}
	
	// encryption
	getKeythereumClass() {
		return require('keythereum');
	}
	
	getEthereumJsClass() {
		var ethereumjs;
		
		ethereumjs = require('@ethereumjs/common');
		ethereumjs.Common = ethereumjs.default;
		ethereumjs.Tx = require('@ethereumjs/tx').Transaction;
		ethereumjs.Util = require('ethereumjs-util');
		ethereumjs.Wallet = require('ethereumjs-wallet').default;

		ethereumjs.Buffer = {};
		ethereumjs.Buffer.Buffer = Buffer.from;
		ethereumjs.Buffer.Buffer.from = Buffer.from;

		return ethereumjs;
	}
	
	setPrivateKey(privkey) {
		var cryptokey = this.cryptokey;
		cryptokey.private_key = privkey;
		
		var ethereumjs = this.getEthereumJsClass();
		var _private_key = cryptokey.private_key.split('x')[1];
		var _private_key_buf =  ethereumjs.Buffer.Buffer(_private_key, 'hex'); 
		
		// ECE
		if (cryptokey.public_key == null) {
			//console.log('ethereumjs is ' + JSON.stringify(ethereumjs));
			
			cryptokey.public_key = '0x' + ethereumjs.Util.privateToPublic(_private_key_buf).toString('hex');
			
			console.log('aes public key is: ' + cryptokey.public_key );
			
			if (cryptokey.address != null) {
				// remove in session
				this.session.removeCryptoKeyObject(cryptokey);
			}
			
			cryptokey.address = '0x' + ethereumjs.Util.privateToAddress(_private_key_buf).toString('hex');
			
			console.log('address is: ' + cryptokey.address);
		}
		else {
			// check public key corresponds
			var public_key = '0x' + ethereumjs.Util.privateToPublic(_private_key_buf).toString('hex');
			
			if (public_key != cryptokey.public_key) {
				// overwrite
				cryptokey.public_key = public_key;
				
				if (cryptokey.address != null) {
					// remove in session
					this.session.removeCryptoKeyObject(cryptokey);
				}
				
				cryptokey.address = '0x' + ethereumjs.Util.privateToAddress(_private_key_buf).toString('hex');
			}
		}
		
		// RSA
		if (cryptokey.rsa_public_key == null) {
			cryptokey.rsa_public_key = this.getRsaPublicKeyFromPrivateKey(cryptokey.private_key);
			
			console.log('rsa public key is: ' + cryptokey.rsa_public_key );
		}
		else {
			// check rsa public key corresponds
			var rsa_public_key = this.getRsaPublicKeyFromPrivateKey(cryptokey.private_key);
			
			if (rsa_public_key != cryptokey.rsa_public_key) {
				// overwrite
				cryptokey.rsa_public_key = rsa_public_key;
				
				if (cryptokey.address != null) {
					// remove in session
					this.session.removeCryptoKeyObject(cryptokey);
				}
			}
			
		}
	}
	
	setPublicKey(pubkey) {
		var cryptokey = this.cryptokey;

		if (cryptokey.private_key)
			throw 'you should not call directly setPublicKey if a private key has already been set';

		var ethereumjs = this.getEthereumJsClass();
		
		cryptokey.public_key = pubkey;
		
		if (cryptokey.address != null) {
			// remove in session
			this.session.removeCryptoKeyObject(cryptokey);
		}
		
		cryptokey.address = '0x' + ethereumjs.Util.publicToAddress(cryptokey.public_key).toString('hex');
	}
	
	// symmetric
	canDoAesEncryption() {
		if (this.cryptokey.private_key != null)
			return true;
		else
			return false;
	}
	
	canDoAesDecryption() {
		if (this.cryptokey.private_key != null)
			return true;
		else
			return false;
	}
	
	getAesCryptionParameters() {
		//var key = 'f06d69cdc7da0faffb1008270bca38f5';
		//var key = 'ae6ae8e5ccbfb04590405997ee2d52d2

		var key = this.cryptokey.private_key.substring(2, 34);
		//var rootiv = '6087dab2f9fdbbfaddc31a90ae6ae8e5ccbfb04590405997ee2d529735c1e6';
		var rootiv = '6087dab2f9fdbbfaddc31a90ae6ae8e5ccbfb04590405997ee2d529735c1e6aef54cde547';
		var iv = rootiv.substring(0,32);
		
		return {
			key: key,
			iv: iv,
			algo: 'aes-128-ctr'
		}
	}
	
	// symmetric encryption with the private key
	aesEncryptString(plaintext) {
		if (this.cryptokey.private_key == null)
			throw 'No private key set to encrypt string ' + plaintext;
		
		if (!plaintext)
			return plaintext;

		var keythereum = this.getKeythereumClass();
		
		/*console.log('typeof keythereum:',               (typeof keythereum));
		console.log('Object.keys(keythereum):',         Object.keys(keythereum));*/
		
		var cryptparams = this.getAesCryptionParameters();
		
		var key = cryptparams.key;
		var iv = cryptparams.iv; 
		var algo = cryptparams.algo;
		
		console.log('key is ' + key);
		console.log('iv is ' + iv);
		
		var plaintextbuf = keythereum.str2buf(plaintext, 'utf8');
		
		var ciphertext = '0x' + keythereum.encrypt(plaintextbuf, key, iv).toString('hex');//, algo);
		
		console.log('plaintext input is ' + plaintext);
		console.log('ciphertext is ' + ciphertext);
		
		var decipheredtext = this.aesDecryptString(ciphertext);
		
		console.log('deciphered text is ' + decipheredtext);
		
		
		return ciphertext;
	}
	
	aesDecryptString(cyphertext) {
		console.log('CryptoKeyEncryption.aesDecryptString called for ' + cyphertext);
		
		if (this.cryptokey.private_key == null)
			throw 'No private key set to decrypt string ' + cyphertext;
		
		if (!cyphertext)
			return cyphertext;

		var keythereum = this.getKeythereumClass();
		
		var cryptparams = this.getAesCryptionParameters();
		
		var key = cryptparams.key;
		var iv = cryptparams.iv; 
		var algo = cryptparams.algo;
		
		var cyphertextbuf = keythereum.str2buf(cyphertext.substring(2), 'hex');
		
		var plaintext = keythereum.decrypt(cyphertextbuf, key, iv).toString('utf8');
		
		console.log('plaintext is ' + plaintext);
		
		return plaintext;
	}
	
	// asymmetric encryption with the private/public key pair
	getBitcoreClass() {
		return require('bitcore');
	}
	
	
	getBitcoreEcies() {
		return require('bitcore-ecies');
	}
	
	
	canDoRsaEncryption() {
		if (this.cryptokey.rsa_public_key != null)
			return true;
		else
			return false;
	}
	
	canDoRsaDecryption() {
		if (this.cryptokey.private_key != null)
			return true;
		else
			return false;
	}
	
	getRsaWifFromPrivateKey(privatekey) {
		return privatekey.split('x')[1];
	}
	
	getRsaPublicKeyFromPrivateKey(privateKey) {
	    var bitcore = this.getBitcoreClass();

	    var wif_key = this.getRsaWifFromPrivateKey(privateKey);
		var privateKey = new bitcore.PrivateKey(wif_key);
		var rsa_public_key = '0x' + privateKey.toPublicKey().toString('hex');

		return rsa_public_key;
	}
	
	getRsaPublicKey(cryptokey) {
		if (!cryptokey)
			throw 'Null cryptokey passed to getRsaPublicKey';
		
		var rsaPubKey = cryptokey.getRsaPublicKey();
		
		if (rsaPubKey)
			return rsaPubKey;
		else {
			if (cryptokey.private_key) {
				// in case rsa public key has not been computed (should not happen)
				console.log('SHOULD NOT HAPPEN: no rsa public key, but cryptokey has a private key');
			    var bitcore = this.getBitcoreClass();

			    var cryptokeywif = this.getRsaWifFromPrivateKey(cryptokey.private_key);
				var cryptokeyPrivateKey = new bitcore.PrivateKey(cryptokeywif);
				
				return '0x' + cryptokeyPrivateKey.toPublicKey().toString('hex');
			}
			else {
				throw 'cryptokey has not private key to compute rsa public key';
			}
		}
	}
	
	rsaEncryptString(plaintext, recipientcryptokey) {
		console.log('CryptoKeyEncryption.rsaEncryptString called for ' + plaintext);
		
	    var bitcore = this.getBitcoreClass();
	    var ECIES = this.getBitcoreEcies();

	    // sender, this cryptokey
	    //var senderwif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct';
	    var senderwif = this.getRsaWifFromPrivateKey(this.cryptokey.private_key);
		var senderPrivateKey = new bitcore.PrivateKey(senderwif);
		
		// recipient
	    //var recipientwif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct';
	    //var recipientwif = this.getRsaWifFromPrivateKey(recipientcryptokey.private_key);
		//var recipientPrivateKey = new bitcore.PrivateKey(recipientwif);
		//var recipientPublicKey = recipientPrivateKey.toPublicKey();
		var rsapubkey = this.getRsaPublicKey(recipientcryptokey);
		var recipientPublicKey = new bitcore.PublicKey(rsapubkey.substring(2));

		// encryption
		var encryptor = new ECIES()
	      .privateKey(senderPrivateKey)
	      .publicKey(recipientPublicKey);

	    var encrypted = '0x' + encryptor.encrypt(plaintext).toString('hex');
	    
	    // test decrypt
	    /*var decrypted = recipientcryptokey.rsaDecryptString(encrypted, this.cryptokey);
	    
	    console.log('plaintext is ' + plaintext);
	    console.log('encrypted text is ' + encrypted);
	    console.log('decrypted text is ' + decrypted);*/

	    
	    return encrypted;
	}
	
	rsaDecryptString(cyphertext, sendercryptokey) {
		console.log('CryptoKeyEncryption.rsaDecryptString called for ' + cyphertext);
		
		var hexcypertext = cyphertext.substring(2);
		
		if (hexcypertext.length == 0)
			return '';

	    var bitcore = this.getBitcoreClass();
	    var ECIES = this.getBitcoreEcies();
		var ethereumjs = this.getEthereumJsClass();
	    
	    // sender
	    //var senderwif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct';
	    //var senderwif = this.getRsaWifFromPrivateKey(sendercryptokey.private_key);
		//var senderPrivateKey = new bitcore.PrivateKey(senderwif);
		//var senderPublicKey = senderPrivateKey.toPublicKey();
		var rsapubkey = this.getRsaPublicKey(sendercryptokey);
		var senderPublicKey = new bitcore.PublicKey(rsapubkey.substring(2));

		// recipient, this cryptokey
	    //var recipientwif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct';
	    var recipientwif = this.getRsaWifFromPrivateKey(this.cryptokey.private_key);
		var recipientPrivateKey = new bitcore.PrivateKey(recipientwif);

		var decryptor = new ECIES()
	      .privateKey(recipientPrivateKey)
	      .publicKey(senderPublicKey);
		
		//var cypherbuf = Buffer(hexcypertext, 'hex'); // deprecated
		var cypherbuf = Buffer.from(hexcypertext, 'hex');

	    var plaintext = decryptor.decrypt(cypherbuf).toString('utf8');

	    return plaintext;
	}
	
	// signature
	signString(plaintext) {
		
		console.log('creating signature for text '+ plaintext);
		
		var ethereumjs = this.getEthereumJsClass();
		
		var cryptokey_address = this.cryptokey.getAddress();
		
		//
		// signing
		//
		var plaintextbuf = ethereumjs.Buffer.Buffer(plaintext, 'utf8');

		var textHashBuffer = ethereumjs.Util.sha256(plaintextbuf);
		var texthash = textHashBuffer.toString('hex')
		
		console.log( 'text hash is: ', texthash);

		// Util signing
		var priv_key = this.cryptokey.private_key.split('x')[1];
		//var priv_key_Buffer = Buffer(priv_key, 'hex') // deprecated
		var priv_key_Buffer = Buffer.from(priv_key, 'hex');
		var util_signature =  ethereumjs.Util.ecsign(textHashBuffer, priv_key_Buffer);
		

		console.log( 'ethereumjs.Util signature is: ', util_signature);
		
		var signature = ethereumjs.Util.toRpcSig(util_signature.v, util_signature.r, util_signature.s);
		
		console.log('signature is: ', signature);
		
		console.log('CryptoKey.validateStringSignature returns ' + this.validateStringSignature(plaintext, signature));
		
		return signature; 
	}
	
	validateStringSignature(plaintext, signature) {
		if (signature) {
			var ethereumjs = this.getEthereumJsClass();
			
			var cryptokey_address = this.cryptokey.getAddress();

			var plaintextbuf = ethereumjs.Buffer.Buffer(plaintext, 'utf8');

			var textHashBuffer = ethereumjs.Util.sha256(plaintextbuf);
			var texthash = textHashBuffer.toString('hex')

			var sig = ethereumjs.Util.fromRpcSig(signature);
			
			console.log('signature is: ', signature);
			console.log('sig.r sig.s sig.v ', sig.r, sig.s, sig.v);
			
			var util_pub = ethereumjs.Util.ecrecover(textHashBuffer, sig.v, sig.r, sig.s);
			var util_recoveredAddress = '0x' + ethereumjs.Util.pubToAddress(util_pub).toString('hex');
			
			return (util_recoveredAddress === cryptokey_address);
		}
		else
			return false;
	}
	
	// utils
	isValidAddress(address) {
		var ethereumjs = this.getEthereumJsClass();
		
		if (ethereumjs.Util.isValidAddress(address)){
			return true;
		}
		else {
			throw address + ' is not a valid address!';
		}
	}

	isValidPublicKey(pubkey) {
		var ethereumjs = this.getEthereumJsClass();
		
		var pubkeystr = pubkey.substring(2); // remove leading '0x'
		//var pubkeybuf = Buffer(pubkeystr, 'hex');  // deprecated
		var pubkeybuf = Buffer.from(pubkeystr, 'hex'); 
		
		if (ethereumjs.Util.isValidPublic(pubkeybuf)){
			return true;
		}
		else {
			throw pubkey + ' is not a valid public key!';
		}
	}
	
	isValidPrivateKey(privkey) {
		var ethereumjs = this.getEthereumJsClass();
		
		var privkeystr = privkey.substring(2); // remove leading '0x'
		//var privkeybuf = Buffer(privkeystr, 'hex'); // deprecated
		var privkeybuf = Buffer.from(privkeystr, 'hex'); 
		
		if (ethereumjs.Util.isValidPrivate(privkeybuf)){
			return true;
		}
		else {
			throw privkey + ' is not a valid private key!';
		}
	}
	
	generatePrivateKey() {
		var ethereumjs = this.getEthereumJsClass();

		var cryptokeyPassword="123456";
		var key = ethereumjs.Wallet.generate(cryptokeyPassword);
		var _privKey = (key.privateKey ? key.privateKey : key._privKey);
		return '0x' + _privKey.toString('hex');		
	}

	
}

module.exports = CryptoKeyEncryption;

