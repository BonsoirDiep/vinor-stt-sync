
// var fileNameTest = 'abc.jpg';
var fileNameTest = 'abc.txt';

const crypto = require('crypto')
const fs = require('fs');
const request = require('request');

function md5File(path, cb) {
    const md5Stream = crypto.createHash('md5')
    const input = fs.createReadStream(path)

    input.on('error', (err) => {
        cb(err)
    })

    md5Stream.once('readable', () => {
        cb(null, md5Stream.read().toString('hex'))
    })

    input.pipe(md5Stream)
}


// var url2 = 'http://localhost:3001/single_all?date=' + encodeURI('05-04-2023');

var url2 = 'http://localhost:3001/body5?date=' + encodeURI('05-04-2023');

const { Readable, Writable } = require('stream');
function test(url, fileName, fieldname, cb) {
    var src = require('fs').createWriteStream(__dirname + '/' + fileName);

    // src.on('open', function(){
    //     console.log('open done!!!', src.path);
    // });

    src.once('close', function () {
        // console.log('DONE!!!');
        inStream.push(null);
    });
    var reqX = request.post(
        url, function (_err, _resp, _body) {
            _resp = _resp || {};
            if (_err) {
                // console.log(_err);
                cb(_err);
                src.destroy();
            } else {
                console.log(_resp.statusCode, _body);
                // done
                cb(null, 'done!!!');
                src.destroy(); // force close
            }
        });
    var form = reqX.form();

    // fake read-stream
    const inStream = new Readable({
        read() { }
    });
    inStream.path = 'C:/1.txt';

    // send to server -> req.body
    // form.append('name', fileName+ '.wav2');
    form.append('username', 'Uể oải nghiêng');

    form.append(fieldname, inStream); // because: upload.single(fieldname)

    var mm = [

    ]
    for (var i = 0; i < 10000; i++) {
        mm.push(i);
    }
    mm.forEach(function (el, i) {
        var x1 = '' + el + '~';

        src.write(x1);
        inStream.push(x1);

        if (i == mm.length - 1) src.end();
    });

}

test(url2, fileNameTest, 'upload', function (err, msg) {
    if (err) return console.error(err);
    console.log(msg);
});


// md5File(fileNameTest, function(err, msg){
//     if (err) return console.error(err);
//     console.log(msg);
    
// })