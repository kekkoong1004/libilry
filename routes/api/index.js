const express = require('express')
const router = express.Router()
const Book = require('../../models/bookModel')
const {downloadImage} = require('../../s3')

router.get('/', async (req, res) => {
  let books
  try {
    books = await Book.find().sort({ createdAt: 'DESC' }).limit(10)
    let base64Files = []
    for (let i = 0; i < books.length; i++) {
      let key = books[i]['coverImg']
      let imgDownload = await downloadImage(key)
      let fileEncoded = await encode(imgDownload.Body)
      base64Files.push(fileEncoded)
    }
    res.render('index', {books: books, base64Files: base64Files})
  } catch (err) {
    console.log(err)
    books = []
    res.redirect('/')
  }
})

function encode(data) {
  let buf = Buffer.from(data)
  let base64 = buf.toString('base64')
  return base64
}

module.exports = router