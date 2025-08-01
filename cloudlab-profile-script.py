"""This is a test of the setup for my wasm-transcode serverless project

Instructions:
These are instructions for using your profile after it is instantiated.
Instructions are optional.
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