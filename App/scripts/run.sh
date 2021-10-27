#!/bin/bash

echo Starting......

npm run build
rm -rf ./production/build
mv build production
cd production
npm start