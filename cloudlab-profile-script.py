"""This is a test of the setup for my wasm-transcode serverless project

Instructions:
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
"""

import geni.portal as portal
import geni.rspec.pg as pg

pc = portal.Context()
request = pc.makeRequestRSpec()

# Create a LAN (private network)
lan = request.LAN("lan")

# CLIENT NODE (vue frontend)
client = request.RawPC("client")
client.hardware_type = "c6525-25g"
client.disk_image = "urn:publicid:IDN+emulab.net+image+emulab-ops//UBUNTU24-64-STD"

# Add client to the LAN
client_iface = client.addInterface("iface1")
lan.addInterface(client_iface)

# API GATEWAY NODE
gw = request.RawPC("api-gateway")
gw.hardware_type = "c6525-25g"
gw.disk_image = "urn:publicid:IDN+emulab.net+image+emulab-ops//UBUNTU24-64-STD"

# Default eth0 gets a public IP
# Add second interface for LAN
gw_lan_iface = gw.addInterface("iface1")
lan.addInterface(gw_lan_iface)

# WORKER NODES
for i in range(1, 4):  # Adjust number of worker nodes here
    node = request.RawPC("worker{}".format(i))
    node.hardware_type = "c6525-25g"
    node.disk_image = "urn:publicid:IDN+emulab.net+image+emulab-ops//UBUNTU24-64-STD"

    # Add LAN interface
    iface = node.addInterface("iface1")
    lan.addInterface(iface)

pc.printRequestRSpec(request)