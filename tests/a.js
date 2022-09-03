console.log("Hello World!");
const list = yield [1];
for(let i=0;i<list.length;i++){
    console.log(`Task: ${list[i].tid}, parent: ${list[i].parent}`);
}