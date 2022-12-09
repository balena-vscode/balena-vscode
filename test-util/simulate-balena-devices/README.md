# Balena Test Devices

## Description
For this project, QEMU based devices were chosen over containerized options [due to a dependency on older cgroup versions](https://github.com/balena-os/balenaos-in-container).

Since Balena generates and embeds an API key into each device image, it requires about 3 GB of space per device desired. 
QEMU should ensure the widest compatibility for developer workstations at the expense of some disk space.

## Setup
1. Follow [Balena's standard setup instructions for QEMU](https://www.balena.io/docs/learn/getting-started/qemux86-64/rust/) where you will:
    - Create a fleet
    - Add a device
    - Download an image with the created device's configuration
    - Ignore everything after the "Provision Device" section

2. Extract and copy each device image downloaded into the `./imgs/` directory with unique names (e.g. balena-cloud-*-device-a.img)

3. Run the emulators with `npm run simulate-balena-devices-qemu`. It will start an instance for every image found in the `./imgs/` directory

4. Wait for devices to appear in the Balena dashboard!