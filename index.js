var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    config_bot = require("./config_bot.js"),
    config_pdf = require("./config_pdf.js"),
    shell = require('shelljs'),
    marked = require('marked'),
    pdf = require('html-pdf');
    http = require("http");

var TelegramBot = require('node-telegram-bot-api');

var token = config_bot.token;

var bot = new TelegramBot(token, {polling: true});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

// Any kind of message
bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  var fromId = msg.from.id;
  // photo can be: a file path, a stream or a Telegram file_id
  //var photo = 'image.png';
  //console.log(msg);
  if(msg.text.indexOf('ls')>-1) {
 	shell.ls('*').forEach(function(file) {
          bot.sendMessage(fromId, file);
        });
  }
  if(msg.text.indexOf('cd')>-1) {
	var par2 = msg.text.split('cd')[1];
 	shell.cd(par2);
        bot.sendMessage(fromId, 'ok');
  }

});

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

    var count = 0;
    for(var item in indexes) {
      console.log('=' + indexes[item]);
      var userPath = indexes[item].split('/');
      var blobAll = '';

      catToHTML(process.argv[2], userPath[0], userPath[1], function (result) {

        blobAll+=result;
        if(count==indexes.length-1) {
          console.log('item ' + item + ' and output = ' + marked(blobAll));
          pdf.create(marked(blobAll), config_pdf).toFile(outFile,function(err, res){
            console.log(res.filename);
          });
        }
        count++;

      });
    }

  });

}

init();

function catToHTML(appPath, section, file, cb) {

  var fullPath = path.join(__dirname, appPath, section, file);
  console.log("*="  + fullPath);

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
