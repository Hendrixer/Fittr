var User = require('../app/models/users.js');
var Steps = require('../app/models/fbSteps.js');
var config = require('./auth.js').fitbit;
var fitbitClient = require('fitbit-js')(config.consumerKey, config.consumerSecret);

module.exports = {
  // Base URL for config - no trailing slash
  // baseUrl: 'http://127.0.0.1:3000',
  baseUrl: 'http://frozen-tor-6324.herokuapp.com',
  
  // =========================
  // Home page
  // =========================
  index: function(req, res) {
    res.sendfile('index.html', {root:__dirname + '/../public/'});
  },

  // ======================================
  // Check to see if user is auth, used to
  // protect our angular routes from unauth
  // users
  // ======================================
  loggedin: function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
  },

  // ========================
  // Post user email here
  // ========================
  updateEmail: function(req, res) {
    var query = {id: req.user._id};
    var email = req.body.email;

    User.findById(query.id, function(err, user) {
      if(err) {
        console.log('could not find user to update email', err);
        return err;
      }
      console.log('user', user);
      user.email = email;
      user.save(function(err) {
        if(err) {
          console.log('could not save ' + user.name + ' email', err);
        }
      });
    });
    res.send(201);
  },

  // =========================
  // logout route
  // =========================
  logout: function(req, res) {
    req.logout();
    res.redirect('/');
  },

  // =========================
  // DB routes
  // =========================

  allUsersActivity: function(req, res) {
    var query = {};
    dateRange(req.params.from, req.params.to, query);
    console.log('db query', query)
    Steps.find(query, function(err, stats) {
      if(err) {
        console.log('Error getting all users stats', err);
        res.send(err);
      }
      if(stats) {
        res.json(stats);
      }
    });
  },

  // ===========================
  // query DB to get single user
  // steps
  // ===========================

  userActivity: function(req, res) {
    var query = { userId: req.user._id };
    dateRange(req.params.from, req.params.to, query);

    Steps.findOne(query, function(err, steps) {
      if(err) {
        res.send(err);
      } else if(steps) {
        console.log('db data', steps.steps);
        res.json(steps.steps);
      }
    });
  }
}

var dateRange = function(dateFrom, dateTo, query) {
  dateFrom = (dateFrom === '-') ? undefined : dateFrom;
  dateTo   = (  dateTo === '-') ? undefined : dateTo;

  if(dateFrom !== undefined && dateTo !== undefined) {
    query.date = { $gte: dateFrom, $lte: dateTo };
  } else {
    if(dateFrom !== undefined) {
      query.date = { $gte: dateFrom };
    }

    if(dateTo !== undefined) {
      query.date = { $lte: dateTo };
    }
  }
};