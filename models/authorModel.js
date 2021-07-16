const mongoose = require('mongoose')
const schema = mongoose.Schema
const Book = require('./bookModel')

const authorSchema = new schema({
  name : {
    type: [String, "Enter a new name"],
    required: true,
    unique: [true, "Name already existed"]
  }
}, {
  timestamps: true
})




module.exports = mongoose.model('Author', authorSchema)