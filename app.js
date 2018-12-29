const express = require('express');
const path = require('path');
const fly = require('flyio');
const request = require('request');
let utility = require('utility')
let multer = require('multer');
let superagent = require('superagent')
let cheerio = require('cheerio')

var app = express();
var fs = require('fs')
var webUploader = require('node-webuploader-server');
var router = express.Router();
var  uploadConfig = {uploadDir:path.join}
app.use(express.static('./dawn'))

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // res.header("Access-Control-Allow-Headers", "multipart/form-data");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8"); /*application/json*/
    next();
});


// var upload = multer({ dest: 'upload/' });
var storage = multer.diskStorage({
    // destination: 'upload', //string时,服务启动将会自动创建文件夹
    destination: function (req, file, cb) { //函数需手动创建文件夹
        var filepath = path.join(__dirname, 'upload');
        if (!fs.existsSync(filepath)) {
            fs.mkdir(filepath, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    cb(null, filepath);
                }
            })
        } else {
            cb(null, filepath);
        }
    },
    filename: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
})

var upload = multer({ storage: storage })
var uploadSingle = upload.single('logo');

/*app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});*/

app.post('/dawn/getName',function (req,res) {
  // body...
  res.send("Dawn,Come on!")
})
app.post('/dawn/uploadSingle', function(req, res, next){
  console.log('dawn/uploadSingle')
  console.log(req)
    uploadSingle(req, res, function(err) { //错误处理
        if (err) return
          console.log('uploadSingle')
        var file = req.file;

        console.log('文件类型：%s', file.mimetype);
        console.log('原始文件名：%s', file.originalname);
        console.log('文件大小：%s', file.size);
        console.log('文件保存路径：%s', file.path);
        console.log(file.fieldname);
        console.log(file.size);
        console.log(file.destination);

        res.send({ret_code: '0'});

    })


});


app.post('/dawn/uploadArray', upload.array('logo'), function(req, res, next){
    var files = req.files;
    console.log(files)

    res.send({ret_code: '0'});
});

app.post('/dawn/uploadFields', upload.fields([{name: 'logo', maxCount: 1}, {name: 'avatar', maxCount: 3}]), function(req, res, next){
    var files = req.files;
    console.log(files)

    res.send({ret_code: '0'});
});


app.post('/dawn/fileUpload',function(req,res){
  console.log(req)
  res.send('File uploaded to: ' + JSON.stringify(req));
  var tmp_path = req.files.path;
  var target_path = './upload/'+ req.files.data.name;
  fs.rename(tmp_path,target_path,function(err){
    if (err) throw err;
    fs.unlink(tmp_path,function(){
      if (err) throw err;
      res.send('File uploaded to: ' + target_path + '-' + req.files.data.size + 'bytes');
    })
  })
})

let server = app.listen(3000,()=>{
  let host = server.address().address;
  let port = server.address().port;
  console.log('app listening add http://%s:%s',host,port);
});



/*
app.post("/dawn/profile",upload.single('avatar'),(req,res,next)=>{
	console.log("文件默认属性:profile")
	console.log(req.file)
	console.log(req.body)
})
app.post('/dawn/photo/upload',upload.array('photo',12),(req,res,next)=>{
	console.log("photo:profile")
	console.log(req.file)
	console.log(req.body)
})

let cpUpload = upload.fields([{name:'avatar',maxCount:1},{name:'gallery',maxCount:8}])
app.post('/cool-profile',cpUpload,(req,res,next)=>{
   console.log('cool-profile')
   console.log(req.body)
})	


app.get('/dawn/getMd',(req,res)=>{
	var q=req.query.q
	let md5Value = utility.md5(q)
	res.send(q+":"+md5Value)
})
app.get('/dawn/getNetContent',(req,res,next)=>{
     superagent.get('https://cnodejs.org')
     .end((err,sres) =>{
     	if(err){
     		return next(err)
     	}
     	let $ = cheerio.load(sres.text);
     	var items = []
     	$('#topic_list .topic_title').each((idx,element)=>{
     		let $element = $(element);
     		items.push({
     			title:$element.attr('title'),
     			href:$element.attr('href'),
     			author:''
     		});
     	});
     	var authors = []
     	$('#topic_list img').each((idx,element)=>{
     		let $element = $(element);
     		authors.push({
     			author:$element.attr('title')
     		}) 
     	})
     	for(let i in items){
     		items[i].author = authors[i].author
     	}
     	res.send(items)
     });
})
app.post('/dawn/sendMessage',(req,res)=>{
  res.send(req.body)
})

function sendTemplateMessage(param) {
  return new Promise((resolve, reject) => {
    let opts = {
      touser: param.openId,
      template_id: param.template_id,
      form_id: param.formId,
      data: {
        "keyword1": {
          "value": param.user,
          "color": "#1d1d1d"
        },
        "keyword2": {
          "value": param.result,
          "color": "#1d1d1d"
        },
        "keyword3": {
          "value": param.time,
          "color": "#1d1d1d"
        }
      }
    }
    let data = {
      method: 'POST',
      url: `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${param.accessToken}`,
      body: JSON.stringify(opts),
      header: {
        'content-type': 'application/json' // 默认值
      }
    }
    app.post(data).then(result => {
      result = JSON.parse(result)
      if (result.errcode == '0' && result.errmsg === 'ok') {
        resolve(result)
      }
      else {
        reject(result)
      }
    }).catch(err => {
      reject(err)
    })
  })
}
app.get('/dawn/dawn',(req,res)=>{
      res.sendFile(fs.readFileSync('index.html','UTF-8'))
   })

*/
