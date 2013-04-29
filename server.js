var connect = Npm.require("connect");
var fs = Npm.require("fs");
var path = Npm.require("path");
var Fiber = Npm.require("fibers");


// default config
var angularAppConfig = {
  name: 'meteorapp',
  appController: 'AppCtrl',
  template: {
    placeholderElement: "<body>",
    name: 'angular.html',
    locations: ['bundle/static/', 'public/'],    
    notice: "This is used as your main page, this should contain the contents of the body.",
  }  
}

angularAppConfig.template.resolvedPaths = function() {
  var self = this;
  var resolved = [];
  for (var path in this.paths) {
    paths.push(path + self.name);
  }
  return resolved;
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
    var templatePaths = angularApp.template.locations;

    // iterate all templatePaths and try each
    for (var templatePath in templatePaths) 
      // only attempt read if file exists
      if (fs.existsSync(templatePath)
        return this.readFile(templatePath);
    } 
    console.log("Angularjs\n______\nCreate any of: " + templatePaths.join(', ') + "\n " + angularApp.template.notice);
  },
  replaceCode: function() {
    var element = function(tag) {
      return "<" + tag + " ";
    }
    var ngAttr = function(name, value) {
      return " ng-" + name + "='" + value + "' ";
    }

    var loadAngularAppConfig = function() {
      if (fs.existsSync('angularAppConfig.json')) {
        try {
          angularApp = JSON.parse(this.readFile('angularAppConfig.json'));
        } catch (e) {
          console.log("Angularjs\n______\nCreate a file: 'angularAppConfig.json' to override the default settings"
            return null;
        }      
      }
    }

    var angularApp = loadAngularAppConfig || angularAppConfig;

    angularApp.template.resolvedPaths = angularAppConfig.template.resolvedPaths;    

    // 
    code = appConfig.getAppHtml();

    // insert Angular template
    code = code.replace(angularApp.template.placeholderElement, appConfig.getAngularTemplate());

    var htmlElem = element('html');
    var htmlReplacement = htmlElem + ngAttr('app', angularApp.name);

    // insert ng-app on html element
    code = code.replace(htmlElem, htmlReplacement);

    // TODO: Allow insert on html element?
    // insert ng-controller="AppCtrl" on angular placeholder element
    if (angularApp.appController) {
      var plh = element(angularApp.template.placeholderElement);
      var plhReplacement = plh + ngAttr('controller', angularApp.appController);

      code = code.replace(plh, plhReplacement);
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
