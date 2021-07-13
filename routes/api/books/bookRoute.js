const express = require('express')
const router = express.Router()
const fs = require('fs')
const Book = require('../../../models/bookModel')
const Author = require('../../../models/authorModel')
const multer = require('multer')
const path = require('path')
const uploadPath = path.join('public', Book.imgBasePath)
const imgMimeTypes = ['image/gif', 'image/ief', 'image/jpeg', 'image/png', 'image/svg+xml']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imgMimeTypes.includes(file.mimetype))
  }
})
const { uploadImage, downloadImage, deleteImage }  = require('../../../s3')


router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != "") {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishBefore != null && req.query.publishBefore != "") {
    query = query.lte('publishDate', req.query.publishBefore)
  }
  if (req.query.publishAfter != null && req.query.publishAfter != "") {
    query = query.gte('publishDate', req.query.publishAfter)
  }
  try {
    const books = await query.exec()
    let base64Files = []
    for (let i = 0; i < books.length; i++) {
      imgDownload = await downloadImage(books[i].coverImg)
      let fileEncoded = await encode(imgDownload.Body)
      base64Files.push(fileEncoded)
    }
    const params = {
      books: books,
      searchOptions: req.query,
      base64Files: base64Files
    }
    res.render('books/index', params)
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

// new book form
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create a new book
router.post('/', upload.single('coverImg'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
    coverImg: fileName,
    imgMimeType : req.file.mimetype
  })
  try {
    let newBook = await book.save()
    let newUpload = await uploadImage(req.file)
    deleteImgFile(book.coverImg)
    res.redirect('/books')
  } catch (err) {
    console.log(err)
    renderNewPage(res, book, true)
  }
})

// Delete all books collections
router.post('/del', async (req, res) => {
  try {
    const books = await Book.find()
    const bookKeys = []
    books.forEach(book => {
      bookKeys.push(book.coverImg)
    })
    imagesDeleted = []
    for (let i = 0; i < bookKeys.length; i++) {
      let imageDelete = await deleteImage(bookKeys[i])
      imagesDeleted.push(imageDelete)
    }
    res.redirect('/books/')
    const deleteDone = await Book.deleteMany()
  } catch (err) {
    console.log(err)
  }
})

// Functions
async function renderNewPage(res, book, hasError=false) {
  try {
    const authors = await Author.find()
    params = {
      book: book,
      authors: authors
    }
    if (hasError) params.errorMessage = "Error rendering page."
    res.render('books/new', params)
  } catch (error) {
    console.log(error)
    res.redirect('/books/new', { book: new Book({}) })
  }
}

function deleteImgFile(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err)
  })
}

async function encode(data) {
  let buf = Buffer.from(data)
  let base64 = buf.toString('base64')
  return base64
}

module.exports = router