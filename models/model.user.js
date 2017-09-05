var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
	providerId: String
})


module.exports = mongoose.model('User', UserSchema)