const express = require('express')
const router = express.Router()
const Book = require('../../models/bookModel')

router.get('/', async (req, res) => {
  let books
  try {
    books = await Book.find().sort({createdAt: 'DESC'}).limit(10)
    res.render('index', {books: books})
  } catch {
    books = []
    res.redirect('/')
  }
})

module.exports = router