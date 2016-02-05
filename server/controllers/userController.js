var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/foodbot';
var auth = require('../config/authOperations.js');
var Promise = require('bluebird');

module.exports = {
  signup: function(req, res) {
    var client = new pg.Client(connectionString);
    client.connect();
    //check if username already exists
    var checkUserQuery = client.query("SELECT * FROM Users where email ='"+req.body.email+"';", function(err, data) {
      if (err) {
        res.status(500).json("We're sorry, an error has occurred");
      } else if (data.rows.length > 0) {
        res.status(400).json('User with that email already exists');
        // res.redirect('/foodBot/auth/signup');
        // res.send({
        //   // status: 400,
        //   // json: 'User with that email already exists',
        //   redirect: '/signup'
        // });
      } else {
        var createUserQuery = client.query("INSERT INTO Users (password, email) VALUES (crypt('"+req.body.password+"', gen_salt('bf', 8)),'"+req.body.email+"') RETURNING id;", function(err, data) {
          var userData = {
            id: data.rows[0].id,
            email: data.rows[0].email
          }
          res.status(201).json(userData);
        });
        createUserQuery.on('end', function(results) {
          auth.createSession(req, res, req.body.email)
          // res.status(201).json('User session created');          
        });
      }
    });
    // checkUserQuery.on('end', function(results) {
  //   
    // });
  },
  storeUser: function(profile, next) {
    // console.log("##1 --- USER OBJECT:", profile);
    var userObj = {
      name: profile.displayName,
      email: profile.email,
      photo: profile.photos[0].value,
      googleID: profile.id,
    }
    // console.log("##2 -- CREATED USER OBJ AFTER PROFILE", userObj);

    var client = new pg.Client(connectionString);
    client.connect();
    var checkUserQuery = client.query("SELECT * FROM Users where email ='"+userObj.email+"';", function(err, checkUserData) {
      if (err) {
        // res.status(500).json("We're sorry, an error has occurred");
        next("We're sorry, an error has occurred", null);
      } else if (checkUserData.rows.length > 0) {
        // res.status(400).json('User with that email already exists');
        userObj.id = checkUserData.rows[0].id;
        next(null, userObj);
      } else {
        var createUserQuery = client.query("INSERT INTO Users (name, email, photo, googleID) VALUES ('"+userObj.name+"','"+userObj.email+"','"+userObj.photo+"','"+userObj.googleID+"') RETURNING id;", function(err, createUserData) {
          if (err) {console.log ("ERROR IN CREATE USER", err)}
            // console.log("##4 -- DATA RETURNED>>>>", createUserData);
            // next(null, createUserData.rows[0].id);
        userObj.id = createUserData.rows[0].id;
        // console.log("PROFILE IN USERCREATION :::::::::::::::", profile);
        // console.log("USER DATA>>>>>>:", userData)
        next(null, userObj);
      });
      }
    });
  },
  retrieveUserByGoogleID: function(gID, next) {

  },
  retrieveOneUser: function(email, next) {
    var id = {};
    var client = new pg.Client(connectionString);
    client.connect();
    var query = client.query("SELECT id FROM Users WHERE email = '"+email+"';");
    query.on('row', function(data) {
      id.id = data;
      // res.status(200).json(data);
      // console.log('##5 -- USER ID ^^^^^^^^^^^^^^^:', id); 
      next(null, id);
    });
    query.on('end', function() {
      //if no id  was found and res.status was not set, declare error to client
      // res.status(400).json("USER does not exist");      
    });
  },
  retrieveAllUsers: function(req, res) {
    var client = new pg.Client(connectionString);
    client.connect();
    var allUsers = [];
    var query = client.query("SELECT * FROM Users;");
    //collect all users in database
     query.on('row', function(data) {
      allUsers.push(data);
    });
    query.on('end', function() {
      res.status(201).json(allUsers);      
    });
  },
  signin: function(req, res) {
   var client = new pg.Client(connectionString);
   client.connect();
   
    client.query("SELECT * FROM Users where email ='"+req.body.email+"' AND password = crypt('"+req.body.password+"', password);", function(err, data) {
     if (err) {
       res.status(500).json("We're sorry, an error has occurred");
       // console.log('500');
     } else if (data.rows.length < 1) {
       res.status(400).json("Username or password is incorrect");
       // console.log('400');
     } else {
       var id = data.rows[0].id
       var userData = {
         email: data.rows[0].email
       };        
       var allUserData = {
         id: id,
         userData: userData,
         profileData: {},
         recipesData: [],
         matchData: {id: "", recipes: []}
       };

       var profileQuery = client.query("SELECT * FROM PROFILES AS P where P.id='"+id+"';")
        profileQuery.on('row', function(data) {
          console.log("data from profile query", data);
          allUserData.profileData = data;
          allUserData.matchData.id = data.match
        })

       var userQuery = client.query("SELECT * FROM PROFILES as P, UserRecipes as U where P.id = U.profileid and P.id='"+id+"';")      
        userQuery.on('row', function(data) {
          allUserData.recipesData.push({
            'recipeid' :data.recipeid,
             'created' :data.created
         });
          // console.log(data)
        })

        var matchQuery = client.query("SELECT * FROM USERRECIPES WHERE profileid IN (SELECT match from profiles where id='"+id+"');")
          var matchRec = allUserData.matchData.recipes
          matchQuery.on('row', function(data) {
            // console.log(data, "MATCHED FOOLS");
            if(!data.created && data.liked)
            matchRec.push(data)
          })

        matchQuery.on('end', function(data) {                      
          // console.log('matchdata sent is', allUserData.matchData)
          res.send(allUserData)
         });

        }
      })
  },
  logout: function(req, res) {
    req.session.destroy(function() {
      res.redirect('/foodBot/auth/signin');
    })
  }
}


//)