/**
 * 
 */
'use strict';


class User {
	
	constructor() {
		this.username = null;
		this.useremail = null;
		
		this.useruuid = null;
	}
	
	getUserUUID() {
		return this.useruuid;
	}
	
	setUserUUID(useruuid) {
		this.useruuid = useruuid;
	}
	
	getUserName() {
		return this.username;
	}
	
	setUserName(username) {
		this.username = username;
	}
	
	getUserEmail() {
		return this.useremail;
	}
	
	setUserEmail(useremail) {
		this.useremail = useremail;
	}
	
	// static
	static createBlankUserInstance() {
		return new User();
	}
	
}


module.exports = User;
