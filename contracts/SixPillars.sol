pragma solidity ^0.4.23;

import "./ERC/ERC165.sol";
import "./ERC/ERC721.sol";
import "./ERC/ERC721Enumerable.sol";
import "./ERC/ERC721Metadata.sol";
import "./ERC/ERC721TokenReceiver.sol";

contract SixPillars is ERC165, ERC721, ERC721Enumerable, ERC721Metadata, ERC721TokenReceiver {
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

  struct Token {
    uint256 id;
    uint256 inscription;
    uint256 amount;
    uint256 ownerIndex; // ownerToTokensIndex[_owner][ownerIndex]
    uint256 createdAt; // block number at created
    address owner;
    address creator;
    address approved;
    string uri;
  }

  Token[] internal tokens;
  mapping(uint256 => uint256) internal tokenIdToIndex; // tokenId -> tokens index
  uint256 internal tokenIdSeed;
  uint256 internal lastMintBlockNumber;

  mapping(address => uint256[]) internal ownerToTokensIndex; // owner address -> tokens index array
  mapping(address => mapping(address => bool)) internal operatorApprovals; // approved address -> approve address flag mapping

  mapping(bytes4 => bool) internal supportedInterfaces;

  /**
   * ERC165
  ***/

  // @override
  function supportsInterface(bytes4 _interfaceId) external view returns (bool) {
    return supportedInterfaces[_interfaceId];
  }

  function _registerInterface(bytes4 _interfaceId) internal {
    require(_interfaceId != 0xffffffff);
    supportedInterfaces[_interfaceId] = true;
  }

  /**
   * ERC721Enumerable
  ***/

  // @override
  function totalSupply() external view returns (uint256) {
    return tokens.length;
  }

  // @override
  function tokenByIndex(uint256 _index) external view returns (uint256) {
    return tokenIdByIndex(_index);
  }

  // @override
  function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256) {
    require(_index < ownerToTokensIndex[_owner].length);
    uint256 index = ownerToTokensIndex[_owner][_index];
    return tokens[index].id;
  }

  function tokenIdByIndex(uint256 _index) internal view returns (uint256) {
    require(_index < tokens.length);
    return tokens[_index].id;
  }

  function indexByTokenId(uint256 _tokenId) internal view returns (uint256) {
    uint index = tokenIdToIndex[_tokenId];
    require(index < tokens.length);
    require(tokens[index].id == _tokenId);
    return index;
  }

  /**
   * ERC721Metadata
  ***/

  // @override
  function name() public view returns (string) {
    return "SixPillars";
  }

  // @override
  function symbol() public view returns (string) {
    return "SPT";
  }

  // @override
  function tokenURI(uint256 _tokenId) external view returns (string) {
    uint index = indexByTokenId(_tokenId);
    return tokens[index].uri;
  }

  /**
   * ERC721TokenReceiver
  ***/

  // @override
  function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes _data) external returns(bytes4) {
    return InterfaceId_ERC721TokenReceiver;
  }

  /**
   * ERC721
  ***/

  // @override
  function balanceOf(address _owner) external view returns (uint256) {
    require(_owner != address(0));
    return ownerToTokensIndex[_owner].length;
  }

  // @override
  function ownerOf(uint256 _tokenId) external view returns (address) {
    return internalOwnerOf(_tokenId);
  }

  // @override
  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) external payable {
    uint256 sendAmount = internalSafeTransferFrom(_from, _to, _tokenId, msg.value, _data);
    if (0 < sendAmount) {
      _from.transfer(sendAmount);
      emit TransferWithAmount(_from, _to, _tokenId, sendAmount);
    }
  }

  // @override
  function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable {
    uint256 sendAmount = internalSafeTransferFrom(_from, _to, _tokenId, msg.value, "");
    if (0 < sendAmount) {
      _from.transfer(sendAmount);
      emit TransferWithAmount(_from, _to, _tokenId, sendAmount);
    }
  }

  // @override
  function transferFrom(address _from, address _to, uint256 _tokenId) external payable {
    uint256 sendAmount = internalTransferFrom(_from, _to, _tokenId, msg.value);
    if (0 < sendAmount) {
      _from.transfer(sendAmount);
      emit TransferWithAmount(_from, _to, _tokenId, sendAmount);
    }
  }

  // @override
  function approve(address _approved, uint256 _tokenId) external payable {
    internalApprove(_approved, _tokenId, 0);
  }

  // @override
  function setApprovalForAll(address _operator, bool _approved) external {
    require(_operator != msg.sender);
    operatorApprovals[msg.sender][_operator] = _approved;
    emit ApprovalForAll(msg.sender, _operator, _approved);
  }

  // @override
  function getApproved(uint256 _tokenId) external view returns (address) {
    return internalGetApproved(_tokenId);
  }

  // @override
  function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
    return internalIsApprovedForAll(_owner, _operator);
  }

  /**
   * payment methods for ERC721
  ***/

  function approve(address _approved, uint256 _tokenId, uint256 _amount) external payable {
    internalApprove(_approved, _tokenId, _amount);
  }

  function amountOf(uint256 _tokenId) external view returns (uint256) {
    uint index = indexByTokenId(_tokenId);
    return tokens[index].amount;
  }

  /**
   * internal methods for ERC721 external methods
  ***/

  // @override
  function internalOwnerOf(uint256 _tokenId) internal view returns (address) {
    uint index = indexByTokenId(_tokenId);
    return tokens[index].owner;
  }

  // @override
  function internalSafeTransferFrom(address _from, address _to, uint256 _tokenId, uint256 _value, bytes _data) internal returns (uint256) {
    if (isContract(_to)) {
      bytes4 retval = ERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data);
      require(retval == InterfaceId_ERC721TokenReceiver, "internalSafeTransferFrom msg.sender can not approved");
    }
    return internalTransferFrom(_from, _to, _tokenId, _value);
  }

  function internalTransferFrom(address _from, address _to, uint256 _tokenId, uint256 _value) internal returns (uint256 sendAmount) {
    uint index = indexByTokenId(_tokenId);
    address owner = tokens[index].owner;
    require((_from == owner) && (_from != _to));

    // can transfer, if meet one of the confitions
    // 1. sender is owner.
    // 2. sender is approved of owner's all token transfer to "_to" address.
    // 3. if an approved address is set,
    // 3-1. and amount is set, approved sender pay token amount to owner, transfer to "_to" address.
    // 3-2. and amount is not set, sender is approved of token transfer to "_to" address.
    // 4. if an approved address is not set, sender to pay token amount to owner.
    uint256 amount = tokens[index].amount;
    tokens[index].amount = 0;
    bool canTransfer = (msg.sender == owner) || internalIsApprovedForAll(owner, msg.sender);
    if (canTransfer) {
      // owner and approved sender, not payable.
      require(_value == 0);

    } else if (tokens[index].approved == msg.sender) {
      sendAmount = amount;
      canTransfer = (amount == _value);

    } else if ((tokens[index].approved == address(0)) && (0 < amount)) {
      sendAmount = amount;
      canTransfer = (amount == _value);
    }
    require(canTransfer);

    // clear approved
    tokens[index].approved = address(0);

    // transfer
    transferToken(_from, _to, _tokenId);
    emit Transfer(_from, _to, _tokenId);
  }

  function internalGetApproved(uint256 _tokenId) internal view returns (address) {
    uint index = indexByTokenId(_tokenId);
    return tokens[index].approved;
  }

  function internalIsApprovedForAll(address _owner, address _operator) internal view returns (bool) {
    return operatorApprovals[_owner][_operator];
  }

  function internalApprove(address _approved, uint256 _tokenId, uint256 _amount) internal {
    uint index = indexByTokenId(_tokenId);
    address owner = tokens[index].owner;
    require(_approved != owner);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender));
    tokens[index].approved = _approved;
    tokens[index].amount = _amount;
    emit Approval(owner, _approved, _tokenId);
    if (0 < _amount) {
      emit ApprovalWithAmount(owner, _approved, _tokenId, _amount);
    }
  }

  /**
   * internal methods for ERC721
  ***/

  function addTokenTo(address _toOwner, uint256 _tokenId, uint256 _inscription, bool _isSetCreator) internal {
    uint index = tokenIdToIndex[_tokenId];
    require(_toOwner != address(0));
    if ((index == 0) && (0 < tokens.length)) {
      require(tokens[0].id != _tokenId);
    }

    index = tokens.length;

    // add token to owner
    uint256 ownerIndex = ownerToTokensIndex[_toOwner].length;
    ownerToTokensIndex[_toOwner].push(index);

    address creator = _isSetCreator ? msg.sender : address(0);
    Token memory tokenWithCreator = Token(_tokenId, _inscription, 0, ownerIndex, block.number, _toOwner, creator, address(0), "");
    tokens.push(tokenWithCreator);
    tokenIdToIndex[_tokenId] = index;
  }

  function removeTokenFrom(address _fromOwner, uint256 _tokenId) internal {
    uint index = indexByTokenId(_tokenId);
    require(tokens[index].owner == _fromOwner);

    // change removeToken index <--> lastToken index for owner
    uint256 removeTokenIndex = tokens[index].ownerIndex;
    uint256 lastTokenIndex = ownerToTokensIndex[_fromOwner].length - 1;
    if (removeTokenIndex != lastTokenIndex) {
      tokens[ownerToTokensIndex[_fromOwner][lastTokenIndex] ].ownerIndex = removeTokenIndex;
      ownerToTokensIndex[_fromOwner][removeTokenIndex] = ownerToTokensIndex[_fromOwner][lastTokenIndex];
    }
    ownerToTokensIndex[_fromOwner].length = lastTokenIndex;

    // change removeToken index <--> lastToken index for all
    removeTokenIndex = index;
    lastTokenIndex = tokens.length - 1;
    if (removeTokenIndex != lastTokenIndex) {
      uint256 lastTokenId = tokens[lastTokenIndex].id;

      // owner to
      address lastTokenOwner = tokens[lastTokenIndex].owner;
      uint256 lastTokenOwnerIndex = tokens[lastTokenIndex].ownerIndex;
      ownerToTokensIndex[lastTokenOwner][lastTokenOwnerIndex] = removeTokenIndex;

      // all
      tokenIdToIndex[lastTokenId] = removeTokenIndex;
      tokens[removeTokenIndex] = tokens[lastTokenIndex];
    }
    tokenIdToIndex[_tokenId] = 0;
    tokens.length = lastTokenIndex;
  }

  function transferToken(address _fromOwner, address _toOwner, uint256 _tokenId) internal {
    uint index = indexByTokenId(_tokenId);
    require((_toOwner != address(0)) && (_fromOwner != _toOwner) && (tokens[index].owner == _fromOwner));

    // remove from old owner
    uint256 removeTokenIndex = tokens[index].ownerIndex;
    uint256 lastTokenIndex = ownerToTokensIndex[_fromOwner].length - 1;

    tokens[ownerToTokensIndex[_fromOwner][lastTokenIndex] ].ownerIndex = removeTokenIndex;
    ownerToTokensIndex[_fromOwner][removeTokenIndex] = ownerToTokensIndex[_fromOwner][lastTokenIndex];
    ownerToTokensIndex[_fromOwner].length = lastTokenIndex;

    // add to new owner
    uint256 ownerIndex = ownerToTokensIndex[_toOwner].length;
    ownerToTokensIndex[_toOwner].push(index);
    tokens[index].owner = _toOwner;
    tokens[index].ownerIndex = ownerIndex;
  }

  function isContract(address addr) internal view returns (bool) {
    uint256 size;
    assembly { size := extcodesize(addr) }
    return size > 0;
  }

  /**
   * SixPillars
  ***/

  constructor() public {
    _registerInterface(InterfaceId_ERC165);
    _registerInterface(InterfaceId_ERC721);
    _registerInterface(InterfaceId_ERC721Enumerable);
    _registerInterface(InterfaceId_ERC721Metadata);
    _registerInterface(InterfaceId_ERC721TokenReceiver);
    tokenIdSeed = 722;
    lastMintBlockNumber = 0;
  }

  function recover(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
    return ecrecover(msgHash, v, r, s);
  }

  /// Mint new token.
  ///
  /// emit Mint(owner, creator, inscription, tokenId)
  /// Throw _to is not valid.
  /// Throw new token id is already used. (please try again later)
  /// @param _to Owner of new token.
  /// @param _inscription immutable parameter for new token.
  /// @param _isSetCreator if true, creator of new token is msg.sender. if false, creator is zero address.
  function mint(address _to, uint256 _inscription, bool _isSetCreator) external {
    uint256 seed = tokenIdSeed;
    if ((lastMintBlockNumber != 0) && (lastMintBlockNumber < block.number)) {
      seed += (block.number - lastMintBlockNumber);
    }
    uint256 newTokenId = uint256(keccak256(abi.encodePacked(seed)));
    tokenIdSeed = newTokenId;
    lastMintBlockNumber = block.number;
    addTokenTo(_to, newTokenId, _inscription, _isSetCreator);
    emit Mint(
      _to,
      (_isSetCreator == true) ? msg.sender : address(0),
      _inscription,
      newTokenId
    );
  }

  /// Burn your token.
  ///
  /// emit Burn(owner, creator, tokenId)
  /// Throw token owner is not msg.sender.
  /// @param _tokenId id of the token you want to burned.
  function burn(uint256 _tokenId) external {
    uint index = indexByTokenId(_tokenId);
    address owner = tokens[index].owner;
    address creator = tokens[index].creator;
    require(owner == msg.sender);
    removeTokenFrom(owner, _tokenId);
    emit Burn(
      owner,
      creator,
      _tokenId
    );
  }

  /// Add creator to the token
  ///
  /// msg.sender is new creator.
  /// emit CreatedBy(creator, tokenId)
  /// Throw token creator is already added.
  /// @param _tokenId id of the token you want add creator.
  function createdBy(uint256 _tokenId) external {
    uint index = indexByTokenId(_tokenId);
    address creator = tokens[index].creator;
    require(creator == address(0));
    tokens[index].creator = msg.sender;
    emit CreatedBy(
      msg.sender,
      _tokenId
    );
  }

  /// Remove creator to the token
  ///
  /// creator of the token will be zero address.
  /// emit ClearCreator(tokenId)
  /// Throw token creator is not msg.sender.
  /// @param _tokenId id of the token you want remove creator.
  function clearCreator(uint256 _tokenId) external {
    uint index = indexByTokenId(_tokenId);
    address creator = tokens[index].creator;
    require(msg.sender == creator);
    tokens[index].creator = address(0);
    emit ClearCreator(_tokenId);
  }

  /// Get inscription of the token.
  /// @param _tokenId id of the token you get it.
  /// @return uint256 inscription of the token.
  function inscription(uint256 _tokenId) external view returns(uint256) {
    uint index = indexByTokenId(_tokenId);
    return tokens[index].inscription;
  }

  /// Get creator of the token.
  /// @param _tokenId id of the token you get it.
  /// @return address creator of the token.
  function creator(uint256 _tokenId) external view returns(address) {
    uint index = indexByTokenId(_tokenId);
    return tokens[index].creator;
  }

  /// Get block number of the token at created.
  /// @param _tokenId id of the token you get it.
  /// @return uint256 block number of the token at created.
  function createdAt(uint256 _tokenId) external view returns(uint256) {
    uint index = indexByTokenId(_tokenId);
    return tokens[index].createdAt;
  }

  /// Set new url for your token.
  ///
  /// Throw token owner is not msg.sender.
  /// @param _tokenId id of the token you set it.
  /// @param _uri new uri.
  function setTokenURI(uint256 _tokenId, string _uri) external {
    uint index = indexByTokenId(_tokenId);
    require(tokens[index].owner == msg.sender);
    tokens[index].uri = _uri;
  }

  /// Token balance of creator.
  ///
  /// Throw creator is not valid.
  /// @param _creator creator of the tokens.
  /// @return uint256 balance.
  function balanceOfCreator(address _creator) external view returns (uint256) {
    require(_creator != address(0));
    uint256 count = 0;
    for (uint256 i = 0; i < tokens.length; i++) {
      if (tokens[i].creator == _creator) {
        count++;
      }
    }
    return count;
  }

  /// Get token ID of the specified creator and index.
  ///
  /// Throw owner is not valid.
  /// Throw overflow index.
  /// @param _creator creator of the token.
  /// @param _index index of the creator tokens.
  /// @return uint256 token id.
  function tokenOfCreatorByIndex(address _creator, uint256 _index) external view returns (uint256) {
    require(_creator != address(0));
    uint256 count = 0;
    for (uint256 i = 0; i < tokens.length; i++) {
      if (tokens[i].creator == _creator) {
        if (count == _index) {
          return tokens[i].id;
        }
        count++;
      }
    }
    revert();
  }

  /// Token balance of owner and creator.
  ///
  /// Throw owner is not valid.
  /// Throw creator is not valid.
  /// @param _owner owner of the tokens.
  /// @param _creator creator of the tokens.
  /// @return uint256 balance of `token.owner == _owner` and `token.creator == _creator` tokens.
  function balanceOfOwnerAndCreator(address _owner, address _creator) external view returns (uint256) {
    require((_owner != address(0)) && (_creator != address(0)));
    uint256 balance = 0;
    for (uint256 i = 0; i < ownerToTokensIndex[_owner].length; i++) {
      uint256 index = ownerToTokensIndex[_owner][i];
      if (tokens[index].creator == _creator) {
        balance++;
      }
    }
    return balance;
  }

  /// Get token ID of the specified owner, creator, and index.
  ///
  /// Throw owner is not valid.
  /// Throw creator is not valid.
  /// Throw overflow index.
  /// @param _owner owner of the token.
  /// @param _creator creator of the token, you can use zero address.
  /// @param _index index of the creator tokens.
  /// @return uint256 token id.
  function tokenOfOwnerAndCreatorByIndex(address _owner, address _creator, uint256 _index) external view returns (uint256) {
    require((_owner != address(0)) && (_creator != address(0)));
    uint256 count = 0;
    for (uint256 i = 0; i < ownerToTokensIndex[_owner].length; i++) {
      uint256 index = ownerToTokensIndex[_owner][i];
      if (tokens[index].creator == _creator) {
        if (count == _index) {
          return tokens[index].id;
        }
        count++;
      }
    }
    revert();
  }
}
