const fs = require("fs");
class Task{
    /**
     * Task ID
     * @type {number}
     */
    tid
    /**
     * The function of the process
     * @type {GeneratorFunction}
     */
    originFun
    /**
     * The function of the process
     * @type {Generator}
     */
    fun
    /**
     * @type {any}
     */
    response
    /**
     * Set to true if the response is a exception
     * @type {boolean}
     */
    throwOut
    /**
     * The TID of the task parent
     * @type {number}
     */
    parent
}
/**
 * @type {Task[]}
 */
const taskList = [];
const genfunConstructor = (function*(){}).constructor;
function define_init_task(path){
    const code = fs.readFileSync(path, {encoding:"utf-8"});
    const f = genfunConstructor(code);
    taskList[0] = {
        tid: 0,
        fun: f(),
        originFun: f,
        parent: null
    };
}

module.exports = {
    start(){
        const commands = [
            function(task){
                const tid = taskList.length-1;
                taskList.push({tid: tid+1, fun: task.originFun(), parent: task.tid, originFun: task.originFun});
            },
            function(){
                return taskList.filter(t => t).map(t => {
                    return {
                        tid: t.tid,
                        parent: t.parent
                    }
                });
            },
            function(task){
                return task.tid;
            },
            function(task,path){
                const code = fs.readFileSync(path,{encoding:"utf-8"});
                const f = genfunConstructor(code);
                const tid = taskList.length;
                taskList.push({
                    tid: tid,
                    fun: f(),
                    parent: task.tid
                });
            }
        ];
        
        /**
         * @param {Task} task 
         * @param {any} request 
         */
        function handleTaskRequests(task,request){
            if(request.constructor.name != "Array"){
                task.throwOut = true;
                task.response = new TypeError("Not a Array");
                return;
            }
            try{
                task.response = commands[request[0]](task,...request.slice(1)); 
            }catch(e){
                task.throwOut = true;
                task.response = e;
            }
        }
        function removeTask(task){
            delete taskList[task.tid];
        }
        
        while(taskList.filter(t=>t).length > 0){
            for(let i=0;i<taskList.length;i++){
                if(!taskList[i]) continue;
                let request;
                const task = taskList[i];
                try{
                    if(task.throwOut)
                        request = task.fun.throw(task.response);
                    else
                        request = task.fun.next(task.response);
                }catch(e){
                    removeTask(task);
                    console.error(`Task ${task.tid}: ${e.stack}`);
                    continue;
                }
                task.throwOut = false;
                if(request.done){
                    removeTask(task);
                    continue;
                }
                handleTaskRequests(task, request.value);
            }
        }
    },
    taskList,
    define_init_task
}