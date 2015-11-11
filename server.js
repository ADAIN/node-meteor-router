/**
 * Created by sixpoly on 11/11/15.
 */

/*************************************
 * ENVIRONMENT VARIABLES
 ************************************/
var PORT = process.env.PORT || 80;
var PATH_TO_CERT = process.env.PATH_TO_CERT || false;
var PATH_TO_KEY = process.env.PATH_TO_KEY || false;

/*************************************
 * APPLICATION VARIABLES
 ************************************/
var http = require('http'),
    https = require('https'),
    _ = require('lodash'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    fs = require('fs');

var proxy = new httpProxy.createProxyServer({});
var options = {};
var server = null;

/*************************************
 * ROUTER
 ************************************/
var routePath = {
  'main':{
    host: 'localhost',
    port: '9000'
  },
  'app1':{
    host: 'localhost',
    port: '9010'
  },
  'app2':{
    host: 'localhost',
    port: '9020'
  }
};

var root = 'main';

/**
 * get target from path
 * @param path
 * @returns {*}
 */
function getTarget(path){
  if(path.pathname === undefined){
    return root;
  }
  var rootPath = path.pathname.split('/')[1];
  if(routePath[rootPath]){
    return rootPath;
  }else{
    return root;
  }
}

/**
 * request handler
 * @param req
 * @param res
 */
function requestHandler(req, res) {
  var path = url.parse(req.url);
  var target = getTarget(path);
  proxy.web(req, res, {target : {
    host: routePath[target].host,
    port: routePath[target].port
  }});
}

/**
 * web socket handler
 * @param req
 * @param res
 */
function websocketHandler(req, res){
  var path = url.parse(req.url);
  var target = getTarget(path);
  proxy.ws(req, res, {target : {
    host: routePath[target].host,
    port: routePath[target].port
  }});
}

if(PATH_TO_CERT && PATH_TO_KEY){
  options = {
    key: fs.readFileSync(PATH_TO_KEY, 'utf8'),
    cert: fs.readFileSync(PATH_TO_CERT, 'utf8')
  };

  server = https.createServer(options, requestHandler);
}else{
  server = http.createServer(requestHandler);
}

// web socket proxy
server.on('upgrade', websocketHandler);

/**
 * Exception handling
 */
process.on('uncaughtException', function (err) {
  console.log("Can't connect to server.");
  console.log((new Date()).toString() + ', Caught exception: ' + err);
});

console.log("Start Routing server. [" + PORT + "]");

// listen server with PORT
server.listen(PORT);