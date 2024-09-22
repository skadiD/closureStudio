#!/bin/sh
git submodule update --init --recursive
node exec.cjs
git add .
git commit -m "ArknightsGamedata Pureupdate"
git push