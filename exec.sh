#!/bin/sh
cd ./ArknightsGamedataPure
git pull
cd ..
node exec.cjs
git add .
git commit -m "ArknightsGamedata Pureupdate"
git push