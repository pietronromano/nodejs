const fs = require('fs')
const utils = require('./utils');


const COLUMN_REPLACER = "|";
const LINE_REPLACER  = " ";
const COLUMN_SEPARATOR = ",";
const NEW_LINE = "\n";
const regExCol = new RegExp(COLUMN_SEPARATOR,"g");
const regExNL = new RegExp(NEW_LINE,"g");

const ensureValidColValue = (val) => {
    if (val == undefined)
    {
        return "";
    }
    else {
        if (Array.isArray(val)) {
            val = val.join(COLUMN_REPLACER);
            val = cleanString(val);
        } else       //Remove unwanted characters
        if(typeof val === "string") {
            val = cleanString(val);
        }
        return val;
    }
}

const cleanString = (val) => {
    if(!val)
        return "";
    if(typeof val != "string") 
        return val;
    if(val.search(COLUMN_SEPARATOR)) 
        val = val.replace(regExCol,COLUMN_REPLACER);
    if(val.search("\n"))
        val = val.replace(regExNL,LINE_REPLACER);

    return val;
}



/**
 * 
 * @param {*} outputArray 
 * @param {*} outputFilePath 
 * @param {*} sort 
 */
const writeToFile = (outputArray,outputFilePath, columnNames) =>{
    var content = columnNames.join(COLUMN_SEPARATOR) + NEW_LINE;
    outputArray.forEach(element => {
        columnNames.forEach(column => {
            content = content + ensureValidColValue(element[column]) + COLUMN_SEPARATOR ;
        });
        content = content + NEW_LINE;
    });
  
    try {
      fs.writeFileSync(outputFilePath, content);
      // file written successfully
    } catch (err) {
      console.error(err);
    }
}

module.exports = {
    ensureValidColValue: ensureValidColValue,
    writeToFile: writeToFile

 }