PORT ?= 5001

install:
	npm install

build:
	cd frontend && npm install
	cd frontend && npm run build

start:
	npx start-server -s ./frontend/dist -p ${PORT}