var express = require('express');
const osmosis = require('osmosis');
var app = express();
var firebase = require('firebase');
var nodemailer = require('nodemailer');


var contactInfo = require('./classified/contact');
emailClient = contactInfo.login
var api = require('./classified/api');
var config = api.config;
firebase.initializeApp(config);
var database = firebase.database();

var transporter = nodemailer.createTransport({
  host: emailClient.host,
  port: emailClient.port,
  secure: emailClient.secure,
  auth: {
    user: emailClient.email,
    pass: emailClient.password
  }
});

var emailOptions = {
  from: emailClient.from,
  to: emailClient.to,
}

var textOptions = {
  from: emailClient.from,
  to: emailClient.phone,
}

var allNewPrints = {}
app.get('/', function(req, res) {
  osmosis
    .get('https://paperandfabric.com/collections/paper-and-fabric-x-wrdsmth')
    .find('.product-list')
    .set({
      'title': ['.title'],
      'prices': ['.h1-style + .price'],
      'image': ['.product-image-img@src'],
      'link': ['.title @href'],
      'saved': ['.title']
    })
    .data(function(data) {
      links = data.link;
      prints = data.title;
      savedPrints = data.saved;
      prices = data.prices;
      images = data.image;
    })
    .then(function() {
      for (let i = 0; i < prints.length; i++) {
        prints.splice(i, 1);
        images.splice(i, 1);
        savedPrints.splice(i, 1)
        prints[i] = prints[i].replace(/[.#$[\]\\]/g, "");
        images[i] = images[i].replace(/^[//"]/, "https:/");
        links[i] = links[i].replace('/collections/', 'https://paperandfabric.com/collections/')
        database.ref('/wrdsmthPrints').child(prints[i]).once("value", function(snapshot) {
          var userData = snapshot.val();
          if (userData) {
            console.log("exists!");
          } else {
            console.log('does not exist')
            console.log(savedPrints[i])
            var newPrint = {
              price: prices[i],
              image: images[i],
              link: links[i],
              print: savedPrints[i],
            };
            //Add subject
            emailOptions.subject = 'There is a new item in the WRDSMTH store: ' + savedPrints[i]
            //add text to email
            emailOptions.text = 'New WRDSMTH item is for sale for ' + prices[i] + ': ' + savedPrints[i] + '. View image Here: ' + images[i] + '. To purchase visit: ' + links[i];
            //add html to email
            emailOptions.html = '<div style="text-align:center"><h1>New WRDSMTH item for sale! </h1><h2>' + savedPrints[i] + '</h2><h3>This item costs: ' + prices[i] + '</h3><h4>To purchase visit: <a href="' + links[i] + '">' + links[i] + '</a><br /><br /><img height="500" src="' + images[i] + '" /></div>';

            textOptions.subject = 'New WRDSMTH Item'
            textOptions.text = 'Check your email for details.'

            var printsRef = database.ref().child('wrdsmthPrints')
            printsRef.child(prints[i]).set(newPrint);
            allNewPrints[savedPrints[i]] = newPrint;
            // send text
            transporter.sendMail(textOptions, (error, info) => {
              if (error) {
                console.log(error);
              }
              console.log('text sent!')
            })

            // send email
            transporter.sendMail(emailOptions, (error, info) => {
              if (error) {
                console.log(error);
              }
              console.log('email sent!')
            })
          };
        });
      };
    })
    .done(function() {
      res.send('WRDSMTH Scrapper: Done');
    })
});

app.listen('8000');
exports = module.exports = app;
