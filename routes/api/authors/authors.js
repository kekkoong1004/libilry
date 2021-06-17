const express = require('express')
const router = express.Router()
const Author = require('../../../models/authorModel')

// All Authors route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    res.render('authors/index', { authors: authors, searchOptions: req.query })
  }
  catch {
    res.render('/', {errorMessage: "Error rendering page."})
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
  catch {
    res.render('authors/new', {
      author :req.body.name,
      errorMessage: "Error creating new author."
    })
  }
})

router.post('/del', async (req, res) => {
  try { 
    let deleteDone = await Author.deleteMany()
    res.redirect('/')
  }
  catch {
    res.redirect('/', {errorMessage: "Error deleting authors."})
  }
})

module.exports = router