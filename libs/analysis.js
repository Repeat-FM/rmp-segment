'use strict'; 
const fs = require('fs');
const mp4boxModule = require('mp4box');

class Analysis {

  constructor() { }

  getMediaInfo(mediaFiles) {
    let filePromise = [];
    let countPromise = 0;
    mediaFiles.forEach((value) => {
      filePromise[countPromise] = new Promise((resolve, reject) => {
        countPromise++;
        fs.readFile(value, (err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve([data, value]);
        });
      }).then((array) => {
        return new Promise((resolve, reject) => {
          let data = array[0];
          let path = array[1];
          let arrayBuffer = new Uint8Array(data).buffer;
          arrayBuffer.fileStart = 0;
          let mp4box = new mp4boxModule.MP4Box();
          mp4box.appendBuffer(arrayBuffer);
          let mediaInfo = mp4box.getInfo();
          let result = {};
          result.hasVideo = false;
          result.hasAudio = false;
          result.bitrate = 0;
          result.videoCodec = null;
          result.audioCodec = null;
          let videoCodecTestString = /avc\d+\./gi;
          let audioCodecTestString = /mp4a\.\d+/gi;
          result.resolution = {};
          for (let key of mediaInfo.tracks) {
            if (typeof key.video === 'undefined' && typeof key.audio === 'undefined') {
              continue;
            }
            if (typeof key.video !== 'undefined') {
              result.hasVideo = true;
              if (videoCodecTestString.test(key.codec)) {
                result.videoCodec = key.codec;
              }
              if (typeof key.video.width === 'number' && key.video.width > 0 &&
                typeof key.video.height === 'number' && key.video.height > 0) {
                result.resolution.width = Math.round(key.video.width);
                result.resolution.height = Math.round(key.video.height);
              }
            } else if (typeof key.audio !== 'undefined') {
              result.hasAudio = true;
              if (audioCodecTestString.test(key.codec)) {
                result.audioCodec = key.codec;
              }
            }
            if (typeof key.bitrate === 'number' && key.bitrate > 0) {
              result.bitrate += Math.round(key.bitrate);
            }
          }
          if ((!result.hasVideo && !result.hasAudio) || result.bitrate === 0 ||
            (result.videoCodec === null && result.audioCodec === null)) {
            reject('Invalid information found in media file');
          }
          result.path = path;
          resolve(result);
        });
      }).catch((err) => {
        console.log(err);
        throw err;
      });
    });
    return Promise.all(filePromise);
  }
}
module.exports = Analysis;