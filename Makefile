ci:
	@- rm -rf dist
	cd ./client-p2p/ && yarn install && yarn build
	cd ./client-local/ && yarn install && yarn build
	mkdir dist/
	cp -r ./client-p2p/dist dist/p2p
	cp -r ./client-local/dist dist/local
