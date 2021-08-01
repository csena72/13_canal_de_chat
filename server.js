const express = require("express");
const bodyParser = require("body-parser");
var exphbs = require('express-handlebars');

const app = express();
const routerApi = express.Router();
const puerto = 8080;

const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.set('views', './views');

app.use(express.static(__dirname + '/public'));

let productos = [];
let producto;
let productosWs = [];

io.on('connection', (socket) => {

  io.sockets.emit('mensajes', productosWs);

  socket.on('producto-nuevo', data => {
    productosWs.push(data);
  })

});

app.get('/', (req,res) => {
  res.render('home', {productosWs: productosWs});
});

app.get("/productos/vista", (req, res) => {
  res.render('productos', {productos: productos})
});

routerApi.get("/productos", (req, res) => {
  let response = productos.length > 0 ? productos : { error: "no hay productos cargados" };
  res.json(response);
});

routerApi.get("/productos/:id", (req, res) => {
  let paramId = req.params.id;
  let producto = productos.filter(function (producto) {
    return producto.id == paramId;
  });

  let response =
    producto.length > 0 ? producto : { error: "producto no encontrado" };
  res.send(response);
});

routerApi.post("/productos", (req, res) => {
  producto = req.body;
  producto.id = productos.length + 1;
  productos.push(req.body);

  res.redirect('/');
});

routerApi.put("/productos/:id", (req, res) => {
  
  let id = parseInt(req.params.id);  
  
  let { title, price, thumbnail } = req.body[0];  

  let producto = productos.filter(function (producto) {
    return producto.id == id;
  });
  
  if(!producto.length > 0){
    res.send( { error: "No existe el producto" });
  }

  productos.splice( id - 1, 1, { title, price, thumbnail, id } );  
  
  res.send({ title, price, thumbnail, id });
});

routerApi.delete("/productos/:id", (req, res) => {
  let id = parseInt(req.params.id);  

  let producto = productos.filter(function (producto) {
    return producto.id == id;
  });
  
  if(!producto.length > 0){
    res.send( { error: "No existe el producto" });
  }
    
  productos = productos.filter(function (producto) {
    return producto.id != id;
  });

  res.send(producto);
});

app.use('/api', routerApi);

server.listen(puerto, () => {
  console.log(`servidor escuchando en http://localhost:${puerto}`);
});

server.on("error", (error) => {
  console.log("error en el servidor:", error);
});