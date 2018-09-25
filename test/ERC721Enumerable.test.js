const SixPillars = artifacts.require("SixPillars")

contract('ERC721Enumerable', (accounts) => {
  const counts = accounts.map(() => { return Math.floor(Math.random() * 3.0) + 1 })
  const sum = counts.reduce((prev, current) => { return prev + current })
  let tokenIds = Array()
  let ownerTokenIds = {}

  before(async function () {
    const token = await SixPillars.new()
    const inscription = 0x1234
    let i, n

    for (i = 0; i < accounts.length; i++) {
      const owner = accounts[i]
      for (n = 0; n < counts[i]; n++) {
        await token.mint(owner, inscription, true)
      }
    }

    for (i = 0; i < sum; i++) {
      const tokenId = await token.tokenByIndex(i)
      tokenIds.push(tokenId)
    }

    for (i = 0; i < accounts.length; i++) {
      const owner = accounts[i]
      ownerTokenIds[i] = Array()
      for (n = 0; n < counts[i]; n++) {
        const tokenId = await token.tokenOfOwnerByIndex(owner, n)
        ownerTokenIds[i].push(tokenId)
      }
    }
  })

  it("正常", async () => {
    assert.equal(tokenIds.length, sum)
    let i
    for (i = 0; i < accounts.length; i++) {
      assert.equal(counts[i], ownerTokenIds[i].length)
    }
  })

  it("全体数 = 個別数の合計", async () => {
    let a = Array()
    accounts.forEach((owner, i) => {
      ownerTokenIds[i].forEach((tokenId) => {
        a.push(tokenId)
      })
    })
    assert.equal(a.length, tokenIds.length)
  })

  describe("重複していない", async () => {
    it("全体", async () => {
      const multipleTokenIds = tokenIds.filter((x, i, self) => { return self.indexOf(x) !== self.lastIndexOf(x) })
      assert.isEmpty(multipleTokenIds)
    })

    it("個別", async () => {
      let a = Array()
      accounts.forEach((owner, i) => {
        ownerTokenIds[i].forEach((tokenId) => {
          a.push(tokenId)
        })
      })
      const multipleTokenIds = a.filter((x, i, self) => { return self.indexOf(x) !== self.lastIndexOf(x) })
      assert.isEmpty(multipleTokenIds)
    })
  })
})
