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
const fs = require('fs');
const input = 'input/bbb';
const output = 'output/bbb-test';
describe('Test for basic rmp-segment task: ', () => {
  let testCmd = 'node main.js -i ' + input + ' -o ' + output;
  it('HLS segment and write files to output folder', (done) => {
    let noError = true;
    console.log('test command: ' + testCmd);
    exec(testCmd, (err) => {
      if (err) {
        console.log(err);
        noError = false;
        expect(noError).toBe(true);
        done();
      }
      fs.readdir(output, (err, arrayFiles) => {
        if (err) {
          console.log(err);
          noError = false;
          expect(noError).toBe(true);
          done();
        }
        let nbM3U8 = 0;
        let nbTS = 0;
        for (let value of arrayFiles) {
          if (value.indexOf('.m3u8') > -1) {
            nbM3U8++;
          } else if (value.indexOf('.ts') > -1) {
            nbTS++;
          }
        }
        expect(noError).toBe(true);
        expect(nbM3U8).toEqual(2);
        expect(nbTS).toEqual(5);
        console.log('RMP-SEGMENT: jasmine test ok');
        done();
      });
    });
  });
});
