import { zeroPadding } from './helpers/zeroPadding'
import { createInterfaceId } from './helpers/createInterfaceId'

const SixPillars = artifacts.require("SixPillars")

contract('Method ID', (accounts) => {
  let methods = Array()

  before(async function () {
    const token = await SixPillars.new()
    const contract = token.contract
    const ignoreMethodNames = ["request", "call", "sendTransaction", "estimateGas", "getData"]
    Object.keys(contract).filter((key) => {
      return (key !== "_eth") && (contract[key].sendTransaction !== undefined)
    })
    .forEach((methodName) => {
      Object.keys(contract[methodName]).filter((childName) => {
        return !ignoreMethodNames.includes(childName)
      })
      .forEach((childName) => {
        methods.push(`${methodName}(${childName})`)
      })
    })
  })

  it('重複していない', () => {
    const methodIds = methods.map((name) => { return web3.sha3(name).substr(2,8) })
    const multipleMethodIds = methodIds.filter((x, i, self) => { return self.indexOf(x) !== self.lastIndexOf(x) })
    assert.isNotEmpty(methodIds)
    assert.isEmpty(multipleMethodIds)
  })
})
