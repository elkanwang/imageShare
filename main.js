$(function() {
    var socket = io.connect('http://0.0.0.0:5001');

    socket.on('connect', function() {
        var delivery = new Delivery(socket);

        delivery.on('delivery.connect', function(delivery) {
            $("button[type=submit]").click(function(evt) {
                var file = $("input[type=file]")[0].files[0];
                delivery.send(file);
                evt.preventDefault();
            });
        });

        delivery.on('send.success', function(fileUID) {
            console.log("file was successfully sent.");
        });

        delivery.on('receive.start', function(fileUID) {
            console.log('receiving a file!');
        });

        delivery.on('receive.success', function(file) {
            if (file.isImage()) {
                $('#content').append('<img src=' + file.dataURL() + ' class="img-rounded"></img>');
            }
        });

        socket.on('user connected', function() {
            $('#content').append("<p>A user has joined the room.</p>");
        });
        
        socket.on('sendfile',function(info){
            if(info.image) {
                var src = 'data:image/jpeg;base64,' + info.buffer; 
                console.log('receiving images from others...');
                $('#content').append('<img src=' + src + '></img>');            
            }
        });
    });
});
