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
        templateUrl: '/views/partials/main.html'
      })
      .when('/admin', {
        templateUrl: 'views/partials/admin.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when('/login', {
        templateUrl: 'views/partials/login.html',
      })
      .when('/signUp', {
        templateUrl: 'views/partials/signUp.html',
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


// app Login Controller
app.controller("LoginController",function ($scope, $http, _) {
    var accounts;
    var pw = "0";
    $http.get('/API/accounts').success(function(data){
        accounts = data;
    });
    // Searching through accounts and seeing if the login info (passed info from
    // signIn.html invocation from the input element as signInEmail and singInPassword) was correct.
    // Then if the login info exists in accounts, we will direct a user to 
    // their profile page else prompt them an error message.
    $scope.accountSignIn = function(email, password){
    // Check to see that the user exists.
        var getUser = _.findWhere(accounts, {email: email, password:password});
        if(getUser != null){
            alert("Your account exists!");
            // FGH TODO : direct user to their profile page.
            // Since placementsApp.js will be handling other client requests
            // to log in or register, perhaps we need to start in another thread
            // another js file to handle the session of a logged in user?
        }else
            alert("HI The entered login information does not exist in the system");
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
    
        if(email != null){
            // search for email given in the accounts list.
            var getUser = _.findWhere(accounts, {email: email});

            if(getUser != null){
                $http.post('/sendmail', {email: email})
                    .success(function (data){
                    pw = data;
                    alert("An email has been sent to " + email);  
                    getUser.password = pw;
                    $http.put('/API/accounts/'+ getUser._id , getUser);
                }); 
            }else{
                alert("The email specified does not exist.");
            }
        }
    };
});
