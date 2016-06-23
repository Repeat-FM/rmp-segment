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
module.exports = function (grunt) {
  'use strict';
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      all: {
        files: [
          'Gruntfile.js',
          'libs/*.js',
          'main.js'
        ],
        tasks: ['shell:jshint']
      }
    },
    shell: {
      jshint: {
        command: 'jshint main.js libs/analysis.js libs/hls.js libs/prepare.js ' +
        'libs/fw.js spec/rmp-segment/RMPSegmentSpec.js Gruntfile.js'
      },
      test: {
        command: [
          'jshint main.js libs/analysis.js libs/hls.js libs/prepare.js ' +
          'libs/fw.js spec/rmp-segment/RMPSegmentSpec.js Gruntfile.js',
          'jasmine'
        ].join('&&')
      }
    }
  });
  // Default task(s).
  grunt.registerTask('default', [
    'shell:test'
  ]);
};