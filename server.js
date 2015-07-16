"use strict";

var io = require('socket.io').listen(5001),
    dl = require('delivery'),
    fs = require('fs');

io.sockets.on('connection', function(socket) {

    socket.broadcast.emit('user connected');

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
        socket.broadcast.emit("user leaved");
    });
});
