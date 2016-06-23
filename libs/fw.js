/** 
 * rmp-segment: an open-source node.js HLS segmenter
 * 
 * @license Copyright (C) 2016  Radiant Media Player - Arnaud Leyder
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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