
const linx = (...args) =>window.flutter_inappwebview.callHandler("LinxWallet", ...args) ;
const console = (...args) =>window.flutter_inappwebview.callHandler("consoleLog", ...args) ;


/**
 * @param {string} request Type of request for the wallet
 * @param {string} description Description that is shown to the user
 * @param {Object} data Dataobject that is send to the wallet, can differ per request
 * @param {bool} needsApproval Boolean if user should manually approve the request
 * @param {bool} chainless Boolean if transaction should be chainless
 */
const newRequest = function (request, description, data, needsApproval, chainless) {
  return {
    request : request,
    description : description,
    data : data,
    needsApproval : needsApproval,
    chainless : chainless
  }
}

// Requires a request as mentioned above, where data needs to consist of a SigningRequest
export async function sign(request) {
  const signRequest = await linx(request)
  return signRequest
}

export async function requestSwap(token) {
  const balanceRequest = await linx(newRequest("swap", "buy token", {token : token}, {}, false));
}

// Param is an Array of tokens, if empty returns all tokens with balance, example ["coin", "free.anedak"]
export async function balance(tokenList) {
  const balanceRequest = await linx(newRequest("balance", "get balance", {tokens : tokenList}, {}, false));
  return balanceRequest
}

// Returns active account on wallet
export async function getAccount() {
  const account = await linx(newRequest("address", "get address", {}, {}, false));
  return account;
}

// Param is a string that can be send to the wallet to log data in the wallet (debug only)
export function logs(message) {
  console(message);
}

// Checks if there is an active connection between browser and LinxWallet
export async function isConnected() {
  const result = await linx(newRequest("connected", "get address", {}, false, false))
  if (result == null ){
    return false;
  } 
  return result;
}



