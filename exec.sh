#!/bin/sh
git submodule update --remote
node exec.cjs
git add .
git commit -m "ArknightsGamedata Pureupdate"
git push