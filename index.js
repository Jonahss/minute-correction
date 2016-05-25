"use strict";

let csv = require('csv-streamify')
let csvWrite = require('csv-write-stream')
let fs = require('fs')
let through = require('through2')

let formatDate = function(seconds) {
  let date = new Date(seconds*1000)
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}

let keystrokes = fs.createReadStream('data/keystrokes.log')
let csvStream = csv({objectMode: true, columns: true})
let dateConvert = through({objectMode: true}, function(chunk, enc, cb) {
  chunk.minute = formatDate(chunk.minute)
  cb(null, chunk)
});
let filter = through({objectMode: true}, function(chunk, enc, cb) {
  if (chunk.minute[3] > 4) {
    this.push(chunk)
  }
  cb()
});
let csvWriteStream = csvWrite()
let out = fs.createWriteStream("keystrokesForPlotly.csv")

let jsonify = through({objectMode: true}, function(chunk, enc, cb) {
  console.log(JSON.stringify(chunk))
  cb()
});

keystrokes
   .pipe(csvStream)
   .pipe(dateConvert)
   .pipe(filter)
   .pipe(csvWriteStream)
//   .pipe(jsonify)
   .pipe(out)
