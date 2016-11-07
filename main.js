#!/usr/bin/env node
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
// core modules
const path = require('path');
const os = require('os');
const fs = require('fs');
const Prepare = require('./libs/prepare.js');
const FW = require('./libs/fw.js');
var fw = new FW();

// we try to locate rmp-segment-config.json file
var configFile = 'rmp-segment-config.json';
if (!fw.fileExists(configFile)) {
  configFile = path.join(__dirname, configFile);
  if (!fw.fileExists(configFile)) {
    console.log('RMP-SEGMENT: global config file rmp-segment-config.json ' +
      'could not be found - exiting');
    return;
  }
}
// parse JSON global config - config.json
var globalConfig = fw.parseSyncJSON(configFile);
if (globalConfig === -1) {
  return;
}
var debug = false;
var ffmpeg = 'utils/linux64/ffmpeg';
if (os.platform() === 'win32') {
  ffmpeg = 'utils/win64/ffmpeg.exe';
} else if (os.platform() === 'darwin') {
  ffmpeg = 'utils/mac64/ffmpeg';
}
if (fw.fileExists(ffmpeg)) {
  ffmpeg = ffmpeg;
} else if (fw.fileExists(path.join(__dirname, ffmpeg))) {
  ffmpeg = path.join(__dirname, ffmpeg);
}
var tsChunkSize = 10;
var allowCache = true;
for (let prop in globalConfig) {
  if (prop === 'debug' && typeof globalConfig[prop] === 'boolean') {
    debug = globalConfig[prop];
  }
  // we try to locate ffmpeg executable
  if (prop === 'ffmpeg' && typeof globalConfig[prop] === 'string') {
    if (fw.fileExists(globalConfig[prop])) {
      ffmpeg = globalConfig[prop];
    } else if (fw.fileExists(path.join(__dirname, globalConfig[prop]))) {
      ffmpeg = path.join(__dirname, globalConfig[prop]);
    }
  }
  if (prop === 'tsChunkSize' && typeof globalConfig[prop] === 'number') {
    tsChunkSize = globalConfig[prop];
  }
  if (prop === 'allowCache' && typeof globalConfig[prop] === 'boolean') {
    allowCache = globalConfig[prop];
  }
}
// sanitized globalConfig
globalConfig = {};
globalConfig.debug = debug;
if (!fw.fileExists(ffmpeg)) {
  console.log('RMP-SEGMENT: could not locate ffmpeg executable - ' + ffmpeg +
    ' - exiting');
  return;
} else if (globalConfig.debug) {
  console.log('RMP-SEGMENT: path to ffmpeg - ' + ffmpeg);
}
// verify/set +x permission for FFmpeg
try {
  fs.accessSync(ffmpeg, fs.X_OK);
} catch (e) {
  if (globalConfig.debug) {
    console.log('RMP-SEGMENT: cannot execute FFmpeg due to missing permission');
    console.log(e);
    console.log('RMP-SEGMENT: trying to set permission to execute FFmpeg now');
  }
  try {
    fs.chmodSync(ffmpeg, '744');
    if (globalConfig.debug) {
      console.log('RMP-SEGMENT: successfully set permission for FFmpeg to execute - resuming segmenting');
    }
  } catch (e) {
    if (globalConfig.debug) {
      console.log(e);
      console.log('RMP-SEGMENT: could not set proper permission to execute FFmpeg - exiting');
    }
    return;
  }
}
globalConfig.ffmpeg = ffmpeg;
globalConfig.tsChunkSize = tsChunkSize;
if (allowCache) {
  globalConfig.allowCache = 1;
} else {
  globalConfig.allowCache = 0;
}
if (globalConfig.debug) {
  console.log('RMP-SEGMENT: global config settings from rmp-segment-config.json');
  console.log(globalConfig);
}
// parse command line arguments
var arrayArg = process.argv;
if (arrayArg.indexOf('-i') === -1 || arrayArg.indexOf('-o') === -1) {
  console.log('RMP-SEGMENT: missing input and/or output value - exiting');
  return;
}
var segmentConfig = {};
segmentConfig.aes = false;
segmentConfig.mAudio = false;
segmentConfig.defaultMAudio = 'en';
process.argv.forEach((val, index, array) => {
  if (val === '-i') {
    segmentConfig.input = array[index + 1];
  }
  if (val === '-o') {
    segmentConfig.output = array[index + 1];
  }
  if (val === '-aes') {
    segmentConfig.aes = true;
  }
  if (val === '-maudio') {
    segmentConfig.mAudio = true;
  }
  if (val === '-default_maudio') {
    segmentConfig.defaultMAudio = array[index + 1];
  }
});
if (globalConfig.debug) {
  console.log('RMP-SEGMENT: arguments from command line');
  console.log(segmentConfig);
}
// prepare for segmenting
var prepare = new Prepare(globalConfig, segmentConfig);
prepare.segment();
