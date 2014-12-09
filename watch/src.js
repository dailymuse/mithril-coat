var watchify = require('watchify');
var fromArgs = require('watchify/bin/args');
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var browserify = require("../node_modules/watchify/node_modules/browserify/index.js");
var watchify = require("watchify");
var coffeeify = require("coffeeify");
var stdin = process.stdin;

var argv = require("optimist")
    .usage("Loops over a directory and Watchify's all files in that directory")

    .options("w", {
        alias: "watch",
        describe: "Watch the input file/directory and bind watchify to that directory"
    })

    .boolean(["w"])

    .argv;

function isDirectory(file) {
    try {
        console.log(fs.lstatSync(file).isDirectory());
        return fs.lstatSync(file).isDirectory();
    } catch(e) {
        console.log('e')
        return false;
    }
}

function replaceExtension(filepath, expectedExtension, newExtension) {
    var dirpath = path.dirname(filepath);
    var filename = path.basename(filepath, expectedExtension) + newExtension;
    return path.join(dirpath, filename);
}

function walkDirectory(root, callback) {
    var results = [];

    fs.readdir(root, function(err, files) {
        if(err) {
            return callback(err);
        }

        var pending = files.length;

        if(!pending) {
            return callback(null, results);
        }

        files.forEach(function(fileName) {
            var file = path.join(root, fileName);

            fs.lstat(file, function(err, stat) {
                if(stat && stat.isDirectory()) {
                    walkDirectory(file, function(err, subResults) {
                        if(err) {
                            return callback(null, results);
                        }

                        results = results.concat(subResults);
                        if(!--pending) callback(null, results);
                    });
                } else {
                    results.push(file);
                    if(!--pending) callback(null, results);
                }
            });
        });
    });
}

function run(input, output) {
    var results = [];

    if(!fs.existsSync(input)) {
        console.error("File does not exist:", input);
        process.exit(1);
    }

    if(isDirectory(input)) {
        //Input is a directory

        if(!isDirectory(output)) {
            console.log(output)
            //Input is a directory but output is not: error
            console.error("Output does not exist or is not a directory");
            process.exit(1);
        } else {
            //Input and output are directories
            bindDirectory(input, output, results);

            // without this, we would only get streams once enter is pressed
            stdin.setRawMode( true );

            // resume stdin in the parent process (node app won't quit all by itself
            // unless an error or process.exit() happens)
            stdin.resume();

            // i don't want binary, do you?
            stdin.setEncoding( 'utf8' );

            // on any data into stdin
            stdin.on( 'data', function( key ){
                // ctrl-c ( end of text )
                if ( key === '\u0003' ) {
                    results.forEach(function(result) {

                        console.log('closing process');
                        console.log(result);
                        result.close();
                    });
                    process.exit();
                }
            });

        }
    } 
}

function bindDirectory(inputDirectory, outputDirectory, results) {
    //Input and output are directories and we want to compile
    walkDirectory(inputDirectory, function(err, results) {
        if(err) {
            console.error("Could not browse input directory:", err);
            process.exit(1);
        } else {
            results.forEach(function(inputFile) {
                if(!/\.coffee$/.test(inputFile)) {
                    return;
                }

                var outputFile = replaceExtension(path.join(outputDirectory, path.relative(inputDirectory, inputFile)), ".coffee", ".js");
                var parentDirectoryPath = path.join(outputFile, "..");

                mkdirp(parentDirectoryPath, function(err) {
                    if(err) {
                        console.error("Could not create parent directory `" + parentDirectoryPath + "`:", err);
                        return;
                    }

                    results.push(watchifyFile(inputFile, outputFile));
                });
            });
        }
    });
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

if(argv._.length < 2) {
    console.error("Input and output file/directory arguments required");
    process.exit(-1);
}

run(argv._[0], argv._[1])


