//书店服务端  返回静态内容  实现图书的增删改查
const http = require('http');
const url = require('url');
const fs = require('fs');
const mime = require('mime');
//封装
//读取json中的内容 为json格式
function readBook(callback) {
    fs.readFile('./book.json','utf8',function (err,data) {
        if(err||data==''){
            data = '[]'
        }
        data = JSON.parse(data);
        callback(data);
    })
}
//将对象类型的数据 写入到json中
function writeBook(data,callback) {
    fs.writeFile('./book.json',JSON.stringify(data),callback);
}
http.createServer(function (req,res) {
    let urlObj = url.parse(req.url,true);
    //let pathname=urlObj.pathname;
    //let query=urlObj.query;
    //es6解构赋值
    let { pathname,query } = urlObj;
    if(pathname == '/'){
        res.setHeader('Content-Type','text/html;charset=utf8');
        fs.createReadStream('./index.html').pipe(res);
    }else if(/^\/book(\/\d+)?$/.test(pathname)){
        var id = /^\/book(?:\/(\d+))?$/.exec(pathname)[1]; //获取的id是字符串类型
        switch (req.method){
            case 'GET':
                    if(id){//查询一个
                    readBook(function (data) {
                        var b = data.find(function (item) {
                            return item.bookId == id;
                        });
                        res.end(JSON.stringify(b));
                    })
                }else{//查询所有
                   readBook(function (data) {
                      res.end(JSON.stringify(data));
                   });
                }
                break;
            case 'POST':
                var str = '';
                req.on('data',function (data) {
                    str+=data;
                });
                req.on('end',function (){
                    var b = JSON.parse(str);
                    readBook(function (data) {
                        b.bookId = data.length?data[data.length-1].bookId+1:1;
                        data.push(b);
                        writeBook(data,function () {
                            res.end(JSON.stringify(b));
                        });
                    });
                });
                break;
            case 'PUT':
                //1.获取id  2.把id改成当前传过来的请求体
                if(id){
                    var str = '';
                    req.on('data',function (data) {
                        str+=data;
                    });
                    req.on('end',function () {
                        var b = JSON.parse(str);
                        readBook(function (data) {
                            data = data.map(function (item) {
                                if(item.bookId == id){
                                    return b;
                                }
                                return item;
                            });
                            writeBook(data,function () {
                                res.end(JSON.stringify(b)); //restFul规范 规定修改后返回修改的那一项
                            })
                        });
                    });
                }
                break;
            case 'DELETE':
                if(id){
                    readBook(function (data) {
                        data = data.filter(function (item) {
                            return item.bookId != id;
                        });
                        writeBook(data,function () {
                            res.end(JSON.stringify({}));//返回一个空对象
                        });
                    });
                }
                break;
        }
    }else{
       fs.exists('.'+pathname,function (exists) {
           if(exists){
                res.setHeader('Content-Type',mime.lookup(pathname)+';charset=utf8');
               fs.createReadStream('.'+pathname).pipe(res);
           }else{
               res.statusCode  = 404;
               res.end();
           }
       });
    }
}).listen(8080);