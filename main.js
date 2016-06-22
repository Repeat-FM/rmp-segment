#! /usr/bin/env node
'use strict';
// core modules
const Prepare = require('./libs/prepare.js');
const FW = require('./libs/fw.js');
var fw = new FW();

// parse JSON global config - config.json
var globalConfig = fw.parseSyncJSON('config.json');
if (globalConfig === -1) {
  return;
}
var debug = false;
var ffmpeg = 'utils/windows64bits/ffmpeg.exe';
var tsChunkSize = 10;
var allowCache = true;
for (let prop in globalConfig) {
  if (prop === 'debug' && typeof globalConfig[prop] === 'boolean') {
    debug = globalConfig[prop];
  }
  if (prop === 'ffmpeg' && typeof globalConfig[prop] === 'string') {
    ffmpeg = globalConfig[prop];
  }
  if (prop === 'tsChunkSize' && typeof globalConfig[prop] === 'number') {
    tsChunkSize = globalConfig[prop];
  }
  if (prop === 'allowCache' && typeof globalConfig[prop] === 'boolean') {
    allowCache = globalConfig[prop];
  }
}
globalConfig = {};
globalConfig.debug = debug;
globalConfig.ffmpeg = ffmpeg;
globalConfig.tsChunkSize = tsChunkSize;
if (allowCache) {
  globalConfig.allowCache = 1;
} else {
  globalConfig.allowCache = 0;
}
if (globalConfig.debug) {
  console.log('RMP-SEGMENT: global config settings from config.json');
  console.log(globalConfig);
}
// parse arguments
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
  console.log('RMP-SEGMENT: local config settings from command line');
  console.log(segmentConfig);
}
// prepare for segmenting
var prepare = new Prepare(globalConfig, segmentConfig);
prepare.segment();
