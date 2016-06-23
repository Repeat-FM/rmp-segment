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
