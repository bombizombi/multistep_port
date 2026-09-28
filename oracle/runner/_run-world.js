const { execSync } = require("child_process");
execSync("node _world-driver.js DUMMY \"" + process.argv[2] + "\"", { stdio: "inherit", cwd: __dirname });
