#!/bin/sh
git submodule update --init --recursive
node updateStageItemTable.cjs
git add .
git commit -m "ArknightsGamedata Pureupdate"
git push