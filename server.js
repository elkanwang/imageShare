"use strict";

// main server

var express = require('express'),
    app = express(),
    path = require('path');

app.use(express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/delivery/lib/client'));

app.get('/', function(req, res){
        res.sendfile(path.join(__dirname + '/index.html'));
});
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});


// server listening to the socket
var memberCount = 0;

var io = require('socket.io').listen(5001),
    dl = require('delivery'),
    fs = require('fs');

io.sockets.on('connection', function(socket) {

    memberCount ++;
    socket.broadcast.emit('user connected', memberCount);
    console.log('A user has connected. There are now ' + memberCount + ' people in the room.');

    var delivery = dl.listen(socket);

    delivery.on('receive.success', function(file) {
        var directory = 'files/';
        var filepath = directory + file.name;
        fs.writeFile(filepath, file.buffer, function(err) {
            if (err) {
                console.log('File could not be saved.');
            } else {
                console.log('File saved.');
                delivery.send({
                    name: 'sample.jpg',
                    path : filepath
                    });
                delivery.on('send.success',function(){console.log('file sent')});
                fs.readFile(filepath, function(error, filedata){
                    if(error) throw error;
                    else socket.broadcast.emit("sendfile",{ image: true, buffer: filedata.toString('base64') });
                });
            };
        });
    });

    socket.on('disconnect', function(){
        memberCount--;
        console.log('A person has just left the room.');
        socket.broadcast.emit("user left", memberCount);
    });

    socket.on('random file', function(url){
        socket.broadcast.emit("upload", {url: url});
    });
});
