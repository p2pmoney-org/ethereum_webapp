/**
 * 
 */
'use strict';


class PasswordObject {
	constructor() {
		this.clearpassword = null;
		this.hashpassword = null;
		this.salt = null;
		this.pepper = null;
		this.hashmethod = -1;
	}
	
	setClearPassword(clearpassword, salt, pepper, hashmethod) {
		this.clearpassword = clearpassword;
		this.salt = salt;
		this.pepper = pepper;
		this.hashmethod = hashmethod;
		
	}
	
	getHashedPassword() {
		if (this.hashpassword)
			return this.hashpassword;
		
		var hashpassword;
		
		switch(this.hashmethod) {
			case 0:
				hashpassword = this.clearpassword;
				break;
			default:
				throw 'hashmethod not supported';
				break;
		}
		
		this.hashpassword = hashpassword;
		
		return hashpassword;
	}
	
	equals(passwordobject) {
		if (!passwordobject)
			return false;
		
		var myhash = this.getHashedPassword();
		var otherhash = passwordobject.getHashedPassword();
		
		return (myhash == otherhash);
	}
}


module.exports = PasswordObject;
