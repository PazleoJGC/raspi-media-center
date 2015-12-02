var http = require('http')
  , server = http.createServer(globalHandler)
  , childProcess = require('child_process')
  ;

function globalHandler (req, res) {
  res.writeHead(200);
  return res.end('HW\n');
}


var cp = childProcess.exec('omxplayer media/a.avi', function (err, out, err) {
  console.log(err);
  console.log("=============================");
  console.log(out);
  console.log("=============================");
  console.log(err);
});


server.listen(8888);