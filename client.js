// Johnny-Five set up
var EtherPortClient = require("etherport-client").EtherPortClient;
var Firmata = require("firmata");
var five = require("johnny-five");

var Matrix = require('./8x16matrix_m.js');

// twitter API
var twitter = require('twitter');
var client = new twitter(require('./config.js'));


// Environment set up
// var host = 'localhost';
var host = '10.0.0.1';
var port = '5040';
var socket = require('socket.io-client')('http://'+host+':'+port);


//2.  create instance johnny-five ESP8266.
var board = new five.Board({
  io: new Firmata(new EtherPortClient({
    host: '10.0.0.73',
    port: 3030
  })),
  timeout: 1e5
});

socket.on('connect', function(){
  socket.emit('bottle_connect')
});


board.on("ready", function() {
  // custom LED matrix module
  var matrix = new Matrix(board, five);

  /*
  * revive message from controller
  */
  socket.on('msg', function(data){
    matrix.setBrightness(data.brt);
    matrix.setDelay(data.dly);
    matrix.setDirection(data.drc);
    matrix.setMassage(data.msg);
    socket.emit('echo',{msg:data.msg});
  });

  /*
  * Twitter
  * get mention
  */
  client.get('account/verify_credentials',
    {include_entities: false, skip_status: true},
    function (error, info, response) {
      if (error) {
        console.log(error)
      }

      client.stream('user', function (stream) {
        stream.on('data', function (tweet) {
          var id = ('user' in tweet && 'screen_name' in tweet.user) ? tweet.user.screen_name : null;
          var ifMention = ('in_reply_to_user_id' in tweet) ? (tweet.in_reply_to_user_id !== null) : false;
          if (ifMention) {
            var text = ('text' in tweet) ? tweet.text.replace(new RegExp('^@' + 'bottled_circuit' + ' '), '') : '';
            text = text.replace(/&lt;/g,"<").replace(/&gt;/g,">");
            text = '@' + id + '> ' + text;
            matrix.setMassage(text); // send message to device

            // var msg = '@' + id + ' recived your msg';
            //client.updateStatus(msg, function (data) {
            //  console.log(data);
            //});
          }
        });

        stream.on('error', function (error) {
            console.log(error);
        });
      });
    }
  );

});