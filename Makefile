all: clean build

clean:
	rm -rf build

dev: 
	npm run build
	rm -rf ../themuse/web/static/lib/mithril-coat
	cp -r build ../themuse/web/static/lib/mithril-coat

