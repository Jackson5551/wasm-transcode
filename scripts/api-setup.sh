#!/bin/bash

for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl -y
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

#curl https://dl.min.io/client/mc/release/linux-amd64/mc \
#  --create-dirs \
#  -o "$HOME"/minio-binaries/mc

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

chmod +x "$HOME"/minio-binaries/mc
export PATH=$PATH:$HOME/minio-binaries/

nvm install 22

npm install pm2 -g

curl -fsSL https://bun.sh/install | bash

git clone https://github.com/Jackson5551/wasm-transcode.git && cd wasm-transcode || exit

cd docker || exit

#docker compose up -d

# For running MinIO locally (optional)
#mc alias set local http://localhost:9000 minioadmin minioadmin123
#mc anonymous set download local/wasm-transcode

cd ../api-gateway || exit

touch .env

{
  # Set S3 endpoint to the public ip address or FQDN of the node running the API gateway
  echo "S3_KEY="
  echo "S3_SECRET="
  echo "S3_ENDPOINT="
  echo "S3_REGION="
  echo "S3_BUCKET=wasm-transcode"
  echo "DB_HOST="
  echo "DB_NAME=wasm_transcode"
  echo "DB_USER="
  echo "DB_PASS="
  echo "DB_PORT=3306"
  echo "API_GATEWAY_URL=http://localhost:8900/api"
} > .env

cat <<EOF

API Dependency Setup Complete!

Next steps:
1. Edit api-gateway/.env to contain the correct values & endpoints

2. Run scripts/deploy-api.sh

EOF