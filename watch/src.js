var chokidar = require("chokidar");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
// in order to grab up to date browserify
var browserify = require("../node_modules/watchify/node_modules/browserify/index.js");
var watchify = require("watchify");
var coffeeify = require("coffeeify");

var argv = require("optimist")
    .usage("Loops over a directory and Watchify's all files in that directory")

    .options("w", {
        alias: "watch",
        describe: "Watch the input file/directory and bind watchify to that directory"
    })

    .boolean(["w"])

    .argv;

function Directify(options) {
    options = options || {};

    this.argv = options.argv;
    this._run()
}

Directify.prototype._run = function() {
    var self = this;

    if(this.argv._.length < 2) {
        console.error("Input and output file/directory arguments required");
        process.exit(-1);
    }

    this.inputDir = this.argv._[0];
    this.outputDir = this.argv._[1];

    if(!fs.existsSync(this.inputDir)) {
        console.error("Input file does not exist:", this.inputDir);
        process.exit(1);
    }

    // ignoring .ds_store files
    var watcher = chokidar.watch(this.inputDir, { ignored: /\.DS_Store/ });
    watcher.on("add", function(inputPath) {
        self._addPath(inputPath);
    });
}

Directify.prototype._addPath = function(inputPath) {
    var self = this;
    var outputPath = this._replaceExtension(path.join(this.outputDir, path.relative(this.inputDir, inputPath)), ".coffee", ".js");

    var parentDirectoryPath = path.join(outputPath, "..");

    mkdirp(parentDirectoryPath, function(err) {
        if(err) {
            console.error("Could not create parent directory `" + parentDirectoryPath + "`:", err);
            return;
        }

        self._watchifyFile(inputPath, outputPath);
    });
}

Directify.prototype._replaceExtension = function(filepath, expectedExtension, newExtension) {
    var dirpath = path.dirname(filepath);
    var filename = path.basename(filepath, expectedExtension) + newExtension;
    return path.join(dirpath, filename);
}

Directify.prototype._watchifyFile = function(inputPath, outputPath) {
    var b = browserify({
        cache: {},
        packageCache: {},
        fullPaths: true
    });
    b = watchify(b);
    b.on('update', this._bundleShare);

    b.add(inputPath);
    b.transform(coffeeify);
    this._bundleShare(b, outputPath);
    return b;
}

Directify.prototype._bundleShare = function(b, outputPath) {
    console.log('bundling')
    console.log(outputPath);
    b.bundle()
        .pipe(fs.createWriteStream(outputPath));
}

new Directify({argv: argv});
