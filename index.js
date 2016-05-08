Error.stackTraceLimit = Infinity;
process.on('uncaughtException', function(e) {
	console.log('got an uncaught exception, this might because you have not handled error in callbacks and an exception bubbles all the way back to the event loop. Node.js handles such exceptions by printing the stack trace to stderr and exiting. Crash the app then and please fix the bug.', e.stack);
	throw e; //the exception stack trace will return to the frontend when the env variable NODE_ENV is not equal to production.
});

var cool = require('cool-ascii-faces');
var express = require('express');
var pg = require('pg');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	request.testing();
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

//custom catch-all exception handler
app.use(function errorHandler(err, req, res, next) {
	console.log('catch all exceptions except those bubbling up to the event loop from callbacks. Then continue on by leaving the exception to the Express in-built handler.');
	next(err);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
