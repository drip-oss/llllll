import { CONTRACT_REVERT_ERROR_MESSAGE, TEST_GAS } from '../helpers/values'

export default function revertTransfers(from, to, sender, value) {
  const data = "hogehoge"

  describe("transferFrom", function() {
    it("revert", async function() {
      try {
        const tokenId = await this.token.tokenOfOwnerByIndex(from, 0)
        await this.token.transferFrom(from, to, tokenId, {from: sender, value: value})
        assert.fail()
      } catch (error) {
        assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
      }
    })
  })
  describe("safeTransferFrom", function() {
    it("revert", async function() {
      try {
        const tokenId = await this.token.tokenOfOwnerByIndex(from, 0)
        const safeTransferFrom = this.token.contract.safeTransferFrom['address,address,uint256']
        await safeTransferFrom.sendTransaction(from, to, tokenId, {from: sender, value: value, gas: TEST_GAS})
        assert.fail()
      } catch (error) {
        assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
      }
    })
  })
  describe("safeTransferFrom(data)", function() {
    it("revert", async function() {
      try {
        const tokenId = await this.token.tokenOfOwnerByIndex(from, 0)
        const safeTransferFrom = this.token.contract.safeTransferFrom['address,address,uint256,bytes']
        await safeTransferFrom.sendTransaction(from, to, tokenId, data, {from: sender, value: value, gas: TEST_GAS})
        assert.fail()
      } catch (error) {
        assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
      }
    })
  })
}
