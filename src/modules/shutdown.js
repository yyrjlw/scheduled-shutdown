const cp = require("child_process");

function Shutdown(action) {
    this.currentPlatform = process.platform;
    this.action=action;

    this.initShutdown = () => new Promise((resolve, reject) => {
        let shutdownCommand = this.getCommandShutdown();
        cp.exec(shutdownCommand, function (err, stdout, stderr) {
            if (err) return reject(err.message);
            resolve("Shutting Down");
        });
    });
    this.getCommandShutdown = () => {
        let arg;
        switch (this.currentPlatform.toLowerCase()) {
            case "darwin":
            case "linux":
                switch (this.action) {
                    case 1:
                        arg='-h'
                        break;
                    case 2:
                        arg='-r'
                        break;
                    case 3:
                        arg='-s'
                        break;
                }
                return `sudo shutdown ${arg} now`;
            case "win32":
                switch (this.action) {
                    case 1:
                        arg='-s -t 0'
                        break;
                    case 2:
                        arg='-r -t 0'
                        break;
                    case 3:
                        arg='-h'
                        break;
                }
                return `shutdown ${arg}`;
        }
        return false;
    };
}

module.exports.Shutdown = Shutdown;