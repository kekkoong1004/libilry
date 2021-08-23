const { ConnectContactLens } = require('aws-sdk')
const express = require('express')
const router = express.Router()
const Author = require('../../../models/authorModel')
const Book = require('../../../models/bookModel')
const { downloadImage } = require('../../../s3')
const ensureLoggedIn = require('../../../ensureLoggedIn')

// All Authors route
router.get('/', ensureLoggedIn, async (req, res) => {0
  let searchOptions = {}
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    res.render('authors/index', { authors: authors, searchOptions: req.query, user: req.user })
  }
  catch (error) {
    res.render('/', {errorMessage: error, user: req.user})
  }
})

// New author form
router.get('/new', ensureLoggedIn, (req, res) => {
  res.render('authors/new', {author: new Author(), user: req.user})
})



// Create new author
router.post('/', ensureLoggedIn, async (req, res) => {
  const author = new Author({
    name: req.body.name,
    user: req.user
  })
  try {
    const newAuthor = await author.save()
    res.redirect('/authors')
  }
  catch (error) {
    res.render('authors/new', {
      author :req.body.name,
      errorMessage: `Error creating new author: ${error}`,
      user: req.user
    })
  }
})

// Delete all authors
router.post('/del', ensureLoggedIn, async (req, res) => {
  try { 
    let deleteDone = await Author.deleteMany()
    res.redirect('/')
  }
  catch {
    res.redirect('/', {errorMessage: "Error deleting authors."})
  }
})

// Show single author page
router.get('/:id', ensureLoggedIn, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    const books = await Book.find({ author: author.id }).sort({ createdAt: 'DESC' }).limit(10)
    let base64Files = []
    for (let i = 0; i < books.length; i++) {
      let key = books[i]['coverImg']
      let imgDownload = await downloadImage(key)
      let fileEncoded = await encode(imgDownload.Body)
      base64Files.push(fileEncoded)
    }
    res.render('authors/show', {author: author, books:books, base64Files: base64Files, user: req.user})
  }
  catch (err) {
    console.log(err)
    res.redirect('/authors/')
  }
})

// Get the edit page
router.get('/:id/edit', ensureLoggedIn, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    if (author !== null) {
      res.render('authors/edit', { author: author, user: req.user })
    }
  } catch (err) {
    console.log(err)
    res.redirect('/authors')
  }
  
})

router.put('/:id', ensureLoggedIn, async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    if (author !== null) {
      author.name = req.body.name
      newAuthor = await author.save()
      res.redirect(`/authors/${author.id}`) 
    } else {
      throw new Error("Author not exist")
    }
  } catch (err) {
    console.log(err)
    if (author == null) {
      res.redirect(`/authors/`)
    }
    res.redirect(`/authors/${author.id}`)
  }
})

// Delete a single author
router.delete('/:id', ensureLoggedIn, async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    const books = await Book.find({ author: req.params.id })
    if (books.length > 0) {
      req.flash("Unable to delete")
    } else {
      await author.remove()
    }
    res.redirect('/authors/')
  } catch (err) {
    res.redirect(`/authors/${author.id}`)
  }
})

function encode(data) {
  let buf = Buffer.from(data)
  let base64 = buf.toString('base64')
  return base64
}

module.exports = router