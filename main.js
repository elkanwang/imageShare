$(function() {
    var socket = io.connect('http://0.0.0.0:5001');

    $('input[type=file]').on("change",function(){
        if($(this)[0].files[0].name.match(/\.(jpg|jpeg|png|gif)$/)){
            $("button[type=submit]")[0].disabled = false;
        } else {
            $("button[type=submit]")[0].disabled = true;
        }   
    });

    $(document).keypress("k",function(e) {
        if(e.ctrlKey){
            socket.emit("random file","http://pc-research.uwaterloo.ca/CheatSheetSample.png");
        }    
    });
    

    socket.on('connect', function() {
        var delivery = new Delivery(socket);

        delivery.on('delivery.connect', function(delivery) {
            $("button[type=submit]").click(function(evt) {
                var file = $("input[type=file]")[0].files[0];
                delivery.send(file);
                $("input[type=file]").val('');
                $(this)[0].disabled = true;
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
                $('#content').append('<div><img src=' + file.dataURL() + ' class="img-rounded"></img></div>');
            }
        });

        socket.on('user connected', function() {
            $('#content').append("<p class='alert alert-success'>A user has joined the room.</p>");
        });
        
        socket.on('upload', function(o){
            console.log(o.url);
            $('#content').append('<div><img class="img-rounded" src=' + o.url  + '></img></div>'); 
        })
        
        socket.on('user leaved', function(){
            $('#content').append("<p class='alert alert-danger'>A user has leaved the room.</p>");
        });
        
        socket.on('sendfile',function(info){
            if(info.image) {
                var src = 'data:image/jpeg;base64,' + info.buffer; 
                console.log('receiving images from others...');
                $('#content').append('<div><img class="img-rounded" src=' + src + '></img></div>');            
            }
        });
    });
});
