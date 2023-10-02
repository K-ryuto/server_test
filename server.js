const http = require('http')
const fs = require('fs')
const WebSocketServer = require('websocket').server

// ポート番号
const PORT1 = 5000
const PORT2 = 5555
const PORT3 = 8000
var acc = {acc:"",score:0}
var kind = {poker:acc,e_card:acc,}
var time = {reqest:0,enter:0,exit:0,used:kind,wait:0}
var player = {name:"",score:kind,auth:1,time:time}
var client = {count:{enter:0,request:{req_time:0},score:{avg_score:0,total_score:0}}}

// リクエスト・レスポンスの対応内容を記述
const server1 = http.createServer((request, response) => {
  const url = request.url.split("?")
  switch (url[0]) {
    case '/qr':
      fs.readFile('C:/Users/kojor/Desktop/server/public/server1/qr.html', 'utf-8', (error, data) => {
        response.writeHead(200, { 'Content-Type': 'text/html' })
        response.write(data)
        response.end()
      })
      break
    case "/":
      fs.readFile('C:/Users/kojor/Desktop/server/public/server1/index.html', 'utf-8', (error, data) => {
        response.writeHead(200, { 'Content-Type': 'text/html' })
        response.write(data)
        response.end()
      })
      break
    default:
      
  }
})

const server2 = http.createServer((request, response) => {
    const url = request.url.split("?")
    switch (url[0]) {
        case '/qr':
            fs.readFile('C:/Users/kojor/Desktop/server/public/qr.html', 'utf-8', (error, data) => {
                response.writeHead(200, { 'Content-Type': 'text/html' })
                response.write(data)
                response.end()
            })
            break
        case '/contract':
            fs.readFile('C:/Users/kojor/Desktop/server/public/contract.html', 'utf-8', (error, data) => {
              response.writeHead(200, { 'Content-Type': 'text/html'})
                response.write(data)
                response.end()
            })
            break
        default:
            fs.readFile('C:/Users/kojor/Desktop/server/public/index.html', 'utf-8', (error, data) => {
                response.writeHead(200, { 'Content-Type': 'text/html' })
                response.write(data)
                response.end()
            })
    }
})
const server3 = http.createServer((request, response) => {
    const url = request.url.split("?")
    if(url[0] == "/"){
      if(url[1] == "pass=test"){
        fs.readFile('C:/Users/kojor/Desktop/server/public/admin/index.html', 'utf-8', (error, data) => {
          response.writeHead(200, { 'Content-Type': 'text/html' })
          response.write(data)
          response.end()
        })
      }else{
        fs.readFile('C:/Users/kojor/Desktop/server/public/admin/pass.html', 'utf-8', (error, data) => {
          response.writeHead(200, { 'Content-Type': 'text/html' })
          response.write(data)
          response.end()
        })
      }
    }else if(url[0] == "/script"){
      fs.readFile('C:/Users/kojor/Desktop/server/public/admin/pass.js', 'utf-8', (error, data) => {
        response.writeHead(200, { 'Content-Type': 'text/html' })
        response.write(data)
        response.end()
      })
    }
})



server1.listen(PORT1, () => {
        console.log(` サーバ起動 http://localhost:${PORT1}`)
})

server2.listen(PORT2, () => {
    console.log(` サーバ起動 http://localhost:${PORT2}`)
})
server3.listen(PORT3, () => {
    console.log(` サーバ起動 http://localhost:${PORT3}`)
})


// !!---　以下追記部分 ---!!

// WebSocketサーバの設定
const wsServer = new WebSocketServer({
  httpServer: server1,
  // autoAcceptConnections は本番環境で使っちゃだめ
  autoAcceptConnections: false
})

const originIsAllowed = (origin) => {
  // アクセス元が信頼できるかを検証する用の関数。今回はlocal環境なので常にtrue
  if(origin == "https://koureisai.tcpexposer.com" || origin == "https://zikkou.tcpexposer.com" || origin == "https://adm-kou.tcpexposer.com"){
    return true
  }
  return false
}

var result

wsServer.on('request', (request) => {
  console.log(request.remoteAddress)
  if (!originIsAllowed(request.origin)) {
    // request.reject()
    console.log(`${request.origin} からのアクセスが拒否されました`)
  }

  const connection = request.accept('ws-sample', request.origin)
  console.log(`接続が許可されました`)
  connection.on('message', message => {
      switch (message.type) {
        case 'utf8':
          console.log(`メッセージ: ${message.utf8Data}`)
          result = message.utf8Data * 10
          // message.response(result)
          result = JSON.stringify(player)
          connection.sendUTF(result)
          result = message.utf8Data * 10
          // wsServer.broadcast(result) // 追記
          break
        case 'binary':
          // 中略
      }
    })

  connection.on('close', (reasonCode, description) => {
    console.log(`${reasonCode} によって切断されました`)
  })
})

const wsServer2 = new WebSocketServer({
    httpServer: server2,
    // autoAcceptConnections は本番環境で使っちゃだめ
    autoAcceptConnections: false
})
  
var result
  
wsServer2.on('request', (request) => {
  console.log(request.remoteAddress)
    if (!originIsAllowed(request.origin)) {
      // request.reject()
      console.log(`${request.origin} からのアクセスが拒否されました`)
    }
  
    const connection = request.accept('ws-sample', request.origin)
    console.log(`接続が許可されました`)
    connection.on('message', message => {
        switch (message.type) {
          case 'utf8':
            console.log(`メッセージ: ${message.utf8Data}`)
            let objData = JSON.parse(message.utf8Data);
            result = check_id(objData.users[0].id)
            if(objData.users[0].type == "up"){
              id_up(objData.users[0].id)
            }
            connection.sendUTF(result)
            break
          case 'binary':
            // 中略
        }
      })
  
    connection.on('close', (reasonCode, description) => {
      console.log(`${description} 、切断されました`)
    })
})

function check_id(data){
  var st = 0
  var tx = fs.readFileSync("C:/Users/kojor/Desktop/server/data/user.txt","utf8").split("\n")
  var test
  var reply_user = "true"
  for(var i = 0;tx.length-1 >i;i++){
      var test = JSON.parse(tx[i])
      if(test.id == data){
          st=2;
          reply_user = "false"
      }
  }
  return reply_user
}

function id_up(data){
  var st = 0
  var tx = fs.readFileSync("C:/Users/kojor/Desktop/server/data/user.txt","utf8").split("\n")
  var test
  var reply_user = "true"
  for(var i = 0;tx.length-1 >i;i++){
      var test = JSON.parse(tx[i])
      if(test.id == data){
          st=2;
          reply_user = "false"
      }
  }
  if(reply_user == "true"){
    fs.appendFileSync("C:/Users/kojor/Desktop/server/data/user.txt",`{"id":"${data}"}\n`)
  }
}


const wsServer3 = new WebSocketServer({
  httpServer: server3,
  // autoAcceptConnections は本番環境で使っちゃだめ
  autoAcceptConnections: false
})

var result = ""
var res = ""
wsServer3.on('request', (request) => {
  console.log(request.remoteAddress)
  if (!originIsAllowed(request.origin)) {
    // request.reject()
    console.log(`${request.origin} からのアクセスが拒否されました`)
  }

  const connection = request.accept('ws-sample', request.origin)
  console.log(`接続が許可されました`)
  result = fs.readFileSync("C:/Users/kojor/Desktop/server/data/user.txt","utf8").split("\n")
  for(var i = 0;result.length-1 > i;i++){
    res += JSON.parse(result[i]).id + ","
  }
  connection.sendUTF(res)
  res = ""
  connection.on('message', message => {
      switch (message.type) {
        case 'utf8':
          console.log(`メッセージ: ${message.utf8Data}`)
          connection.sendUTF(result)
          // wsServer.broadcast(result) // 追記
          break
        case 'binary':
          // 中略
      }
    })

  connection.on('close', (reasonCode, description) => {
    console.log(`${connection.remoteAddress} が切断されました`)
  })
})