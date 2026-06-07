const fs = require('fs')
const xml2js = require('xml2js');  
const path = require('path');
const utils = require('./utils');

let objectAnalyzer = require('./objectAnalyzer');
const c4 = require('./c4Analyzer');

var args = process.argv;
const inputFileFormat = args[2]; // json|xml
const inputFilePath = args[3]; //example: "tests/test1.json"
let outputFileDir = args[4]; //example: "tests/objectAnalysis.csv"
const options = args[5]; // c4

if(!inputFilePath) {
  console.log("Missing Arguments: usage: app.js inputFileFormat:[json|xml] inputFilePath [outputFileDir] options[c4]");
  return;
}
if(!outputFileDir) {
  console.log("Missing Arguments: usage: app.js inputFileFormat:[json|xml] inputFilePath [outputFileDir] options[c4]");
  return;
}

const outputArray =  [];
// Get current date in YYYY-MM-DD format for timestamping output files
const processDateTime = utils.getFormatedDateTime({separator: "-"}); 
console.log(`processDateTime: ${processDateTime}`);

const analyze = (obj, options) =>  {
  if(options == "c4") {
    objectAnalyzer = c4;
  } 

  objectAnalyzer.analyzeProperties(outputArray,obj);
  const outputFilePath = path.join(outputFileDir, `objectAnalysis_${processDateTime}.csv`);
  objectAnalyzer.writeToFile(outputArray, outputFilePath);
  console.log("File written to: " + outputFilePath);

}

try {
  const fileContents = fs.readFileSync(inputFilePath, { encoding: 'utf8', flag: 'r' });
  if (inputFileFormat === "xml") {
    xml2js.parseString(fileContents, function (err, obj) { 
      analyze(obj, options);
    });
  } else {
    const obj = JSON.parse(fileContents);
    analyze(obj, options);
  }
  
} catch (err) {
  console.error(err);
}

