npm install typescript --save-dev

npm install @types/node --save-dev

npm install eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser ts-node tsc-alias tsconfig-paths rimraf nodemon --save-dev

jq --arg name "hunghoang" --arg command "ngocquynh" \
 '.scripts += { (hunghoang): stringdf }' package.json > package.json.tmp

npm run dev // start moi truong dev
npm run build // production
npm run start // sau khi build xong

npm run lint // kiem tra loi eslint
npm run lint:fix
npm run prettier // kiem tra loi format
npm run prettier:fix

npm install winston winston-daily-rotate-file
npm install @types/newrelic\_\_winston-enricher --save-dev
npm install dotenv --save-dev
npm install cors
npm install @types/express --save-dev
npm install express
