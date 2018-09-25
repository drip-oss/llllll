function zeroPadding(str, count) {
  return (Array.from({length: count}, () => "0").join("") + str).slice(-count)
}

module.exports = {
  zeroPadding,
}
