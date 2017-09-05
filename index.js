var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose')
var config = require('./config/development');
var MongoStore= require('connect-mongo')(session);

mongoose.Promise = global.Promise;
mongoose.connect(config.database);

var app = express()
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser());
app.use(express.static('public'));
app.use(session({
	secret: 'thisismysecret',
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize())
app.use(passport.session())

require('./config/config.passport');

app.use('/', require('./routes/router.index'));





app.listen(process.env.PORT || 3000, (req,res) => {
	console.log('Server is running');
})