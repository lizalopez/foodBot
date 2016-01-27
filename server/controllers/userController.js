module.exports = {
  signup: function(req, res) {
    var pg = require('pg');
    var connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/foodbot';
    var client = new pg.Client(connectionString);
    client.connect();
    var query = client.query("INSERT INTO Users (password, email) VALUES ('"+req.body.password+"','"+req.body.email+"');");
    // currently not rejecting signup attempts for existing users, instead creates new items if email already exists
    query.on('end', function(results) {
      res.send(201);
      client.end();
    });
  }, 
  retrieveOneUser: function(req, res) {
    var pg = require('pg');
    var connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/foodbot';
    var client = new pg.Client(connectionString);
    client.connect();
    var query = client.query("SELECT * FROM Users WHERE id = "+req.params.id+";");
    query.on('row', function(data) {
      res.status(200).json(data);
    });
    query.on('end', function() {
      //if no id  was found and res.status was not set, declare error to client
      res.status(400).json("USER does not exist");
      client.end();
    }); 
  },
  retrieveAllUsers: function(req, res) {
    var pg = require('pg');
    var connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/foodbot';
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
      client.end();
    });
  },
  signin: function(req, res) {
    var password = req.body.password;
    var email = req.body.email;
    var pg = require('pg');
    var connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/foodbot';
    var client = new pg.Client(connectionString);
    client.connect();
    var query = client.query("SELECT password FROM Users where email ='"+req.body.email+"'");
     query.on('row', function(results) {
      //input password does not match password in database
      if (results.password !== req.body.password) {
        res.status(400).json("Incorrect password");
      }
      else {
        res.status(201).json("User signed in");
      }
    });
    query.on('end', function() {
      //if no email was found and res.status was not set, declare error to client
      res.status(400).json("USER does not exist");
      client.end();
    });
  }
}

//)