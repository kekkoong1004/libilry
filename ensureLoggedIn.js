module.exports = function ensureLoggedIn(req, res, next) {
  console.log(req.isAuthenticated())
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect('/users/login')
  }
  
}