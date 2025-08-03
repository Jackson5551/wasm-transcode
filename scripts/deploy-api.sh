#!/bin/bash

~/.bun/bin/bun install || exit

pm2 start --interpreter ~/.bun/bin/bun ./src/index.ts