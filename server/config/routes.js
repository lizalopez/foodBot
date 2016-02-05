// links to controllers
var matchController = require('../controllers/matchController.js');
var recipeController = require('../controllers/recipeController.js');
var userController = require('../controllers/userController.js');

var profileController = require('../controllers/profileController.js');
var mealController = require('../controllers/mealController.js');

var helpers = require('./helpers.js');
var auth = require('./authOperations.js');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var keys = require('./apiKeys.js');
var passport = require('passport');

module.exports = function(app, express) {

    // app.get('/foodBot/profile', userController.retrieveAllUsers); // Add AuthChecker
	// app.post('/foodBot/auth/signup', userController.signup);
	app.post('/foodBot/auth/signin', userController.signin); // Add AuthChecker
	app.get('/foodBot/auth/logout', userController.logout);

	// app.post('/foodBot/recipes/', recipeController.addMeal); // Add AuthChecker
	app.get('/foodBot/recipes/:id', auth.checkUser, recipeController.retrieveSuggestedRecipes); // Add AuthChecker

	app.get('/foodBot/meals/:id', auth.checkUser, mealController.retrieveUserMeals); // Add AuthChecker
	
	app.post('/foodBot/meals/:id', auth.checkUser, mealController.addUserMeal); // Add AuthChecker

	app.get('/foodBot/match/:id', auth.checkUser, matchController.retrieveMatch);
	app.post('/foodBot/match/:id', auth.checkUser, matchController.createMatch);
	app.delete('/foodBot/match/:id', auth.checkUser, matchController.deleteMatch);
	// app.get('/foodBot/users/home/:username', dashboardController.getUserProfile) // Add AuthChecker

	app.get('/foodBot/profile/:id', auth.checkUser, profileController.retrieveOneUser); // Add 4th argument to direct to matchController, Add AuthChecker
  app.post('/foodBot/profile/:id', auth.checkUser, profileController.addUserProfile, matchController.createMatch); // Add 4th argument to direct to matchController, Add AuthChecker
  // app.put('/foodBot/profile/:id', profileController.updateUserProfile); // Add 4th argument to direct to matchController, Add AuthChecker
  app.get('/foodBot/profile', auth.checkUser, profileController.retrieveAllUsers); //Add AuthChecker
	// app.get('/foodBot/profile/:id', auth.checkUser, profileController.retrieveOneUser); // Add 4th argument to direct to matchController
  // app.get('/foodBot/profile', auth.checkUser, profileController.retrieveAllUsers);


	// app.post('/foodBot/recipes/', auth.checkUser, recipeController.addMeal); // Add AuthChecker
	// app.get('/foodBot/recipes/:id',  auth.checkUser, recipeController.retrieveSuggestedRecipes) // Add AuthChecker

	// app.get('/foodBot/user/home/:id', auth.checkUser, dashboardController.getUserMeals) // Add AuthChecker
	// app.post('/foodBot/user/home/:id', auth.checkUser, dashboardController.addMeal); // Add AuthChecker
	// app.get('/foodBot/users/home/:username', auth.checkUser, dashboardController.getUserProfile) // Add AuthChecker

	passport.serializeUser(function(user, done) {
		//saves user to session (req.session.passport.user = {id: '..'})
			// console.log("serializeUser:", user)
		done(null, user.email);
	});

	passport.deserializeUser(function(user, done) {
		//find user by id (id, cb(err, user) {
			// console.log("deserializeUser:", user);
			// userController.retrieveUserByGoogleID:
			//done (err, user);
			//user object attaches to req as req.user
		// })
		done(null, user);
	});

	passport.use(new GoogleStrategy({
		clientID: keys.google.clientID,
		clientSecret: keys.google.clientSecret,
		callbackURL: keys.google.callbackURL
	},
	function(accessToken, refreshToken, profile, done) {
		// console.log("ACCESSING TOKEN ON CB FOR NEW GOOGLE STRAT", accessToken);
		process.nextTick(function() {
			//storeUser profile will not fire until we have all of our data back from Google
			//find user based on their email
			// var userIDFromDB = userController.storeUser(profile, accessToken, function(err,data) {
			// 	console.log("##5 --- userIDFromDB}}}}}}}}}}", data);
			// 	profile.DBid = data;
			// });
						// console.log("PROFILE after USER SAVE:", profile);
			return done(null, profile);
		})
	}
	));
	//send to google to do the authentication
	app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email'] }));
	//the callback ater google has authenticated the user
	app.get('/auth/google/callback',
		passport.authenticate('google', {failureRedirect: '/foodBot/auth/google' }),
		function(req, res) {
			// console.log("##3 --- INSIDE PASSPORT AUTHENTICATE:", req.user);
			// console.log("##3#### --- TOKEN???:", req.user.token);
			var userObj = {};
			userController.storeUser(req.user, function(err, userData) {
				if (err) {
					res.json(err);
				} else {
				console.log("##6 -- <<<<USERDATA FROM google/callback>>>>>", userData);
				userObj = {
					name: req.user.displayName,
					id: userData.id,
					photos: req.user.photos[0].value
				}
				req.DBid = userObj.id;
				res.json(userObj);		
				}
			});

		});
};