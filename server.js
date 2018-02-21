var express = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.urlencoded({ extended: false }))
require('./routes/apiRoutes')(app)
app.listen('8000')
exports = module.exports = app
