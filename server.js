// thêm thư viện
var express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

// dùng thư viện
var app = express();
app.use(express.json());
app.use(cors());
/*app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
    origin: ['*', 'https://file-sharing-gz.herokuapp.com/']
}));*/

//for test server work
app.get("/", function (req, res) {
  return res.send("server work !");
});

//chuyển tiếp tin nhắn từ user này đến user khác
app.post("/", (req, res) => {
  console.log("===============> api accept call");
  let data = req.body.message;
  console.log(data);
  console.log(persons[data.idConnect]);
  if (persons[data.idConnect] == undefined || persons[data.idConnect] == null) {
    // console.log("user not found");
    let resMessage = {
      type: "NOT_FOUND",
      id: data.idConnect,
    };
    return res.send(resMessage);
  } else {
    try {
      let message = {
        type: data.type,
        idConnect: data.idPerson,
        iceConnect: data.icePerson,
        message: data.message,
      };
      persons[data.idConnect].send(JSON.stringify(message));
    } catch (e) {
      console.log(e);
      return res.send(e);
    }
  }
  let resMessage = {
    type: "SUCCESS",
    id: data.idConnect,
  };
  return res.send(resMessage);
});

// config server
const wsServer = new WebSocket.Server({ noServer: true });
var port = process.env.PORT || 5000;
const server = app.listen(port, function () {
  console.log("Our app is running on http://localhost:" + port);
});
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});

let persons = [];

//init id for user
wsServer.on("connection", (socket) => {
  // console.log("have connect");
  persons.push(socket);

  socket.on("close", () => {
    console.log("on close connect");
    /*let index = persons.indexOf(socket);
        console.log(index);

        persons.splice(index,1);*/
  });

  // console.log("length persons :"+persons.length);
  let id = persons.length - 1;
  let message = {
    type: "INIT",
    id: id,
  };
  //send by socket
  persons[id].send(JSON.stringify(message));
});

setInterval(() => {
  wsServer.clients.forEach((client) => {
    //console.log(new Date().toTimeString());
    client.send(new Date().toTimeString());
  });
}, 1000);
