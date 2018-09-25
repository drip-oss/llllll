import { TEST_GAS, ADDRESS_ZERO, CONTRACT_REVERT_ERROR_MESSAGE } from './helpers/values'
const SixPillars = artifacts.require("SixPillars")
const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ERC721Event', (accounts) => {
  let token
  let tokenId
  let transferLogs
  let approveLogs
  let setApprovalForAllLogs
  const inscription = 0x1234
  const owner = accounts[0]
  const creator = accounts[1]
  const approved = accounts[2]
  const allApproved = accounts[3]
  const newOwner = accounts[4]

  before(async function () {
    token = await SixPillars.new()
    await token.mint(owner, inscription, true, {from: creator})
    tokenId = await token.tokenOfOwnerByIndex(owner, 0)

    // raw logs data
    const transactionHash = await token.contract.approve['address,uint256'](approved, tokenId, {from: owner, gas: TEST_GAS})
    const receipt = await web3.eth.getTransactionReceipt(transactionHash)
    approveLogs = receipt.logs

    // decoded logs data
    let transaction = await token.setApprovalForAll(allApproved, true, {from: owner})
    setApprovalForAllLogs = transaction.logs
    transaction = await token.transferFrom(owner, newOwner, tokenId, {from: approved})
    transferLogs = transaction.logs
  })

  it("Transfer", () => {
    transferLogs.length.should.be.eq(1)
    transferLogs[0].event.should.be.eq('Transfer')
    transferLogs[0].args._from.should.be.eq(owner)
    transferLogs[0].args._to.should.be.eq(newOwner)
    transferLogs[0].args._tokenId.should.be.bignumber.eq(tokenId)
  })

  it("Approval", () => {
    approveLogs.length.should.be.eq(1)
    approveLogs[0].topics.length.should.be.eq(4)
    approveLogs[0].topics[0].should.be.eq(web3.sha3('Approval(address,address,uint256)'))
    approveLogs[0].topics[1].substr(-40, 40).should.be.eq(owner.substr(-40, 40))
    approveLogs[0].topics[2].substr(-40, 40).should.be.eq(approved.substr(-40, 40))
    const receiptTokenId = new BigNumber(approveLogs[0].topics[3])
    receiptTokenId.should.be.bignumber.eq(tokenId)
  })

  it("ApprovalForAll", () => {
    setApprovalForAllLogs.length.should.be.eq(1)
    setApprovalForAllLogs[0].event.should.be.eq('ApprovalForAll')
    setApprovalForAllLogs[0].args._owner.should.be.eq(owner)
    setApprovalForAllLogs[0].args._operator.should.be.eq(allApproved)
    setApprovalForAllLogs[0].args._approved.should.be.true
  })
})
