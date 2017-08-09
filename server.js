var express = require('express');
const osmosis = require('osmosis');
var app     = express();
var firebase = require('firebase');

var api = require('./classified/api')
var contactInfo = require('./classified/contact')

var config = api.config
firebase.initializeApp(config);
var database = firebase.database();

app.get('/', function(req, res){
  osmosis
    .get('https://paperandfabric.com/collections/paper-and-fabric-x-wrdsmth')
    .find('.product-list')
    .set({'title': ['.title'],
          'price': ['.h1-style + .price'],
          'image': ['.product-image-img@src'],
        })
    .data(function(data){
      prints = data.title;
      price = data.price;
      images = data.image;
    })
    .done(function(){
      for(let i = 0; i < prints.length; i++){
        prints.splice(i,1);
        images.splice(i,1);
        savedPrint = prints[i];
        prints[i] = prints[i].replace(/[.#$[\]\\]/g, "");
        images[i] = images[i].replace(/^[//"]/, "https:/");
        if(prints[i] != "jak"){
          var newPrint = {
            print: prints[i],
            price: price[i],
            image: images[i],
          };
          var printsRef = database.ref().child(prints[i]);
          printsRef.set(newPrint);
        };
      };
      res.send(newPrint);
    })
  });

app.listen('8000');
console.log('Magic happens on port 8000');
exports = module.exports = app;
