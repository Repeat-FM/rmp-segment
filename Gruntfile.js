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
          'rmp-segment.js'
        ],
        tasks: ['shell:jshint']
      }
    },
    shell: {
      jshint: {
        command: 'jshint rmp-segment.js libs/analysis.js libs/hls.js libs/prepare.js ' +
        'libs/fw.js spec/rmp-segment/RMPSegmentSpec.js Gruntfile.js'
      }
    }
  });
  // Default task(s).
  grunt.registerTask('default', [
    'jshint'
  ]);
};