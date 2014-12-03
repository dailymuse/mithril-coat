all: clean build

clean:
	rm -rf build

build:
	mkdir -p build
	./node_modules/browserify/bin/cmd.js src/index.js -o build/shadow.js -s shadow
	cd build && ../node_modules/uglify-js/bin/uglifyjs shadow.js -o shadow.min.js --source-map shadow.min.map
