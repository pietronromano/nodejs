const fs = require('fs')
const xml2js = require('xml2js');  
  

let objectAnalyzer = require('./objectAnalyzer');
const c4 = require('./c4Analyzer');

var args = process.argv;
const inputFileFormat = args[2]; // json|xml
const inputFilePath = args[3]; //example: "tests/test1.json"
let outputFilePath = args[4]; //example: "tests/objectAnalysis.csv"
const options = args[5]; // c4

if(!inputFilePath) {
  console.log("Missing Arguments: usage: app.js inputFileFormat:[json|xml] inputFilePath [outputFilePath] options[c4]");
  return;
}
if(!outputFilePath) 
  outputFilePath = inputFilePath + "_output.csv";

const outputArray =  [];

const analyze = (obj, options) =>  {
  if(options == "c4")
    objectAnalyzer = c4;

  objectAnalyzer.analyzeProperties(outputArray,obj);
  objectAnalyzer.writeToFile(outputArray,outputFilePath)
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

