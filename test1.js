
// var fileNameTest = 'abc.jpg';
var fileNameTest = __dirname + '\\abc.mp4';
// var fileNameTest = __dirname+ '\\MapR-Sandbox-For-Hadoop-5.1.0-disk1.vdi';

const request = require('request');

const crypto = require('crypto');
const fs = require('fs');
function md5File(path, cb) {
    const md5Stream = crypto.createHash('md5')
    const input = fs.createReadStream(path, {
        // highWaterMark: 1024
    })

    input.on('error', (err) => {
        cb(err)
    })

    md5Stream.once('readable', () => {
        cb(null, md5Stream.read().toString('hex'))
    })

    input.pipe(md5Stream)
}

// const userName = 'Uể oải nghiêng';
const userName = 'Phuong X';
const dateForce = '05-04-2023';

var urlMd5 = 'http://localhost:3001/md5';
var url3 = 'http://localhost:3001/single_all?date=' + encodeURI(dateForce);

var urlResume = 'http://localhost:3001/resume';

const { Readable, Writable } = require('stream');

function resumeUpload(url, fileName, fieldname, cb, opt) {
    console.log({ url });
    opt = opt || {};
    var startX = opt.start || 0;
    var src = require('fs').createReadStream(fileName, {
        highWaterMark: opt.highWaterMark || undefined,
        start: startX
    });
    var request = require('request');
    var reqX = request.post(url, {
        headers: {
            'username': userName + '',
            'start': startX,
            'date': encodeURI(dateForce)
        }
    }, function (_err, _resp, _body) {
        _resp = _resp || {};
        if (_err) {
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
    form.append(fieldname, src);
}

function newUpload(url, fileName, fieldname, cb, opt) {
    opt = opt || {};
    var md5Hex = opt.md5;
    if (!md5Hex || !opt.urlResume) return cb({ message: 'args function missing !' });
    const readStream2 = new Readable({
        read() { }
    });
    readStream2.path = fileName + '.md5';
    var reqX = request.post(url, {
        headers: {

        }
    }, function (_err2, _resp, _body) {
        _resp = _resp || {};
        if (_err2) {
            cb(_err2);
            readStream2.destroy();
        } else {
            console.log(_resp.statusCode, _body);
            readStream2.destroy(); // force close
            // cb(null, 'done!!!');
            resumeUpload(opt.urlResume, fileName, fieldname, function (err2, msg2) {
                cb(err2, msg2);
            }, {
                start: 0,
                highWaterMark: opt.highWaterMark
            });
        }
    });
    var form = reqX.form();

    form.append('username', userName);
    form.append(fieldname, readStream2);
    readStream2.push(md5Hex);
    readStream2.push(null);
}


md5File(fileNameTest, function (err, msg) {
    if (err) return console.error(err);
    // console.log(msg); // md5 string
    request.post(
        urlMd5, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            md5: msg,
            path: fileNameTest,
            user: userName,
            date: dateForce
        }
    }, function (_err, _resp, _body) {
        _resp = _resp || {};

        console.log(_resp.statusCode, _body);

        if (_err) {
            console.log(_err);
        } else {
            if (_resp.statusCode === 200) {
                var j1 = JSON.parse(_body);
                var sizeInClient = fs.statSync(fileNameTest).size;
                if (j1.size === sizeInClient) {
                    console.log('upload done !!!');
                    return;
                }
                if (j1.size < sizeInClient) {
                    console.log('_resume upload, put:', sizeInClient - j1.size, 'from: ', j1.size);
                    resumeUpload(urlResume, fileNameTest, 'upload', function (err2, msg2) {
                        if (err2) return console.error(err2);
                        console.log(msg2);
                    }, {
                        start: j1.size,
                        // highWaterMark: 1
                    });
                }
            } else {
                console.log('_new upload');
                newUpload(url3, fileNameTest, 'upload', function (err3, msg3) {
                    if (err3) return console.error(err3);
                    console.log(msg3);
                }, {
                    md5: msg,
                    // highWaterMark: 1,
                    urlResume
                });
            }
        }
    });
});