const mongoose = require('mongoose')
const schema = mongoose.Schema

const authorSchema = schema({
  name : {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Author', authorSchema)