#!/bin/bash

cd ../worker || exit

spin build

spin up --quiet

cd ../native-worker || exit

~/.bun/bin/bun install || exit

pm2 start --interpreter ~/.bun/bin/bun index.ts
