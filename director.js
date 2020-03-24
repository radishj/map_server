var mapOptions = {
    zoom: 11
};
var map = new google.maps.Map(document.getElementById("map"), mapOptions);
var panorama = map.getStreetView();
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();

var login = {
    phone : 7783502200,
    password : 'asdfaf',
};
//example use
//var serverURL = 'https://localhost:3060';
var serverURL = 'https://mediavictoria.com:3060';
var tasti = {};
//tasti = tasti.merchants;
//console.log(JSON.stringify(tasti,null,"   "));
var orderMarkers={};
var selectedMarkers=[];
var color={red:'FE6256',green:'07950a',blue:'ac91fb'};
var waitIcon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|'+color.red+'|ffffff';
var assignedIcon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|'+color.blue+'|ffffff';
var diffAreaLarge = 0.2;
var diffAreaSmall = 0.015;
var areaDiff = diffAreaSmall;
function setMapOnAll(map) {
    Object.keys(orderMarkers).forEach(id => {
        orderMarkers[id](map);
    });
}
function deleteMarkers() {
    setMapOnAll(null);
    orderMarkers = {};
    selectedMarkers=[];
}
function addMarkers(addrTree){
    deleteMarkers();
    keys = Object.keys(addrTree);
    for(var i = 0; i < keys.length; i++){
        var icon = waitIcon;
        //if(tasti[keys[i]].name == "Cafe Carolina and Bakery")
        //    icon = './icons/lNone.png';
        addDeliveryMarker(addrTree, keys[i], map, icon);
    };
}
function addressStr(merchant){
    let addr = merchant.address;
    return addr.street1 + "," + addr.city + "," + addr.state+ "," + addr.country;
};
function addressLoc(merchant){
    //console.log(JSON.stringify(merchant.address));
    return {lat: merchant.address.location.latitude, lng: merchant.address.location.longitude};
};
async function checkAndMoveLocation(addrTree, addrKey)
{
    //console.log("before set:"+JSON.stringify(addrTree));
    var loc = new google.maps.LatLng(addressLoc(addrTree[addrKey]));
    //console.log("checkAndMoveLocation:"+JSON.stringify(loc));
    keys = Object.keys(addrTree);
    for(var i = 0; i < keys.length; i++){
        //if(element.index==6)
            //console.log('ii:'+i+',index:'+addrTree[i].index);
        key = keys[i];
        if(key!==addrKey && (addrTree[key].loc))
        {
            //if(element.index==6)
                //console.log('iii:'+i);
            //if(element.index==6)
            //{
            //    console.log('ee'+addrTree[i].index+':'+JSON.stringify(addrTree[i].loc)+';'+JSON.stringify(loc)+' dist:'+Math.sqrt(Math.pow((addrTree[i].loc.lat()-loc.lat()),2)+Math.pow((addrTree[i].loc.lng()-loc.lng()),2)));
            //}
            if(Math.sqrt(Math.pow((addrTree[key].loc.lat()-loc.lat()),2)+Math.pow((addrTree[key].loc.lng()-loc.lng()),2))<0.0004){
                //console.log('lat:'+(loc.lat() + 0.0005)+', lng:'+(loc.lng() + 0.0005));
                loc =  new google.maps.LatLng({lat:(loc.lat() + 0.0005), lng:(loc.lng() + 0.0005)});
                if(!addrTree[key].sameAddress)
                    addrTree[key].sameAddress=[];
                if(!addrTree[key].sameAddress.includes(addrKey))
                    addrTree[key].sameAddress.push(addrKey);
                if(!addrTree[addrKey].sameAddress)
                    addrTree[addrKey].sameAddress=[];
                if(!addrTree[addrKey].sameAddress.includes(key))
                    addrTree[addrKey].sameAddress.push(key);
                i=-1;
                //console.log('Moved '+element.index+' from '+JSON.stringify(loc));
            }
        }
    }
    //console.log("checkAndMoveLocation after:"+JSON.stringify(loc));
    addrTree[addrKey].loc = loc;
}
function addressStr(merchant){
    let addr = merchant.address;
    return addr.street1 + "," + addr.city + "," + addr.state+ "," + addr.country;
};
function addDeliveryMarker(addrTree, addrKey, map, iconStr) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    //console.log(JSON.stringify("addMarkers:"+addrTree));
    checkAndMoveLocation(addrTree, addrKey);//console.log('key:'+addrKey+','+JSON.stringify(addrTree[addrKey],null,'   '));
    //console.log("addMarkers:"+JSON.stringify(addrTree[addrKey].loc));
    var marker = new google.maps.Marker({
        position: addrTree[addrKey].loc,
        //label: addrTree[addrKey].name,
        icon: iconStr,
        map: map
    });
    marker.index = addrKey;//console.log('index:'+marker.index);
    marker.phone = addrTree[addrKey].phone;
    marker.address = addressStr(addrTree[addrKey]);
    orderMarkers[addrKey]= marker;
    marker.addListener('click', function() {
        var markerPos = marker.getPosition();
        Object.values(orderMarkers).forEach(om => {
            if(om.getIcon()==waitIcon && om!=marker)
            {
                var omPos = om.getPosition();
                var dist = Math.sqrt(Math.pow((markerPos.lat()-omPos.lat()),2)+Math.pow((markerPos.lng()-omPos.lng()),2));
                if(dist<areaDiff)
                {
                    selectedMarkers.push(om);
                    var iconStr = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+selectedMarkers.length.toString()+'|'+color.green+'|ffffff';
                    om.setIcon(iconStr);
                }
            }
        });
        if(marker.getIcon()==waitIcon){
            selectedMarkers.push(marker);
            var iconStr = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+selectedMarkers.length.toString()+'|'+color.green+'|ffffff';
            marker.setIcon(iconStr);
            //alert(addrTree[addrKey].name+'\n'+addressStr(addrTree[addrKey]));
            //marker.setMap(null);
        }
    });
}

var user={
    token:'',
    name:'',
    phone:'',
    icon:'',
    loc:''
}
function requestPosition() {
    // additionally supplying options for fine tuning, if you want to
    return new Promise(function(resolve, reject) {
      navigator.geolocation.getCurrentPosition(
        pos => { resolve(pos); }),
        err => { reject (err); }
    });
}
function convertLoc(loc)
{
    return {lat: Number(loc.lat), lng: Number(loc.lng)};
}
function removeMarker(orderID)
{
    var pos = -1;
    for(var i=0; i<selectedMarkers.length; i++){
        var start=false;
        if(start){
            var iconStr = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+(selectedMarkers.length-1).toString()+'|'+color.green+'|ffffff';
            selectedMarkers[i].setIcon(iconStr);
        }else if(selectedMarkers[i].index==orderID){
            selectedMarkers[i].setMap(null);
            start=true;
            pos=i;
        }
    }
    if(pos>=0){
        selectedMarkers.splice(pos, 1);
    }
    else if(orderMarkers[orderID])
        orderMarkers[orderID].setMap(null);
    delete orderMarkers[orderID];
}
function removeAllMarkers()
{
    Object.keys(orderMarkers).forEach(id => {
        console.log('id:'+id);
        orderMarkers[id].setMap(null);
        delete orderMarkers[id];
    });
    selectedMarkers=[];
    orderMarkers={};
}
$(function() {
    $("#hide_my_icon").click(async function() {
        if(user.marker.getVisible()){
            user.marker.setVisible(false);
            $(this).val("Show");
        }
        else{
            user.marker.setVisible(true);
            $(this).val("Hide");
        }
    });
    $('input:radio[name="area"]').change(
    function(){
        if ($(this).is(':checked') && $(this).val() == 'None') {
            user.largeMarkers.forEach(marker => {
                marker.setVisible(false);
            });
            user.smallMarkers.forEach(marker => {
                marker.setVisible(false);
            });
            areaDiff = 0;
        }
        if ($(this).is(':checked') && $(this).val() == 'Small') {
            user.largeMarkers.forEach(marker => {
                marker.setVisible(false);
            });
            user.smallMarkers.forEach(marker => {
                marker.setVisible(true);
            });
            areaDiff = diffAreaSmall;
        }
        if ($(this).is(':checked') && $(this).val() == 'Large') {
            user.largeMarkers.forEach(marker => {
                marker.setVisible(true);
            });
            user.smallMarkers.forEach(marker => {
                marker.setVisible(false);
            });
            areaDiff = diffAreaLarge;
        }
    });

    $("#request").click(async function() {
        var togo = confirm('You selected '+selectedMarkers.length+' orders, ready to request server?');
        if (togo == true) {
            var data={"token":user.token};
            var selectedOrders = [];
            selectedMarkers.forEach(marker => {
                selectedOrders.push(marker.index);
            });
            data.selectOrders=selectedOrders;
            var res=postURL(serverURL+"/tasti-request",data);
            info = JSON.parse(res);
            if(info.status)
            {
                if(info.status=='success'){
                    selectedMarkers.forEach(marker => {
                        marker.setIcon(assignedIcon);
                        marker.addListener('click', function() {
                            var togo = confirm(marker.phone+'\n'+marker.address+'\nOpen GMap to go there?');
                            if (togo == true) {
                                marker.delivered = true;
                                marker.setIcon('./icons/finished_g.png');
                                window.open("https://www.google.ca/maps/place/"+marker.address);
                            }
                        });
                    });
                    $("#login_panel").css({
                        display: "none"
                    });
                    $("#user_panel").css({
                        display: "block"
                    })
                    $("#command_panel").css({
                        display: "none"
                    })
                }
                else if(info.status=='wrongToken'){
                    alert('Logined in other device? You need login again.');
                    $("#login_panel").css({
                        display: "block"
                    });
                    $("#user_panel").css({
                        display: "none"
                    })
                    $("#command_panel").css({
                        display: "none"
                    })
                }
                else if(info.status=='orderMissing'){
                    Object.values(orderMarkers).forEach(marker => {
                        marker.valid=false;
                    });
                    info.allOrderIDs.forEach(orderID => {
                        if(orderMarkers[orderID])
                            orderMarkers[orderID].valid = true;
                    });
                    var count = 0;
                    Object.keys(orderMarkers).forEach(id => {
                        if(!orderMarkers[id].valid){
                            count++;
                            removeMarker(id);
                        }
                    });
                    alert(count+' orders are not available anymore. They got removed from your map!');
                }
                else{
                    alert('Error send back from server, Err:'+info.status);
                }
            }
        }
    });
    $("#button_login").click(async function() {
        // Try HTML5 geolocation.
        loc = await requestPosition();
        //console.log(loc);
        if (loc.coords) {
            user.loc = {
                //lat: loc.coords.latitude,
                //lng: loc.coords.longitude
                lat: 35.904355,
                lng: -79.0105121
            };

            //infoWindow.setPosition(currentLoc);
            //infoWindow.setContent('I\'m here');
            //infoWindow.open(map);
            //map.setZoom(20);
        } else {
            // Browser doesn't support Geolocation
            alert('Browser does not support Geolocation!');
        }
        user.phone = $("#phone").val();
        user.password = $("#password").val();
        if(user.largeMarkers){
            user.largeMarkers.forEach(marker => {
                marker.setMap(null);
                delete marker;
            });
            user.largeMarkers=[];
        }
        if(user.smallMarkers){
            user.smallMarkers.forEach(marker => {
                marker.setMap(null);
                delete marker;
            });
            user.smallMarkers=[];
        }
        if(user.marker)
        {
            user.marker.setMap(null);
            delete user.marker;
        }
        $("#user_name").text("Username: ");
        console.log("usr22:"+JSON.stringify(user));
        var res=postURL(serverURL+"/tasti-login",user);
        if(res=="failed"){
            alert('Login failed!');
            return;
        }
        tasti = JSON.parse(res);
        if(tasti.user){
            user = tasti.user;console.log('u1:'+JSON.stringify(tasti.user));
            user.loc = convertLoc(user.loc);
            map.setCenter(user.loc);console.log('l:'+JSON.stringify(user.loc));
            var marker = new google.maps.Marker({
                position: user.loc,
                //label: addrTree[addrKey].name,
                icon: '../icons/driver1.png',
                map: map
            });
            user.marker = marker;
            user.largeMarkers = [];
            user.smallMarkers = [];
            for(var i=0; i<20; i++)
            {
                var lat = user.loc.lat+diffAreaLarge*Math.sin(Math.PI/180*(360*i/20));
                var lng = user.loc.lng+diffAreaLarge*Math.cos(Math.PI/180*(360*i/20));
                var loc={"lat":lat, "lng":lng};
                var marker = new google.maps.Marker({
                    position: loc,
                    //label: addrTree[addrKey].name,
                    icon: '../icons/dot10.png',
                    map: map
                });
                marker.setVisible(false);
                user.largeMarkers.push(marker);
                console.log('i:'+(i&1));
                if((i&1)==0)
                {
                    var lat = user.loc.lat+diffAreaSmall*Math.sin(Math.PI/180*(360*i/20));
                    var lng = user.loc.lng+diffAreaSmall*Math.cos(Math.PI/180*(360*i/20));
                    var loc={"lat":lat, "lng":lng};
                    var marker = new google.maps.Marker({
                        position: loc,
                        //label: addrTree[addrKey].name,
                        icon: '../icons/dot10.png',
                        map: map
                    });
                    user.smallMarkers.push(marker);
                }
            }
            removeAllMarkers();
            addMarkers(tasti.merchants);
            $("#login_panel").css({
                display: "none"
            });
            $("#user_panel").css({
                display: "block"
            })
            $("#command_panel").css({
                display: "block"
            })
            $("#user_name").append(user.name);
            //var sex = $("#sex input:checked").prop("id");
        }
        else{
            alert('Login failed!');
        }
    });

    $("#send_message").click(function() {
        data_message = {
            id: socket_id,
            message: $("#chat_message").val(),
            name: $("#user_name").val()
        };
        $("#chat_message").val("");
        socket.emit("message", data_message);
    });
    $(".world").click(function() {
        $("#world").css({
            display: "block"
        });
        $("#room").css({
            display: "none"
        });
        return false;
    });
    $("#createroom").click(function(event) {
        if (createGroup == 0 && room_id == '') {
            room_id = Math.random().toString(36).substring(7);
            socket.emit("create_room", room_id);
            createGroup = 1;
            $("#room_message").html("Created new room<br/>");
        }
        $("#world").css({
            display: "none"
        });
        $("#room").css({
            display: "block"
        });
        return false;
    });
});

function travel(from, to) {
    for (var i = 0; i < Math.max(allFlightPath.length, allMarkerStress.length); i++) {
        if (typeof(allFlightPath[i]) !== undefined) {
            allFlightPath[i].setMap(null);
        }
        if (typeof(allMarkerStress[i]) !== undefined) {
            allMarkerStress[i].setMap(null);
        }
    }
    allFlightPath = [];
    allMarkerStress = [];
    for (var i = 0; i < from.length; i++) {
        var request = {
            origin: new google.maps.LatLng(from[i][0], from[i][1]),
            destination: new google.maps.LatLng(to[0], to[1]), //lat, lng
            travelMode: google.maps.TravelMode["WALKING"]
        };
        directionsService.route(request, function(response, status) {
            var flightPath = '',
                marker_stress = '';
            if (status == google.maps.DirectionsStatus.OK) {
                data = response.routes[0].overview_path;
                color = "#ff0000";
                opacity = 1;

                flightPath = new google.maps.Polyline({
                    path: data,
                    geodesic: true,
                    strokeColor: color,
                    strokeOpacity: opacity,
                    strokeWeight: 2,
                    map: map
                });
                flightPath.setMap(map);
                marker_stress = new google.maps.Marker({
                    position: new google.maps.LatLng(data[data.length - 1].k, data[data.length - 1].B),
                    icon: "http://icons.iconarchive.com/icons/fatcow/farm-fresh/32/hand-point-270-icon.png"
                });
                marker_stress.setMap(map);
                allFlightPath.push(flightPath);
                allMarkerStress.push(marker_stress);
            }
        });
    }
}

function postURL(url,body){
    return $.ajax({
        type: "POST",
        url: url,
        data: body,
        async: false
    }).responseText;
};