# rmp-segment
rmp-segment is an open-source node.js HLS segmenter. It is built as a portable command line tool with ease of use in mind.

It follows the HTTP Live Streaming [IETF sepcification](https://tools.ietf.org/html/draft-pantos-http-live-streaming-03). It uses [FFmpeg](https://github.com/FFmpeg/FFmpeg) for MPEG-2 TS segmenting. 

rmp-segment is an open-source project released under GPL version 3. For business users we can provide a [support and LGPL v3 licensing plan](https://www.radiantmediaplayer.com/rmp-segment/#rmp-segment-plan).

## Supported features
- on-demand video segmenting (output to MPEG-2 TS container)
- adaptive bitrate streaming
- AES-128 encryption
- multiple audio
- audio-only (output to AAC container)

## Currently unsupported features
- live 
- DVR
- Embedded closed captions (WebVTT or CEA-*)

Contributions are welcome!

## Requirements
rmp-segment is developed with ES6 and makes uses of new ES6 features like Promise.
- Node.js version 4.4+ 
- OS Linux 64-bits
 - Debian 8+
 - Ubuntu 14+
 - Fedora 24+
- OS Windows 64-bits:
 - Windows 8.1+

These are the OS we tested rmp-segment on. 32-bits OS are not supported.

## Install
`npm install -g rmp-segment`

## Usage
`rmp-segment -i input/bbb -o output/bbb`

The segmenter will locate all valid input files (.mp4|.m4a|.m4v) in `input/bbb` and write the .ts chunks and .m3u8 playlists at `output/bbb`

## Documentation
https://www.radiantmediaplayer.com/rmp-segment/

## For developer
`git clone https://github.com/radiantmediaplayer/rmp-segment.git`
`cd rmp-segment`
`npm install`

Install jshint globally: 

`npm install -g jshint`

In working directory (where main.js is) run:

`grunt`

If it greenlights you are good to go.

## Example
Here are some HLS streams generated with rmp-segment
- ABR stream: https://www.radiantmediaplayer.com/media/rmp-segment/bbb-abr/playlist.m3u8
- AES-128 ABR stream: https://www.radiantmediaplayer.com/media/rmp-segment/bbb-abr-aes/playlist.m3u8
- Video with 3 audio tracks stream: https://www.radiantmediaplayer.com/media/rmp-segment/bbb-maudio/playlist.m3u8

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

## LGPL v3 licensing and professional support
For business users we can provide a support and LGPL v3 licensing plan. This plan includes:
- Professional email-based technical support with priority bugfixes and feature requests
- Business-friendly LGPL version 3 compatible code for rmp-segment and FFmpeg build for Linux or Windows

Visit this [page to subscribe](https://www.radiantmediaplayer.com/rmp-segment/#rmp-segment-plan) or [contact us](https://www.radiantmediaplayer.com/contact.html) for more information. 

## Supporting the project
Code contributions and further testing are welcome.