function toBase64(books) {
  let base64Files = []
  for (let i = 0; i < books.length; i++) {
    imgDownload = await downloadImage(books[i].coverImg)
    let buf = Buffer.from(data)
    let base64 = buf.toString('base64')
    base64Files.push(fileEncoded)
    return base64Files
  }
}

exports.toBase64 = toBase64