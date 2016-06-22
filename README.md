# rmp-segment
rmp-segment is an open-source node.js HLS segmenter. 
It is built as a portable command line tool with ease of use in mind.
It follows the HTTP Live Streaming [IETF sepcification](https://tools.ietf.org/html/draft-pantos-http-live-streaming-03).
It uses [FFmpeg](https://github.com/FFmpeg/FFmpeg) for segmenting. 
rmp-segment is released under GPL version 3.

## Supported features
- on-demand video segmenting (output to MPEG-2 TS container)
- adaptive bitrate streaming
- AES-128 encryption
- multiple audio
- audio-only (output to AAC container)

## Currently unsupported features (contributions are welcome)
- live 
- DVR
- Embedded closed captions (WebVTT or CEA-*)

## Requirements
- Node.js 
version 4.4+ 
rmp-segment was developed with ES6 and makes extensive uses of new ES6 features like Promise.
It could work with earlier node 4 versions but they are untested and not supported.
- OS
Linux 64-bits: 
* Debian 8+
* Ubuntu 14+
* Fedora 24+
Windows 64-bits:
* Windows 10

These are the OS we tested rmp-segment on. 32-bits OS are not supported.

## Install
npm -i rmp-segment

## Usage
rmp-segment -i input/bbb -o output/bbb

## Documentation
https://www.radiantmediaplayer.com/rmp-segment/documentation.html

## For developer
Install jshint globally: 
npm install -g jshint
In working directory (where rmp-segment.js is) run:
grunt:shell:jshint
jasmine 
If it greenlights you are good to go.

## Example
Here are some HLS streams generated with rmp-segment
- on-demand ABR stream: https://www.radiantmediaplayer.com/media/rmp-segment/bbb-abr/playlist.m3u8
- on-demand AES-128 ABR stream: https://www.radiantmediaplayer.com/media/rmp-segment/bbb-abr-aes/playlist.m3u8
- on-demand video with 3 audio tracks stream: https://www.radiantmediaplayer.com/media/rmp-segment/bbb-maudio/playlist.m3u8

## Issues
Code related issues should be submitted through GitHub.
If you are looking for professional support we provide a dedicated support and custom licensing plan.

## License
rmp-segment is released under GPL version 3.
The GPL version 3 text is availabe with the LICENSE file.
rmp-segment uses the following dependencies: 
- [FFmpeg](https://github.com/FFmpeg/FFmpeg) which is released under GPL version 3 as well
- [mp4box.js](https://github.com/gpac/mp4box.js/) which is released under  BSD-3
- [node-mkdirp](https://github.com/substack/node-mkdirp) which is released under MIT

## Custom licensing and professional support
We provide a dedicated support and custom licensing plan. This plan includes:
- Professional email-based technical support with priority bugfixes and feature requests
- Business-friendly LGPL version 3 compatible code for rmp-segment and FFmpeg build for Linux or Windows
This support and custom licensing plan is available for $199 per month (billed annually)

## Supporting the project
Code contributions and further testing are welcome.
If you want to support the project further please consider making a donation (an invoice can be provided).

 
