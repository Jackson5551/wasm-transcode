#!/bin/bash

cd ../worker || exit

spin build

pm2 start "spin up" --name spin-app

cd ../native-worker || exit

~/.bun/bin/bun install || exit

pm2 start --interpreter ~/.bun/bin/bun index.ts
