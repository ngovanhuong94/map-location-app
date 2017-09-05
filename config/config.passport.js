var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('./development').facebook;
var User = require('../models/model.user');


passport.serializeUser(function(user, done){
	done(null, user._id)
})

passport.deserializeUser(function(id,done){
	User.findOne({_id: id}, function(err, user){
		done(err,user);
	})
})



passport.use(new FacebookStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL	
}, function(accessToken, refreshToken, profile, done){
	User.findOne({providerId: profile.id}, function(err,user){
		if(err) {
		 done(err)
		}

		if(user) {
		  	done(null, user)
		}

		if(!user) {
			var newUser = new User({
				providerId: profile.id
			})

			newUser.save(function(err){
				if(err) throw err;
				done(null, newUser)
			})
		}
	})
}))


