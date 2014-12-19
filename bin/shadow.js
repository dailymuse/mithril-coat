#!/usr/bin/env node

var sys = require("sys");
var fs = require("fs");
var watch = require("node-watch");
var path = require("path");
var shadow = require("../lib");
var mkdirp = require("mkdirp");
var util = require("util");
var _ = require("underscore");

var argv = require("optimist")
    .usage("Compiles shadow templates")

    .options("v", {
        alias: "version",
        describe: "Prints the current version at exits",
    })
    
    .options("w", {
        alias: "watch",
        describe: "Watch the input file/directory and re-compile on change"
    })

    .options("e", {
        alias: "extension",
        describe: "Specifies a node module that plugs into the compiler for custom behavior"
    })
    
    .boolean(["v", "w"])

    .argv;

var WATCH_OPTIONS = {
    recursive: true,
    followSymLinks: true
};

var COMPILER_OPTIONS = {
    wrapFunction: true
};

function version() {
    var pkg = require("../package.json");
    console.log("v" + pkg.version);
}

function isDirectory(file) {
    try {
        return fs.lstatSync(file).isDirectory();
    } catch(e) {
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

function run(input, output, isWatching, extensionPaths) {
    if(!fs.existsSync(input)) {
        console.error("File does not exist:", input);
        process.exit(1);
    }

    var extensions = extensionPaths.map(function(relativePath) {
        return require(path.join(process.cwd(), relativePath));
    });

    if(isDirectory(input)) {
        //Input is a directory

        if(!isDirectory(output)) {
            //Input is a directory but output is not: error
            console.error("Output does not exist or is not a directory");
            process.exit(1);
        } else {
            //Input and output are directories
            compileDirectory(input, output, extensions);

            if(isWatching) {
                //Input and output are directories and we want to watch
                watchFiles(input, output, extensions);
            }
        }
    } else {
        //Input is a file

        if(isWatching) {
            //Input is a file and we want to watch: error
            console.error("Cannot watch an individual file");
            process.exit(1);
        } else if(!isDirectory(path.join(output, ".."))) {
            //Input is a file but output's parent is not a directory: error
            console.error("Cannot create output file as its parent path does not exist or is not a directory");
            process.exit(1);
        } else {
            if(isDirectory(output)) {
                //Input is a file and output is a directory: determine what the output file should be
                output = path.join(output, replaceExtension(input, ".html", ".js"));
            }

            //Input is a file and output is a file
            compileFile(input, output, extensions);
        }
    }
}

function watchFiles(inputDirectory, outputDirectory, extensions) {
    watch(inputDirectory, WATCH_OPTIONS, function(input) {
        if(!/\.html$/.test(input)) {
            return;
        }

        var relative = path.relative(inputDirectory, input);
        var output = replaceExtension(path.join(outputDirectory, relative), ".html", ".js");

        fs.exists(input, function(exists) {
            if(exists) {
                fs.lstat(input, function(err, stat) {
                    if(err) {
                        console.error("Could not stat `" + input + "`:", err);
                        return;
                    }

                    if(!stat.isDirectory()) {
                        var outputParentDirectory = path.join(output, "..");

                        mkdirp(outputParentDirectory, function(err) {
                            if(err) {
                                console.error("Could not create parent directory `" + outputParentDirectory + "`:", err);
                                return;
                            }

                            compileFile(input, output, extensions);
                        });
                    }
                });
            } else {
                fs.unlink(output, function(err) {
                    if(err) {
                        console.error("Could not unlink `" + output + "`: ", err);
                    }
                });
            }
        });
    });
}

function compileDirectory(inputDirectory, outputDirectory, extensions) {
    //Input and output are directories and we want to compile
    walkDirectory(inputDirectory, function(err, results) {
        if(err) {
            console.error("Could not browse input directory:", err);
            process.exit(1);
        } else {
            results.forEach(function(inputFile) {
                if(!/\.html$/.test(inputFile)) {
                    return;
                }

                var outputFile = replaceExtension(path.join(outputDirectory, path.relative(inputDirectory, inputFile)), ".html", ".js");
                var parentDirectoryPath = path.join(outputFile, "..");

                mkdirp(parentDirectoryPath, function(err) {
                    if(err) {
                        console.error("Could not create parent directory `" + parentDirectoryPath + "`:", err);
                        return;
                    }

                    compileFile(inputFile, outputFile, extensions);
                });
            });
        }
    });
}

function compileFile(inputPath, outputPath, extensions) {
    var templateName = path.basename(replaceExtension(inputPath, ".html", ""));

    fs.readFile(inputPath, {encoding: "utf-8"}, function(err, templateContents) {
        if(err) {
            console.error("Could not read file `" + inputPath + "`:", err);
        } else {
            var opts = _.defaults({ extensions: extensions || [] }, COMPILER_OPTIONS);

            shadow.compile(templateContents, opts, function(err, compiledTemplate) {
                if(err) {
                    console.error("Could not compile file `" + inputPath + "`:", err);
                } else {
                    var contents = "module.exports = " + compiledTemplate + ";\n";
                    fs.writeFile(outputPath, contents, function(err) {
                        if(err) {
                            console.error("Could not write compiled contents to `" + outputPath + "`:", err);
                        } else {
                            console.log("Compiled `" + inputPath + "` to `" + outputPath + "`")
                        }
                    });
                }
            });
        }
    });
}

if(argv.v) {
    version();
} else {
    if(argv._.length < 2) {
        console.error("Input and output file/directory arguments required");
        process.exit(-1);
    }

    if(argv.e == undefined) {
        var extensions = [];
    } else if(!util.isArray(argv.e)) {
        var extensions = [argv.e];
    } else {
        var extensions = argv.e;
    }

    run(argv._[0], argv._[1], argv.w, extensions);
}
