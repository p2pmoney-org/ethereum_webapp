/**
 * 
 */
'use strict';


class WebappControllers {
	
	constructor(global) {
		this.global = global;
	}
	
	//
	// webapp API
	//
	webapp_getDappManifest(req, res) {
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");

		global.log("webapp_getDappManifest called for sessiontoken " + sessionuuid);
		
		var webappservice = global.getServiceInstance('ethereum_webapp');

		var jsonresult;
		
		var name = global.service_name;
		var description = 'web app for ' + global.service_name;
		var launchurl = webappservice.webapp_app_dir;
		
		jsonresult = {status: 1, name: name, description: description, launchurl: launchurl};
	  	
		res.json(jsonresult);
	}
	
	webapp_postDappManifest(req, res) {
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");

		global.log("webapp_postDappManifest called for sessiontoken " + sessionuuid);
		
		var webappservice = global.getServiceInstance('ethereum_webapp');

		var jsonresult;
		
		var postsessionuuid = req.body.sessionuuid;;
		
		var name = global.service_name;
		var description = 'web app for ' + global.service_name;
		var launchurl = webappservice.getServedDappIndexUrl() + "?=sessionuuid=" + postsessionuuid;
		
		jsonresult = {status: 1, name: name, description: description, launchurl: launchurl};
	  	
		res.json(jsonresult);
	}	

}

module.exports = WebappControllers;