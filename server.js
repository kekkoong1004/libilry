if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const indexRouter = require('./routes/api/index')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(expressLayouts)
app.set('layout', 'layouts/layout')
app.use(express.static('public'))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.log(error))
db.once('open', () => console.log("Connected to mongoose"))

app.use('/', indexRouter)

app.listen(process.env.port || 5000)