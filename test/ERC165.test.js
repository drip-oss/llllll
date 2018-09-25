import { zeroPadding } from './helpers/zeroPadding'
import { createInterfaceId } from './helpers/createInterfaceId'

const SixPillars = artifacts.require("SixPillars")

const methodNames = {
  ERC165: [
    'supportsInterface(bytes4)',
  ],
  ERC721: [
    'balanceOf(address)',
    'ownerOf(uint256)',
    'approve(address,uint256)',
    'getApproved(uint256)',
    'setApprovalForAll(address,bool)',
    'isApprovedForAll(address,address)',
    'transferFrom(address,address,uint256)',
    'safeTransferFrom(address,address,uint256)',
    'safeTransferFrom(address,address,uint256,bytes)',
  ],
  ERC721Enumerable: [
    'totalSupply()',
    'tokenOfOwnerByIndex(address,uint256)',
    'tokenByIndex(uint256)',
  ],
  ERC721Metadata: [
    'name()',
    'symbol()',
    'tokenURI(uint256)',
  ],
  ERC721TokenReceiver: [
    'onERC721Received(address,address,uint256,bytes)',
  ],
}

contract('ERC165', (accounts) => {
  let token

  describe('supportsInterface', () => {
    before(async function () {
      token = await SixPillars.new()
    })

    it("サポートしているものは true", async () => {
      Object.keys(methodNames).forEach(async (key) => {
        const interfaceId = createInterfaceId(web3, methodNames[key])
        assert.isTrue(await token.supportsInterface(interfaceId))
      })
    })

    it("サポートしていないものは false", async () => {
      assert.isFalse(await token.supportsInterface("0x01010101"))
      assert.isFalse(await token.supportsInterface("0xf0f0f0f0"))
    })
  })
})
