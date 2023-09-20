#/bin/bash

echo 'script setup project'


mkdir -p src dist

#  Create efile tsconfig.json for building the typescript project
if [ ! -e "tsconfig.json" ]; then
    touch tsconfig.json
fi

echo "" > tsconfig.json
echo '{
  "compilerOptions": {
    "module": "NodeNext", // Quy định output module được sử dụng
    "moduleResolution": "NodeNext",
    "target": "ES2022", // Target output cho code
    "outDir": "dist", // Đường dẫn output cho thư mục build
    "esModuleInterop": true,
    "strict": true /* Enable all strict type-checking options. */,
    "skipLibCheck": true /* Skip type checking all .d.ts files. */,
    "baseUrl": ".", // Đường dẫn base cho các import
    "paths": {
      "~/*": ["src/*"] // Đường dẫn tương đối cho các import (alias)
    }
  },
  "ts-node": {
    "require": ["tsconfig-paths/register"]
  },
  "files": ["src/type.d.ts"], // Các file dùng để defined global type cho dự án
  "include": ["src/**/*"] // Đường dẫn include cho các file cần build
}' > tsconfig.json


# Create file eslintrc
if [ ! -e ".eslintrc" ]; then
    touch .eslintrc
fi

echo "" > .eslintrc
echo '{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "eslint-config-prettier", "prettier"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "prettier/prettier": [
      "warn",
      {
        "arrowParens": "always",
        "semi": true,
        "trailingComma": "none",
        "tabWidth": 4,
        "endOfLine": "auto",
        "useTabs": false,
        "singleQuote": true,
        "printWidth": 120,
        "jsxSingleQuote": true
      }
    ]
  }
}
' > .eslintrc


# Create file .eslintignore
if [ ! -e ".eslintignore" ]; then
    touch .eslintignore
fi

echo "" > .eslintignore
echo 'node_modules/
dist/
' > .eslintignore


# Create file .prettierrc
if [ ! -e ".prettierrc" ]; then
    touch .prettierrc
fi

echo "" > .prettierrc
echo '{
  "arrowParens": "always",
  "semi": true,
  "trailingComma": "none",
  "tabWidth": 4,
  "endOfLine": "auto",
  "useTabs": false,
  "singleQuote": true,
  "printWidth": 120,
  "jsxSingleQuote": true
}' > .prettierrc


# Create file .prettierrc
if [ ! -e ".prettierignore" ]; then
    touch .prettierignore
fi
echo "" > .prettierignore
echo 'node_modules/
dist/
' > .prettierignore


# Create file .editorconfig
if [ ! -e ".editorconfig" ]; then
    touch .editorconfig
fi

echo "" > .editorconfig
echo '[*]
indent_size = 4
indent_style = space
' > .editorconfig


# Create file .gitignore
if [ ! -e ".gitignore" ]; then
    touch .gitignore
fi

echo "" > .gitignore
echo 'node_modules/
dist/' > .gitignore


# create file nodemon.json


if [ ! -e "nodemon.json" ]; then
    touch nodemon.json
fi

echo "" > nodemon.json
echo '{
    "watch": ["src"],
    "ext": ".ts,.js",
    "ignore": [],
    "exec": "npx ts-node -r dotenv/config ./src/server.ts"
}' > nodemon.json

# Define the scripts block to add
MY_SCRIPT='{
        "dev": "npx nodemon",
        "buildStart": "npm run build && npm run start",
        "build": "rimraf ./dist && tsc && tsc-alias",
        "start": "node -r dotenv/config dist/server.js",
        "lint": "eslint .",
        "lint:fix": "eslint . --fix",
        "prettier": "prettier --check .",
        "prettier:fix": "prettier --write ."
    }'

if [ -f "package.json" ]; then
  # Use jq to merge the new scripts block with the existing scripts
  jq --argjson new_scripts "$MY_SCRIPT" '.scripts = $new_scripts' package.json > package.json.tmp
  # Check if jq successfully modified the JSON
  if [ $? -eq 0 ]; then
    # Replace the original package.json with the modified one
    mv package.json.tmp package.json
    echo "Scripts have been added to package.json."
  else
    echo "Failed to add scripts to package.json."
    exit 1
  fi
else
  echo "package.json not found in the current directory."
  exit 1
fi


if [ ! -e "src/type.d.ts" ]; then
    touch src/type.d.ts
fi


if [ ! -e "src/server.ts" ]; then
    touch src/server.ts
fi

mkdir -p logs
cd src 
mkdir -p auth controllers core database helpers routers services types
cd ..

