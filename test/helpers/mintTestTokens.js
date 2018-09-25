import { TEST_GAS } from './values'

async function mintTestTokens(token, owners, creators) {
  const inscription = 0x1234
  let txs = Array()
  owners.forEach((owner) => {
    creators.forEach((creator) => {
      Array.from({length: 4}).forEach(() => {
        txs.push({owner: owner, creator: creator})
      })
    })
  })
  for (const h of txs) {
    await token.mint(h.owner, inscription, true, {from: h.creator})
  }
}

async function setApprovedTokens(token, owners, approved, amount) {
  const methodParams = !amount ? 'address,uint256' : 'address,uint256,uint256'
  const approve = token.contract.approve[methodParams]
  const promises = owners.map((owner) => {
    return token.balanceOf(owner)
  })
  const lengthArr = (await Promise.all(promises)).map((value) => {
    return value
  })

  let i, n
  if (!amount) {
    for (i = 0; i < owners.length; i++) {
      for (n = 0; n < lengthArr[i]; n++) {
        const tokenId = await token.tokenOfOwnerByIndex(owners[i], n)
        await approve.sendTransaction(approved, tokenId, {from: owners[i], gas: TEST_GAS})
      }
    }
  } else {
    for (i = 0; i < owners.length; i++) {
      for (n = 0; n < lengthArr[i]; n++) {
        const tokenId = await token.tokenOfOwnerByIndex(owners[i], n)
        await approve.sendTransaction(approved, tokenId, amount, {from: owners[i], gas: TEST_GAS})
      }
    }
  }
}

module.exports = {
  mintTestTokens,
  setApprovedTokens,
}
