const express = require('express')
const router = express.Router()
const fs = require('fs')
const mongoose = require('mongoose')
const Book = require('../../../models/bookModel')
const Author = require('../../../models/authorModel')
const multer = require('multer')
const path = require('path')
const uploadPath = path.join('public', Book.imgBasePath)
const imgMimeTypes = ['image/gif', 'image/ief', '	image/jpeg', 'image/jpeg', 'image/png', 'image/svg+xml']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imgMimeTypes.includes(file.mimetype))
  }
})

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
    const params = {
      books: books,
      searchOptions: req.query
    }
    res.render('books/index', params)
  } catch {
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
    coverImg: fileName
  })
  try {
    const newBook = await book.save()
    res.redirect('/books')
  } catch {
    if (book.coverImg != null) {
      deleteImgFile(book.coverImg)
    }
    renderNewPage(res, book, true)
  }
})

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

module.exports = router