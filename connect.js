var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/bitdefender')

module.exports = mongoose.connection;
