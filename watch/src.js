var chokidar = require("chokidar");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
// in order to grab up to date browserify
var browserify = require("../node_modules/watchify/node_modules/browserify/index.js");
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
    this.cache = {};
    this.deps = {};
    this.curDir = path.join(__dirname, "..");
    this._run();
}


Directify.prototype._run = function() {
    var self = this;

    console.log('yo')
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
    this.watcher = chokidar.watch(this.inputDir, { ignored: /\.DS_Store/ });
    this.watcher.on("add", function(inputPath) {

        if(!(inputPath in self.deps)) {
            self._addPath(inputPath);
        }
    });
    this.watcher.on("change", function(changePath) {
        console.log('\n')
        console.log('change path ' + changePath)
        if(changePath in self.cache) {
            self._bundleShare(changePath);
        }
        if(changePath in self.deps) {
            console.log('in deps')
            var deps = self.deps[changePath]
            for(var i=0; i < deps.length; i++) {

                self._bundleShare(deps[i]);
            }
        }
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

        // console.log('watchifying file ' + inputPath)
        self._watchifyFile(inputPath, outputPath);
    });
}

Directify.prototype._replaceExtension = function(filepath, expectedExtension, newExtension) {
    var dirpath = path.dirname(filepath);
    var filename = path.basename(filepath, expectedExtension) + newExtension;
    return path.join(dirpath, filename);
}

Directify.prototype._watchifyFile = function(inputPath, outputPath) {
    // console.log('watchifying')
    // console.log('input path ' + inputPath)
    // console.log('output path ' + outputPath)
    var self = this;

    var b = browserify(inputPath);

    this.cache[inputPath] = {
        deps: [],
        b: b,
        outputPath: outputPath
    }

    b.on("dep", function(dep) {
        console.log('dep')
        if(dep.file !== inputPath) {
            console.log(dep.file)
            var depFile = path.relative(self.curDir, dep.file);
            var deps = self.cache[inputPath].deps;
            
            if (deps.indexOf(depFile)) {
                deps.push(depFile);
            }
            if(depFile in self.deps) {
                self.deps[depFile].push(inputPath);
            } else {
                self.deps[depFile] = [inputPath];
                if(!(depFile in self.cache)) {
                    self.watcher.add(depFile);
                }
                
                
            }
        }
    });

    console.log('input path ' + inputPath);
    b.add(inputPath);
    b.transform(coffeeify);
    b.on("error", function(err) {
        console.log(err)
    })
    this._bundleShare(inputPath);
}

Directify.prototype._bundleShare = function(inputPath) {
    console.log('browserifying ' + this.cache[inputPath].outputPath);
    input = this.cache[inputPath];
    try {
        input.b.bundle()
            .pipe(fs.createWriteStream(input.outputPath));
        console.log('piped');
    } catch(error) {
        console.log(error);
    }
}

new Directify({argv: argv});
