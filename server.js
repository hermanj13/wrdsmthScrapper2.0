var express = require('express');
var app = express();
require("./routes/apiRoutes")(app);
app.listen('8000');
exports = module.exports = app;
