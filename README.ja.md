[<img src="logo.png" alt="|||||| 6 pillars" width=50% />](https://6-pillars.ooo)

[||||||](https://6-pillars.ooo) は DApps をまたいで利用可能なトークンを誰でも生成できる、Ethereum 上で動作するスマートコントラクトです。
生成されたトークンには不変なデータが明記され、開発者がそれを使いトークンの振る舞いを決定する事で、ある DApps 上では価値がなかったものが、他の DApps 上では価値が高いものとして扱われるなど、トークンの価値が絶対価値から相対価値になります。

English is [here](README.md).

# 特徴

* |||||| はコントラクトデプロイヤーという意味での一切の Ownable を持たない。
* トークンは2つのデータを持っている。
  * inscription : 発行時に指定できる不変な uint256 パラメータ
  * creator : トークンの発行元アドレス
* DApps 開発者はトークン発行時、 `inscription` にサービス特有のデータを設定できる。
* DApps 開発者は一定のルールを自由に設け、他の DApps 等で発行されたトークンを自身の DApps 内で使用させる事ができる。
  * 主に `creator` と `inscription` に対するルール付け。

# サンプル

### BandStar

* WebPage - https://drip-samples.github.io/llllll-sample-bandstar/
* Github - https://github.com/drip-samples/llllll-sample-bandstar/

### Dragon

* WebPage - https://drip-samples.github.io/llllll-sample-dragons/
* Github - https://github.com/drip-samples/llllll-sample-dragons/

# インストール

```
npm install llllll
```

# 使い方

## 開発

### contract

DApps 開発者が以下のようなコントラクトを準備すれば、そのコントラクトアドレスを `creator` として持つトークンが生成できます。

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

開発時は |||||| をローカルチェーンにデプロイする必要があるため、以下の truffle migration ファイルが必要になります。

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

## デプロイ

|||||| はご自身でデプロイせず `deployed/contracts/SixPillars.json` をご利用ください。
コントラクトアドレスは以下の通りです。

* Mainnet
  * [0x9895960B93e314ef221346Ab985b895da9a5B7d5](https://etherscan.io/address/0x9895960B93e314ef221346Ab985b895da9a5B7d5)
* Ropsten
  - [0x9895960b93e314ef221346ab985b895da9a5b7d5](https://ropsten.etherscan.io/address/0x9895960b93e314ef221346ab985b895da9a5b7d5)
* Rinkeby
  * [0x542A900357c9638AD6e944a57072c5D01f1C1Ea7](https://rinkeby.etherscan.io/address/0x542A900357c9638AD6e944a57072c5D01f1C1Ea7)
* Kovan
  * [0x542A900357c9638AD6e944a57072c5D01f1C1Ea7](https://kovan.etherscan.io/address/0x542A900357c9638AD6e944a57072c5D01f1C1Ea7)

# リファレンス

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

また、以下のインターフェイスを備えています。

* ERC165
* ERC721

# 開発背景

ERC721 を初めとした DApps で使われている Non-Fungible トークンは、移行や売買はユーザー同士で可能ですが、発行や破棄は DApps 運営主体が握っており、従来の中央集権的サービスに近い形をとっています。

またそのトークンは、発行した DApps 内でしか価値を発揮できないものがほとんどです。

そんな中で、発行や破棄すらもユーザー自身で可能な、かつトークンの持つデータは改竄不可能な、そしてどんな DApps でも利用でき、それぞれの DApps で価値が変化する、より柔軟で自由なNon-Fungibleトークンがあれば、既存の DApps が提唱するトークンエコノミーよりも広い世界を創れるのではないか、という想いから開発しました。

# FAQ

### Q. |||||| コントラクトは自身でデプロイする必要がありますか？

メインネットおよび各種テストネットでの利用に関しては、上記記載のアドレスに対して既にデプロイしてありますので、ご自身でデプロイする必要はありません。
開発環境においてはローカルで動作しているネットワークに対してデプロイした方が、開発しやすいかと思います。

### Q. |||||| コントラクトを使うと DApps 作成が楽になりますか？

ERC721 として一通りの機能が実装されているので、上記使い方にあるようなコントラクトを作成していただければ、標準の ERC721 トークンとして動作するものをすぐに利用可能です。

### Q. トークンの発行量を制限したいのですが、可能ですか？

はい、可能です。
そのためには独自のスマートコントラクトを準備する必要があります。以下のようなコードが考えられます。

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

### Q. こちらの意図しないパラメータを持つトークンは DApps 内で使わせたくないのですが...

ご自身の DApps から発行されたトークン以外は使えないようにすれば、意図しないパラメータを持つトークンをブロックできます。
ただしユーザーにとっては他の DApps で作ったトークンを使えないため、あなたの DApps が持つ魅力を損なう恐れがあります。

### Q. ユーザーに直接 |||||| に対してトークン発行トランザクションを送信して欲しいのですが、可能ですか？

ユーザーには `mint` メソッドの `_isSetCreator` を `false` として発行してもらい、後からあなたがそのトークンに対して `createdBy` メソッドを呼び出せば適切な `creator` を付与できます。

# お問い合わせ

[公式ページ](https://6-pillars.ooo)のお問い合わせフォームをご利用ください。

# ライセンス
このソフトウェアはMITライセンスのもとで公開されています。詳しくは[LICENSE](LICENSE)をご覧ください。
