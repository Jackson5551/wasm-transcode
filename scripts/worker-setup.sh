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

cd native-worker || exit

touch .env

{
  echo "SOCKET_URL=http://<ip-address or fqdm>:8900 # Address of the socket server"
  echo "PUBLIC_URL=http://<ip-address or fqdm>:8081 # public address of this worker"
} > .env

cat <<EOF

Worker Dependency Setup Complete!

Next steps:
1. Edit worker/spin.toml, adding your api gateway server ip to the environment
section and to the allowed_outbound_hosts section.

2. Edit native-worker/.env to contain the correct endpoints.

3. Run scripts/deploy-worker.sh

EOF