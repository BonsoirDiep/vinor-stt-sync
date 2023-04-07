//app.js
const express = require('express');
const multer = require("multer");
const app = express();
const fs = require('fs');
const os = require('os');
const path = require("path");

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var urlencodedParser2 = bodyParser.urlencoded({ extended: true })

// process.on('uncaughtException', function (ls) {
//     (function () { })();
// });

const SAVED_PATH = os.homedir() + path.sep+ 'VinorSoft_Stt';


//Setting storage engine
const storageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        // console.log(req.body.username);
        try {
            if (!req.query.date || !req.body.username) return cb('Missing query \"date\" or body \"username\"');
            var dir1 = SAVED_PATH;
            if (!fs.existsSync(dir1)) fs.mkdirSync(dir1);

            dir1 += '/' + req.body.username;
            if (!fs.existsSync(dir1)) fs.mkdirSync(dir1);

            dir1 += '/' + req.query.date;
            if (!fs.existsSync(dir1)) fs.mkdirSync(dir1);

            // console.log('req.query:', req.query);
            // console.log({file});
        } catch (_ex) {
            cb(_ex);
            return;
        }
        cb(null, dir1);
    },
    // destination: "./audios/123456",
    filename: (req, file, cb) => {
        // cb(null, `${Date.now()}--${file.originalname}`);
        cb(null, `${file.originalname}`);
    },

});



const checkFileType = function (file, cb) {
    //Allowed file extensions
    const fileTypes = /audio\/*/;

    //check extension names
    // const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const extName = 1;

    const mimeType = fileTypes.test(file.mimetype);

    if ((mimeType || file.mimetype == 'application/octet-stream') && extName) {
        return cb(null, true);
    } else {
        cb("Error: You can Only Upload Audios!!");
    }
};

//initializing multer
const upload = multer({
    storage: storageEngine,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});
// const upload = multer({
//     storage: storageEngine,
//     limits: { fileSize: 1000000 },
// });

const uploadAll = multer({
    storage: storageEngine
});

const port = process.env.PORT || 3001;

// app.listen(port, () => {
//     console.log(`App is listening on port ${port}`);
// });

const crypto = require('crypto');
function md5File(path, cb) {
    const md5Stream = crypto.createHash('md5')
    const input = fs.createReadStream(path, {
        highWaterMark: 1024
    })

    input.on('error', (err) => {
        cb(err)
    })

    md5Stream.once('readable', () => {
        cb(null, md5Stream.read().toString('hex'))
    })

    input.pipe(md5Stream)
}
app.post('/md5', urlencodedParser, function (req, res, next) {

    var x1 = req.body;
    if (!x1.md5 || !x1.path || !x1.user || !x1.date) return res.status(400).send("No valid md5 api !");
    var p1 = path.parse(req.body.path);
    var dir1 = SAVED_PATH + '/' + x1.user + '/' + x1.date + '/' + p1.base;
    var dir2 = dir1 + '.md5';

    fs.readFile(dir2, function (err, s1) {
        if (err) return res.status(400).send(err.message);
        // console.log(JSON.stringify(req.body));
        var s2 = s1.toString();
        if (s2 === x1.md5) {
            var sizeFileBE;
            try {
                sizeFileBE = fs.statSync(dir1).size;
            } catch (_ex) {
                sizeFileBE = 0;
            }
            res.status(200).send({
                size: sizeFileBE
            });
        } else {
            res.status(400).send("File in client change !");
        }
    });
});

app.post('/body1', jsonParser, function (req, res) {
    console.log('req.body:', JSON.stringify(req.body));
    console.log('req.upload:', req.upload);
    res.status(200).send(req.path);
});
app.post('/body2', urlencodedParser, function (req, res) {
    console.log('req.body:', JSON.stringify(req.body));
    console.log('req.upload:', req.upload);
    res.status(200).send(req.path);
});
app.post('/body3', urlencodedParser2, function (req, res) {
    console.log('req.body:', JSON.stringify(req.body));
    console.log('req.upload:', req.upload);
    res.status(200).send(req.path);
});
// const formidable = require('formidable');
// app.post('/body4', function (req, res) {
//     // console.log(req.originalUrl);
//     const form = formidable({ multiples: true });
//     form.parse(req, (err, fields, files) => {
//         if (err) {
//             next(err);
//             return;
//         }

//         console.log({fields, files});
//         res.json({ fields, files });
//     });
// });

const busboy = require('busboy');
const { randomFillSync } = require('crypto');
const random = (() => {
    const buf = Buffer.alloc(16);
    return () => randomFillSync(buf).toString('hex');
})();
app.post('/resume', function (req, res) {
    // console.log(req.originalUrl);
    var x1= req.headers;
    console.log(x1);
    // x1['content-type'] = x1['content-type'] || 'application/octet-stream';
    const bb = busboy({ headers: x1 });
    bb.on('file', (name, file, info) => {
        // C:\Users\ADMIN\AppData\Local\Temp\busboy-upload-...
        // const saveTo = path.join(os.tmpdir(), `busboy-upload-${random()}`);
        x1.start= x1.start || '0';
        var startX= parseInt(x1.start);
        if( !Number.isInteger(startX) || ''+ startX!= ''+ x1.start || (
            !x1.username || !x1.date || !info.filename
        )){
            file.destroy();
            bb.destroy();
            return;
        }
        var dir1 = SAVED_PATH + '/' + x1.username + '/' + x1.date + '/' + info.filename;
        console.log({dir1});
        var w1= fs.createWriteStream(dir1, {
            start: startX,
            flags: startX==0 ? 'w': 'a'
        })
        file.pipe(w1);
        w1.once('error', function(err){
            console.log('w1:', err);
            file.destroy();
            bb.destroy();
        });
    });
    // send field in req.headers
    // bb.on('field', (name, val, info) => {
    //     console.log(`Field [${name}]: value: %j`, val);
    // });
    bb.on('error', (e) => {
		console.error('failed upload', e);
		res.sendStatus(403);
	})
    bb.on('finish', () => {
        res.writeHead(200, { 'Connection': 'close' });
        res.end(`That's all folks!`);
    });
    req.pipe(bb);
});

app.post("/single", upload.single("audio"), (req, res) => {
    if (req.file) {
        res.send("Single file uploaded successfully");
    } else {
        res.status(400).send("Please upload a valid audio");
    }
});

app.post("/multiple", upload.array("audios", 5), (req, res) => {
    if (req.files) {
        res.send("Muliple files uploaded successfully");
    } else {
        res.status(400).send("Please upload a valid audios");
    }
});

// console.log(require('fs').statSync('./abc.txt').size)

app.post("/single_all", uploadAll.single("upload"), (req, res) => {

    console.log({
        'req.file': req.file,
        'req.body': JSON.stringify(req.body)
    });

    if (req.file) {
        res.send("Single file uploaded successfully");
    } else {
        res.status(400).send("Please upload a valid file");
    }
});

app.post("/multiple_all", uploadAll.array("uploads", 2), (req, res) => {

    console.log({
        'req.files': req.files,
        'req.body': JSON.stringify(req.body)
    });

    if (req.files) {
        res.send("Muliple files uploaded successfully");
    } else {
        res.status(400).send("Please upload a valid files");
    }
});

app.use((error, req, res, next) => {
    if (error.field) console.log('This is the rejected field ->', error.field);
    else {
        console.log('###\nExpressJS:')
        console.error(error);
    }
    res.status(403).send(error.message || 'Err!!!');
});


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {

    console.error(error);

    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(0);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(0);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

var http = require('http');
app.set('port', port);
app.enable('trust proxy');

var server = http.createServer(app);

server.listen(app.get('port'), function () {
    console.log('HTTP server listening on port ' + app.get('port'));
});
server.on('error', onError);
server.on('listening', onListening);