if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// Importing middleware
const express = require('express')
const app = express()
const path = require('path')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')
const passport = require('passport')
const session = require("express-session")
const flash = require('express-flash')

// Middleware settings
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(expressLayouts)
app.set('layout', 'layouts/layout')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: true,
  saveUninitialized: true
}))
app.use(methodOverride('_method'))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

require('./passport-configure')()

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
const userRouter = require('./routes/api/users/user')

app.use('/', indexRouter)
app.use('/authors', authorsRouter)
app.use('/books', bookRouter)
app.use('/users', userRouter)

// App listen to port
app.listen(process.env.PORT || 5000)