var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    config_pdf = require("./config_pdf.js"),
    shell = require('shelljs'),
    marked = require('marked'),
    cheerio = require('cheerio'),
    pdf = require('html-pdf'),
    traverse = require('./traverseJSON.js'),
    http = require("http");

function init() {

  var indexPath = path.join(__dirname, process.argv[2], 'index.txt');

  var parsedTree = traverse.init(process.argv[2]);

  console.log("Parsing .. " + indexPath);

  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  });

  parseIndex(indexPath, function (indexes) {

    var outFile = path.join(__dirname, 'output.pdf');
    //config_pdf["base"] = 'file://' + path.join(__dirname, process.argv[2]);

    console.log(JSON.stringify(config_pdf));
    var count = 0;
    for(var item in indexes) {
      console.log('=' + indexes[item]);
      var userPath = indexes[item].split('/');
      var blobAll = '';
      var sections = new Array();

      catToHTML(process.argv[2], userPath[0], userPath[1], item, function (result, item) {

        var $ = cheerio.load(marked(result));

        if($('img').length>0) {
          $('img').attr('style','width:100%; border:1px solid blue; page-break-before: always');
          var src = $('img').attr('src');
          src =  path.join(__dirname, process.argv[2], src);
          $('img').attr('src','file://'+src);
        }
        result = $.html();

        sections[item] = result;
        console.log('item ' + item + ' and output = ' + result);
        /* At the end */
        if(count==indexes.length-1) {
          for(var j=0;j<sections.length;j++) {
            blobAll+=sections[j];
          }
          pdf.create(blobAll, config_pdf).toFile(outFile,function(err, res){
            console.log(res.filename);
          });
        }
        count++;
      });
    }
  });
}

function catToHTML(appPath, section, file, item, cb) {
  var fullPath = path.join(__dirname, appPath, section, file);
  var blobFile = '';
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(fullPath)
  });
  lineReader.on('line', function (line) {
    blobFile+=line+"\n";
  });
  lineReader.on('close', function (line) {
    cb(blobFile, item);
  });
}

function parseIndex(fullPath, callBack) {

  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(fullPath)
  });

  var indexParse = 0;
  var indexes = new Array();

  lineReader.on('line', function (line) {
      if(indexParse==0) {
        console.log('Title =' + line)
      }
      if(indexParse>0) {
        console.log('Pushing '+ line)
        indexes.push(line);
      }
      indexParse++;
  });

  lineReader.on('close', function (line) {
    callBack(indexes);
  });

}

init();
