const fs = require('fs')


const COLUMN_REPLACER = "|";
const LINE_REPLACER  = " ";
const COLUMN_SEPARATOR = ",";
const NEW_LINE = "\n";
const regExCol = new RegExp(COLUMN_SEPARATOR,"g");
const regExNL = new RegExp(NEW_LINE,"g");


const roundToInteger = (num) => {
    if (num === null || isNaN(num) || num === undefined) {
      return null;
    } else {
      return Math.round(num);
    }
}

/**
 * // Get date in format YYYY-MM-DD, with an optional date parameter to specify a different date
 * @param {*} param0 
 * @returns 
 */
const getFormatedDate = ({date, separator = "-",offsetDays=0} = {}) => {
    if(date == undefined || date == null)
        date = new Date();
    if(offsetDays) {
        date.setDate(date.getDate() + offsetDays);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${separator}${month}${separator}${day}`;
}

const getFormatedDateTime = ({date, separator = "-",offsetDays=0} = {}) => {
    if(date == undefined || date == null)
        date = new Date();
    if(offsetDays) {
        date.setDate(date.getDate() + offsetDays);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${separator}${month}${separator}${day}_${hours}${separator}${minutes}${separator}${seconds}`;
}

/**
 * Generate an array of date strings in the format YYYY-MM-DD between a start date and end date (inclusive)
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns 
 */
const generateDateArray = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

//For inserts into DB
const undefinedOrEmptyToNull = (val) => {
    if (val == undefined || val == null || val === "") {
        return null;
    }
    return val;
}

//For inserts into DB
const nullToEmpty = (val) => {
    if (val === null) {
        return "";
    }
    return val;
}

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
    if(val == undefined || val == null || val == "")
        return "";
    if(typeof val != "string") 
        return val;
    if(val.search(COLUMN_SEPARATOR) >=0) 
        val = val.replace(regExCol,COLUMN_REPLACER);
    if(val.search("\n") >=0)
        val = val.replace(regExNL,LINE_REPLACER);

    return val;
}


const toCamelCase = (rows) => {
  return rows.map((row) => {
    const replaced = {};

    for (let key in row) {
      const camelCase = key.replace(/([-_][a-z])/gi, ($1) =>
        $1.toUpperCase().replace('_', '')
      );
      replaced[camelCase] = row[key];
    }

    return replaced;
  });
};

/**
 * 
 * @param {*} outputArray 
 * @param {*} outputFilePath 
 * @param {*} sort 
 */
const writeToCsvFile = (outputArray,outputFilePath, columnNames) =>{
    let content = columnNames.join(COLUMN_SEPARATOR) + NEW_LINE;
    for (let i = 0; i < outputArray.length; i++) {
        const element = outputArray[i];
        if (i > 0) {
            content = content + NEW_LINE;
        }
        let line = "";
        columnNames.forEach(column => {
            if(line.length > 0) 
                line = line + COLUMN_SEPARATOR;
            line = line + ensureValidColValue(element[column])  ;
        });
        content = content + line;
    }
  
    try {
      fs.writeFileSync(outputFilePath + ".csv", content);
      // file written successfully
    } catch (err) {
      console.error(err);
    }
}

const linesToJSONArray = (multilineString) => {
  return multilineString
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}

/**
 * Remove duplicates from an array of objects based on a specific property
 * @param {Array} array - Array of objects to deduplicate
 * @param {string} propertyName - Name of the property to use for deduplication
 * @returns {Array} Array with duplicates removed (keeps first occurrence)
 */
const removeDuplicates = (array, propertyName) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[propertyName];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

module.exports = {
    roundToInteger,
    undefinedOrEmptyToNull,
    ensureValidColValue ,
    writeToCsvFile,
    linesToJSONArray,
    getFormatedDate,
    getFormatedDateTime,
    generateDateArray,
    toCamelCase,
    removeDuplicates,
    nullToEmpty
 }