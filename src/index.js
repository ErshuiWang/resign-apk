const $ = require('jQuery');
const fs = require('fs');
const process = require('child_process');
const rimraf = require('rimraf');

let startSignBtn = $('#startSign');
let apkList = $('#apkList');

let keystore = $('#keystore');
let storepass = $('#storepass');
let alias = $('#alias');
let keypass = $('#keypass');

let selectedFolder;

// 给选择APK目录添加监听事件, 用户在选择了目录之后读取目录下的apk文件
$('#apkfolder').change(function(){
    // 获取apk所在路径
    selectedFolder = getPath($(this));
    // 获取路径下的所有APK文件名
    let apks = getApksByFloder(selectedFolder);
    // 将读取到的APK信息展示到APK列表中
    showApkList(apks);
})

startSignBtn.click(function(){
    if(keystore.val() && storepass.val() && alias.val() && keypass.val()){
        startSign($('input[type=checkbox]:checked'));
    }else{
        alert('签名文件,签名密码等不可为空!');
    }
});

// 使用递归的方式将所有选中的checkbox进行重新签名操作
function startSign(selectApks, index=0){
    if(selectApks[index]){
        // 读取一个文件名
        let apk = $(selectApks[index]).val();
        // 生成存储临时文件目录
        createTempFile(apk, function(){
            // 将文件解压到指定目录
            process.exec('cd ./temp/files && jar -xvf ' + selectedFolder + '/' + apk , function(error, stdout, stderr){
                // 删除原有签名文件
                rimraf('./temp/files/META-INF', function(){
                    // 将文件再次打包成apk
                    process.exec('cd ./temp/files && jar -cvf ../unsign.apk ./', function(error, stdout, stderr){
                        // 对重新打包后的apk进行签名
                        process.exec(['jarsigner -digestalg SHA1 -sigalg MD5withRSA -verbose -keystore'
                        ,getPath(keystore)
                        ,'-storepass'
                        ,storepass.val()
                        ,'-keypass'
                        ,keypass.val()
                        ,'-signedjar'
                        ,selectedFolder + '/signed_' + apk
                        ,'./temp/unsign.apk'
                        ,alias.val()].join(' '), function(error, stdout, stderr){
                            startSign(selectApks, index+1 );
                        })
                    })
                });
            })
        });
    }else{
        alert('完成!');
    }
}

// 生成临时文件目录, 如果存在则文件夹一起删除再重新创建
function createTempFile(name, callback){
    let fileTempFolder = './temp/files';
    fs.exists(fileTempFolder, function(exists){
        if(exists){
            rimraf(fileTempFolder, function(err){
                fs.mkdir(fileTempFolder,function(){
                    callback();
                });
            });
        }else{
            fs.mkdir(fileTempFolder,function(){
                callback();
            });
        }
    });
}

// 将apk展示到APK列表中
function showApkList(apks){
    // 清空APK列表内容
    apkList.children().remove();
    if(apks && apks.length > 0){
        apks.forEach(function(value){
            apkList.append(['<li class="list-group-item" id="'
            ,value
            ,'"><div class="checkbox" style="display:inline-block;"><label><input name="apkCheckBox" value="'
            ,value
            ,'" type="checkbox">'
            ,value
            ,'</label></div></li>'].join(''));
        });
    }else{
        apkList.append('<li class="list-group-item">未找到APK文件!</li>');
    }
}

// 加载选中目录下的APK文件
function getApksByFloder(folder){
    let apks = [];
    if( folder ){
        // 读取目录下所有的文件和文件夹
        let files = fs.readdirSync(folder);
        for(let i=0;i<files.length;i++){
            let file = files[i];
            // 判断符合以.apk结尾的文件, 并将文件名保存到待返回的数组中
            if(file && file.lastIndexOf('.apk')> 0){
                let stats = fs.statSync(folder + '/' + file);
                if(stats && stats.isFile()){
                    apks.push(file);
                }
            }
        }
    }
    return apks;
}

// 获取input目录文件选择的绝对路径
function getPath(fileInput){
    return fileInput[0].files[0].path;
}