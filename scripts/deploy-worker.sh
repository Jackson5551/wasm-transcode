#!/bin/bash

sudo apt-get update
sudo apt-get install ffmpeg -y

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

nvm install 22

npm install pm2 -g

curl -fsSL https://bun.sh/install | bash

curl -fsSL https://spinframework.dev/downloads/install.sh | bash

sudo mv spin /usr/local/bin/

git clone https://github.com/Jackson5551/wasm-transcode.git && cd wasm-transcode || exit

cd worker || exit

spin build

spin up --quiet

cd ../native-worker || exit

bun install

pm2 start --interpreter ~/.bun/bin/bun index.ts
