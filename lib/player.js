var config = require('./config')
  , path = require('path')
  , Nedb = require('nedb')
  , exec = require('child_process').exec
  , movies = new Nedb({ filename: 'data/movies.nedb', autoload: true });

var inputPipe = false;
var wasStopped = false;

// Parameter movies database
movies.persistence.setAutocompactionInterval(config.autocompactionInterval);
movies.ensureIndex({ fieldname: 'path' });


function Player () {
  var self = this;

  this.currentlyPlaying = null;
  this.currentDuration = null;
  this.currentPosition = null;
}
require('util').inherits(Player, require('events'));

/**
 * Start playing a new movie
 * After omxplayer command is executed, check periodically that omxplayer actually launched (should take about 1-2s)
 * If omxplayer not launched after too long a time, return an error
 */
Player.prototype.start = function (file, _callback) {
  var self = this
    , callback = _callback || function () {};

  if (this.currentlyPlaying) {
    this.stop();
  }

  if(wasStopped){
    console.log("cat omxcontrol");
    exec("cat omxcontrol");
    exec("rm omxcontrol");
    inputPipe = null;
  }

  // Get movie data before it is overwritten by playback
  movies.findOne({ path: file }, function (err, movie) {
    self.currentlyPlaying = file;
    
    console.log(self.currentlyPlaying);

	  if (!inputPipe)
    {
		  inputPipe = 'omxcontrol';
		  console.log('mkfifo '+inputPipe);
		  exec('mkfifo '+inputPipe);
	  }
    
    console.log("mplayer -fs " + self.currentlyPlaying + " -input file=" + inputPipe);
    exec("mplayer -fs " + self.currentlyPlaying + " -input file=" + inputPipe); //+" > omxout");
  });
};


Player.prototype.stop = function () {
  if (this.currentlyPlaying) {
    console.log("echo stop > omxcontrol");
    exec("echo stop > omxcontrol");
    wasStopped = true;
    this.currentlyPlaying = undefined;
  }
};

Player.prototype.pause = function () {
	console.log("echo pause > omxcontrol");
	exec("echo pause > omxcontrol");
};

// Absolute position in milliseconds
Player.prototype.setPosition = function (pos) {
  console.log("echo seek " + (pos) + " 1 > omxcontrol");
	exec("echo seek " + (pos) + " 1 > omxcontrol");
}

// Interface: singleton
module.exports = new Player();
