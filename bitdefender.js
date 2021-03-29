var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require("http");
var querystring = require('querystring');
var expressSession = require('express-session')
var MongoStore = require('connect-mongo')(expressSession)
var db = require('./connect.js')
var cookieParser = require('cookie-parser')
var mongoose = require('mongoose')
var cons = require('consolidate')
var request = require("request")
var Schema = mongoose.Schema
var jade = require('jade')
var fs = require('fs');
var crypto = require('crypto')
var randomstring = require("randomstring")
var MySchemas = require('./schemas.js')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser())
app.set('views', './views');
app.set('view engine', 'jade');
app.engine('.html', cons.jade);
app.use(function (req, res, next) {

		// Website you wish to allow to connect
		res.setHeader('Access-Control-Allow-Origin', '*');

		// Request methods you wish to allow
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

		// Request headers you wish to allow
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

		// Set to true if you need the website to include cookies in the requests sent
		// to the API (e.g. in case you use sessions)
		res.setHeader('Access-Control-Allow-Credentials', true);

		// Pass to next layer of middleware
		next();
});
var Schema = mongoose.Schema
mongoose.Promise = require('bluebird');

var Forms = mongoose.model('forms', MySchemas.schema_forms)


var authorization = "Basic S3ByVU5uVy9yUGZzcXJ6cnRlTzZ6bm1hR3hzc3N0RFo6"

db.on('error', console.error.bind(console, 'connection error:'))
db.on('open', function(err) {
		if(err) throw err;
		console.log("Conectado a la DB")
	})


app.use(expressSession({
     secret: 'kdfi2mgWFjewGEn6h1J',
     store: new MongoStore({mongooseConnection: db}),
     resave: false,
     saveUninitialized: false
}));

app.post('/api', function (req, res) {
	if(req.body != undefined && req.body.option != undefined) {
		switch(req.body.option) {
			case 'status':
				console.log(req.session.login);
				if(req.session.login==true){
					res.send({status:true})
				}else{
					res.send({status:false})
				}
				break;
			case 'company_list': //Lista de empresas
				var id = randomstring.generate();
				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: { "id": id, "jsonrpc": "2.0", "method": "getCompaniesList", "params": [] } },
				function(response, result) {
					console.log(result.body);
					res.send({state : true, data : result.body})
				});
				break;
			case 'create_company': //Crea una nueva empresa y el usuario administrador de esta. Tambien crea el paquete de instalacion predeterminado.
			var id = randomstring.generate();

				if(req.body.documento == undefined || req.body.address == undefined || req.body.phone == undefined || req.body.accountEmail == undefined || req.body.accountFullName == undefined) {
					console.log("No se ingresaron las suficientes variables.")
					res.send({state : false, message : "No se ingresaron las suficientes variables."})
					return
				}

				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/companies",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: {
						"params": {
							"type": 1,
							"name": req.body.name,
							"address": req.body.address,
							"phone": req.body.phone,
							"accountEmail": req.body.accountEmail,
							"accountFullName": req.body.accountFullName,
							"accountLanguage" : "es_ES"
						},
						"jsonrpc": "2.0",
						"method": "createCompany",
						"id": id
					}
				},
				function(response, result) {
					console.log(result.body);
					if(result.body == undefined && result.body.result == undefined) {
						res.send({state : false, message : "Error al crear la empresa."})
						return
					}
					var company_id = result.body.result
					var id = randomstring.generate();
					request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/packages",
						method: "POST",
						headers: { 'Authorization': authorization },
						json: {
							"params": {
								"packageName": "DefaultPackage_"+company_id,
								"companyId": company_id,
								"description": "Paquete de instalacion predeterminado",
								"language": "es_ES",
								"modules": {
									"atc": 1,
									"firewall": 1,
									"contentControl": 1,
									"deviceControl": 1,
									"powerUser": 0
								},
								"scanMode": {
									"type": 1
								},
								"settings": {
									"scanBeforeInstall": 0
								}
							},
							"jsonrpc": "2.0",
							"method": "createPackage",
							"id": id
						}
					},
					function(response, result) {
						console.log(result.body);
						res.send({state : true, data : result.body})
					});
				});
				break;
			case 'get_instalation_links': //Obtiene los links de instalacion
			console.log("aqui")
				if(req.body.company_id == undefined) {
					console.log("No se ingresaron las suficientes variables.")
					req.session.login=false
					res.send({state : false, message : "No se ingresaron las suficientes variables."})
					return
				}
				var id = randomstring.generate();
				var company_id = req.body.company_id
				var package_name = ""
				if(req.body.package_name != undefined)
					package_name = req.body.package_name
				else
					package_name = "DefaultPackage_"+company_id
				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/packages",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: {
						"params": {
							"companyId": company_id,
							"packageName": "DefaultPackage_"+company_id
						},
						"jsonrpc": "2.0",
						"method": "getInstallationLinks",
						"id": id
					}},
				function(response, result) {
					console.log(result.body);
					res.send({state : true, data : result.body})
				});
				break;
			case 'get_licence_info': //Obtiene la informacion de licencia de una empresa.
				if(req.body.company_id == undefined) {
					console.log("No se ingresaron las suficientes variables.")
					req.session.login=false
					res.send({state : false, message : "No se ingresaron las suficientes variables."})
					return
				}
				var id = randomstring.generate();
				var company_id = req.body.company_id
				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/licensing",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: {
						"params": {
							"companyId": company_id
						},
						"jsonrpc": "2.0",
						"method": "getLicenseInfo",
						"id": id
					}},
				function(response, result) {
					console.log(result.body);
					res.send({state : true, data : result.body})
				});
				break;
			case 'set_monthly_subscription': //Aplica suscripcion mensual a una empresa.
				if(req.body.company_id == undefined || req.body.slots == undefined) {
					console.log("No se ingresaron las suficientes variables.")
					req.session.login=false
					Forms.findOne().where("page").eq("registrar").exec(function(err, forms) {
						if(err)
							console.log("err", err);
						res.render("registrar.jade", forms)
						console.log();
					})
					res.send({state : false, message : "No se ingresaron las suficientes variables."})
					return
				}
				var id = randomstring.generate();
				var company_id = req.body.company_id
				var slots = parseInt(req.body.slots)
				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/licensing",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: {
						"params": {
							"companyId" : company_id,
							"reservedSlots" : slots
						},
						"jsonrpc": "2.0",
						"method": "setMonthlySubscription",
						"id": id
					}},
				function(response, result) {
					console.log(result.body);
					res.send({state : true, data : result.body})
				});
				break;
			case 'suspend_company': //Suspende el servicio una empresa
				if(req.session.company_id == undefined) {
					console.log("No se ingresaron las suficientes variables.")
					req.session.login=false
					Forms.findOne().where("page").eq("registrar").exec(function(err, forms) {
						if(err)
							console.log("err", err);
						res.render("registrar.jade", forms)
						console.log();
					})
					res.send({state : false, message : "No se ingresaron las suficientes variables."})
					return
				}
				var id = randomstring.generate();
				var company_id = req.session.company_id
				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/companies",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: {
						"params": {
							"companyId" : company_id
						},
						"jsonrpc": "2.0",
						"method": "suspendCompany",
						"id": id
					}},
				function(response, result) {
					console.log(result.body)
					if(result == undefined || result.body == undefined || result.body.error != undefined || result.body.result != undefined) {
						res.send(false)
					} else {
						res.send(true)
					}
				});
				break;
			case 'activate_company': //Activa el servicio de una empresa suspendida.
				if(req.session.company_id == undefined) {
					console.log("No se ingresaron las suficientes variables.")
					req.session.login=false
					Forms.findOne().where("page").eq("registrar").exec(function(err, forms) {
						if(err)
							console.log("err", err);
						res.render("registrar.jade", forms)
						console.log();
					})
					res.send({state : false, message : "No se ingresaron las suficientes variables."})
					return
				}
				var id = randomstring.generate();
				var company_id = req.session.company_id
				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/companies",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: {
						"params": {
							"companyId" : company_id
						},
						"jsonrpc": "2.0",
						"method": "activateCompany",
						"id": id
					}},
				function(response, result) {
					console.log(result.body);
					//res.send({state : true, data : result.body})
					if(result == undefined || result.body == undefined || result.body.error != undefined || result.body.result != null) {
						res.send(false)
					} else {
						res.send(true)
					}
				});
				break;
			case 'login_user': //Logueo de un usuario
				if(req.body.username == undefined || req.body.password == undefined) {
					console.log("No se ingresaron las suficientes variables.")
					req.session.login=false
					Forms.findOne().where("page").eq("registrar").exec(function(err, forms) {
						if(err)
							console.log("err", err);
						res.send({status:true})
					})
					res.send({state : false, message : "No se ingresaron las suficientes variables."})
					return
				}
				var id = randomstring.generate();
				var username = req.body.username
				var password = req.body.password
				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/companies",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: {
						"params": {
							"username" : username,
							"password" : password
						},
						"jsonrpc": "2.0",
						"method": "getCompanyDetailsByUser",
						"id": id
					}},
				function(response, result) {
					if(result == undefined || result.body == undefined || result.body.error != undefined || result.body.result == undefined || result.body.result.id == undefined) {
						res.send({status:false})
					} else {
						req.session.company_id = result.body.result.id
						req.session.name = result.body.result.name
						req.session.login = true
						res.send({status:true, company_id:result.body.result.id})
					}
				});
				break;
			case 'get_endpoint_list': //Obtiene los equipos asociados a una empresa.
				if(req.body.company_id == undefined) {
					console.log("No se ingresaron las suficientes variables.")
					res.send({state : false, message : "No se ingresaron las suficientes variables."})
					return
				}
				var id = randomstring.generate();
				var company_id = req.body.company_id
				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: {
						"params": {
							"parentId" : company_id
						},
						"jsonrpc": "2.0",
						"method": "getEndpointsList",
						"id": id
					}},
				function(response, result) {
					console.log(result.body);
					res.send({state : true, data : result.body})
				});
				break;
			case 'create_scan': //Crea una tarea de scan para toda la empresa
				if(req.body.company_id == undefined) {
					console.log("No se ingresaron las suficientes variables.")
					req.session.login=false
					res.send({state : false, message : "No se ingresaron las suficientes variables."})
					return
				}
				var id = randomstring.generate();
				var f = new Date()
				var company_id = req.body.company_id
				var name = req.session.name
				var package_name = ""
				var tipos = ""
				var tipoScan = req.body.type
				if(tipoScan=="1"){
					package_name = "Quick"
				}else if (tipoScan=="2") {
					package_name = "Full"
				}else{
					package_name ="Memory"
				}
				request({ uri: "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network",
					method: "POST",
					headers: { 'Authorization': authorization },
					json: {
						"params": {
							"targetIds": [company_id],
							"type": parseInt(tipoScan),
							"name": package_name
						},
						"jsonrpc": "2.0",
						"method": "createScanTask",
						"id": id
					}},
				function(response, result) {
					if(result == undefined || result.body == undefined || result.body.error != undefined || result.body.result != true ) {
						res.send({state:false})
					} else {
						res.send({state:true})
					}
				});
				break;
			default:
				res.send({state : false})
		}
	}  else {
		res.send({state : false})
	}
})

app.get('/api', function (req, res) {
	if(req.query != undefined && req.query.option != undefined) {
		switch(req.query.option) {
			default:
				res.status(404)
		}
	}  else {
		res.status(404)
	}
})

app.get('/web', function (req, res) {
	if(req.query != undefined && req.query.page != undefined) {
		switch(req.query.page) {
			case 'registrar':
				if(req.session.login==true){
					Forms.findOne().where("page").eq("index").exec(function(err, forms) {
						if(err)
							console.log("err", err);
						res.render("index.jade", forms)
						console.log();
					})
				}else{
					Forms.findOne().where("page").eq("registrar").exec(function(err, forms) {
						if(err)
							console.log("err", err);
						res.render("registrar.jade", forms)
						console.log();
					})
				}
				break
			case 'index':
				if(req.session.login==true){
					Forms.findOne().where("page").eq("index").exec(function(err, forms) {
						if(err)
							console.log("err", err);
						res.render("index.jade", {forms : forms, company : req.session.company_id})
						console.log();
					})
				}else{
					Forms.findOne().where("page").eq("registrar").exec(function(err, forms) {
						if(err)
							console.log("err", err);
						res.render("registrar.jade", forms)
						console.log();
					})
				}
				break
			case 'logout':
				req.session.login = false
				Forms.findOne().where("page").eq("registrar").exec(function(err, forms) {
					if(err)
						console.log("err", err);
					res.render("registrar.jade", forms)
					console.log();
				})
				break
			default:
				Forms.findOne().where("page").eq(req.query.page).exec(function(err, forms) {
					if(err)
						console.log("err", err);
					res.render(req.query.page+".jade", forms)
					console.log();
				})
				break
		}
	}  else {
		res.status(404)
	}
})

var server = app
	.use(express.static(__dirname + '/public'))
	.listen(3140);
