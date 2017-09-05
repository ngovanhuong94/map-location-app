var mongoose = require('mongoose');
var Schema  = mongoose.Schema;


var goingSchema = new Schema({
	latitude: String,
	longitude: String,
	date: {
		type: String,
		default: new Date().toLocaleDateString()
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
})


module.exports = mongoose.model('Going', goingSchema);