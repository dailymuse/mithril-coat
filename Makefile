all: clean build

clean:
	rm -rf build

dev: 
	npm run build
	rm -rf ../themuse/static/lib/mithril-coat
	cp -r build ../themuse/static/lib/mithril-coat

