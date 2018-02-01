/**
 * 
 */
'use strict';

class Tests {
	
	static testEthNode(global, session, artifactpath) {
		global.log('#####  TEST BEGIN  #####')

		var ethnode  = session.getEthereumNode();
		
		// wallet
		var wallet_address = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
		var wallet_password = '';
		
		var gaslimit = 4712388;
		var gasPrice = 100000000000;

		
		//
		//
		//
		
		var data = ethnode.truffle_loadArtifact(artifactpath);
		var trufflecontract = ethnode.truffle_loadContract(data);
		var contractinstance;
		
		// test new
		var owner_identifier = 'John Lennon';
		var owner_address = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
		var owner_pubkey = '0xce7edc292d7b747fab2f23584bbafaffde5c8ff17cf689969614441e0527b90015ea9fee96aed6d9c0fc2fbe0bd1883dee223b3200246ff1e21976bdbc9a0fc8';
		var owner_privkey = '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f';
		
		var ledger_name = 'Share Register';
		var ledger_description = 'Strawberry fields llc';
		
		var cocrypted_shldr_identifier = '29b88a823769';
		var cocrypted_ledger_description = '17a5948f25650d774796e4def2fa6f6ebdaa204710';

		contractinstance = ethnode.truffle_contract_new(trufflecontract,
				[owner_address, 
				owner_pubkey,
				cocrypted_shldr_identifier,
				ledger_name,
				cocrypted_ledger_description,
				{from: wallet_address, gas: gaslimit, gasPrice: gasPrice}]);
		
		var restest = ethnode.truffle_method_call(contractinstance, 'owner', []);
		global.log('restest is ' + restest);
		
		// test instantiation at address
/*		var contractaddress = '0xf25186b5081ff5ce73482ad761db0eb0d25abfbf';

		try {
			global.log('starting instantiation test');
			
			contractinstance = ethnode.truffle_contract_at(trufflecontract, contractaddress);
			var restest = ethnode.truffle_method_call(contractinstance, 'owner', []);
			global.log('restest is ' + restest);
		}
		catch(e) {
			global.log('exception in test ' + e);
			global.log(e.stack);
		}*/
		
		global.log('#####  TEST END   #####')
		
	}
	
}

module.exports = Tests;
