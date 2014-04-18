'use strict';
// underscore injection 
var underscore = angular.module('underscore', []);
    underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});

//var app = angular.module('placementsApp', ['ngRoute','underscore','ngResource'])
var app = angular.module('placementsApp', ['ngResource','ngRoute','underscore'])
    .config(function($routeProvider, $locationProvider, $httpProvider) {
    //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user){
        // Authenticated
        if (user !== '0')
          $timeout(deferred.resolve, 0);

        // Not Authenticated
        else {
          $rootScope.message = 'You need to log in.';
          $timeout(function(){deferred.reject();}, 0);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };
    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.responseInterceptors.push(function($q, $location) {
      return function(promise) {
        return promise.then(
          // Success: just return the response
          function(response){
            return response;
          }, 
          // Error: check the error status to get only the 401
          function(response) {
            if (response.status === 401)
              $location.url('/login');
            return $q.reject(response);
          }
        );
      }
    });
    //================================================

    //================================================
    // Define all the routes
    //================================================
    $routeProvider
      .when('/', {
        templateUrl: 'views/partials/main.html'
      })
      .when('/admin', {
        templateUrl: 'views/partials/admin.html',
        controller: 'AdminCtrl',
        // Makes sure the user is login
        resolve: { loggedin: checkLoggedin}
      })
      .when('/login', {
        templateUrl: 'views/partials/login.html'
      })
      .when('/signUp', {
        templateUrl: 'views/partials/signUp.html'
      })
      .otherwise({
        redirectTo: '/'
      });
    //================================================

  }) // end of config()
  .run(function($rootScope, $http){
    $rootScope.message = '';

    // Logout function is available in any pages
    $rootScope.logout = function(){
      $rootScope.message = 'Logged out.';
      $http.post('/logout');
    };
  });

/**********************************************************************
 * Admin controller
 **********************************************************************/
app.controller('AdminCtrl', function($scope, $http) {
  // List of users got from the server
  $scope.users = [];

  // Fill the array to display it in the page
  $http.get('/users').success(function(users){
    for (var i in users)
      $scope.users.push(users[i]);
  });
});


 // set a cotroller for accounts
app.controller("AccountController",function ($scope, $http, _) {
    var accounts;
    $http.get('/API/accounts').success(function(data){
        accounts = data;
    });

    $scope.addAccount = function(name, email,password,comName,phone) {
        $http.post('/API/accounts',{name: name, email: email,password:password, comName:comName,phone:phone}).success(function(data){
            accounts.push(data);
            $scope.user  = {
                name     : "",
                email    : "",
                password : "",
                comName  : "",
                phone    : ""
            };
        });
    };
     
    $scope.removeAccount = function(memberToRemove) {
        var index = accounts.indexOf(memberToRemove);
        $http.delete('/API/accounts/' + memberToRemove._id).success(function(){
            accounts.splice(index, 1);    
        });
    };

    $scope.showPassword = "password";
    $scope.pAction = "Show";
    $scope.passwordToggle = function(){
        $scope.showPassword = $scope.showPassword == "password"? "text": "password";
        $scope.pAction = $scope.pAction == "Show"?  "Hide" : "Show";
    };
});

/**********************************************************************
* SingUp controller
**********************************************************************/
app.controller("SingUpController", function ($scope, $http, _,$location) {

  $scope.SignUP = function(name, email,password,comName,phone) {
      $http.post('/API/accounts',{name: name, email: email,password:password, comName:comName,phone:phone}).success(function(data){
          $location.url('/login');
      });
  };
  
  $scope.showPassword = "password";
  $scope.pAction = "Show";
  $scope.passwordToggle = function(){
      $scope.showPassword = $scope.showPassword == "password"? "text": "password";
      $scope.pAction = $scope.pAction == "Show"?  "Hide" : "Show";
  };
});
/**********************************************************************
* Login controller
**********************************************************************/
app.controller("LoginController",function ($scope, $http, _, $location, $rootScope) {
    
    var pw = "0";
    $scope.user = {
      password : '',
      email : '',
      error : false
    };

    $scope.accountSignIn = function(){
      $http.post('/login', {
        username: $scope.user.email,
        password: $scope.user.password,
      })
      .success(function(user){
        // No error: authentication OK
        $rootScope.message = '';
        $location.url('/admin');
      })
      .error(function(){
        // Error: authentication failed
        $rootScope.message    = 'Authentication failed.';
        $scope.user.email     = '';
        $scope.user.password  = '';
        $scope.user.error     = true;
        //$location.url('/login');
      });
    };

    $scope.showPassword = "password";
    $scope.pAction = "Show";
    $scope.passwordToggle = function(){
        $scope.showPassword = $scope.showPassword == "password"? "text": "password";
        $scope.pAction = $scope.pAction == "Show"?  "Hide" : "Show";
    };

    // This function assumes all the emails in the accounts collection objects are unique.
    $scope.resetPassword = function(){
      var email = prompt("Please enter the email you would like to send reset password");
      // var accounts;
      // $http.get('/API/accounts?email:'+email).success(function(data){
      //   accounts = data;
      // });

      if(email != null){
        // search for email given in the accounts list.

        $http.put('/API/accounts/R/'+ email)
        .success(function (data){

        });



        $http.post('/sendmail', {email: email})
          .success(function (data){
          pw = data;
          alert("An email has been sent to " + email);  
          getUser.password = pw;
          $http.put('/API/accounts/'+ getUser._id , getUser);
        })
        .error(function(){
          alert("The email specified does not exist.");
        }); 
      }
    };
});
