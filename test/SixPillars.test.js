import { TEST_GAS, ADDRESS_ZERO, CONTRACT_REVERT_ERROR_MESSAGE } from './helpers/values'
const SixPillars = artifacts.require("SixPillars")
const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('SixPillars', function(accounts) {
  let token
  const inscription = new BigNumber(0x1234)

  describe('supply and index', function() {
    const owner = accounts[1]
    const anotherOwner = accounts[2]
    const firstCreator = accounts[3]
    const secondCreator = accounts[4]
    const thirdCreator = accounts[5]

    before(async function () {
      token = await SixPillars.new()
      let i

      for (i = 0; i < 5; i++) {
        await token.mint(owner, inscription, false)
      }
      for (i = 0; i < 10; i++) {
        await token.mint(owner, inscription, true, {from: firstCreator})
        await token.mint(anotherOwner, inscription, true, {from: firstCreator})
      }
      for (i = 0; i < 15; i++) {
        await token.mint(owner, inscription, true, {from: secondCreator})
        await token.mint(anotherOwner, inscription, true, {from: secondCreator})
      }
      for (i = 0; i < 20; i++) {
        await token.mint(owner, inscription, true, {from: thirdCreator})
        await token.mint(anotherOwner, inscription, true, {from: thirdCreator})
      }
    })

    describe("supply", async function() {
      describe("success", async function() {
        it("all", async function() {
          assert.equal((await token.totalSupply()).toNumber(), 95)
        })

        it("owner", async function() {
          assert.equal((await token.balanceOf(owner)).toNumber(), 50)
        })

        it("creator", async function() {
          assert.equal((await token.balanceOfCreator(firstCreator)).toNumber(), 20)
          assert.equal((await token.balanceOfCreator(secondCreator)).toNumber(), 30)
          assert.equal((await token.balanceOfCreator(thirdCreator)).toNumber(), 40)
        })

        it("owner and creator", async function() {
          assert.equal((await token.balanceOfOwnerAndCreator(owner, firstCreator)).toNumber(), 10)
          assert.equal((await token.balanceOfOwnerAndCreator(owner, secondCreator)).toNumber(), 15)
          assert.equal((await token.balanceOfOwnerAndCreator(owner, thirdCreator)).toNumber(), 20)
        })
      })

      describe("error", async function() {
        describe("not valid owner", async function() {
          it("balanceOf", async function() {
            try {
              await token.balanceOf(ADDRESS_ZERO)
              assert.fail()
            } catch (error) {
              assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
            }
          })

          it("balanceOfOwnerAndCreator", async function() {
            try {
              await token.balanceOfOwnerAndCreator(ADDRESS_ZERO, firstCreator)
              assert.fail()
            } catch (error) {
              assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
            }
          })
        })

        describe("not valid creator", async function() {
          it("balanceOfCreator", async function() {
            try {
              await token.balanceOfCreator(ADDRESS_ZERO)
              assert.fail()
            } catch (error) {
              assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
            }
          })

          it("balanceOfOwnerAndCreator", async function() {
            try {
              await token.balanceOfOwnerAndCreator(owner, ADDRESS_ZERO)
              assert.fail()
            } catch (error) {
              assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
            }
          })
        })

        describe("not valid owner and creator", async function() {
          it("balanceOfOwnerAndCreator", async function() {
            try {
              await token.balanceOfOwnerAndCreator(ADDRESS_ZERO, ADDRESS_ZERO)
              assert.fail()
            } catch (error) {
              assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
            }
          })
        })
      })
    })

    describe("index", async function() {
      describe("success", async function() {
        it("first creator", async function() {
          let tokenIds = Array()
          const length = await token.balanceOfOwnerAndCreator(owner, firstCreator)
          for (let i = 0; i < length; i++) {
            const tokenId = await token.tokenOfOwnerAndCreatorByIndex(owner, firstCreator, i)
            tokenIds.push(tokenId.toString(16))
          }
          tokenIds.should.be.not.empty
          const multipleTokenIds = tokenIds.filter((x, i, self) => { return self.indexOf(x) !== self.lastIndexOf(x) })
          multipleTokenIds.should.be.empty
        })

        it("second creator", async function() {
          let tokenIds = Array()
          const length = await token.balanceOfOwnerAndCreator(owner, secondCreator)
          for (let i = 0; i < length; i++) {
            const tokenId = await token.tokenOfOwnerAndCreatorByIndex(owner, secondCreator, i)
            tokenIds.push(tokenId.toString(16))
          }
          tokenIds.should.be.not.empty
          const multipleTokenIds = tokenIds.filter((x, i, self) => { return self.indexOf(x) !== self.lastIndexOf(x) })
          multipleTokenIds.should.be.empty
        })

        it("third creator", async function() {
          let tokenIds = Array()
          const length = await token.balanceOfOwnerAndCreator(owner, thirdCreator)
          for (let i = 0; i < length; i++) {
            const tokenId = await token.tokenOfOwnerAndCreatorByIndex(owner, thirdCreator, i)
            tokenIds.push(tokenId.toString(16))
          }
          tokenIds.should.be.not.empty
          const multipleTokenIds = tokenIds.filter((x, i, self) => { return self.indexOf(x) !== self.lastIndexOf(x) })
          multipleTokenIds.should.be.empty
        })
      })

      describe("error", async function() {
        it("not valid owner", async function() {
          try {
            await token.tokenOfOwnerAndCreatorByIndex(ADDRESS_ZERO, firstCreator, 0)
            assert.fail()
          } catch (error) {
            assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
          }
        })

        it("not valid creator", async function() {
          try {
            await token.tokenOfOwnerAndCreatorByIndex(owner, ADDRESS_ZERO, 0)
            assert.fail()
          } catch (error) {
            assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
          }
        })

        it("not valid owner and creator", async function() {
          try {
            await token.tokenOfOwnerAndCreatorByIndex(ADDRESS_ZERO, ADDRESS_ZERO, 0)
            assert.fail()
          } catch (error) {
            assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
          }
        })

        it("overflow index", async function() {
          try {
            const length = await token.balanceOfOwnerAndCreator(owner, firstCreator)
            await token.tokenOfOwnerAndCreatorByIndex(owner, firstCreator, length)
            assert.fail()
          } catch (error) {
            assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
          }
        })
      })
    })
  })

  describe('mint', function() {
    const owner = accounts[1]
    const creator = accounts[2]
    let logs
    let tokenId
    let creatorTokenId

    before(async function () {
      token = await SixPillars.new()
      const transaction = await token.mint(owner, inscription, true, {from: creator})
      logs = transaction.logs
      tokenId = await token.tokenOfOwnerByIndex(owner, 0)
      creatorTokenId = await token.tokenOfCreatorByIndex(creator, 0)
    })

    describe("success", async function() {
      it("all", async function() {
        assert.equal((await token.balanceOf(owner)).toNumber(), 1)
        assert.isAbove((await token.createdAt(tokenId)).toNumber(), 0)
        assert.equal((await token.inscription(tokenId)).toNumber(), inscription)
      })

      it("owner", async function() {
        tokenId.should.be.bignumber.not.equal(0)
        assert.equal(await token.ownerOf(tokenId), owner)
      })

      it("creator", async function() {
        assert.equal((await token.balanceOfCreator(creator)).toNumber(), 1)
        tokenId.should.be.bignumber.equal(creatorTokenId)
      })

      it("event", async function() {
        logs.length.should.be.eq(1)
        logs[0].event.should.be.eq('Mint')
        logs[0].args._owner.should.be.eq(owner)
        logs[0].args._creator.should.be.eq(creator)
        logs[0].args._inscription.should.be.bignumber.equal(inscription)
        logs[0].args._tokenId.should.be.bignumber.equal(tokenId)
      })
    })
  })

  describe('burn', function() {
    const firstCreator = accounts[9]
    const secondCreator = accounts[8]

    describe("success", async function() {
      let logs
      let tokenId
      let lastTokenId

      before(async function () {
        token = await SixPillars.new()
        await token.mint(accounts[1], inscription, true, {from: firstCreator})
        await token.mint(accounts[1], inscription, true, {from: firstCreator})
        await token.mint(accounts[1], inscription, true, {from: secondCreator})
        await token.mint(accounts[2], inscription, true, {from: secondCreator})
        await token.mint(accounts[2], inscription, true, {from: secondCreator})
        await token.mint(accounts[3], inscription, true, {from: secondCreator})
      })

      it("before state", async function() {
        assert.equal((await token.totalSupply()).toNumber(), 6)
        assert.equal((await token.balanceOf(accounts[1])).toNumber(), 3)
        assert.equal((await token.balanceOf(accounts[2])).toNumber(), 2)
        assert.equal((await token.balanceOf(accounts[3])).toNumber(), 1)
        assert.equal((await token.balanceOfCreator(firstCreator)).toNumber(), 2)
        assert.equal((await token.balanceOfCreator(secondCreator)).toNumber(), 4)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[1], firstCreator)).toNumber(), 2)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[1], secondCreator)).toNumber(), 1)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[2], firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[2], secondCreator)).toNumber(), 2)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[3], firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[3], secondCreator)).toNumber(), 1)
        tokenId = await token.tokenOfOwnerByIndex(accounts[1], 0)
        lastTokenId = await token.tokenOfOwnerByIndex(accounts[1], 2)
      })

      it("exec", async function() {
        const transaction = await token.burn(tokenId, {from: accounts[1]})
        logs = transaction.logs
      })

      it("after state", async function() {
        assert.equal((await token.totalSupply()).toNumber(), 5)
        assert.equal((await token.balanceOf(accounts[1])).toNumber(), 2)
        assert.equal((await token.balanceOf(accounts[2])).toNumber(), 2)
        assert.equal((await token.balanceOf(accounts[3])).toNumber(), 1)
        assert.equal((await token.balanceOfCreator(firstCreator)).toNumber(), 1)
        assert.equal((await token.balanceOfCreator(secondCreator)).toNumber(), 4)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[1], firstCreator)).toNumber(), 1)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[1], secondCreator)).toNumber(), 1)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[2], firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[2], secondCreator)).toNumber(), 2)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[3], firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[3], secondCreator)).toNumber(), 1)
        assert.equal((await token.tokenOfOwnerByIndex(accounts[1], 0)).toString(16), lastTokenId.toString(16))
      })

      it("event", async function() {
        logs.length.should.be.eq(1)
        logs[0].event.should.be.eq('Burn')
        logs[0].args._owner.should.be.eq(accounts[1])
        logs[0].args._creator.should.be.eq(firstCreator)
        logs[0].args._tokenId.should.be.bignumber.equal(tokenId)
      })

      it("more burn", async function() {
        tokenId = await token.tokenOfOwnerByIndex(accounts[2], 0)
        await token.burn(tokenId, {from: accounts[2]})
        tokenId = await token.tokenOfOwnerByIndex(accounts[2], 0)
        await token.burn(tokenId, {from: accounts[2]})
        assert.equal((await token.totalSupply()).toNumber(), 3)
        assert.equal((await token.balanceOf(accounts[1])).toNumber(), 2)
        assert.equal((await token.balanceOf(accounts[2])).toNumber(), 0)
        assert.equal((await token.balanceOf(accounts[3])).toNumber(), 1)
        assert.equal((await token.balanceOfCreator(firstCreator)).toNumber(), 1)
        assert.equal((await token.balanceOfCreator(secondCreator)).toNumber(), 2)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[1], firstCreator)).toNumber(), 1)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[1], secondCreator)).toNumber(), 1)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[2], firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[2], secondCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[3], firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[3], secondCreator)).toNumber(), 1)
      })

      it("all burn", async function() {
        tokenId = await token.tokenOfOwnerByIndex(accounts[3], 0)
        await token.burn(tokenId, {from: accounts[3]})
        tokenId = await token.tokenOfOwnerByIndex(accounts[1], 0)
        await token.burn(tokenId, {from: accounts[1]})
        tokenId = await token.tokenOfOwnerByIndex(accounts[1], 0)
        await token.burn(tokenId, {from: accounts[1]})
        assert.equal((await token.balanceOf(accounts[1])).toNumber(), 0)
        assert.equal((await token.balanceOf(accounts[2])).toNumber(), 0)
        assert.equal((await token.balanceOf(accounts[3])).toNumber(), 0)
        assert.equal((await token.balanceOfCreator(firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfCreator(secondCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[1], firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[1], secondCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[2], firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[2], secondCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[3], firstCreator)).toNumber(), 0)
        assert.equal((await token.balanceOfOwnerAndCreator(accounts[3], secondCreator)).toNumber(), 0)
      })
    })

    describe("failed", async function() {
      beforeEach(async function () {
        token = await SixPillars.new()
        await token.mint(accounts[1], inscription, true, {from: firstCreator})
        await token.mint(accounts[1], inscription, true, {from: firstCreator})
        await token.mint(accounts[1], inscription, true, {from: secondCreator})
        await token.mint(accounts[2], inscription, true, {from: secondCreator})
        await token.mint(accounts[2], inscription, true, {from: secondCreator})
        await token.mint(accounts[3], inscription, true, {from: secondCreator})
      })

      it("creator can not burn", async function() {
        try {
          const tokenId = await token.tokenOfOwnerByIndex(accounts[1], 0)
          await token.burn(tokenId)
          assert.fail()
        } catch (error) {
          assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
        }
      })

      it("third party can not burn", async function() {
        try {
          const tokenId = await token.tokenOfOwnerByIndex(accounts[1], 0)
          await token.burn(tokenId, {from: accounts[2]})
          assert.fail()
        } catch (error) {
          assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
        }
      })
    })
  })

  describe('add creator', function() {
    const owner = accounts[1]
    const newCreator = accounts[2]

    describe("success", async function() {
      let logs
      let tokenId

      before(async function () {
        token = await SixPillars.new()
        await token.mint(owner, inscription, false, {from: owner})
      })

      it("before state", async function() {
        assert.equal(await token.balanceOfCreator(owner), 0)
        assert.equal(await token.balanceOfCreator(newCreator), 0)
      })

      it("exec", async function() {
        tokenId = await token.tokenOfOwnerByIndex(owner, 0)
        const transaction = await token.createdBy(tokenId, {from: newCreator})
        logs = transaction.logs
      })

      it("after state", async function() {
        assert.equal(await token.creator(tokenId), newCreator)
        assert.equal(await token.balanceOfCreator(owner), 0)
        assert.equal(await token.balanceOfCreator(newCreator), 1)
      })

      it("event", async function() {
        logs.length.should.be.eq(1)
        logs[0].event.should.be.eq('CreatedBy')
        logs[0].args._creator.should.be.eq(newCreator)
        logs[0].args._tokenId.should.be.bignumber.equal(tokenId)
      })
    })

    describe('failed', function() {
      beforeEach(async function () {
        token = await SixPillars.new()
        await token.mint(owner, inscription, false, {from: owner})
      })

      describe('can not added if already set creator', function() {
        it("at mint", async function() {
          try {
            await token.mint(accounts[2], inscription, true, {from:accounts[1]})
            const tokenId = await token.tokenOfOwnerByIndex(accounts[2], 0)
            await token.createdBy(tokenId, {from:accounts[3]})
            assert.fail()
          } catch (error) {
            assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
          }
        })
        it("already using createdBy", async function() {
          try {
            const tokenId = await token.tokenOfOwnerByIndex(accounts[1], 0)
            await token.createdBy(tokenId, {from:accounts[2]})
            await token.createdBy(tokenId, {from:accounts[3]})
            assert.fail()
          } catch (error) {
            assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
          }
        })
      })
    })
  })

  describe('clear creator', function() {
    const owner = accounts[1]
    const creator = accounts[2]

    describe("success", async function() {
      let logs
      let tokenId

      before(async function () {
        token = await SixPillars.new()
        await token.mint(owner, inscription, true, {from: creator})
      })

      it("before state", async function() {
        assert.equal(await token.balanceOfCreator(creator), 1)
      })

      it("exec", async function() {
        tokenId = await token.tokenOfOwnerByIndex(owner, 0)
        const transaction = await token.clearCreator(tokenId, {from: creator})
        logs = transaction.logs
      })

      it("after state", async function() {
        assert.equal(await token.creator(tokenId), ADDRESS_ZERO)
        assert.equal(await token.balanceOfCreator(creator), 0)
      })

      it("event", async function() {
        logs.length.should.be.eq(1)
        logs[0].event.should.be.eq('ClearCreator')
        logs[0].args._tokenId.should.be.bignumber.equal(tokenId)
      })
    })

    describe("error", async function() {
      before(async function () {
        token = await SixPillars.new()
        await token.mint(owner, inscription, true, {from: creator})
      })

      it("owner can not clear", async function() {
        try {
          const tokenId = await token.tokenOfOwnerByIndex(owner, 0)
          await token.clearCreator(tokenId, {from: owner})
          assert.fail()
        } catch (error) {
          assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
        }
      })

      it("third party can not clear", async function() {
        try {
          const tokenId = await token.tokenOfOwnerByIndex(owner, 0)
          await token.clearCreator(tokenId, {from: accounts[5]})
          assert.fail()
        } catch (error) {
          assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
        }
      })
    })
  })

  describe('recover', function() {
    const message = 'yo'
    const r = '0xaed9201eabed5ebe687bc51c58102078a240fc00cb629fcb5f3416152ba62b16'
    const s = '0x42bb64ad8df1b8eb0ba391a374fcf1d01889f38014df2ddadc4c0d8c10084da7'
    const v = 27
    const address = '0x11d0a6ca566c39ae0a426c3e607e61f278d84684'

    beforeEach(async function () {
      token = await SixPillars.new()
    })

    it("success", async function() {
      const prefixedMessage = "\x19Ethereum Signed Message:\n" + message.length + message
      assert.equal(await token.recover(web3.sha3(prefixedMessage), v, r, s), address)
    })
  })

  describe('tokenURI', function() {
    let tokenId
    const uri = "this is special token."
    const owner = accounts[1]

    beforeEach(async function () {
      token = await SixPillars.new()
      await token.mint(owner, inscription, true)
      tokenId = await token.tokenOfOwnerByIndex(owner, 0)
    })

    describe('success', function() {
      it("default", async function() {
        assert.equal(await token.tokenURI(tokenId), "")
      })

      it("custom", async function() {
        await token.setTokenURI(tokenId, uri, {from: accounts[1]})
        assert.equal(await token.tokenURI(tokenId), uri)
      })
    })

    describe('error', function() {
      beforeEach(async function () {
        token = await SixPillars.new()
        await token.mint(owner, inscription, true)
        tokenId = await token.tokenOfOwnerByIndex(owner, 0)
      })

      it("can not exec except owner", async function() {
        try {
          await token.setTokenURI(tokenId, uri)
          assert.fail()
        } catch (error) {
          assert.equal(error.message, CONTRACT_REVERT_ERROR_MESSAGE)
        }
      })
    })
  })

  describe('Events', function() {
    let transferLogs
    let approveLogs
    let tokenId
    const owner = accounts[1]
    const newOwner = accounts[2]
    const amount = new BigNumber(1000)
    const transferUser = accounts[3]

    before(async function () {
      token = await SixPillars.new()
      await token.mint(owner, inscription, true)
      tokenId = await token.tokenOfOwnerByIndex(owner, 0)

      const transactionHash = await token.contract.approve['address,uint256,uint256'].sendTransaction(ADDRESS_ZERO, tokenId, amount, {from: owner, gas: TEST_GAS})
      const receipt = await web3.eth.getTransactionReceipt(transactionHash)
      approveLogs = receipt.logs

      const transaction = await token.transferFrom(owner, newOwner, tokenId, {from: transferUser, value: amount})
      transferLogs = transaction.logs
    })

    describe('Transfer', function() {
      describe('success', function() {
        it('size', async function() {
          transferLogs.length.should.be.eq(2)
        })

        it('Transfer event', async function() {
          const logs = transferLogs.filter((log) => { return log.logIndex == 0 })
          logs.length.should.be.eq(1)
          logs[0].event.should.be.eq('Transfer')
          logs[0].args._from.should.be.eq(owner)
          logs[0].args._to.should.be.eq(newOwner)
          logs[0].args._tokenId.should.be.bignumber.eq(tokenId)
        })

        it('TransferWithAmount event', async function() {
          const logs = transferLogs.filter((log) => { return log.logIndex == 1 })
          logs.length.should.be.eq(1)
          logs[0].args._from.should.be.eq(owner)
          logs[0].args._to.should.be.eq(newOwner)
          logs[0].args._tokenId.should.be.bignumber.eq(tokenId)
          logs[0].args._amount.should.be.bignumber.eq(amount)
        })

        it('not auth other event', async function() {
          const authLogIndexes = [0, 1]
          for (const log of transferLogs) {
            if (!authLogIndexes.includes(log.logIndex)) {
              assert.fail()
            }
          }
        })
      })
    })

    describe('Approval', function() {
      describe('success', function() {
        it('size', async function() {
          approveLogs.length.should.be.eq(2)
        })

        it('Approval event', async function() {
          const logs = approveLogs.filter((log) => { return log.logIndex == 0 })
          logs.length.should.be.eq(1)
          logs[0].topics.length.should.be.eq(4)
          logs[0].topics[0].should.be.eq(web3.sha3('Approval(address,address,uint256)'))
          logs[0].topics[1].substr(-40, 40).should.be.eq(owner.substr(-40, 40))
          logs[0].topics[2].substr(-40, 40).should.be.eq(ADDRESS_ZERO.substr(-40, 40))
          const receiptTokenId = new BigNumber(logs[0].topics[3])
          receiptTokenId.should.be.bignumber.eq(tokenId)
        })

        it('ApprovalWithAmount event', async function() {
          const logs = approveLogs.filter((log) => { return log.logIndex == 1 })
          logs.length.should.be.eq(1)
          logs[0].topics.length.should.be.eq(4)
          logs[0].topics[0].should.be.eq(web3.sha3('ApprovalWithAmount(address,address,uint256,uint256)'))
          logs[0].topics[1].substr(-40, 40).should.be.eq(owner.substr(-40, 40))
          logs[0].topics[2].substr(-40, 40).should.be.eq(ADDRESS_ZERO.substr(-40, 40))
          const receiptTokenId = new BigNumber(logs[0].topics[3])
          receiptTokenId.should.be.bignumber.eq(tokenId)
          const receiptAmount = new BigNumber('0x' + logs[0].data.substr(2, 64))
          receiptAmount.should.be.bignumber.eq(amount)
        })

        it('not auth other event', async function() {
          const authLogIndexes = [0, 1]
          for (const log of approveLogs) {
            if (!authLogIndexes.includes(log.logIndex)) {
              assert.fail()
            }
          }
        })
      })
    })
  })
})
