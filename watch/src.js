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

function run(argv) {
    if(argv._.length < 2) {
        console.error("Input and output file/directory arguments required");
        process.exit(-1);
    }

    var input = argv._[0];
    var output = argv._[1];

    if(!fs.existsSync(input)) {
        console.error("File does not exist:", input);
        process.exit(1);
    }

    // ignoring .ds_store files
    var watcher = chokidar.watch(input, { ignored: /\.DS_Store/ });

    watcher.on("add", function(inputPath) {
        addPath(input, inputPath, output);
    });
}

function addPath(input, inputFile, output) {
    var outputFile = replaceExtension(path.join(output, path.relative(input, inputFile)), ".coffee", ".js");

    var parentDirectoryPath = path.join(outputFile, "..");

    mkdirp(parentDirectoryPath, function(err) {
        if(err) {
            console.error("Could not create parent directory `" + parentDirectoryPath + "`:", err);
            return;
        }

        watchifyFile(inputFile, outputFile);
    });
}

function replaceExtension(filepath, expectedExtension, newExtension) {
    var dirpath = path.dirname(filepath);
    var filename = path.basename(filepath, expectedExtension) + newExtension;
    return path.join(dirpath, filename);
}

function watchifyFile(inputPath, outputPath) {
    console.log('input path: ' + inputPath);
    console.log('output path: ' + outputPath);

    var b = browserify({
        cache: {},
        packageCache: {},
        fullPaths: true
    });
    b = watchify(b);
    b.on('update', function(){
        console.log(outputPath);
        bundleShare(b, outputPath);
    });

    b.add(inputPath);
    b.transform(coffeeify);
    console.log('applied transform');
    bundleShare(b, outputPath);
    return b;
}

function bundleShare(b, outputPath) {
    console.log('bundling')
    b.bundle()
        .pipe(fs.createWriteStream(outputPath));
}

run(argv)


