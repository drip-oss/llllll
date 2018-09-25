pragma solidity ^0.4.20;

/// @title ERC-721 Token Receiver
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
/// @dev Note: the ERC-165 identifier for this interface is 0x150b7a02.
interface ERC721TokenReceiverInterface {
  /// @notice Handle the receipt of an NFT
  /// @dev The ERC721 smart contract calls this function on the
  /// recipient after a `transfer`. This function MAY throw to revert and reject the transfer. Return
  /// of other than the magic value MUST result in the transaction being reverted.
  /// @notice The contract address is always the message sender.
  /// @param _operator The address which called `safeTransferFrom` function
  /// @param _from The address which previously owned the token
  /// @param _tokenId The NFT identifier which is being transferred
  /// @param _data Additional data with no specified format
  /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
  /// unless throwing
  function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes _data) external returns(bytes4);
}

contract ERC721TokenReceiver is ERC721TokenReceiverInterface {
  bytes4 public constant InterfaceId_ERC721TokenReceiver = 0x150b7a02;
}
