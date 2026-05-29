// NOT USED: No need to read line by line to make an array, we can directly parse the JSON file as an array of objects.
// replaced by: jq -s '.' "$download_file" > "$usage_array"  
const fs = require('fs')
const readline = require('readline');

let utils = require('./utils');
let objectAnalyzer = require('./objectAnalyzer');

var args = process.argv;
const inputFile = args[2]; // 

if(!inputFile) {
  console.log("Missing Argument: usage: app.js inputFile");
  return;
}

const topLevelArray =  [];
const topLevelColumns = ["id", "report_start_day","report_end_day","day",
  "enterprise_id", "user_id","user_login", "user_initiated_interaction_count",
  "code_generation_activity_count","code_acceptance_activity_count",
  "used_agent","used_chat","loc_suggested_to_add_sum","loc_suggested_to_delete_sum",
  "loc_added_sum","loc_deleted_sum"
];

const totalsArray =  [];
const totalsColumns =  ["top_level_obj", "totals_by","ide", "model", "language", "feature", "user_initiated_interaction_count", 
  "code_generation_activity_count", "code_acceptance_activity_count", 
  "loc_suggested_to_add_sum", "loc_suggested_to_delete_sum", 
  "loc_added_sum", "loc_deleted_sum"];



try {
  const fileStream = fs.createReadStream(inputFile);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    // Process each line here
    let jsonObj = JSON.parse(line);
    objectAnalyzer.analyzeProperties(jsonObj, topLevelArray, totalsArray);
  });

  rl.on('close', () => {
    console.log('Finished reading file');
    utils.writeToFile(topLevelArray,inputFile + "_topLevel.csv",topLevelColumns);
    fs.writeFileSync(inputFile + "_topLevel.json", JSON.stringify(topLevelArray, null, 2));
    
    utils.writeToFile(totalsArray,inputFile + "_totals.csv",totalsColumns);
    fs.writeFileSync(inputFile + "_totals.json", JSON.stringify(totalsArray, null, 2));
  });

  rl.on('error', (err) => {
    console.error('Error reading file:', err);
  });
  
} catch (err) {
  console.error(err);
}

