var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    shell = require('shelljs');

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

var traverse = {

  indexes : {},

  init: function (indexDirectory) {

    console.log("Will traverse " + indexDirectory);
    this.indexes['root'] = {
      'dir': path.join(__dirname,indexDirectory),
      'shortPath': indexDirectory,
      'index': path.join(indexDirectory, "index.txt"),
      'childs': new Array()
    }

    shell.cd(path.join(__dirname,indexDirectory));
    this.traverseDir(this.indexes['root']);

    console.log(JSON.stringify(this.indexes));
    //this.parseIndex(indexPath, function(bufferFile) {
    //    console.log('Expanded: ' + marked(bufferFile))
    //});

  },

  traverseDir: function (currentNode) {
    console.log('Current node child len='+currentNode.childs.length);

    if(currentNode.childs.length==0)
     {
      console.log('Not populated, entering '+currentNode.shortPath)
      var totalDir = 0;
      var i=0;
      shell.ls('-d','*').forEach(function(file) {
        //console.log(shell.pwd());
        console.log('Listed: ' + file);
        if (shell.test('-d', file)) {
          var currDir = path.join(currentNode.dir,file);
          console.log('Checking dir = ' + file);
          var childNode = {
            'shortPath': file,
            'dir': currDir,
            'index': path.join(currDir, "index.txt"),
            'expanded':false,
            'childs': new Array()
          }

          currentNode.childs.push(childNode);
          shell.cd(currDir);
          traverse.traverseDir(childNode);
          shell.cd('..');
        } else {

        }
      });
    }

  },

  parseIndex: function (fullPath, callBack) {
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(fullPath)
    });
    var bufferFile = '';
    lineReader.on('line', function (line) {
        console.log('Pushing '+ line)
        bufferFile+=line+'\n';
    });
    lineReader.on('close', function (line) {
      callBack(bufferFile);
    });
  }

}

module.exports = traverse;
