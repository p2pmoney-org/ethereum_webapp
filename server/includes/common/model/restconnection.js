/**
 * 
 */
'use strict';

class RestConnection  {
	constructor(session, rest_server_url, rest_server_api_path) {
		this.session = session;
		
		this.rest_server_url = rest_server_url;
		this.rest_server_api_path = rest_server_api_path;
	}
	
	_processResponseText(xhttp, callback) {
    	if (callback) {
	    	var jsonresponse;
	    	
	    	try {
		    	jsonresponse = JSON.parse(xhttp.responseText);
	    	}
	    	catch(e) {
	    		console.log('rest answer is not json compliant');
	    	}
	    	
	    	if (jsonresponse) {
	    		if (jsonresponse['status']) {
	    			// primus compliant
			    	if (jsonresponse['status'] == '1') {
			    		console.log('RestConnection.rest_post response is ' + JSON.stringify(jsonresponse));
			    		callback(null, jsonresponse);
			    	}
			    	else  {
			    		callback((jsonresponse['error'] ? jsonresponse['error'] : 'unknown error'), null);
			    	}
	    			
	    		}
	    		else {
	    			callback(null, jsonresponse);
	    		}
	    		
	    	}
	    	else {
	    		// copy plain text
	    		jsonresponse = xhttp.responseText;
	    		
	    		callback(null, jsonresponse);
	    	}
	    	
		    		    		
    	}
	}
	
	rest_get(resource, callback) {
		console.log("RestConnection.rest_get called for resource " + resource);
		
		var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		
		var self = this;
		var session = this.session;
	    
		var xhttp = new XMLHttpRequest();
	    
	    var rest_server_url = this.rest_server_url;
	    var rest_server_api_path = this.rest_server_api_path;
	    var resource_url = rest_server_url + rest_server_api_path + resource;
	    
	    xhttp.open("GET", resource_url, true);
	    
	    xhttp.setRequestHeader("Content-Type", "application/json");
	    xhttp.setRequestHeader("sessiontoken", session.getSessionUUID());
	    
	    xhttp.send();
	    
	    xhttp.onload = function(e) {
		    if (xhttp.status == 200) {
			    //console.log('response text is ' + xhttp.responseText);
		    	self._processResponseText(xhttp, callback);
		    }
		    else {
		    	if (callback)
		    		callback(xhttp.statusText, null);	
			}
	    	
	    };
	    
	    xhttp.onerror = function (e) {
	    	console.error('rest error is ' + xhttp.statusText);
	    	
	    	if (callback)
	    		callback(xhttp.statusText, null);	
	    };
	    
	}
	
	rest_post(resource, postdata, callback) {
		console.log("RestConnection.rest_post called for resource " + resource);
		
		var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		
		var self = this;
		var session = this.session;
	    
		var xhttp = new XMLHttpRequest();
	    
	    var rest_server_url = this.rest_server_url;
	    var rest_server_api_path = this.rest_server_api_path;
	    var resource_url = rest_server_url + rest_server_api_path + resource;
	    
	    xhttp.open("POST", resource_url, true);
	    
	    xhttp.setRequestHeader("Content-Type", "application/json");
	    xhttp.setRequestHeader("sessiontoken", session.getSessionUUID());
	    
	    xhttp.send(JSON.stringify(postdata));
	    
	    xhttp.onload = function(e) {
		    if (xhttp.status == 200) {
			    //console.log('response text is ' + xhttp.responseText);
		    	self._processResponseText(xhttp, callback);
		    }
		    else {
		    	if (callback)
		    		callback(xhttp.statusText, null);	
			}
	    	
	    };
	    
	    xhttp.onerror = function (e) {
	    	console.error('rest error is ' + xhttp.statusText);
	    	
	    	if (callback)
	    		callback(xhttp.statusText, null);	
	    };
	    
	}
}

module.exports = RestConnection;
