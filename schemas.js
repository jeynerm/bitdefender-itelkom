var mongoose = require('mongoose')
var Schema = mongoose.Schema

var schema_forms = new Schema({
  page : String,
  form : [{
    name : String,
    inputs : [{
      id : String,
    	placeholder : String,
      label : String,
    	icon : String,
    	size : String,
      ftype : String,
      data : {
        options: [{
          value : String,
          name : String,
        }],
        ftype: String,
        style: String,
        function : String,
        rows : String,
        cols : String,
      },
    }]
  }]
});

exports.schema_forms = schema_forms;
