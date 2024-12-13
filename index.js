const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const socketIo = require("socket.io")

const uri = "mongodb+srv://Admin:1234@chatapp.h0po0.mongodb.net/?retryWrites=true&w=majority&appName=ChatApp";
const client = new MongoClient(uri);

const server = http.createServer((req, res) => {
  if (req.url === "/chat" && req.method === "POST"){
    let body = "";
    req.on('data', chunk => {
      body += chunk; // Convert the buffer to a string
    });

    req.on('end', async () => {
      const parsedData = JSON.parse(body);
      console.log('Received Datas:', parsedData);
			const doc = await send(parsedData)
			io.emit('broadcastMessage', doc);
    }); 
  }
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, 'public', 'home.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
  else if (req.url === '/images/home.jpg') {
    fs.readFile(path.join(__dirname, 'public/images', 'home.jpg'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(data);
    });
  }
  else if (req.url === '/chat') {
    fs.readFile(path.join(__dirname, 'public', 'chat.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
  else if (req.url === '/style.css' || req.url === "/chat/style.css") {
    fs.readFile(path.join(__dirname, 'public', 'style.css'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
  } 
  else if (req.url === '/chat/client.js' || req.url === "/client.js") {
    fs.readFile(path.join(__dirname, 'public', 'client.js'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  }
  else if (req.url === '/chat/read.js') {
    fs.readFile(path.join(__dirname, 'public', 'read.js'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  }
	else if (req.url === '/chat/socket.io/socket.io.js') {
		const filePath = path.join(__dirname, 'node_modules', 'socket.io', 'client-dist', 'socket.io.js');
		fs.readFile(filePath, (err, data) => {
			if (err) {
					res.writeHead(404);
					res.end('File not found');
					return;
			}
			res.writeHead(200, { 'Content-Type': 'application/javascript' });
			res.end(data);
		});
	}
  else if (req.url === '/chat/datas') {
    All(req, res)
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}).listen(8080)
const io = socketIo(server);

async function send(parsedData) {
	let doc = {};
  try{
		const ID = new ObjectId;
    await client.connect();
    const ChatApp = client.db("ChatApp");
    const room = ChatApp.collection(parsedData.Chat);
    await room.insertOne({
			_id:ID,
      User:parsedData.User,
			Name:parsedData.Name,
      Message:parsedData.Message
    });
		doc = await room.findOne(
			{
				_id:ID
			}
		);
		doc["Chat"] = parsedData.Chat;
		
    console.log("Message sent in " + parsedData.Chat + " by " + parsedData.User + ": " + parsedData.Message)
  }
  finally{
  	await client.close();
		console.log(doc)
		return doc;
  }
  
}

async function All(req, res) {
  try {
    await client.connect();
    const db = client.db("ChatApp");
    const collections = await db.listCollections().toArray();

    let allData = {};
    
    for (let collection of collections) {
      const col = db.collection(collection.name);
      const documents = await col.find({}).toArray();
      allData[collection.name] = documents;
    };

		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(allData));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

