if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
// Importing middleware
const express = require('express')
const path = require('path')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')


// Middleware settings
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(expressLayouts)
app.set('layout', 'layouts/layout')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))


// Database config
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
const db = mongoose.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log("Connected to mongoose"))

// Routes
const indexRouter = require('./routes/api/index')
const authorsRouter = require('./routes/api/authors/authors')
const bookRouter = require('./routes/api/books/bookRoute')

app.use('/', indexRouter)
app.use('/authors', authorsRouter)
app.use('/books', bookRouter)

// App listen to port
app.listen(process.env.PORT || 5000)