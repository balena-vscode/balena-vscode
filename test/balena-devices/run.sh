#!/bin/bash

shopt -s nullglob

DEVICES=(./imgs/*)
for ((i = 0; i < ${#DEVICES[@]}; i++))
do
    echo $i
    echo "${DEVICES[$i]}"
    qemu-system-x86_64 \
        -device ahci,id=ahci \
        -drive file="${DEVICES[$i]}",media=disk,cache=none,format=raw,if=none,id=disk \
        -device ide-hd,drive=disk,bus=ahci.0 \
        -net nic,model=virtio \
        -net user \
        -m 512 \
        -machine type=pc,accel=kvm \
        -smp 4 \
        -cpu host \
        -daemonize
done