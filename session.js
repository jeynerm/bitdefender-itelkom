var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require("http");
var querystring = require('querystring');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
