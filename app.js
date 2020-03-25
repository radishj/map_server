const fs = require('fs');
var options = {
    key: fs.readFileSync('/etc/apache2/conf.d/ssl.crt/server.key'),
    cert: fs.readFileSync('/etc/apache2/conf.d/ssl.crt/server.crt'),
    requestCert: false
};

var express = require("express"),
    app = require("express")(),
    http = require("http").Server(options,app),
    axios = require('axios');
http.listen(6600, function() {
    console.log("Connected to :6600");
});
/* old
var express = require("express"),
    app = require("express")(),
    http = require("http").Server(app),
    fs = require("fs"),
    axios = require('axios');
http.listen(6600, function() {
    console.log("Connected to :6600");
});
*/
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
