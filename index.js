var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    config_pdf = require("./config_pdf.js"),
    shell = require('shelljs'),
    marked = require('marked'),
    cheerio = require('cheerio'),
    pdf = require('html-pdf'),
    http = require("http");

function init() {

  var indexPath = path.join(__dirname, process.argv[2], "index.md");

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

      catToHTML(process.argv[2], userPath[0], userPath[1], function (result) {
        blobAll+=result;
        if(count==indexes.length-1) {
          var $ = cheerio.load(marked(blobAll));
          $('img').attr('style','width:100%;');
          var src = $('img').attr('src');
          src =  path.join(__dirname, process.argv[2], src);
          $('img').attr('src','file://'+src);
          blobAll = $.html();
          console.log('item ' + item + ' and output = ' + blobAll);

          pdf.create(blobAll, config_pdf).toFile(outFile,function(err, res){
            console.log(res.filename);
          });
        }
        count++;
      });
    }
  });
}

function catToHTML(appPath, section, file, cb) {
  var fullPath = path.join(__dirname, appPath, section, file);
  var blobFile = '';
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(fullPath)
  });
  lineReader.on('line', function (line) {
    blobFile+=line+"\n";
  });
  lineReader.on('close', function (line) {
    cb(blobFile);
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
