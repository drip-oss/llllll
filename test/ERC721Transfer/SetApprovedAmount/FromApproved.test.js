import { mintTestTokens, setApprovedTokens } from '../../helpers/mintTestTokens'
import { ADDRESS_ZERO, TOKEN_AMOUNT } from '../../helpers/values'
import shouldBehaviourTransferOwner from '../../behaviour/ERC721TransferOwner.behaviour'
import shouldBehaviourTransferApproved from '../../behaviour/ERC721TransferApproved.behaviour'
import shouldBehaviourSafeTransferOwner from '../../behaviour/ERC721SafeTransferOwner.behaviour'
import shouldBehaviourSafeTransferApproved from '../../behaviour/ERC721SafeTransferApproved.behaviour'
import revertTransfers from '../../behaviour/ERC721RevertTransfers.behaviour'

const SixPillars = artifacts.require("SixPillars")

async function createAndMintToken(owners, creators, approved) {
  const token = await SixPillars.new()
  await mintTestTokens(token, owners, creators)
  await setApprovedTokens(token, owners, approved, TOKEN_AMOUNT)
  return token
}

contract('ERC721Transfer SetApprovedAmount FromApproved', function(accounts) {
  const owners = Array(accounts[1], accounts[2], accounts[3])
  const creators = Array(accounts[4], accounts[5], accounts[6])
  const approved = accounts[7]
  const data = "hogehoge"

  describe("to owner", function() {
    before(async function() {
      const token = await createAndMintToken(owners, creators, approved)
      this.token = token
    })

    describe("with no value", function() {
      revertTransfers(owners[0], owners[0], approved, 0)
    })

    describe("with value", function() {
      revertTransfers(owners[0], owners[0], approved, TOKEN_AMOUNT)
    })
  })

  describe("to third party", function() {
    const newOwner = accounts[0]

    describe("with no value", function() {
      before(async function() {
        const token = await createAndMintToken(owners, creators, approved)
        this.token = token
      })
      revertTransfers(owners[0], newOwner, approved, 0)
    })

    describe("with value", function() {
      describe("transferFrom", function() {
        before(async function() {
          const token = await createAndMintToken(owners, creators, approved)
          this.token = token
        })
        shouldBehaviourTransferApproved(owners, newOwner, approved, TOKEN_AMOUNT)
      })
      describe("safeTransferFrom", function() {
        before(async function() {
          const token = await createAndMintToken(owners, creators, approved)
          this.token = token
        })
        shouldBehaviourSafeTransferApproved(owners, newOwner, approved, TOKEN_AMOUNT, null)
      })
      describe("safeTransferFrom(data)", function() {
        before(async function() {
          const token = await createAndMintToken(owners, creators, approved)
          this.token = token
        })
        shouldBehaviourSafeTransferApproved(owners, newOwner, approved, TOKEN_AMOUNT, data)
      })
    })
  })

  describe("to zero", function() {
    const newOwner = ADDRESS_ZERO

    before(async function() {
      const token = await createAndMintToken(owners, creators, approved)
      this.token = token
    })

    describe("with no value", function() {
      revertTransfers(owners[0], newOwner, approved, 0)
    })

    describe("with value", function() {
      revertTransfers(owners[0], newOwner, approved, TOKEN_AMOUNT)
    })
  })

  describe("to approved", function() {
    describe("with no value", function() {
      before(async function() {
        const token = await createAndMintToken(owners, creators, approved)
        this.token = token
      })
      revertTransfers(owners[0], approved, approved, 0)
    })

    describe("with value", function() {
      describe("transferFrom", function() {
        before(async function() {
          const token = await createAndMintToken(owners, creators, approved)
          this.token = token
        })
        shouldBehaviourTransferApproved(owners, approved, approved, TOKEN_AMOUNT)
      })
      describe("safeTransferFrom", function() {
        before(async function() {
          const token = await createAndMintToken(owners, creators, approved)
          this.token = token
        })
        shouldBehaviourSafeTransferApproved(owners, approved, approved, TOKEN_AMOUNT, null)
      })
      describe("safeTransferFrom(data)", function() {
        before(async function() {
          const token = await createAndMintToken(owners, creators, approved)
          this.token = token
        })
        shouldBehaviourSafeTransferApproved(owners, approved, approved, TOKEN_AMOUNT, data)
      })
    })
  })
})
