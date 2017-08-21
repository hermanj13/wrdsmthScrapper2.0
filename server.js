var express = require('express');
const osmosis = require('osmosis');
var app = express();
var firebase = require('firebase');
var nodemailer = require('nodemailer');


var contactInfo = require('./classified/contact');
var wrdsmthEmailClient = contactInfo.wrdsmth
var yifyEmailClient = contactInfo.yify
var api = require('./classified/api');
var config = api.config;
firebase.initializeApp(config);
var database = firebase.database();

var transporter = nodemailer.createTransport({
  host: wrdsmthEmailClient.host,
  port: wrdsmthEmailClient.port,
  secure: wrdsmthEmailClient.secure,
  auth: {
    user: wrdsmthEmailClient.email,
    pass: wrdsmthEmailClient.password
  }
});

var wrdsmthEmailOptions = {
  from: wrdsmthEmailClient.from,
  to: wrdsmthEmailClient.to,
};

var yifyEmailOptions = {
  from: yifyEmailClient.from,
  to: yifyEmailClient.to,
}
var wrdsmthTextOptions = {
  from: wrdsmthEmailClient.from,
  to: wrdsmthEmailClient.phone,
};

app.get('/wrdsmth', function(req, res) {
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
        savedPrints.splice(i, 1);
        prints[i] = prints[i].replace(/[.#$[\]\\]/g, "");
        images[i] = images[i].replace(/^[//"]/, "https:/");
        links[i] = links[i].replace('/collections/', 'https://paperandfabric.com/collections/');
        database.ref('/wrdsmthPrints').child(prints[i]).once("value", function(snapshot) {
          var userData = snapshot.val();
          if (userData) {
          } else {
            var newPrint = {
              price: prices[i],
              image: images[i],
              link: links[i],
              print: savedPrints[i],
            };
            //Add subject
            wrdsmthEmailOptions.subject = 'There is a new item in the WRDSMTH store: ' + savedPrints[i];
            //add text to email
            wrdsmthEmailOptions.text = 'New WRDSMTH item is for sale for ' + prices[i] + ': ' + savedPrints[i] + '. View image Here: ' + images[i] + '. To purchase visit: ' + links[i];
            //add html to email
            wrdsmthEmailOptions.html = '<div style="text-align:center"><h1>New WRDSMTH item for sale! </h1><h2>' + savedPrints[i] + '</h2><h3>This item costs: ' + prices[i] + '</h3><h4>To purchase visit: <a href="' + links[i] + '">' + links[i] + '</a><br /><br /><img height="500" src="' + images[i] + '" /></div>';

            wrdsmthTextOptions.subject = 'New WRDSMTH Item';
            wrdsmthTextOptions.text = 'Check your email for details.';

            var printsRef = database.ref().child('wrdsmthPrints');
            printsRef.child(prints[i]).set(newPrint);
            // send text
            transporter.sendMail(wrdsmthTextOptions, (error, info) => {
              if (error) {
                console.log(error);
              }
              console.log('text sent!');
            })

            // send email
            transporter.sendMail(wrdsmthEmailOptions, (error, info) => {
              if (error) {
                console.log(error);
              }
              console.log('email sent!');
            })
          };
        });
      };
    })
    .done(function() {
      res.send('WRDSMTH Scrapper: Done');
    })
});

app.get('/movies', function(req, res) {
  osmosis
    .get('https://yts.ag/browse-movies/0/1080p/all/0/latest')
    .find('.browse-content')
    .set({
      'title': ['.browse-movie-title'],
      'link': ['.browse-movie-link@href'],
      'image': ['.img-responsive@src'],
      'rating': ['.rating'],
      'year': ['.browse-movie-year'],
      'save': ['.browse-movie-title']
    })
    .data(function(data) {
      title = data.title
      saveTitle = data.save
      link = data.link
      image = data.image
      rating = data.rating
      year = data.year
    })
    .then(function(){
      for (let i = 0; i < title.length; i++) {
        title[i] = title[i].replace(/[.#$[\]\\]/g, "");
        database.ref('/yify').child(title[i]).once("value", function(snapshot) {
          var userData = snapshot.val();
          if (userData) {
            console.log('in database')
          } else {
            var newMovie = {
              title: title[i],
              link: link[i]
            };
            // Add subject
            yifyEmailOptions.subject = 'The is a new YIFY movie: ' + saveTitle[i];
            //add html to email
            yifyEmailOptions.html = '<div style="text-align:center"><h1>New YIFY movie available! </h1><h2>' + saveTitle[i] + '</h2><h4>To view movie visit: <a href="' + link[i] + '">' + link[i] + '</a></h4><h4>Rating: '+ rating[i] +' </h4><h4>Year: '+ year[i] +' </h4><br /><br /><img height="500" src="' + image[i] + '" /></div>';

            var printsRef = database.ref().child('yify');
            printsRef.child(title[i]).set(newMovie);

            // send email
            transporter.sendMail(yifyEmailOptions, (error, info) => {
              if (error) {
                console.log(error);
              }
              console.log('email sent!');
            })
          };
        });
      };
    })
    .done(function() {
      res.send('YIFY Scrapper: Done')
    });
});

app.listen('8000');
exports = module.exports = app;
