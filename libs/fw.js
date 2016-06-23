'use strict';
const fs = require('fs');
// FW is for framework - i.e. helper functions for rmp-segment
class FW {

  constructor() { }

  fileExists(path) {
    try {
      return fs.statSync(path).isFile();
    } catch (e) {
      return false;
    }
  }

  parseSyncJSON(jsonPath) {
    try {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

}

module.exports = FW;