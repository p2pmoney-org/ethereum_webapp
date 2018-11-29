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
		
		this.toaddress = null;
		
		this.value = 0;
		
		this.gas = 0;
		this.gasPrice = 0;
		
		this.data = null;
		this.rawdata = null;
		
		this.nonce = null;
		
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
	
	getTxJson() {
		var fromaddress = this.fromaddress;
		var toaddress = this.toaddress;
		
		var value = this.value;
		var gas = this.gas;
		var gasPrice = this.gasPrice;
		
		var txdata = (this.data ? this.data : this.rawdata);
		var nonce = this.nonce;
		
		var txjson = {from: fromaddress,
				to: toaddress,
				value: value,
				gas: gas, 
				gasPrice: gasPrice,
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
		return this.sendingaccount.isPrivateKeyValid();
	}
}

module.exports = EthereumTransaction;