build:
	cd frontend && npm install
	cd frontend && npm run build

start:
	npx start-server -s ./frontend/dist -p ${PORT}