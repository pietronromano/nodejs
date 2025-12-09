/*
Libraries
npm install extract-zip --save
npm install  path --save
*/
const extract = require('extract-zip');
const fs = require("fs");
const path = require("path");

const zippedFiles = [];

async function extractZip(source, target) {
    try {
      await extract(source, { dir: target });
      console.log("Extraction complete of " + source);
    } catch (err) {
      console.log("Oops: extractZip failed", err);
    }
  }

// Method to traverse folders recursively
const unzipFiles = async function (dirPath) {
  var separator = (dirPath.indexOf("\\") > 0) ? "\\" : "/";
  const files = fs.readdirSync(dirPath);

  await Promise.all(
    files.map(async (file) => {
      if (fs.statSync(dirPath + separator + file).isDirectory()) {
        await unzipFiles(dirPath + separator + file);
      } else {
        const fullFilePath = path.join(dirPath, separator, file);
        const folderName = file.replace(".zip", "");
        if (file.endsWith(".zip")) {
          zippedFiles.push(fullFilePath);
          console.log("Added " + fullFilePath + " to unzip list");
          await extractZip(fullFilePath, path.join(dirPath, separator, folderName));
          await unzipFiles(path.join(dirPath, separator, folderName));
        }
      }
    })
  );
};



async function main () {
  try {
    const dirPath = process.argv[2];
    if(!fs.existsSync(dirPath)) {
      console.log(dirPath + " doesn't exist");
      return;
    }
    unzipFiles(dirPath);
    console.log("Unzipping " +  zippedFiles.length + " files in " + dirPath);
  } catch (err) {
    console.dir(err);
  }
}
main();
