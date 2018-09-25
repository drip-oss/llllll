import { zeroPadding } from './zeroPadding'

function createInterfaceId(web3, interfaces) {
  let id = 0
  interfaces.forEach((str) => {
    id = id ^ parseInt(web3.sha3(str).substr(0, 10), 16)
  })
  if (id < 0) {
    // toString すると負の値になるので、ビット反転してから toString して先頭1文字を操作
    const bottom = zeroPadding((id & 0x7fffffff).toString(16), 8)
    const top = (parseInt(bottom.substr(0, 1), 16) + 8).toString(16)
    return "0x" + top + zeroPadding(bottom.toString(16), 7)

  } else {
    return "0x" + zeroPadding(id.toString(16), 8)
  }
}

module.exports = {
  createInterfaceId,
}
