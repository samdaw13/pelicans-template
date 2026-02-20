install:
    npm install
    npm install --prefix frontend
    npm install --prefix backend

setup: install
    lefthook install

check:
    npm run lint --prefix frontend
    npm run type-check --prefix frontend
    npm run lint --prefix backend
    npm run type-check --prefix backend
