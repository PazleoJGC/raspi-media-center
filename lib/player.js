var omxcontrol = require('simpleomxcontrol')
  , cp = require('child_process')
  , config = require('./config')
  , path = require('path')
  , Nedb = require('nedb')
  , exec = require('child_process').exec
  , movies = new Nedb({ filename: 'data/movies.nedb', autoload: true });

var inputPipe = false;

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

  // Get movie data before it is overwritten by playback
  movies.findOne({ path: file }, function (err, movie) {
    self.currentlyPlaying = file;
    
    console.log(self.currentlyPlaying);
    //omxcontrol.start(self.currentlyPlaying);
	  if (!inputPipe)
    {
		  inputPipe = 'omxcontrol';
		  exec('mkfifo '+inputPipe);
	  }
    
	exec("mplayer " + self.currentlyPlaying + " -input file=" + inputPipe);

  // Detect when player is active to actually launch remote
  var elapsedTime = 0;
  function checkIfActive () {
      return callback();
  }
  checkIfActive();  
  });
};


Player.prototype.stop = function () {
  if (this.currentlyPlaying) {
    exec("echo stop > omxcontrol");
    this.currentlyPlaying = undefined;
  }
};

Player.prototype.pause = function () {
	exec("echo pause > omxcontrol");
};

// Absolute position in milliseconds
Player.prototype.setPosition = function (pos) {
	exec("echo seek " + (pos * 1000) + " 1 > omxcontrol");
}



// Interface: singleton
module.exports = new Player();
