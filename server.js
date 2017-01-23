var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

function send404(res) {
    res.writeHead(404,{'Content-type':'text/plain'});
    res.write('404 ERROR,response not found');
    res.end();
}

function sendFile(res, filePath, fileContents) {
    res.writeHead(200,
        {'Content-type':mime.lookup(path.basename(filePath))}
    );
    res.end(fileContents);
}

function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {  //检查文件是否缓存在内存中
        sendFile(response, absPath, cache[absPath]);  //从内存中返回文件
    } else {
        fs.exists(absPath, function(exists) {  //检查文件是否存在
            if (exists) {
                fs.readFile(absPath, function(err, data) {  //从硬盘中读取文件
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);  //从硬盘中读取文件并返回
                    }
                });
            } else {
                send404(response);  //发送HTTP 404响应
            }
        });
    }
}
var server = http.createServer(function(request, response) {　　//创建HTTP服务器，用匿名函数定义对每个请求的处理行为
    var filePath = false;
    if (request.url == '/') {
        filePath = 'public/index.html';  //确定返回的默认HTML文件
    } else {
        filePath = 'public' + request.url;  //将URL路径转为文件的相对路径
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);  //返回静态文件
});

server.listen(3000,function() {
    console.log('server listening on port:3000 ');
});

