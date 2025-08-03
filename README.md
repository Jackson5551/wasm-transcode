# wasm-transcode
Project I am working on to study WASM containers and their uses for egde &amp; serverless computing.

## Setup Instructions

Run all `.sh` files are sudo.

You will need a MySQL database with a table called 'wasm_transcode'. You will also need an S3-compatible
object storage bucket set up with the name 'wasm-transcode'. This bucket will need to have anonymous read
enabled.

On the 'client' node, clone down the repository and run the vue app in the 'frontend' folder in whatever
way you prefer. You can even run it on your local machine!

On the 'api-gateway', copy and run the 'setup-api.sh' script. This will install all needed dependencies
and clone down the rest of the repo. After that is complete, follow the given instructions and then run
the `deploy-api.sh` script.

On the 'worker' nodes, copy and run the 'setup-worker.sh' script. This will install all needed dependencies
and clone down the rest of the repo. After that is complete, follow the given instructions and then run
the `deploy-worker.sh` script.

If any of the scripts have issues, try running the commends individually and report any that are broken.

---
© 2025 Jackson Bingham