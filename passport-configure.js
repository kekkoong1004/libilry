const LocalStrategy = require('passport-local').Strategy
const passport = require('passport')
const User = require('./models/userModel')
const bcrypt = require ('bcrypt')


const authenticate = () => {
  passport.use(new LocalStrategy(
    {usernameField: 'email'},
    async (username, password, done)  => { 
      try {
        const user = await User.findOne({email: username})
          if (!user) {
            return done(null, false, {message: 'User does not exist'})
          }
        const passwordMatched = await bcrypt.compare(password, user.hashedPassword)
          if (!passwordMatched) {
            return done(null, false, {message: 'Incorrect Password'})
          } 
        return done(null, user);
      } catch {
        return res.redirect('/users/login')
      }
    }
  ))
  
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user)
    })
  })


}

module.exports = authenticate