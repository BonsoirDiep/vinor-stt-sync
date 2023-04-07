
// var fileNameTest = 'abc.jpg';
var fileNameTest = 'abc.txt';

const crypto = require('crypto')


var url2 = 'http://localhost:3001/multiple_all?date=' + encodeURI('05-04-2023');

const { Readable, Writable } = require('stream');
function test(url, fileName, fieldname, cb) {
    var src = require('fs').createWriteStream(__dirname + '/' + fileName);

    // src.on('open', function(){
    //     console.log('open done!!!', src.path);
    // });

    // fake read-stream
    const readStream1 = new Readable({
        read() { }
    });
    readStream1.path = fileName;
    const readStream2 = new Readable({
        read() { }
    });
    readStream2.path = fileName+ '.md5';

    var request = require('request');
    src.once('close', function () {
        // console.log('DONE!!!');
        readStream1.push(null);
        
    });
    var reqX = request.post(
        url, function (_err, _resp, _body) {
            _resp = _resp || {};
            if (_err) {
                console.log(_err);
                cb(_err);
                src.destroy();
            } else {
                console.log(_resp.statusCode, _body);
                cb(null, 'done!!!');
                src.destroy(); // force close
            }
        });
    var form = reqX.form();

    // create md5 streaming
    const md5Stream = crypto.createHash('md5');
    md5Stream.once('readable', () => {
        var md5Hex= md5Stream.read().toString('hex');
        // console.log('md5:', md5Hex);
        readStream2.push(md5Hex);
        readStream2.push(null);
    });

    // send to server -> req.body
    // form.append('name', fileName+ '.wav2');
    form.append('username', 'Uể oải nghiêng');

    // form.append(fieldname, [readStream1, readStream2]);

    form.append(fieldname, readStream1);
    form.append(fieldname, readStream2);

    // because: upload.array(fieldname)

    readStream1.pipe(md5Stream);

    var mm = [

    ]
    for (var i = 0; i < 10000; i++) {
        mm.push(i);
    }
    mm.forEach(function (el, i) {
        var x1 = '' + el + '~';

        src.write(x1);
        readStream1.push(x1);

        if (i == mm.length - 1) src.end();
    });

}

test(url2, fileNameTest, 'uploads', function (err, msg) {
    if (err) return console.error(err);
    console.log(msg);
});