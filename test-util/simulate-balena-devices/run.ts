import glob from 'glob';
import path from 'path';
import { exec } from 'child_process';
import { platform } from 'process';

const imageDir = path.join(__dirname, 'imgs');
glob(path.join(imageDir, "*.img"), (err, fileNames) => {
    if (err) return console.log('Unable to scan directory: ' + err);

    fileNames.forEach(fileName =>  {
        const cmd = getOSDependentCommand(fileName);

        exec(cmd, (err, stdout, stderr) => {
            console.log(err);
            console.log(stdout);
            console.log(stderr);
        })
    });
});

const getOSDependentCommand = (fileName: string) => {
    const baseCmd = [
        "qemu-system-x86_64",
        "-device ahci,id=ahci",
        "-net nic,model=virtio",
        "-net user",
        "-m 512",
        "-smp 4",
    ];

    // Drop CPU flag and KVM accel on macos & windows
    // https://www.balena.io/docs/learn/getting-started/qemux86-64/nodejs/#provision-device
    switch(platform) {
        case "linux":
            return baseCmd.concat([
                `-drive file=${fileName},if=none,media=disk,cache=none,format=raw,id=disk`,
                "-cpu host",
                "-machine type=pc,accel=kvm"
            ]).join(" ")
        case "darwin":
        case "win32":
        default:
            return baseCmd.concat([
                `-drive file=${fileName},if=virtio,media=disk,cache=none,format=raw,id=disk`,
                "-machine type=pc"
            ]).join(" ")
    }
}