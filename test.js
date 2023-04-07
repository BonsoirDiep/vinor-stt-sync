
// var fileNameTest = 'abc.jpg';
// var fileNameTest = 'abc.docx';
var fileNameTest= 'MapR-Sandbox-For-Hadoop-5.1.0-disk1.vdi';
var fieldnameTest = 'audio';

var url1 = 'http://localhost:3001/single?date=' + encodeURI('05-04-2023');
var url2 = 'http://localhost:3001/single_all?date=' + encodeURI('05-04-2023');

function test(url, fileName, fieldname, cb) {
    var src = require('fs').createReadStream(__dirname + '/' + fileName, {
        highWaterMark: 1024
    });

    // src.on('open', function(){
    //     console.log('open done!!!', src.path);
    // });

    var request = require('request');
    var reqX = request.post(
        url, function (_err, _resp, _body) {
            _resp = _resp || {};
            if (_err) {
                console.log(_err);
                cb(_err);
                src.destroy();
            } else {
                console.log(_resp.statusCode, _body);
                // done
                cb(null, 'done!!!');
                src.destroy();
            }
        });
    var form = reqX.form();

    // send to server -> req.body
    // form.append('name', fileName+ '.wav2');
    form.append('username', 'Uể oải nghiêng'); // 

    form.append(fieldname, src); // because: upload.single(fieldname)

}

test(url1, fileNameTest, 'audio', function (err, msg) {
    if (err) return console.error(err);
    console.log(msg);
});

test(url2, fileNameTest, 'upload', function (err, msg) {
    if (err) return console.error(err);
    console.log(msg);
})