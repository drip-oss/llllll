import { mintTestTokens } from './helpers/mintTestTokens'

const SixPillars = artifacts.require("SixPillars")

const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should()

contract('ERC721Caller', (accounts) => {
  let token
  const owners = Array(accounts[0], accounts[1], accounts[2])
  const creators = Array(accounts[0], accounts[3], accounts[4])

  before(async () => {
    token = await SixPillars.new()
    await mintTestTokens(token, owners, creators)
  })

  it("個数", async () => {
    const supply = await token.totalSupply()
    supply.should.be.bignumber.equal(36)
    owners.forEach(async (owner) => {
      const balance = await token.balanceOf(owner)
      balance.should.be.bignumber.equal(12)
    })
    creators.forEach(async (creator) => {
      const balance = await token.balanceOfCreator(creator)
      balance.should.be.bignumber.equal(12)
    })
  })

  it("ownerOf", async () => {
    const counts = {}
    owners.forEach((owner) => {
      counts[owner] = 0
    })
    const supply = (await token.totalSupply()).toNumber()
    const promises = Array.from({length: supply}).map((value, index) => {
      return token.tokenByIndex(index)
    })
    const secondPromises = (await Promise.all(promises)).map((value) => {
      return token.ownerOf(value)
    })
    const addreses = (await Promise.all(secondPromises)).map((value) => {
      return value
    })
    addreses.forEach((address) => {
      counts[address] += 1
    })
    owners.forEach((owner) => {
      assert.equal(counts[owner], 12)
    })
  })

  describe("tokenId is unique", async () => {
    const regex = new RegExp('^[a-f0-9]+$')
    let supply

    before(async () => {
      supply = (await token.totalSupply()).toNumber()
    })

    it("全体", async () => {
      const promises = Array.from({length: supply}).map((value, index) => {
        return token.tokenByIndex(index)
      })
      const tokenIds = (await Promise.all(promises)).map((value) => {
        const str = value.toString(16)
        assert.isTrue(regex.test(str))
        return str
      })
      const uniqTokenIds = tokenIds.filter((value, index, self) => {
        return self.indexOf(value) === index
      })
      assert.equal(tokenIds.length, supply)
      assert.equal(tokenIds.length, uniqTokenIds.length)
    })

    it("owner", async () => {
      let tokenIds = Array()
      let i
      for (i = 0; i < owners.length; i++) {
        const owner = owners[i]
        const length = (await token.balanceOf(owner)).toNumber()
        const promises = Array.from({length: length}).map((value, index) => {
          return token.tokenOfOwnerByIndex(owner, index)
        })
        const addTokenIds = (await Promise.all(promises)).map((value) => {
          const str = value.toString(16)
          assert.isTrue(regex.test(str))
          return str
        })
        tokenIds = tokenIds.concat(addTokenIds)
      }
      const uniqTokenIds = tokenIds.filter((value, index, self) => {
        return self.indexOf(value) === index
      })
      assert.equal(tokenIds.length, supply)
      assert.equal(tokenIds.length, uniqTokenIds.length)
    })

    it("creator", async () => {
      let tokenIds = Array()
      let i
      for (i = 0; i < creators.length; i++) {
        const creator = creators[i]
        const length = (await token.balanceOfCreator(creator)).toNumber()
        const promises = Array.from({length: length}).map((value, index) => {
          return token.tokenOfCreatorByIndex(creator, index)
        })
        const addTokenIds = (await Promise.all(promises)).map((value) => {
          const str = value.toString(16)
          assert.isTrue(regex.test(str))
          return str
        })
        tokenIds = tokenIds.concat(addTokenIds)
      }
      const uniqTokenIds = tokenIds.filter((value, index, self) => {
        return self.indexOf(value) === index
      })
      assert.equal(tokenIds.length, supply)
      assert.equal(tokenIds.length, uniqTokenIds.length)
    })
  })
})
