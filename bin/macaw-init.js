#!/usr/bin/env Node


const program = require('commander');
const glob = require('glob');
const path = require('path');
const fs = require('fs')
const download = require('../lib/download.js');
// const gitdown = require('../lib/download.js');
const inquirer = require('inquirer');

const latestVersion = require('latest-version');

const generator = require('../lib/generator');

// const gitdownFunc = gitdown();

program.usage('<project-name>').parse(process.argv)

let projectName = program.args[0];

console.log(projectName)

if(!projectName) {
    program.help();
    return
}

const list = glob.sync('*');
console.log(list);//[ 'bin', 'lib', 'node_modules', 'package-lock.json', 'package.json' ]
let rootName = path.basename(process.cwd());
// console.log(rootName);//Init-tie

let next = undefined;

if(list.length){
    if (list.filter(name=>{
        const src = path.join('.',name);
        const fileName = path.resolve(process.cwd(),src)
        // const isDir = fs.stat(fileName).isDirectory();
        
        const isDir = fs.stat(fileName,function(err,stats){
            try {
                return name.indexOf(projectName) !== -1 && stats.isDirectory();
            } catch{
                console.log(err)
            }
        })
    }).length !== 0) {
        console.log(`项目${projectName}已经存在`);
        return 
    }
    
    next  = Promise.resolve(projectName);


    rootName = projectName;
    console.log(rootName);
} else if (rootName === projectName) {

    next = inquirer.prompt([
        {
            name:'bulidInCurrent',
            message:'当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
            type:'confirm',
            default:true
        }
    ]).then(answer => {
        return Promise.resolve(answer.bulidInCurrent ? '.':projectName)
    })
    // rootName = '.'
} else{
    next = Promise.resolve(projectName)
    // rootName = projectName;
}

next && go();

function go(){

    next.then(projectRoot => {
        if (projectRoot !== '.' ){
            fs.mkdirSync(projectRoot);
        }
        return download(projectRoot).then(target => {
            return{
                projectRoot,
                downloadTemp:target
            }
        })
    }).then(context => {
        return inquirer.prompt([
            {
                name:'projectName',
                message:'项目名称',
                default:context.default
            },{
                name: 'projectVersion',
                message: '项目的版本号',
                default: '1.0.0'
            }, {
                name: 'projectDescription',
                message: '项目的简介',
                default: `A project named ${context.name}`
            }
        ]).then(answers => {

            console.log(answers);
            // return latestVersion('macaw-ui').then(version =>  {
            //     answers.supportUiVersion = version;
            //     return{
            //         ...context,
            //         metadata: 
            //         {
            //             ...answers
            //         }
            //     }
            // }).catch(err => {
            //     return Promise.reject(err)
            // })
        })
        return generator(context);
    }).then(context =>{
        console.log(context);
        console.log('创建成功:');
    }).catch(err => {
        console.log('创建失败:');
        console.error(err);
    })

    // download(rootName)
    //     .then(target => console.log(target))
    //     .catch(err => console.log(err))
    // console.log(path.resolve(process.cwd(),path.join('.',rootName)));
    // console.log("aaaaaa")
}


// console.log('hello,commander');
