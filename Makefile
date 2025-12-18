.PHONY: install start dev clean

install:
	cd backend && npm install
	cd frontend && npm install

dev:
	cd backend && npm run dev & cd frontend && npm run dev

start:
	cd backend && npm run build && npm start & cd frontend && npm run dev

stop:
	pkill -f "tsx" || true
	pkill -f "node dist/server.js" || true
	pkill -f "vite" || true

clean:
	rm -rf backend/dist backend/node_modules
	rm -rf frontend/dist frontend/node_modules
