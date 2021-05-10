/**
 * 
 */
'use strict';

class EthereumTransaction {
	constructor(session) {
		this.session = session;
		
		this.transactionuuid = null;
		this.transactionHash = null;
		
		this.fromaddress = null;
		this.fromprivatekey = null;
		
		this.toaddress = null;
		
		this.value = 0;
		
		this.gas = 0;
		this.gasPrice = 0;
		
		this.data = null;
		this.rawdata = null;
		
		this.nonce = null;
		
		this.web3providerurl = null;

		this.chainid = null;
		this.networkid = null;
	}
	
	getTransactionUUID() {
		return this.transactionuuid;
	}
	
	setTransactionUUID(txuuid) {
		this.transactionuuid = txuuid;
	}
	
	getTransactionHash() {
		return this.transactionHash;
	}
	
	setTransactionHash(txhash) {
		this.transactionHash = txhash;
	}
	
	getFromAddress() {
		return this.fromaddress;
	}
	
	setFromAddress(address) {
		this.fromaddress = address;
	}
	
	getFromPrivateKey() {
		return this.fromprivatekey;
	}
	
	setFromPrivateKey(privatekey) {
		this.fromprivatekey = privatekey;
	}
	
	getToAddress() {
		return this.toaddress;
	}
	
	setToAddress(address) {
		this.toaddress = address;
	}
	
	getValue() {
		return this.value;
	}
	
	setValue(value) {
		this.value = value;
	}
	
	getGas() {
		return this.gas;
	}
	
	setGas(gas) {
		this.gas = gas;
	}
	
	getGasPrice() {
		return this.gasPrice;
	}
	
	setGasPrice(gasprice) {
		this.gasPrice = gasprice;
	}
	
	getNonce() {
		return this.nonce;
	}
	
	setNonce(nonce) {
		this.nonce = nonce;
	}
	
	getData() {
		this.data;
	}
	
	setData(data) {
		this.data = data;
	}
	
	getWeb3ProviderUrl() {
		if (this.web3providerurl)
		return this.web3providerurl;
		
		// return default
		var global = this.session.getGlobalInstance();
		var ethnodeservice = global.getServiceInstance('ethnode');
		
		return ethnodeservice.getWeb3ProviderFullUrl();
	}
	
	setWeb3ProviderUrl(url) {
		this.web3providerurl = url;
	}
	
	getChainId() {
		return this.chainid;
	}

	setChainId(chainid) {
		this.chainid = chainid;
	}

	getNetworkId() {
		return this.networkid;
	}

	setNetworkId(networkid) {
		this.networkid = networkid;
	}

	getTxJson() {
		var fromaddress = this.fromaddress;
		var toaddress = this.toaddress;
		
		var value = this.value;
		var gas = this.gas;
		var gasPrice = this.gasPrice;
		
		var txdata = (this.data ? this.data : this.rawdata);
		var nonce = this.nonce;
		
		var chainid = this.chainid; // EIP-155 replay protection
		var networkid = this.networkid;
		
		var txjson = {from: fromaddress,
				to: toaddress,
				value: value,
				gas: gas, 
				gasPrice: gasPrice,
				chainid: chainid,
				networkid: networkid
			};
		
		if (nonce)
			txjson.nonce = nonce;
		
		if (txdata)
			txjson.data = txdata;

		return txjson;
	}
	
	setTxJson(txjson) {
		this.fromaddress = txjson.from;
		this.toaddress = txjson.to;
		
		this.value = txjson.value;
		this.gas = txjson.gas;
		this.gasPrice = txjson.gasPrice;
		
		this.data = txjson.data;
		this.nonce = txjson.nonce;
	}
	
	getRawData() {
		return this.rawdata;
	}
	
	setRawData(raw) {
		this.rawdata = raw;
	}
	
	canSignTransaction() {
		return (this.fromprivatekey != null);
	}
}

module.exports = EthereumTransaction;