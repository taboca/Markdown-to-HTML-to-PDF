var config = {
 
  "height": "10.5in",        // allowed units: mm, cm, in, px 
  "width": "8in",            // allowed units: mm, cm, in, px 
  "border": {
    "top": "2in",            // default is 0, units: mm, cm, in, px 
    "right": "1in",
    "bottom": "2in",
    "left": "1.5in"
  },
 
  "header": {
    "height": "45mm",
    "contents": '<div style="text-align: center;">Author: Generator</div>'
  },
  "footer": {
    "height": "28mm",
    "contents": '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>'
  },
 
 
  "type": "pdf",             // allowed file types: png, jpeg, pdf 
  "quality": "75",           // only used for types png & jpeg 
  "phantomPath": "./node_modules/phantomjs/bin/phantomjs", // PhantomJS binary which should get downloaded automatically 
  "phantomArgs": [], // array of strings used as phantomjs args e.g. ["--ignore-ssl-errors=yes"] 
  "timeout": 30000,           // Timeout that will cancel phantomjs, in milliseconds 
 
  "httpHeaders": {
    "Authorization": "Bearer ACEFAD8C-4B4D-4042-AB30-6C735F5BAC8B"
  }
 
}

module.exports = config;

