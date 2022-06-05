# Lepton Client
An API wrapper for lepton. This is used by lepton itself but can also be used independently to create bots.
```js
const {Client} = require('lepton-client');
const client = new Client();
client.signIn('username', 'password');
client.once("clientUserChanged", ()=>{
	console.log("Logged In!");
})
```