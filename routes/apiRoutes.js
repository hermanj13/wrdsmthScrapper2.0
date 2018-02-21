const osmosis = require('osmosis')
var request = require('request-promise')

const api = require('../classified/api')
const config = api.config

const firebase = require('firebase')
firebase.initializeApp(config)
const database = firebase.database()

const twilloInfo = require('../classified/contact').twillo

const accountSid = twilloInfo.accountSid
const authToken = twilloInfo.authToken
const client = require('twilio')(accountSid, authToken)
// const MessagingResponse = require('twilio').twiml.MessagingResponse

module.exports = function (app) {
  app.post('/recieve', function (req, res) {
    if (req.body.From === '+16154286053') {
      var search = req.body.Body.split(' ')
      // TODO: add inaditional switch cases for information about the movies on request
      switch (search[0]) {
        case 'Add':
        case 'add':
          search.splice(0, 1)
          search = search.join().split(',')
          search.forEach(function (value) {
            database.ref('/yify').orderByChild('id').equalTo(parseInt(value)).on('value', function (snapshot) {
              var searchTerm = Object.keys(snapshot.val())[0]
              database.ref('/download').child(searchTerm).once('value', function (data) {
                if (data.val()) {} else {
                  var downloadRef = database.ref().child('download')
                  downloadRef.child(searchTerm).set(snapshot.val()[searchTerm])
                }
              })
            })
          })
          break
        case 'remove':
        case 'Remove':
          search.splice(0, 1)
          search = search.join().split(',')
          search.forEach(function (value) {
            database.ref('/yify').orderByChild('id').equalTo(parseInt(value)).on('value', function (snapshot) {
              var searchTerm = Object.keys(snapshot.val())[0]
              database.ref('/download').child(searchTerm).once('value', function (data) {
                if (data.val()) {
                  database.ref('/download').child(searchTerm).remove()
                }
              })
            })
          })
          break
      }
      // TODO: add in response functionality
      res.writeHead(200, {'Content-Type': 'text/xml'})
      res.send()
    }
  })

  app.get('/wrdsmth', function (req, res) {
    var prints, links, savedPrints, prices, images
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
      .data(function (data) {
        links = data.link
        prints = data.title
        savedPrints = data.saved
        prices = data.prices
        images = data.image
      })
      .then(function () {
        for (let i = 0; i < prints.length; i++) {
          prints.splice(i, 1)
          images.splice(i, 1)
          savedPrints.splice(i, 1)
          prints[i] = prints[i].replace(/[.#$[\]\\]/g, '')
          images[i] = images[i].replace(/^[//"]/, 'https:/')
          links[i] = links[i].replace('/collections/', 'https://paperandfabric.com/collections/')
          database.ref('/wrdsmthPrints').child(prints[i]).once('value', function (snapshot) {
            var userData = snapshot.val()
            if (userData) {} else {
              var newPrint = {
                price: prices[i],
                image: images[i],
                link: links[i],
                print: savedPrints[i],
                timestamp: firebase.database.ServerValue.TIMESTAMP
              }
              var printsRef = database.ref().child('wrdsmthPrints')
              printsRef.child(prints[i]).set(newPrint)
              // send text
              twilloInfo.wrdsmth.forEach(function (value) {
                client.messages
                  .create({
                    body: `Print Name: ${savedPrints[i]} \nPrice: ${prices[i]} \nLink: ${links[i]}`,
                    to: value,
                    from: twilloInfo.from,
                    mediaUrl: images[i]
                  })
                  .then(message => process.stdout.write(message.sid))
              })
            };
          })
        };
      })
      .done(function () {
        res.send('WRDSMTH Scrapper: Done')
      })
  })

  app.get('/movies', function (req, res) {
    var title, saveTitle, link, image, rating, year, lastObject, keys
    database.ref('/yify').once('value', function (snapshot) {
      keys = Object.keys(snapshot.val() || {})
      lastObject = keys.length
    })
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
      .data(function (data) {
        title = data.title
        saveTitle = data.save
        link = data.link
        image = data.image
        rating = data.rating
        year = data.year
      })
      .then(function () {
        for (let i = 0; i < title.length; i++) {
          title[i] = title[i].replace(/[.#$[\]\\]/g, '')
          database.ref('/yify').child(title[i]).once('value', function (snapshot) {
            var userData = snapshot.val()
            if (userData) {} else {
              var search = title[i].replace(/\s/g, '+')
              var newBody
              request(`http://www.omdbapi.com/?apikey=trilogy&t=${search}&plot=full`, function (error, response, body) {
                if (error) { console.log(error) }
                newBody = JSON.parse(body)
              }).then(function () {
                var newMovie = {
                  id: lastObject += 1,
                  title: title[i],
                  link: link[i],
                  image: image[i],
                  timestamp: firebase.database.ServerValue.TIMESTAMP,
                  plot: newBody.Plot || null,
                  genre: newBody.Genre || null,
                  actors: newBody.Actors || null
                }
                var movieRef = database.ref().child('yify')
                movieRef.child(title[i]).set(newMovie)

                // send text
                client.messages
                  .create({
                    body: `Movie name: ${saveTitle[i]} \nPlot: ${newBody.Plot || 'n/a'} \nRating: ${rating[i]} \nGenre: ${newBody.Genre || 'n/a'} \nActors: ${newBody.Actors || 'n/a'} \nYear: ${year[i]} \nText 'Add ${lastObject}' to save for download`,
                    to: twilloInfo.yify,
                    from: twilloInfo.from
                  })
                  .then(message => process.stdout.write(message.sid))
              })
            }
          })
        };
      })
      .done(function () {
        res.send('YIFY Scrapper: Done')
      })
  })
}
