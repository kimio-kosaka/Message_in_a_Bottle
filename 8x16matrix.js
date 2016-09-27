/*
* LED Matrix Control
*/
var async = require('async');

/* LED Matrix Control Functions as below */
var Matrix = {
    // CLEAR  "32" 0x20
    clear: function  () {
        board.io.sendString('32');
    },

    // SET Brightness "36" 0x24
    setBrightness: function(brightness) {
        board.io.sendString('36' + ',' + brightness );
    },

    // SET Direction "37" 0x25
    setDirection: function(direction) {
        board.io.sendString('37' + ',' + direction );
    },
    // SET Delay  "38" 0x26
    setDelay: function(delay) {
        board.io.sendString('38' + ',' + delay);
    },

    // SET Massage "40" 0x28, "41" 0x29
    setMassage: function(buffer) {
        if(buffer.length != 0) {
            buffer = buffer.slice(0,255);  //upper limit 140 chars
            buffer = buffer.replace(/\n/g,' ');
            var k = 24;
            async.series([
                function(next){
                    console.log('--');
                    console.log(buffer.slice(0,k));
                    board.io.sendString('40,'+buffer.slice(0,k));
                    next(null, '1');
                },
                function(next){
                    for(var n = k; n < buffer.length; n = n+k){
                        console.log("--");
                        console.log(buffer.slice(n,n+k));
                        board.io.sendString('41,' + buffer.slice(n, n + k));
                    }
                    next(null, '2');
                },
                function(next){
                    board.io.sendString('42, ');
                    next(null,'3');
                },
            ],
            function complete(err,result){
              //  console.log(JSON.stringify(result));
            }
            );
        }
    }
};
module.exports = Matrix;
