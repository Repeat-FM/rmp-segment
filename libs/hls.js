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
const exec = require('child_process').exec;
const path = require('path');
const EOL = require('os').EOL;
const fs = require('fs');
const crypto = require('crypto');

class HLS {

  // class constructor
  constructor(mediaData, segmentConfig, globalConfig) {
    this.ffmpegCmd = [];
    this.mediaData = mediaData;
    this.segmentConfig = segmentConfig;
    this.globalConfig = globalConfig;
    this.startTime = 0;
    this.endTime = 0;
  }

  // create AES key information
  runAes() {
    let outputKeyPath = path.join(this.segmentConfig.output, 'file.key');
    let sslStep1 = new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buffer) => {
        if (err) {
          return reject(err);
        }
        fs.writeFile(outputKeyPath, buffer, (err) => {
          if (err) {
            return reject(err);
          }
          if (this.globalConfig.debug) {
            console.log('RMP-SEGMENT: HLS AES-128 file.key generated');
          }
          resolve(true);
        });
      });
    });
    let sslStep2 = new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buffer) => {
        if (err) {
          return reject(err);
        }
        let token = buffer.toString('hex');
        if (this.globalConfig.debug) {
          console.log('RMP-SEGMENT: HLS AES-128 IV generated');
        }
        resolve(token);
      });
    });
    return Promise.all([sslStep1, sslStep2]).then((result) => {
      if (result[0] !== true) {
        throw 'file.key generation did not complete';
      }
      let iv = result[1];
      let outputKeyInfoPath = path.join(this.segmentConfig.output, 'file.keyinfo');
      let outputKeyInfoString = 'file.key' + EOL;
      outputKeyInfoString += path.join(this.segmentConfig.output, 'file.key') + EOL;
      if (typeof iv === 'string') {
        outputKeyInfoString += iv + EOL;
      }
      return new Promise((resolve, reject) => {
        fs.writeFile(outputKeyInfoPath, outputKeyInfoString, (err) => {
          if (err) {
            return reject(err);
          }
          if (this.globalConfig.debug) {
            console.log('RMP-SEGMENT: HLS AES-128 file.keyinfo generated');
          }
          resolve(true);
        });
      });
    });
  }

  // create chunklists
  runChunkLists() {
    this.startTime = Date.now();
    // re-arrange bitrates from lowest to highest
    this.mediaData.sort((a, b) => {
      return a.bitrate - b.bitrate;
    });
    if (this.globalConfig.debug) {
      console.log('RMP-SEGMENT: start chunklist generation');
    }
    let mediaPromise = [];
    let countPromise = 0;
    let h264CodecTestString = /avc\d+\./gi;
    this.mediaData.forEach((element, index) => {
      mediaPromise[countPromise] = new Promise((resolve, reject) => {
        countPromise++;
        let bitrate = element.bitrate.toString();
        let outputPathTs;
        let outputPathM3u8;
        if (this.segmentConfig.mAudio) {
          if (element.hasAudio && !element.hasVideo) {
            // this is an audio-only input file 
            // we create audio-only HLS data
            let fileName = path.parse(element.path);
            let language = fileName.name.split('-');
            language = language[0];
            outputPathTs = path.join(this.segmentConfig.output, 'media_b' + bitrate + '_ao_' +
              language + '_%01d.aac');
            outputPathM3u8 = path.join(this.segmentConfig.output, 'chunklist_b' + bitrate + '_ao_' +
              language + '.m3u8');
          } else if (element.hasVideo) {
            // this input file has video 
            // we create video-only HLS data
            outputPathTs = path.join(this.segmentConfig.output, 'media_b' + bitrate + '_vo_%01d.ts');
            outputPathM3u8 = path.join(this.segmentConfig.output, 'chunklist_b' + bitrate + '_vo.m3u8');
          }
        } else {
          if (element.hasAudio && !element.hasVideo) {
            // this is an audio-only input we create .aac chunks
            outputPathTs = path.join(this.segmentConfig.output, 'media_b' + bitrate + '_%01d.aac');
          } else {
            // this is an audio/video or video-only input we create .ts chunks
            outputPathTs = path.join(this.segmentConfig.output, 'media_b' + bitrate + '_%01d.ts');
          }
          // our chunklist playlist
          outputPathM3u8 = path.join(this.segmentConfig.output, 'chunklist_b' + bitrate + '.m3u8');
        }
        if (!outputPathM3u8 || !outputPathTs) {
          // something went wrong - reject
          reject('HLS: Invalid output path for .m3u8 playlist and .ts chunks');
        }
        this.ffmpegCmd[index] = path.normalize(this.globalConfig.ffmpeg) + ' -i ' +
          element.path + ' -hls_time ' +
          this.globalConfig.tsChunkSize + ' -hls_allow_cache ' +
          this.globalConfig.allowCache + ' -hls_list_size 0' +
          ' -hls_segment_filename ' + outputPathTs + ' ';
        if (h264CodecTestString.test(element.videoCodec)) {
            this.ffmpegCmd[index] += '-bsf:v h264_mp4toannexb -c copy '
        }
        if (this.segmentConfig.aes === true) {
          this.ffmpegCmd[index] += '-hls_key_info_file ' +
            path.join(this.segmentConfig.output, 'file.keyinfo') + ' ';
        }
        // here is our ffmpeg command line
        this.ffmpegCmd[index] += outputPathM3u8;
        if (this.globalConfig.debug) {
          console.log('RMP-SEGMENT: Create HLS chunklist command: ' + this.ffmpegCmd[index]);
        }
        // we execute the ffmpeg command line
        exec(this.ffmpegCmd[index], (err) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      }).catch((err) => {
        console.log(err);
        throw (err);
      });
    });
    return Promise.all(mediaPromise);
  }

  runMasterPlaylist() {
    if (this.globalConfig.debug) {
      console.log('RMP-SEGMENT: start master playlist generation');
    }
    // all our chunklists are ready
    // now we create our master playlist
    let playlist = '#EXTM3U' + EOL;
    if (this.segmentConfig.mAudio) {
      // multiple audio reuires HLS version 7+
      playlist += '#EXT-X-VERSION:7' + EOL;
    } else {
      // otherwise we stay as compatible as possible with version 3
      playlist += '#EXT-X-VERSION:3' + EOL;
    }

    this.mediaData.forEach((element) => {
      let bitrate = element.bitrate.toString();
      let resolution = element.resolution.width + 'x' + element.resolution.height;
      let codec = '';
      if (element.hasVideo) {
        codec += element.videoCodec;
      }
      if (element.hasAudio) {
        if (codec) {
          codec += ',';
        }
        codec += element.audioCodec;
      }
      let m3u8;
      if (this.segmentConfig.mAudio) {
        if (element.hasAudio && !element.hasVideo) {
          let fileName = path.parse(element.path);
          let split = fileName.name.split('-');
          let language = split[0].toLowerCase();
          let name = split[1];
          let defaultTrack = this.segmentConfig.defaultMAudio;
          if (defaultTrack && defaultTrack.toLowerCase() === language) {
            defaultTrack = true;
          } else {
            defaultTrack = false;
          }
          playlist += '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac"';
          if (typeof language === 'string') {
            playlist += ',LANGUAGE="' + language + '"';
          }
          if (typeof name === 'string') {
            playlist += ',NAME="' + name + '"';
          }
          if (defaultTrack) {
            playlist += ',DEFAULT=YES';
          } else {
            playlist += ',DEFAULT=NO';
          }
          m3u8 = 'chunklist_b' + bitrate + '_ao_' + language + '.m3u8';
          playlist += ',URI="' + m3u8 + '"' + EOL;
        } else if (element.hasVideo) {
          playlist += '#EXT-X-STREAM-INF:';
          if (bitrate) {
            playlist += 'BANDWIDTH=' + bitrate;
          }
          if (codec) {
            playlist += ',CODECS="' + codec + '"';
          }
          if (resolution) {
            playlist += ',RESOLUTION=' + resolution;
          }
          playlist += ',AUDIO="aac"' + EOL;
          m3u8 = 'chunklist_b' + bitrate + '_vo.m3u8';
          playlist += m3u8 + EOL;
        }
      } else {
        playlist += '#EXT-X-STREAM-INF:';
        if (bitrate) {
          playlist += 'BANDWIDTH=' + bitrate;
        }
        if (codec) {
          playlist += ',CODECS="' + codec + '"';
        }
        if ((!element.hasAudio || (element.hasAudio && element.hasVideo)) && resolution) {
          playlist += ',RESOLUTION=' + resolution;
        }
        playlist += EOL;
        m3u8 = 'chunklist_b' + bitrate + '.m3u8';
        playlist += m3u8 + EOL;
      }
    });

    return new Promise((resolve, reject) => {
      let outputPathMaster = path.join(this.segmentConfig.output, 'playlist.m3u8');
      fs.writeFile(outputPathMaster, playlist, (err) => {
        if (err) {
          return reject(err);
        }
        this.endTime = Date.now();
        if (this.globalConfig.debug) {
          console.log('RMP-SEGMENT: master playlist created');
          let timeToFinish = this.endTime - this.startTime;
          if (timeToFinish > 0) {
            console.log('RMP-SEGMENT: process completed in ' + timeToFinish + ' ms');
          }
        }
        resolve(true);
      });
    });
  }
}
module.exports = HLS;