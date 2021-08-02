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
const { uploadImage, downloadImage, deleteImage } = require('../../../s3')

// Get all books
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

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author')
    const image = book.coverImg
    const fileDownloaded = await downloadImage(image)
    const base64 = await encode(fileDownloaded.Body)
    res.render('books/show', { book:book, base64: base64 })
  } catch (err) {
    console.log(err)
    res.redirect('/books')
  }
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
    const newBook = await book.save();
    const fileUploaded = await uploadImage(req.file)
    deleteImgFile(book.coverImg)
    res.redirect('/books')
  } catch (err) {
    if (newBook) {
      await newBook.remove()
    }
    if (fileUploaded) {
      await deleteImage(fileName)
    }
    console.log(err)
    renderNewPage(res, book, true)
  }
})

// Get to edit page
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    const authors = await Author.find()
    const image = book.coverImg
    const fileDownloaded = await downloadImage(image)
    const base64 = await encode(fileDownloaded.Body)
    res.render('books/edit',
      {
        book: book,
        authors: authors,
        base64: base64
      })
  } catch (err) {
    console.log(err)
    res.redirect('/books/')
  }
})

// Update a book
router.put('/:id', upload.single('coverImg'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  try {
    let book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount =  req.body.pageCount
    book.description = req.body.description
    if (fileName !== null) {
      book.cover = fileName
      book.imgMimeType = req.file.mimetype
    }
    book = await book.save()
    if (fileName !== null) {
      const newUpload = await uploadImage(req.file)
      deleteImgFile(book.coverImg)
    }
    res.redirect(`/books/${book.id}`)
  } catch (err) {
    console.log(err)
    renderNewPage(res, book, true)
  }
})

// Delete single book
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    const imageFile = book.coverImg
    const bookRemoved = await book.remove()
    const imageDeleted = await deleteImage(imageFile)
    res.redirect('/books')
  } catch (err) {
    if (book != null) {
      res.render(`books/show`, {
        book: book,
        errorMessage: 'Could not remove book.'
      })
    } else {
      console.log(err)
      res.redirect(`/books`)
    }
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
    const deleteDone = await Book.deleteMany()
    res.redirect('/books/')
  } catch (err) {
    console.log(err)
    res.redirect('/')
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

function encode(data) {
  let buf = Buffer.from(data)
  let base64 = buf.toString('base64')
  return base64
}

module.exports = router