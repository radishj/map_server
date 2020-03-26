/* old
var cors = require('cors');
var express = require("express");
var app = express();
app.use(cors());
var fs = require("fs"),
    axios = require('axios');
server = app.listen(process.env.PORT || 6600);
console.log("Listening on port %s...", server.address().port);
*/

const https = require("https");
var fs = require("fs");
const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/www.mediavictoria.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/www.mediavictoria.com/fullchain.pem"),
    dhparam: fs.readFileSync("/etc/letsencrypt/live/www.mediavictoria.com/dh-strong.pem")
  };
var cors = require('cors');
var express = require("express");
var app = express();
app.use(helmet());
app.use(cors());
var axios = require('axios');
server = app.listen(process.env.PORT || 6600);
console.log("Listening on port %s...", server.address().port);

https.createServer(options, app).listen(8800);


app.use(express.static(__dirname));
app.get("/director", function(req, res) {
    res.sendFile(__dirname + "/director.html");
});
app.get("/test", function(req, res) {console.log(__dirname);
    res.sendFile(__dirname + "/test.html");
});
function getUserRoom(room_id) {
    var user = [];
    for (var key in io.sockets.adapter.rooms[room_id]) {
        if (io.sockets.adapter.rooms[room_id][key] == true) {
            user.push(key);
        }
    }
    return user;
}

function getURL(url){
    return $.ajax({
        type: "GET",
        url: url,
        async: false
    }).responseText;
};

async function getGCode(address)
{
    var addr = encodeURI(address);
    var apiCode = "AIzaSyD771wv0bZmSuvvpH8dpBQq1C5kQIKWYag";
    var code="";
    try {
        res= await axios.get("https://maps.googleapis.com/maps/api/geocode/json?address="+addr+"&key="+apiCode);
        code = res.data.results[0].geometry.location;console.log(code);
    } catch (error) {
        console.error(error);
    }
    
    //console.log("code:"+JSON.stringify(code.results.geometry.location));
    return code;
}
