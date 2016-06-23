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