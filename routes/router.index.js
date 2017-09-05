var express = require('express');
var router = express.Router();
var API_KEY = require('../config/development').API_KEY;
var fetch = require('node-fetch');
var User = require('../models/model.user');
var Going = require('../models/model.going');
var passport = require('passport');


function checkUserLogin (req,res,next){
 if(req.isAuthenticated()){
        //if user is looged in, req.isAuthenticated() will return true 
        next();
    } else{
        res.redirect("/");
    }
}

router.get('/', function(req,res){

	res.render('index', {
		userLogged: req.user ?  true : false
	});
})

router.get('/api/location', async (req,res) => {
	var longitude = req.query.longitude;
	var latitude = req.query.latitude;
	var type_search = req.query.type_search;                                                        //lat ///longitude
  var type_callback = req.query.type_callback;
  var city = req.query.city || '';

  
  var user = req.user ? req.user : '';  
  var url;
  if(type_callback == 'textsearch') url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=bar+in+'+city+'&key='+API_KEY;
  if(type_callback == 'nearbysearch') url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latitude+','+longitude+'&radius=3000&type='+type_search+'&key=AIzaSyBmpXovCL1YIttoCdvCACYjhcmihKak_hY';

  var fetchData = await fetch(url).then(function(data){
  	return data.json()
  }).then(function(json){
  	return json
  })
  
  var results = fetchData.results;
  // console.log(results[0].photos[0].photo_reference)
  // console.log(results[0].geometry.location);
  // console.log(new Date().toLocaleDateString())
  var locationData  = []
  for(var i =0; i< results.length; i++){
  	
  	var location = results[i].geometry.location;
    var dateString = new Date().toLocaleDateString();
    var countGoing =  await Going.count({longitude: location.lng, latitude: location.lat, date: dateString}).exec();
    var isGoingUser = false;
    if(user != ''){

      var goingUser = await Going.findOne({
       user: user,
       longitude: location.lng,
       latitude: location.lat,
       date: dateString
     }).exec();
      if(goingUser) isGoingUser = true;
     }
    
    

    var photo = results[i].photos ?  results[i].photos[0].photo_reference : '';
     locationData.push({
     	name: results[i].name,
     	vicinity: results[i].vicinity || results[i].formatted_address,
     	photoLink: photo !== '' ? 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference='+photo+'&key='+API_KEY : '',
     	countGoing: countGoing,
     	longitude: location.lng,
     	latitude: location.lat,
      isGoingUser: isGoingUser
     })
  }
  res.json(locationData)
})





router.get('/api/addgoing',checkUserLogin,function(req,res,next){
	var longitude = req.query.longitude;
	var latitude = req.query.latitude;
  var date = new Date().toLocaleDateString();
  var user = req.user;

  var oldGoing = Going.findOne({
    longitude: longitude,
    latitude: latitude,
    date: date,
    user: user
  }, function(err, going){
    if(err) throw err;
    if(going) oldGoing.remove(function(err){
      if(err) throw err;
      console.log('removed');
      res.redirect('/');
    })
     if(!going) {
      var newGoing = new Going({
        latitude: latitude,
        longitude: longitude,
        user: user
      });
       newGoing.save(function(err){
        if(err) throw err;
       res.redirect('/');
       })
     } 
  })


})



router.get('/error', (req,res) => {
	res.send('Error auth with facebook');
})

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
	successRedirect: '/',
	failureRedirect: '/error'
}));

router.get('/logout', function(req,res){
	req.logout();
	res.redirect('/')
})

module.exports = router;