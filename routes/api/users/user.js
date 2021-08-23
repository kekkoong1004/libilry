const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../../../models/userModel')
const { render } = require('ejs')
const passport = require('passport')
const connectEnsureLogin  = require('connect-ensure-login').ensureLoggedIn
const ensureLoggedIn = require('../../../ensureLoggedIn')

// Sign Up form
router.get('/new', (req, res) => {
  res.render('users/new')
})



// Sign up for member
router.post('/', async(req, res) => {
  // Check if username & email has been taken.
  const username =  req.body.username
  const email = req.body.email
  User.findOne({username:username}, (err, user) => {
    if (err) console.log(err)
    if (user) {
      return res.render('users/new', {errorMessage: "This username has been used."})
    }

  User.findOne({email:email}, (err, existedEmail) => {
    if (err) console.log(err)
    if(existedEmail) {
      return res.render('users/new', {errorMessage: "This email has been used."})
    }
  })
  })

  // Check if password and confirmed Password is the same
  if (req.body.password != req.body.confirmPassword) {
    return res.render('users/new', {
      errorMessage: "Password and Confirm password not the same."
    })
  }
  // Check if password length is > 6
  if (req.body.password.length < 6 && req.body.confirmPassword.length < 6) {
    return res.render('users/new', {
      errorMessage: "Password must have at least 6 characters."
    })
  }

  // if nothing wrong: 
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      hashedPassword: hashedPassword
    })
    const newUser = await user.save()
    req.login(newUser, (err) => {
      if (err) throw err
      return res.redirect('/')
    })

  } catch (err){
    console.log(err)
    res.redirect('/')
  }
})

// Login form
router.get('/login', (req, res) => {
  res.render('users/sign-in')
})

// Login a user
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}))

// Logout a user
router.get('/logout', ensureLoggedIn, (req, res) => {
  req.logout()
  return res.redirect('/')
})

// Show a user profile
router.get('/show', ensureLoggedIn, (req, res) => {
  res.render('users/show', {user: req.user})
})


module.exports = router