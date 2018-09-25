pragma solidity ^0.4.20;

/// @title ERC165
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
interface ERC165Interface {
  /// @notice Query if a contract implements an interface
  /// @param interfaceID The interface identifier, as specified in ERC-165
  /// @dev Interface identification is specified in ERC-165. This function
  ///  uses less than 30,000 gas.
  /// @return `true` if the contract implements `interfaceID` and
  ///  `interfaceID` is not 0xffffffff, `false` otherwise
  function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

contract ERC165 is ERC165Interface {
  // 0x01ffc9a7 ===
  // bytes4(keccak256('supportsInterface(bytes4)'))
  bytes4 public constant InterfaceId_ERC165 = 0x01ffc9a7;
}
