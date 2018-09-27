var express = require('express');
var favicon = require('serve-favicon');

var app = express();

app.use(favicon(__dirname + '/dist/favicon.ico'));
app.use(express.static('dist'));

app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});

var server = app.listen(process.env.PORT || 5000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("App listening at http://%s:%s", host, port);
});
