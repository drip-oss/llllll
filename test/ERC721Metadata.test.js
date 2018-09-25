const SixPillars = artifacts.require("SixPillars")

contract('ERC721Metadata', (accounts) => {
  let token
  let tokenId
  let secondTokenId
  const inscription = 0x1234
  const owner = accounts[0]
  const creator = accounts[0]

  before(async function () {
    token = await SixPillars.new()
    await token.mint(owner, inscription, true, {from: creator})
    await token.mint(owner, inscription, true, {from: creator})
    tokenId = await token.tokenOfOwnerByIndex(owner, 0)
    secondTokenId = await token.tokenOfOwnerByIndex(owner, 1)
  })

  it("name", async () => {
    assert.equal(await token.name(), "SixPillars")
  })

  it("symbol", async () => {
    assert.equal(await token.symbol(), "SPT")
  })

  describe("tokenURI", () => {
    const src = "this is uri."

    it("default", async () => {
      const uri = await token.tokenURI(tokenId)
      assert.equal(uri.length, 0)
      const secondUri = await token.tokenURI(secondTokenId)
      assert.equal(secondUri.length, 0)
    })

    it("custom", async () => {
      await token.setTokenURI(tokenId, src)
      const uri = await token.tokenURI(tokenId)
      assert.equal(uri, src)
      const secondUri = await token.tokenURI(secondTokenId)
      assert.equal(secondUri.length, 0)
    })
  })
})
