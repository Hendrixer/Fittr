var helpers = require('../config/routeHelpers.js');
module.exports = {

  facebook: {
    clientID: '292173437605995',
    clientSecret: 'd471dc58c7c519ded6d72aef4321495c',
    callbackURL: helpers.baseUrl + '/auth/facebook/callback'
  },

  fitbit: {
    consumerKey: '6b8b28e0569a422e97a70b5ca671df32',
    consumerSecret: 'b351c1fea45d48ed9955a518f4e30e72',
    callbackURL: helpers.baseUrl + '/auth/fitbit/callback'
  }

};