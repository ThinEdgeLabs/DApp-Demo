# DApp-Demo

V1 of DApp integration inside Linx Wallet

With this library (and granted access from the ThinEdgeLabs Team) the DApp will be accessable inside Linx Wallet through a in-app browser.

Make sure your DApp is scaling properly for all kinds of mobile device size. 

With this library, and while running inside of Linx Wallet, you can:

  - Easily get balance for all or for a specific token, with a total balance included
  - Request a signed transaction by sending a SigningRequest (as stated here https://kadena-io.github.io/signing-api/#definition-SigningRequest)
  - Send the user directly to the swap screen to swap to a token given by the DApp
  - Detect Linx Wallet and automatically login so the user will not have to interact and can jump right to his/her personal screen
  - Get the (active) account from the wallet

Other functionalities can be added upon request.

DApps can request a chainless transaction, where the wallet will take care of gathering the required balance on the right chain and will send the initial transaction to the blockchain once the right amount of balance is in the right chain.

By default, the wallet will only sign the transaction and return a SigningResponse (https://kadena-io.github.io/signing-api/#definition-SigningResponse)
unless the DApp set 'chainless'.
