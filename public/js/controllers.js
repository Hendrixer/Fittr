'use strict';

/* Controllers */

angular.module('Fittr')
.controller('AppCtrl', function ($scope, $http, $timeout) {
  $scope.name = 'Fittr';
  $scope.someone = 'The World';
  // Array of random names for Jumbotron
  var names = ['LeBron', 'Manning', 'San Francisco', '94102', 'your friends', 'Westbrook', 'The World', 'Rose', 'Jeter','Fred','your Mom', 'your brother'];

  // return a random name
  var randomName = function() {
    var name = Math.floor(Math.random() * (names.length));
    $scope.someone = names[name];
  };

  // set name to a random name on an interval
  setInterval(function() {
    $scope.$apply(function(){
      randomName();
    })
  }, 2000);
})

// sign up controller
.controller('Signup', function ($scope, $http) {
  $scope.name = 'Signup';
})

// Dashbord controller
.controller('Dashboard', function ($scope, $rootScope, $http, FitbitData) {
  $scope.name = 'Dashboard';
  $scope.stats = function(data) { // callback function to retrieve async data from fitbit
    console.log('data from frontend ', data);
    $scope.yourAvg = data;
  };


  // userd to update user email
  // FIXME: currentlly not using user email
  $scope.submit = function() {
    FitbitData.update($scope.email);
    $scope.checkEmail();
  };
  $scope.email = 'email';
  $scope.checkEmail = function() {
    return $rootScope.user.email;
  };

  //==========================================
  //  callback function to print chart from
  //  async data from the db.
  //==========================================
  $scope.averageCallback = function(data) {
    console.log('average step data', data);
    var stepSum = 0;
    var calSum = 0;
    for (var i = 0; i < data.length; i++){
      stepSum += data[i].steps;
      calSum += data[i].caloriesOut;
    }
    $scope.stepAvg = stepSum/data.length;
    // $scope.yesterday = data[data.length-1].steps;
    $scope.stepsChart = [
      {
        "key": "Your Average",
        "values": [ [ 'Steps Taken' , $scope.yourAvg], [ 'Steps Goal' , 10000] ]
      },
      {
        "key": "Global Average",
        "values": [ [ 'Steps Taken' , $scope.stepAvg], [ 'Steps Goal' , 10000] ]
      }
    ];
  };
  $scope.getAverage = function() {
    FitbitData.retrieve($scope.myDates, $scope.stats);
    FitbitData.getData($scope.myDates, $scope.averageCallback); // AverageSteps is a factory fn found in services.js
    $scope.show = true;
  };
  $scope.dateOptions = {
    changeYear: true,
    changeMonth: true,
    yearRange: '2010:-0'
  };
  $scope.myDates; //the datepicker stores the dates as {'from':'someDate', 'to':'someDate'}
});