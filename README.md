
## 关于

获取每周收听的 last.fm 「Top Artists」榜单，发布到豆瓣广播。

图文完整版： http://www.douban.com/note/504954610/

前几天的想法： http://www.douban.com/people/post-rocker/status/1664711094/

最终效果见这条广播：
http://www.douban.com/people/post-rocker/status/1672773169/


**注：不适合用于正式的线上服务。**


## 开发手记 & 逻辑说明:

用到了 express.js 和 redis（其实感觉可以不用 redis）。


**1. 用户用豆瓣账号登录，然后提交自己的 last.fm 用户名**

（图片不可见）



**2. 之后前端 js 把 username post 给后端：**

```
$.ajax({
    url: '/getlastfmchart',
    type: 'POST',
    data: {'data': username},
    success: function (resp) {
        console.log('resp', resp);
    }
});
```

**3. 后端根据传过来的username ，往 last.fm 发 get 请求**

```
router.post('/getlastfmchart', function (req, res) {
    var username = req.body.data;
    var xml = 'http://ws.audioscrobbler.com/2.0/user/' + username + '/weeklyartistchart.xml';
    request.get(xml, {timeout: 3000}, function (err, httpResponse, body) {
        // body 即为最终的的 xml 数据
    });
 });
```


**4. 拿到 xml 后，用 xmlreader 吧 xml 解析为 json 格式，然后再返回给前端。**

```
xmlreader.read(body, function(errors, responsive) {
    var artists = responsive.weeklyartistchart.artist.array.reverse();
    var artistArray = [];

    // 只获取音乐人名称、 播放次数、链接
    for (var i = artists.length - 1; i >= 0; i--) {
        var artistObj = {};
        artistObj.name = artists[i].name.text();
        artistObj.playcount = artists[i].playcount.text();
        artistArray.push(artistObj);
    }

    // 前十条
    artistArray = artistArray.slice(0, 10);

    // 以 json 形式传回给前端
    res.json({error: err, message: null, data: artistArray});
});
```

后端输出的结果：
（图片不可见）


前端输出的结果：
（图片不可见）



**5. 前端拿到 json 后，在页面中插入一张图，图片的 src 中的 config 参数是处理后的 json。**

```
var config = encodeURIComponent(JSON.stringify(json).replace(/[\\"']/g, '\\$&')); //  这里需要过滤单引号和双引号
$('#content').prepend('<img src="/chart?config=' + config + '">');
```

获取图片的请求如下：

```
GET /chart?config=%7B%22data%22%3A%5B%7B%22name%22%3A%22F.D.%20Project%22%2C%22playcount%22%3A%22384%22%7D%2C%7B%22name%22%3A%22Lyn%20Collins%22%2C%22playcount%22%3A%2258%22%7D%2C%7B%22name%22%3A%22Dr.%20Dre%22%2C%22playcount%22%3A%2226%22%7D%2C%7B%22name%22%3A%22John%20Lennon%22%2C%22playcount%22%3A%2214%22%7D%2C%7B%22name%22%3A%22Side%20Liner%22%2C%22playcount%22%3A%2210%22%7D%2C%7B%22name%22%3A%22%E6%9C%A8%E9%A9%AC%22%2C%22playcount%22%3A%228%22%7D%2C%7B%22name%22%3A%22Pink%20Floyd%22%2C%22playcount%22%3A%227%22%7D%2C%7B%22name%22%3A%22Black%20N%20Blue%22%2C%22playcount%22%3A%227%22%7D%2C%7B%22name%22%3A%22Dr.%20Dre%20%26%20Snoop%20Dogg%20%26%20Kurupt%20%26%20Nate%20Dogg%22%2C%22playcount%22%3A%227%22%7D%2C%7B%22name%22%3A%22Australis%22%2C%22playcount%22%3A%226%22%7D%5D%7D 200 30ms
```

这个请求返回的是自动生成的榜单图，如下图：
（图片不可见）



图片请求成功，显示在页面里的样子：
（图片不可见）



**6. 关于图片处理：**

后端根据上面请求中的 config 参数，在后端自动生成一张图片（用到了 webshot 和 swig）。将图片存入 redis，如果 redis 中已有记录，则不存只取。 参考： https://github.com/lowesoftware/image-chart

**7. 用户点击「发布到豆瓣」按钮之后：**

```
// 根据 key 从 redis 里取对应的图片
// var key = 'chart:341edab70e20fd1df15c93eeabcf42d5';
var fileReadStream = redisReadStream(key);

// 把图片写入目录，随便写了个本地的地址
var fileWriteStream = fs.createWriteStream('/Users/username/desktop/test1.jpg');
fileReadStream.pipe(fileWriteStream);

// 写完之后，发布广播
fileWriteStream.on('close',function(){
    // console.log('copy over !!! :P ');
    var r = request.post('https://api.douban.com/shuo/v2/statuses/', {
            method: 'POST',
            headers: {'Authorization': 'Bearer ' + accessToken},
            timeout: 3000
        }, function (err, httpResponse, body) {
            if (callback && typeof callback === 'function') {
                callback(err, httpResponse, body);
            }
        });

    var form = r.form();
    form.append('text', '测试豆瓣广播 API: 自动发送图片和文字');
    form.append('image', fs.createReadStream('/Users/username/desktop/test1.jpg'));
});
```




**8. 把刚才写入到本地的图片删除**

`// todo`


--------

#### 整个流程的逻辑还有可以改进的地方：

1. 现在豆瓣广播还需要手动点击发布按钮才能发布，应该改为用户用豆瓣账号登录后，输入用户名，之后程序会每周自动发布（不过可能会遇到豆瓣 token 过期的问题）

2. 简化流程：比如，在获取到 last.fm 的 json 数据后，就自动生成图片存 redis 和 fs，然后发布广播，省去步骤 5 （预览榜单图片、点击发布按钮）

3. 往豆瓣广播发布图片时，最早想直接从 redis 里读图，`redis.readStream('chart:341edab70e20fd1df15c93eeabcf42d5')`，试了一晚上都不行。
遇到的错误有：发布的内容不能为空；发布后的图片打不开，地址是 None.jpg；返回“图片格式不对”的错误信息。后来发现 `fs.createReadStream('/Users/hanjiyun/desktop/3D_Movie_Logo_3.jpg')` 读本地的图则可以正常发布，所以后来才换成了先读 redis 的图，然后写入本地，再读本地的图传到豆瓣。这部分耗费的开发时间最长。 

4. 根据 json 数据自动生成图片这部分的开发大概花了 3 个小时，尝试过用 image-chart ，研究了一下C3.js http://c3js.org/samples/data_color.html ，但是生成的图片不够理想（我想实现类似 last.fm 榜单的样式），而且用 C3.js 来生成一个简单的图表，对我来说有点臃肿了。后来自己写了一个 swig 模板，没有用 image-chart 自己的那个模板。

5. 其实 last.fm 的用户名不一定非要填自己的，其他用户的也可以。也就是说用豆瓣帐号登录后，用户可以把任何 last.fm 用户的收听榜单发布到自己的豆瓣广播里。

6. 需要把用户的登录状态保存下来。
7. 可以尝试抓虾米的榜单。

------

这些都做完之后，写一个自动报时的豆瓣大笨钟程序很简单了，而且可以在大笨钟的广播里加上配图，配图也可以是程序自动生成的（比如连接电脑摄像头之类）。
