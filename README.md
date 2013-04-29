#Angularjs in Meteor

## Configuration

The angular app generation can be configured in the server.js file via the 'angularApp' config object.

    var angularApp = {
        name: 'meteorapp',
        withAppCtrl: true,
        template: {
            placeholderElement: "<body>",
            name: 'angular.html',
            defaultPath: 'bundle/static/' + this.name,
            publicPath: 'public/' + this.name

            paths: [this.defaultPath, this.publicPath]
        }
    }     

##How to use it
The angularjs app is by default called 'meteorapp'.

    angular.module('meteorapp', []).
        config(['$routeProvider', function($routeProvider) {
        $routeProvider.
             when('/index', {templateUrl: 'partials/index.html',   controller: MeteorCtrl}).
             otherwise({redirectTo: '/'});
    }]);

You can change this in server.js

        angularApp.name = 'my-app';    


###Directory structure

Default structure:

     /public
         /partials
         angular.html(Main screen should contain body content)

You can change angular template location in 'server.js', f.ex:

    angularApp.template.name = "base.html";
    angularApp.template.defaultPath = "public/angular/" + angular.template.name;

###Usage
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
See https://github.com/lvbreda/Meteor_angularjs/issues/18

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

The 'currentUser' directive is by default a HTML element attribute.

    <span currentUser=""></span>

Then in a controller:

    $scope.currentUser = $meteor('users').find({_id:Meteor.userId()})

###Deploying
Make sure that you always write angularjs code that can be minified, else use the --debug function. To deploy with Heroku use this buildpack. Thanks to @mimah
https://github.com/mimah/heroku-buildpack-meteorite
