const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should()

// MARK: this.token に オブジェクトが入っている前提で動かしてください
export default function shouldBehaviourTransferApproved(owners, newOwner, approved, value) {
  it("newOwner はトークンを持っていない状態から始まる", async function() {
    const token = this.token
    const balance = await this.token.balanceOf(newOwner)
    balance.should.be.bignumber.equal(0)
  })

  it("古い順に渡す", async function() {
    const token = this.token
    const owner = owners[0]
    let i
    for (i = 0; i < 12; i++) {
      const tokenId = await token.tokenOfOwnerByIndex(owner, 0)
      await token.transferFrom(owner, newOwner, tokenId, {from: approved, value: value})
    }
    const newOwnerBalance = await token.balanceOf(newOwner)
    newOwnerBalance.should.be.bignumber.equal(12)
    const ownerBalance = await token.balanceOf(owner)
    ownerBalance.should.be.bignumber.equal(0)
  })

  it("新しい順に渡す", async function() {
    const token = this.token
    const owner = owners[1]
    let i
    for (i = 11; 0 <= i; i--) {
      const tokenId = await token.tokenOfOwnerByIndex(owner, i)
      await token.transferFrom(owner, newOwner, tokenId, {from: approved, value: value})
    }
    const newOwnerBalance = await token.balanceOf(newOwner)
    newOwnerBalance.should.be.bignumber.equal(24)
    const ownerBalance = await token.balanceOf(owner)
    ownerBalance.should.be.bignumber.equal(0)
  })

  it("ランダムに渡す", async function() {
    const token = this.token
    const owner = owners[2]
    let i
    for (i = 12; 0 < i; i--) {
      const index = Math.floor(Math.random() * i)
      const tokenId = await token.tokenOfOwnerByIndex(owner, index)
      await token.transferFrom(owner, newOwner, tokenId, {from: approved, value: value})
    }
    const newOwnerBalance = await token.balanceOf(newOwner)
    newOwnerBalance.should.be.bignumber.equal(36)
    const ownerBalance = await token.balanceOf(owner)
    ownerBalance.should.be.bignumber.equal(0)
  })

  it("totalSupply と一致", async function() {
    const token = this.token
    const supply = await token.totalSupply()
    const newOwnerBalance = await token.balanceOf(newOwner)
    supply.should.be.bignumber.equal(newOwnerBalance)
  })
}
