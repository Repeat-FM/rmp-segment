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
const path = require('path');
const HLS = require('./hls.js');
const Analysis = require('./analysis.js');
const mkdirp = require('mkdirp');
var analysis = new Analysis();

class Prepare {

  constructor(globalConfig, segmentConfig) {
    this.validExt = ['.mp4', '.m4a', '.m4v'];
    this.segmentConfig = segmentConfig;
    this.globalConfig = globalConfig;
  }

  _getHLSChunkList(hls) {
    let chunkLisPromise = hls.runChunkLists();
    return chunkLisPromise.then((mediaPromise) => {
      for (let value of mediaPromise) {
        if (!value) {
          throw 'Could not create sub-chunk list - exiting';
        }
      }
      // once all chunklists are created - generate master playlist
      return hls.runMasterPlaylist();
    });
  }

  _getMediaFiles() {
    let contentDir = path.normalize(this.segmentConfig.input);
    return new Promise((resolve, reject) => {
      let finalArrayFiles = [];
      fs.readdir(contentDir, (err, arrayFiles) => {
        if (err) {
          return reject(err);
        }
        let processed = 0;
        arrayFiles.forEach((value, index, array) => {
          let file = path.join(contentDir, value);
          fs.stat(file, (err, stats) => {
            if (err) {
              return reject(err);
            }
            processed++;
            if (stats.isFile() && this.validExt.indexOf(path.extname(file)) > -1) {
              finalArrayFiles.push(file);
            }
            if (processed === array.length) {
              if (finalArrayFiles.length > 0) {
                resolve(finalArrayFiles);
              } else {
                reject('No valid media found in directory');
              }
            }
          });
        });
      });
    });
  }

  segment() {
    if (this.globalConfig.debug) {
      console.log('RMP-SEGMENT: start HLS segmenting');
    }
    let getMediaFilesPromise = this._getMediaFiles();
    return getMediaFilesPromise.then((results) => {
      if (this.globalConfig.debug) {
        console.log('RMP-SEGMENT: the following input media files will be processed');
        console.log(results);
      }
      // check if output folder exists otherwise create it
      return new Promise((resolve, reject) => {
        fs.stat(this.segmentConfig.output, (err, stats) => {
          if (err || stats && !stats.isDirectory()) {
            mkdirp(this.segmentConfig.output, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(results);
              }
            });
          } else if (stats && stats.isDirectory()) {
            resolve(results);
          }
        });
      });
    }).catch((err) => {
      console.log(err);
      throw err;
    }).then((results) => {
      if (this.globalConfig.debug) {
        console.log('RMP-SEGMENT: output folder ok - proceed');
      }
      // we read media input files
      let getMediaInfoPromise = analysis.getMediaInfo(results);
      return getMediaInfoPromise.then((mediaData) => {
        if (this.globalConfig.debug) {
          console.log('RMP-SEGMENT: validated input files - proceed');
        }
        // new HLS segmenter instance
        let hls = new HLS(mediaData, this.segmentConfig, this.globalConfig);
        // create chunklists for AES or non-AES HLS
        if (this.segmentConfig.aes) {
          let aesPromise = hls.runAes();
          return aesPromise.then((result) => {
            if (result === true) {
              return this._getHLSChunkList(hls);
            }
          }).catch((err) => {
            console.log(err);
            throw err;
          });
        } else {
          return this._getHLSChunkList(hls);
        }
      }).catch((err) => {
        console.log(err);
        throw err;
      });
    }).catch((err) => {
      console.log(err);
      throw err;
    });
  }
}
module.exports = Prepare;