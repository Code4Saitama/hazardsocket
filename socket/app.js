// 1.モジュールオブジェクトの初期化
var fs = require("fs");
var server = require("http").createServer(function(req, res) {
     res.writeHead(200, {"Content-Type":"text/html"});
     var output = fs.readFileSync("./index.html", "utf-8");
     res.end(output);
}).listen(8080);
var io = require("socket.io").listen(server);

// ユーザ管理ハッシュ
var userHash = {};

// 2.イベントの定義
io.sockets.on("connection", function (socket) {

  // 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
  socket.on("connected", function (name) {
    userHash[socket.id] = name;
  });

  // メッセージ送信カスタムイベント
  socket.on("publish", function (data) {
    console.log(data);
    //dataをGeoJSONにてして返す
        var geojson = {
            "type":"Feature",
            "properties":{
                "subject": data.subject,
                "message": data.message
            },
            "geometry":{
                "type":"Point",
                "coordinates":[
                    data.longitude,
                    data.latitude,
                    0.0
                ]
            }
        }
        console.log(geojson);
        io.sockets.emit("geojson", geojson);
  });

  // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
  socket.on("disconnect", function () {
    if (userHash[socket.id]) {
      var msg = userHash[socket.id] + "が退出しました";
      delete userHash[socket.id];
    }
  });
});
