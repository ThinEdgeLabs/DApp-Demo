import * as Linx from './linx.js'

var balances = [];

document.getElementById("btnLogOut").addEventListener("click", logout, false);

document.getElementById("btnLogIn").addEventListener("click", loadLinx, false);

document.getElementById("btnBalance").addEventListener("click", getBalance, false);

document.getElementById("btnNetwork").addEventListener("click", getNetwork, false);

document.getElementById("signTX").addEventListener("click", sendSignRequest, false);

window.onloadstart = loadLinx();

async function loadLinx() {
  // If Linx did not automatically login
  if (account == "") {
    // Manual check if there is an active connection to LinxWallet
    LinxWalletAvailable = Linx.isConnected();
    // On detection of LinxWallet
    // On loading of the page, the dapp can call requestLoging to automatically login
    if (LinxWalletAvailable) {
      await requestLogin()
      if (account == "") {
        document.getElementById("loginButton").style.display = "contents";
        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("welcomeMessage").innerHTML = `Please Login`
      }
      else {
        document.getElementById("logoutButton").style.display = "contents";
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("welcomeMessage").innerHTML = `Welcome ${account.slice(0,6)}...${account.slice(account.length - 5, account.length)}`
        document.getElementById('getBalance').innerHTML= `<button id="btnBalance" type="button" >Get Balance</button>`
      }
    }
  }
}

// Logout the user
function logout() {
  account = "";
  document.getElementById("loginButton").style.display = "contents";
  document.getElementById("logoutButton").style.display = "none";
  document.getElementById("getBalance").style.display = "none";
  document.getElementById("welcomeMessage").innerHTML = `Please Login`
}

// Request the address from LinxWallet, returns the active k: account
async function requestLogin() {
  const accountName = await Linx.getAccount()
  if (accountName != null) {
    account = accountName;
    document.getElementById("welcomeMessage").innerHTML = `Welcome ${account.slice(0,6)}...${account.slice(account.length - 5, account.length)}`
    document.getElementById("getBalance").style.display = "contents";
  }
}

// Request the wallet for balance with a list of tokens
// The response will give, for the requested token(s), or when empty all tokens with balance:
async function getBalance() {
  const tokenList = ["coin"];
  const balance = await Linx.balance(tokenList)
  if (balance != null && balance.error != null) {
    alert(balance.error);
  } else if (balance != null) {
    balances = balance;
  }
  document.getElementById("balance").innerHTML = `Total KDA Balance: ${balances[0].totalBalance}`
}

// Request the current network from the wallet
// Response will be a string of the current network name
async function getNetwork() {
  const network = await Linx.network();
  document.getElementById("network").innerHTML = `Current Network: ${network}`
}


// Function where you send the user to the swap screen to buy set token
function requestSwap() {
  Linx.swap("free.anedak")
}

// Example for chainless buy, WALLET RETURNS REQUESTKEYS
// In this example in the wallet is only 1 kda on chain 0
async function sendSignRequest() {
  const signingRequest = {
    code : `(validate-principal (read-keyset 'keyset) "${account}")`,
    data : {
      keyset : {
        keys : [account.slice(2)]
      }
    },
    caps : [{
      role: "pay gas",
      description: "pay for gas",
      cap : {
        args : [],
        name: "coin.GAS"
      }},
    ],
    nonce : Date.now().toLocaleString,
    chainId : "0",
    gasLimit: 1200,
    ttl : 600,
    sender: account,
    extraSigners : []
    }
  const request = Linx.requestData(signingRequest, "Verify Account",null, 0, "KDA", 0.0, 0.0, null, false);
  const result = await Linx.send(request, "Login to verify ownership of account")
  // Show sig hash
  if (result.error) {
    alert(result.error)
  } else {
    alert(result.hash)
  }
}

// Example for chainless buy, WALLET RETURNS REQUESTKEYS
// In this example in the wallet is only 1 kda on chain 0
function sendBuyRequest() {
  const signingRequest = {
    code : `(coin.transfer "${accountName}" "xxx" 2.0)`,
    data : {
      keyset : {
        keys : [accountName.slice(2)]
      }
    },
    caps : [{
      role: "pay gas",
      description: "pay for gas",
      cap : {
        args : [],
        name: "coin.GAS"
      }},
    {
      role: "Transfer",
      description: "Transfer KDA",
      cap : {
        name : "coin.TRANSFER",
        args : [accountName, "xxx", 2.0]
      }
    }
    ],
    nonce : Date.now().toLocaleString,
    chainId : "0",
    gasLimit: 1200,
    ttl : 600,
    sender: accountName,
    extraSigners : []
    }
  const request = Linx.requestData(signingRequest, null, 0, "coin", 2.0, 0.0, null, true);
  const result = Linx.buy(request, "Send 2 KDA as Chainless Test")
  // The result will be an object with 2 requestkeys, 1 for gathering balance and the second for the above transaction
  /**
  {
    balance_requestkeys: [],
    tx_requestkey : []
  }
  */
  alert(result);
}

// General example function to verify the wallet owns the given account
// The transaction is created in a SigningRequest format, which you can 
// create manually or through pact-api. (https://kadena-io.github.io/signing-api/#definition-SigningRequest)
async function verifyAccount(accountName) {
  const signingRequest = {
      code : `(validate-principal (read-keyset 'keyset) "${accountName}")`,
      data : {
        keyset : {
          keys : [accountName.slice(2)]
        }
      },
      caps : [{
        role: "pay gas",
        description: "no need to pay for gas on a local tx",
        cap : {
          args : [],
          name: "coin.GAS"
        }
      }],
      nonce : Date.now().toLocaleString,
      chainId : "0",
      gasLimit: 100,
      ttl : 600,
      sender: accountName,
      extraSigners : []
      }
  if (LinxWalletAvailable) {
    const request = {
      description: "Sign in to verify the account", // Description used to show to the user if it needs approval
      request : "sign", // Request command so the wallet knows what to do with the data
      data : signingRequest, // https://kadena-io.github.io/signing-api/#definition-SigningRequest
      chainless : {}, // Object where you specify which token and amount needs to be available on what chain, empty if none *
      needsApproval : false, // Let the wallet know if the user needs to manually approve **
    };
    const sig = await Linx.sign(request);
    if (sig != null && sig.error != null) {
      alert(sig.error);
    } else if (sig != null){
      // Send local request
      const result = await sendLocal(sig);
      if (result) {
        account = accountName;
        load()
      } else {
        logout();
      }
    }
  }
};

// General example function to send a local request to Chainweb without pact-api
async function sendLocal(sig) {
  const host = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/0/pact/api/v1/local`;
  const result = await fetch(host, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(sig),
    });

  if (result.ok) {
    const resJson = await result.json();
    return resJson.result.data;
  } else {
    return false;
  }
}


/*

* Chainless requests
  If you don't want to worry about the balance being in the right chain you can request
  a 'chainless' transaction.
  The wallet will then first make sure the requested balance get's on the right chain
  and once that it there, execute the transaction the DApp send.

  IF CHAINLESS IS ENABLED, THE WALLET TAKES CARE OF ALL TRANSACTIONS AND RETURNS A LIST OF REQUESTKEYS

  If 'chainless' is an empty object {}, the wallet will only sign the transaction
  and the DApp will have to send the transaction.

  Example chainless request:
  {
    token : "coin",   (string, the contract name of the token)
    destination: 1,   (integer, the chain where the final transaction takes place)
    amount: 100.0     (double / float, amount of token needed to have a successfull transaction)
  }

** Needs Approval
  If needs approval is set to false, the user will NOT BE NOTIFIED of the transaction and the wallet
  will not show a popup. You will get a signed transaction returned immediately. This can be usefull
  if you want to verify a k: account with signature for example.

  The wallet will not allow any TRANSFER capabilities.

  IF A DAPP MISUSES THIS OPTION IT WILL BE BANNED FROM LINX WALLET


*/


