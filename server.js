var connect = Npm.require("connect");
var fs = Npm.require("fs");
var path = Npm.require("path");
var Fiber = Npm.require("fibers");

// TODO: These vars should be defined as Angular constants?

var angularApp = {
  name: 'meteorapp',
  appController: 'AppCtrl',
  template: {
    placeholderElement: "<body>",
    name: 'angular.html',
    defaultPath: 'bundle/static/' + this.name,
    publicPath: 'public/' + this.name

    paths: [this.defaultPath, this.publicPath]
    notice: "This is used as your main page, this should contain the contents of the body.",
  }  
}

var appConfig = {
  readFile: function(filePath) {
    new String(fs.readFileSync(path.resolve(filePath)));
  },
  getAppHtml: function() {
    try {
     return this.readFile('bundle/app.html');
    } catch(e) {
      return this.readFile('.meteor/local/build/app.html');
    }          
  },
  
  getAngularTemplate: function() {
    var templatePaths = angularApp.template.paths;

    // iterate all templatePaths and try each
    for (var templatePath in templatePaths) 
      // only attempt read if file exists
      if (fs.existsSync(templatePath)
        return this.readFile(templatePath);
    } 
    console.log("Angularjs\n______\nCreate any of: " + templatePaths.join(', ') + "\n " + angularApp.template.notice);
  },
  replaceCode: function() {
    code = appConfig.getAppHtml();
    code = code.replace(angularApp.template.placeholderElement, appConfig.getAngularTemplate());
    code = code.replace("<html ",'<html ng-app=' + angularApp.name + "' ");

    if (angularApp.appController) {
      code = code.replace("<body ", "<body ng-controller='" + angularApp.appController + "' ");
    }  

    if (typeof __meteor_runtime_config__ !== 'undefined') {
      code = code.replace("// ##RUNTIME_CONFIG##", this.runtimeConfig());
    }    
  }

  runtimeConfig: function() {
    "__meteor_runtime_config__ = " + JSON.stringify(__meteor_runtime_config__) + ";");
  }
}


__meteor_bootstrap__.app
    .use(connect.query())
    .use(function (req, res, next) {
    	
      // Need to create a Fiber since we're using synchronous http calls
      Fiber(function() {
        var code = appConfig.replaceCode();
      	      			
        res.writeHead(200, {'Content-Type': 'text/html'});	
        res.write(code);
        res.end();
        return;
    }).run();
});
