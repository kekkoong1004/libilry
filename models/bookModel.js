const mongoose = require('mongoose')
const schema = mongoose.Schema
const imgBasePath = 'uploads/bookCoverImg'
const path = require('path')
const {downloadImage} = require('../s3')

const bookSchema = new schema({
  title: {
    type: String,
    required: true
  },
  publishDate: {
    type: Date,
    required: true
  },
  coverImg: {
    type: String,
    required: true
  },
  imgMimeType: {
    type: String,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, 
    ref: 'Author'
  }
}, { timestamps: true })


module.exports = mongoose.model('Book', bookSchema)
module.exports.imgBasePath = imgBasePath