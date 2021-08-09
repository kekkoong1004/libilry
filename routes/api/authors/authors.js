const { ConnectContactLens } = require('aws-sdk')
const express = require('express')
const router = express.Router()
const Author = require('../../../models/authorModel')
const Book = require('../../../models/bookModel')
const { downloadImage } = require('../../../s3')

// All Authors route
router.get('/', async (req, res) => {0
  let searchOptions = {}
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    res.render('authors/index', { authors: authors, searchOptions: req.query })
  }
  catch (error) {
    res.render('/', {errorMessage: error})
  }
})

// New author form
router.get('/new', (req, res) => {
  res.render('authors/new', {author: new Author()})
})



// Create new author
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  })
  try {
    const newAuthor = await author.save()
    res.redirect('/authors')
  }
  catch (error) {
    res.render('authors/new', {
      author :req.body.name,
      errorMessage: `Error creating new author: ${error}`
    })
  }
})

// Delete all authors
router.post('/del', async (req, res) => {
  try { 
    let deleteDone = await Author.deleteMany()
    res.redirect('/')
  }
  catch {
    res.redirect('/', {errorMessage: "Error deleting authors."})
  }
})

// Show single author page
router.get('/:id', async (req, res) => {
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
    res.render('authors/show', {author: author, books:books, base64Files: base64Files})
  }
  catch (err) {
    console.log(err)
    res.redirect('/authors/')
  }
})

// Get the edit page
router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    if (author !== null) {
      res.render('authors/edit', { author: author })
    }
  } catch (err) {
    console.log(err)
    res.redirect('/authors')
  }
  
})

router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    const books = await Book.find({ author: req.params.id })
    if (books.length > 0) {
      throw error("Unable to delete author with book written.")
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