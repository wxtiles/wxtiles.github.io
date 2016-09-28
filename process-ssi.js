// var ssi = require("ssi");
 
// var inputDirectory = "./api-docs";
// var outputDirectory = "/api-docs/out";
// var matcher = "/**/*.shtml";
 
// var includes = new ssi(inputDirectory, outputDirectory, matcher);
// includes.compile();




var fs = require('fs');
var ssi = require("ssi");
var glob = require("glob");
var path = require('path');


// var allDocs = fs.readFileSync('out/docs/api.md', 'utf8');
// var wxTilesDocs = "## wxTiles" + allDocs.split(/[^#]## wxTiles/g, 2).pop();
// fs.writeFileSync('./out/docs/wxTiles.md', wxTilesDocs, 'utf8');


//Setup the ssi parser.
//new ssi(inputDirectory, outputDirectory, matcher, loosenedSpaces)
var ssiParser = new ssi(".", ".", '/**/*.shtml', true);

//Get a list of all the files.
var fileNames = glob.sync("**/*.shtml", {ignore: "node_modules/**/*"});

//Rewrite the files.
fileNames.forEach((filePath) => {
	var fileContent = fs.readFileSync(filePath, 'utf8');
	fileContent = ssiParser.parse(filePath, fileContent);

	//Change the extension.
	var newFilePath = path.parse(filePath);
	newFilePath.ext = 'html';
	newFilePath = path.format(newFilePath);

	//And write the new tile out.
	fs.writeFileSync(filePath, fileContent, 'utf8');
});