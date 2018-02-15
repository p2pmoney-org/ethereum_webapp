settings folder is used to store configuration file config.json

if you want to override default values, you can create a config.json file and change the default values show below

config.json
-----------

{
"service_name": "ethereum securities webapp",
"server_listening_port": 8000,
"route_root_path": "/api",
"web3_provider_url": "http://localhost",
"web3_provider_port": 9547,
"enable_log": 1,
"write_to_log_file":1,
 
"dapp_root_dir": "/home/frederic/home/p2pmoney-dev/usr/local/primus-ethereum-securities-dap-dev",
"rest_server_url": "http://dev1.p2pmoney.org:8280",
"rest_server_api_path": "/dapp/api"

"defaultgaslimit": "4712388",
"defaultgasprice": "100000000000"
}

1st part (up to "write_to_log_file") are value that are used on the server
2nd part (below "write_to_log_file") are values that will be used on the client or that could overload standard dapp confi

users.json
----------

[
	{
		"username": "test",
		"password": "test",
		"private_key": "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
		"public_key": "0xce7edc292d7b747fab2f23584bbafaffde5c8ff17cf689969614441e0527b90015ea9fee96aed6d9c0fc2fbe0bd1883dee223b3200246ff1e21976bdbc9a0fc8",
		"address": "0xf17f52151EbEF6C7334FAD080c5704D77216b732"
	},
	{
		"username": "frederic",
		"password": "baud",
		"private_key": "0xb955ab3558ae94985a80d55404ee76eb2a792b95f885aa98aa27959621ac5868",
		"public_key": "0xd9f6cc150dd5382ee98f25e94ee501b0807d27e6c56895cf7d04c1ef6eded0a60d3f719303ade1546a15e0168f72ec67ad37a52c981efa8af257f6b403676faf",
		"address": "0x00c737fe578b40c8ade858c7bf4c4db368d7ac90"
	}
	
]