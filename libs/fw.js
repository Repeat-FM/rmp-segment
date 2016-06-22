'use strict'; 
const fs = require('fs');
// FW is for framework - i.e. helper functions for rmp-segment
class FW {

  constructor() { }

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