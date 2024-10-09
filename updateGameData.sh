#!/bin/sh
git submodule update --init --recursive
cd ArknightsGamedataPure
git pull origin main
cd ..
node updateStageItemTable.cjs
git add .
git commit -m "ArknightsGamedata Pureupdate"
git push