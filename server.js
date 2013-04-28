var connect = Npm.require("connect");
var fs = Npm.require("fs");
var path = Npm.require("path");
var Fiber = Npm.require("fibers");

var myAppName = 'meteorapp';
var angularTemplatePath = "public/angular.html";

__meteor_bootstrap__.app
    .use(connect.query())
    .use(function (req, res, next) {
    	
      // Need to create a Fiber since we're using synchronous http calls
      Fiber(function() {
      	try{
      	 var code = fs.readFileSync(path.resolve('bundle/app.html'));
        }catch(e){
          var code = fs.readFileSync(path.resolve('.meteor/local/build/app.html'));
        }
      	var angular = "";
        try{ 
      		angular = fs.readFileSync(path.resolve('bundle/static/angular.html'));
        }catch(e){
          if(fs.existsSync(angularTemplatePath)){
            angular = fs.readFileSync(path.resolve(angularTemplatePath));
          }else{
            console.log("Angularjs\n______\nCreate " + angularTemplatePath + "\n This is used as your main page, this should contain the contents of the body.");
          }
        }
      	
      	
      	code = new String(code);
      	code = code.replace("<body>",new String(angular));
    		code = code.replace("<html##HTML_ATTRIBUTES##>",'<html ng-app=' + myAppName + '>');
    		if (typeof __meteor_runtime_config__ !== 'undefined') {
    		  code = code.replace(
    		    "// ##RUNTIME_CONFIG##",
    		    "__meteor_runtime_config__ = " +
    		      JSON.stringify(__meteor_runtime_config__) + ";");
    		}
		
        res.writeHead(200, {'Content-Type': 'text/html'});	
        res.write(code);
        res.end();
        return;
    }).run();
});
