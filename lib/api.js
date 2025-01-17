var player = require('./player')
  , atob = require('atob')
  , path = require('path')
  , rimraf = require('rimraf')
  , fs = require('fs')
  , config = require('./config')
  , api = {}
  ;

api.pause = function (req, res) {
  console.log("api.js - api.pause");
  player.pause();
  return res.status(200).json({});
};

api.stop = function (req, res) {
  console.log("api.js - api.stop");
  player.stop();
  return res.status(200).json({});
};

// body.position in seconds
api.setPosition = function (req, res) {
  console.log("api.js - api.setPosition");
  player.setPosition(req.body.position);
  return res.status(200).json({});
};


/**
 * Upload new movie
 */
api.upload = function (req, res) {
  if (!req.file) { return res.status(200).json({}); }   // No need to raise an error
  console.log("api.js - api.upload");

  var currentPath = req.file.path
    , newPath = path.join(atob(req.params.id), req.file.originalname);

  fs.renameSync(currentPath, newPath);

  return res.status(200).json({});
};


/**
 * Refuse to delete anything outside the media root
 */
api.deleteMovie = function (req, res) {
  console.log("api.js - api.deleteMovie");
  var file = atob(req.params.id);;

  // Cautiously refuse to delete any file outside the media directory
  if (path.isAbsolute(file) || path.relative(config.mediaRoot, file).indexOf('..') !== -1) {
    return res.status(200).json({});   // No need to raise an error
  }

  if (! fs.statSync(file).isDirectory()) {
    fs.unlinkSync(file);
    var srt = file.substring(0, file.length - path.extname(file).length) + '.srt';
    if (fs.existsSync(srt)) { fs.unlinkSync(srt); }
  } else {
    rimraf.sync(file);
  }

  return res.status(200).json({});
};


/**
 * Create a directory
 */
api.createDir = function (req, res) {
  console.log("api.js - api.createDir");
  var name = atob(req.params.id);

  // Cautiously refuse to create any directory outside the media directory
  if (path.isAbsolute(name) || path.relative(config.mediaRoot, name).indexOf('..') !== -1) {
    return res.status(200).json({});   // No need to raise an error
  }

  fs.mkdirSync(name);

  return res.status(200).json({});
};



// Interface
module.exports = api;
