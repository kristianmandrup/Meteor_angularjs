# Angularjs in Meteor

## Configuration

The angular HTML page will be served by meteor. The page generation can be configured in the `server.js` file. The `angularAppConfig` object is used by default:

    var angularAppConfig = {
        name: 'meteorapp',
        appController: 'AppCtrl',
        template: {
            placeholderElement: '<body>',
            name: 'angular.html',
            locations: ['bundle/static/', 'public/'],    
    }     

* `name` - name of the Angular app (used for `ng-app` attribute and name of app module, default: `'meteorapp'`)
* appController - name used to define the main controller on the body element (default: `'AppCtrl'`)
* template - config options for how to load and insert the Angular template

### Angular template config options

* `placeholderElement` - the tag element to substitute with the template (default: `'<body>'`')
* `name` - the name of the template file (default: `'angular.html'`)
* `locations` - relative folder locations to search for the Angular template. 

Note that `locations` are set up to first try in the expected "deploy" location, then the development location.

If you define a config file `angularAppConfig.json`, it will be used for angular app configuration. Here an example of a custom config file:

    {
        name: 'my-meteorapp',
        appController: 'AppController',
        template: {
            placeholderElement: '<div ng-view>',
            name: 'main-view.html',
            locations: ['bundle/static/', 'public/'],    
    }

## Configuring the Angular app

Define the main angular module, named to match the config Angular app name config setting for the meteor server (default: `'meteorapp'`):

    angular.module('meteorapp', []).
        config(['$routeProvider', function($routeProvider) {
        $routeProvider.
             when('/index', {templateUrl: 'partials/index.html',   controller: MeteorCtrl}).
             otherwise({redirectTo: '/'});
    }]);

For a complete example, see [meteor-angular-leaderboard](https://github.com/bevanhunt/meteor-angular-leaderboard)

    # coffeescript example

    angular.module('meteorapp', [])
    .config ['$routeProvider', '$locationProvider', ($routeProvider, $locationProvider) ->
      $locationProvider.html5Mode(true)
      $routeProvider.when '/'
        controller: 'home'
]


### Directory structure

Create the angular template file with a name and location matching your server config settings.

Default structure:

     /public
         /partials
         angular.html(Main screen should contain body content)

Custom structure:

     /public
         /partials
         /angular
            main-view.html(Main screen should contain body content)

The router should load the index file when you navigate to root `'/'` of your app. The index file will then be served by meteor (see server.js)

Example 'index.html' file

     /client
        index.html

Example index HTML file

    <head>
      <title>Leaderboard</title>
    </head>

Meteor server will magically create the `<html>` and `<body>` element.

###Usage of $meteor

You can simply inject the $meteor module provided anywhere you want to use it, typically in your meteor-enabled controllers. Then execute the provided Meteor commands (see client.js)

    app.controller('MeteorCtrl', ['$scope','$meteor',function($scope,$meteor){
      $scope.todos = $meteor("todos").find({});
    	$meteor("todos").insert({
    	    name: "Do something",
    	    done: false
    	});
    }]);

    <div ng-repeat="todo in todos">
        <input type="text" ng-model="todo.name"/>
        <button ng-click="todo.save()">Save</button>
        <button ng-click="todo.remove()">Remove</button>
    </div>

### Current user

In order to add Meteor current user functionality:

See [current user issue #18](https://github.com/lvbreda/Meteor_angularjs/issues/18)

You can use something like:

    app.directive('currentUser', function($timeout) {
            return function(scope, element) {
                    var timeoutId; // timeoutId, so that we can cancel the user updates
                // used to update the UI
                function updateUser() {
                    element.text((Meteor.user() != null)? Meteor.user()._id : "anonymous");
                }
                // schedule update in one tenth of a second
                function updateLater() {
                    // save the timeoutId for canceling
                    timeoutId = $timeout(function() {
                        updateUser(); // update DOM
                        updateLater(); // schedule another update
                    }, 100);
                }
                // listen on DOM destroy (removal) event, and cancel the next UI update
                // to prevent updating user after the DOM element was removed.
                element.bind('$destroy', function() {
                    $timeout.cancel(timeoutId);
                });
                updateLater(); // kick off the UI update process.
            }
        });

The `currentUser` directive is by default a HTML element attribute.

    <span currentUser=""></span>

Then in a controller:

    $scope.currentUser = $meteor('users').find({_id:Meteor.userId()})

### Deploying

Make sure that you always write angularjs code that can be minified, else use the `--debug` function. To deploy with Heroku use this buildpack. Thanks to @mimah

https://github.com/mimah/heroku-buildpack-meteorite
