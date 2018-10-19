[<img src="logo.png" alt="|||||| 6 pillars" width=50% />](https://6-pillars.ooo)

[||||||](https://6-pillars.ooo)  is a smart contract based cryptocurrency that anyone can generate and use on DApps.

日本語は[こちら](README.ja.md).

# Unique Features

* |||||| is don't have any Ownable as the contract deployer.
* Token has two data.
  * inscription : immutable uint256 parameter that can be specified when minting.
  * creator : address of token creator.
* DApps developers can set service specific data for `inscription` when minting a token.
* DApps developers can be used any token minting by other DApps, and can freely set rules to the token.
  * mainly can use `creator` and` inscription`.

# Samples

### BandStar

* WebPage - https://drip-samples.github.io/llllll-sample-bandstar/
* Github - https://github.com/drip-samples/llllll-sample-bandstar/

### Dragon

* WebPage - https://drip-samples.github.io/llllll-sample-dragons/
* Github - https://github.com/drip-samples/llllll-sample-dragons/

# Install

```
npm install llllll
```

# Usage

## development

### contract

If DApps developers create the following contract, can minting a token with contract address as `creator`.

```
pragma solidity ^0.4.24;

import "../node_modules/llllll/contracts/SixPillars.sol";

contract DappsContract {

  function mint(uint256 _inscription, address _llllll) external {
    SixPillars llllll = SixPillars(_llllll);
    llllll.mint(msg.sender, _inscription);
  }
}
```

### migration

The developer must create following truffle migration file, for deploy to local chain at development.

```
const SixPillars = artifacts.require("SixPillars");

module.exports = function(deployer) {
  deployer.deploy(SixPillars);
};
```

### test

```
const SixPillars = artifacts.require("SixPillars");
const DappsContract = artifacts.require("DappsContract");

contract('DappsContract', function(accounts) {
  let llllll
  let dappsContract
  const inscription = 1234

  describe('mint', function() {
    before(async function () {
      llllll = await SixPillars.new()
      dappsContract = await DappsContract.new()
    })

    it("success", async function() {
      await dappsContract.mint(inscription, llllll.address)
    })
  })
})
```

## deploy

Don't deploy |||||| yourself, please use `deployed/contracts/SixPillars.json`.
Contract address is as follows.

* Mainnet
  * [0x9895960B93e314ef221346Ab985b895da9a5B7d5](https://etherscan.io/address/0x9895960B93e314ef221346Ab985b895da9a5B7d5)
* Ropsten
  - [0x9895960b93e314ef221346ab985b895da9a5b7d5](https://ropsten.etherscan.io/address/0x9895960b93e314ef221346ab985b895da9a5b7d5)
* Rinkeby
  * [0x542A900357c9638AD6e944a57072c5D01f1C1Ea7](https://rinkeby.etherscan.io/address/0x542A900357c9638AD6e944a57072c5D01f1C1Ea7)
* Kovan
  * [0x542A900357c9638AD6e944a57072c5D01f1C1Ea7](https://kovan.etherscan.io/address/0x542A900357c9638AD6e944a57072c5D01f1C1Ea7)

# Reference

```
/// This emits when minted new token.
event Mint(
  address indexed _owner,
  address indexed _creator,
  uint256 _inscription,
  uint256 _tokenId
);

/// This emits when burned any token.
event Burn(
  address indexed _owner,
  address indexed _creator,
  uint256 _tokenId
);

/// This emits when set new creator of any token.
event CreatedBy(
  address indexed _creator,
  uint256 _tokenId
);

/// This emits when remove creator of any token.
event ClearCreator(
  uint256 _tokenId
);

/// This emits when the approved amount for an NFT is changed or reaffirmed.
/// and it emits after `Approval` event.
event ApprovalWithAmount(
  address indexed _owner,
  address indexed _approved,
  uint256 indexed _tokenId,
  uint256 _amount
);

/// This emits when ownership of any token changes by used amount.
/// and it emits after `Transfer` event.
event TransferWithAmount(
  address indexed _from,
  address indexed _to,
  uint256 indexed _tokenId,
  uint256 _amount
);

/// Mint new token.
///
/// emit Mint(owner, creator, inscription, tokenId)
/// Throw _to is not valid.
/// Throw new token id is already used. (please try again later)
/// @param _to Owner of new token.
/// @param _inscription immutable parameter for new token.
/// @param _isSetCreator if true, creator of new token is msg.sender. if false, creator is zero address.
function mint(address _to, uint256 _inscription, bool _isSetCreator) external;

/// Burn your token.
///
/// emit Burn(owner, creator, tokenId)
/// Throw token owner is not msg.sender.
/// @param _tokenId id of the token you want to burned.
function burn(uint256 _tokenId) external;

/// Add creator to the token
///
/// msg.sender is new creator.
/// emit CreatedBy(creator, tokenId)
/// Throw token creator is already added.
/// @param _tokenId id of the token you want add creator.
function createdBy(uint256 _tokenId) external;

/// Remove creator to the token
///
/// creator of the token will be zero address.
/// emit ClearCreator(tokenId)
/// Throw token creator is not msg.sender.
/// @param _tokenId id of the token you want remove creator.
function clearCreator(uint256 _tokenId) external;

/// Get inscription of the token.
/// @param _tokenId id of the token you get it.
/// @return uint256 inscription of the token.
function inscription(uint256 _tokenId) external view returns(uint256);

/// Get creator of the token.
/// @param _tokenId id of the token you get it.
/// @return address creator of the token.
function creator(uint256 _tokenId) external view returns(address);

/// Get block number of the token at created.
/// @param _tokenId id of the token you get it.
/// @return uint256 block number of the token at created.
function createdAt(uint256 _tokenId) external view returns(uint256);

/// Set new url for your token.
///
/// Throw token owner is not msg.sender.
/// @param _tokenId id of the token you set it.
/// @param _uri new uri.
function setTokenURI(uint256 _tokenId, string _uri) external;

/// Token balance of creator.
/// @param _creator creator of the tokens.
/// @return uint256 balance.
function balanceOfCreator(address _creator) external view returns (uint256);

/// Get token ID of the specified creator and index.
///
/// Throw owner is not valid.
/// Throw overflow index.
/// @param _creator creator of the token.
/// @param _index index of the creator tokens.
/// @return uint256 token id.
function tokenOfCreatorByIndex(address _creator, uint256 _index) external view returns (uint256);

/// Token balance of owner and creator.
///
/// Throw owner is not valid.
/// Throw creator is not valid.
/// @param _owner owner of the tokens.
/// @param _creator creator of the tokens.
/// @return uint256 balance of `token.owner == _owner` and `token.creator == _creator` tokens.
function balanceOfOwnerAndCreator(address _owner, address _creator) external view returns (uint256);

/// Get token ID of the specified owner, creator, and index.
///
/// Throw owner is not valid.
/// Throw creator is not valid.
/// Throw overflow index.
/// @param _owner owner of the token.
/// @param _creator creator of the token, you can use zero address.
/// @param _index index of the creator tokens.
/// @return uint256 token id.
function tokenOfOwnerAndCreatorByIndex(address _owner, address _creator, uint256 _index) external view returns (uint256);
```

It also has the following interfaces.

* ERC165
* ERC721

# Background

Non-Fungible Token used on DApps such as "ERC721" can easily be transferred or exchanged between users, but the DApps admin team holds the authority of publishing and deleting currencies.
Thus the service itself is quite known and centralized because of the above reason.

So we thought it might be interesting to have de-centralized digital currency which can be published and deleted by the users themselves, and token data values can be added by changing parameters.
Moreover, the currencies can be used over any DApps and the same token may have different values depends on the transferred environment, DApps.
We strongly believe in our new concepts and free Non-Fungible token which may broaden the world of current token economy.

# FAQ

### Q. Do I need to deploy ||||||-contract by myself ?

Regarding use on Mainnet and any Testnet, we already deployed to the address mentioned above, so you don't need to deploy by yourself.

### Q. Is it easier to development DApps with |||||| ?

|||||| is implemented as ERC721, if you create a contract like the above usage, you can immediately use what works as a standard ERC 721 token.

### Q. Can I limit the amount of token ?

Yes.
For that, you need to prepare your own Smart Contract.
The following code is conceivable.

```
pragma solidity ^0.4.24;

import "../node_modules/llllll/contracts/SixPillars.sol";

contract DappsContract {

  uint internal totalSupply;

  constructor() {
    totalSupply = 10000
  }

  function mint(uint256 _inscription, address _llllll) external {
    revert(0 < totalSupply);
    totalSupply--;
    SixPillars llllll = SixPillars(_llllll);
    llllll.mint(msg.sender, _inscription);
  }
}
```

### Q. My DApps don't want to use any tokens with unintended parameter...

You can block all tokens of minted by other DApps, for you don't want to use tokens with unintended parameter.
However, since users can not use the tokens created by other DApps, there is a danger of damaging the charm of your DApps.

### Q. I'd like users to sent a token minting transaction. Can I this?

Ask the user to issue the `_isSetCreator` of `mint` method as `false`, and later you can grant the appropriate `creator` if you call the `createdBy` method on that token.

# Contact

Please use the contact form on the [official page](https://6-pillars.ooo).

# License
This software is released under the MIT License, see [LICENSE](LICENSE).
