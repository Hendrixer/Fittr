var mongoose      = require('mongoose'),
    db            = mongoose.connect('mongodb://localhost/fittr'),
    User          = require('./app/models/users.js'),
    Steps         = require('./app/models/fbSteps.js'),
    config        = require('./config/auth.js').fitbit,
    fitbitClient  = require('fitbit-js')(config.consumerKey, config.consumerSecret, config.callbackURL);
    moment        = require('moment');

// =================================
// get all users fibit access tokens
// retrieve prior days info and save
// to database
// =================================
var yesterday = function() {
  var date = moment();
  date = date.subtract('days', 1).format('YYYY-MM-DD');
  return date;
}();

var updateActivitiesDb = function(userActivities) {
  var dailyActivities = new Steps({
    userId:           userActivities.id,
    date:             userActivities.date,
    steps:            userActivities.summary.steps,
    distances:        userActivities.distances,
    caloriesBurned:   userActivities.caloriesOut,
    sedentaryMins:    userActivities.summary.sedentaryMinutes,
    lightActMins:     userActivities.summary.lightlyActiveMinutes,
    fairlyActMins:    userActivities.summary.fairlyActiveMinutes,
    veryActMins:      userActivities.summary.veryActiveMinutes
  });

  dailyActivities.save(function(err, activities, numAffected) {
    if (err) throw err;
    else {
      console.log('activities', activities);
      console.log('number affected', numAffected);
    }
  });
};

var getActivities = function(users) {
  for (var i = 0; i < users.length; i++) {
    (function(index){
      var user = users[index];
      var token = {
        oauth_token: user.fitbit.token,
        oauth_token_secret: user.fitbit.tokenSecret
      };

      fitbitClient.apiCall(
        'GET', '/user/-/activities/date/' + yesterday + '.json',
        {token: token},
        function(err, resp, userActivities) {

          if (err) console.log(err);
          else {
            userActivities.id = user._id;
            userActivities.date = yesterday;
            console.log('----- User ----');
            console.log(userActivities);
            updateActivitiesDb(userActivities);
          }
        }
      );
    })(i);
  }
};

var updateProfileDb = function(userProfile, user) {
  // updates displayName and profPic
  console.log('updateProfileDb\'s userProfile obj', userProfile);
  var query = { _id: user._id };
  User.update(
    query,
    { $set: {
          'fitbit.displayName': userProfile.user.displayName,
          'fitbit.profilePic': userProfile.user.avatar
        }
    },
    // {upsert: true},
    function(err, numAffected, raw) {
      if (err) console.log(err);
      console.log('rows affected:', numAffected);
      console.log('mongo response:', raw);
    }
  );
};

var getProfile = function(users) {
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    var token = {
      oauth_token: user.fitbit.token,
      oauth_token_secret: user.fitbit.tokenSecret
    };

    fitbitClient.apiCall(
      'GET',
      '/user/-/profile.json',
      {token: token},
      function(err, resp, userProfile) {
        if (err) console.log(err);
        else {
          updateProfileDb(userProfile, user);
        }
      }
    );
  }
};

// Grab all users from DB
User.find({}, function(err, users) {
  if (err) {
    console.log('could not find users', err);
    return err;
  }

  if (users) {
    getActivities(users);
    getProfile(users);
  }
});


