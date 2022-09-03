const yargs = require("yargs");
const {define_init_task, start} = require("./task-sched.js");
const file = yargs.argv._[0];
if(!file){
    const repl = require("repl");
    const {version} = require("./package.json");
    console.log("NodeJS Task Scheduler " + version);
    console.log("Type \".help\" to get a command list.");
    const server = repl.start();
    server.defineCommand("set_init", {
        action(path){
            this.clearBufferedCommand();
            define_init_task(path);
            console.log(`Defined "${path}" as init task. Type ".exit" to run the scheduler.`);
            this.displayPrompt();
        },
        help: "Define a init task"
    });
    server.once("exit", start);
    return;
}else{
    define_init_task(file);
    return start();
}