//Code 
var ilon = centerLonScr;
var ilat = centerLatScr;

var multipler = 2.0;
var map;
var previousShapeSelected = null;
var screenmap;
var imageM = {
 url: 'images/MapMarker.png',
 size: new google.maps.Size(25,62),
 origin: new google.maps.Point(0,0),
 anchor: new google.maps.Point(0,35)
};

google.maps.event.addDomListener(window, 'load', initialize);
var rSide = document.getElementById("left");

var canvas = document.getElementById("myCanvas");
//var context = canvas.getContext('2d');

var addListenerOnPolygon = function(polygon){
  google.maps.event.addListener(polygon, 'click', function (event){
    
    var ppath = polygon.getPath();
    console.log(ppath.getLength());

    var bounds = new google.maps.LatLngBounds();
    var polygonCoords = new Array();
    for(i=0; i<ppath.getLength() ;i++){
      polygonCoords.push(new google.maps.LatLng(ppath.getAt(i).lat(),ppath.getAt(i).lng()));
      bounds.extend(polygonCoords[i]);
    }
    console.log(bounds.getCenter());

    if(previousShapeSelected !== null){
      previousShapeSelected.setOptions({fillOpacity: 0.3});
    }
    previousShapeSelected = polygon;    
    polygon.setOptions({fillOpacity: 0.8});


    sendMessageData("SEND_GEOPOSITION_MESSAGE",[bounds.getCenter().k,bounds.getCenter().B,0.00001,0.00001]); 
  });
};
	
//Events
google.maps.event.addDomListener(window, "resize", function() {
  var center = map.getCenter();
  google.maps.event.trigger(map, "resize");
  map.setCenter(center); 
});

/*
canvas.addEventListener('mousemove', function(){
  var mousePos = getMousePos(canvas,evt);
  var message = "Mouse position" + mousePos.x + " , " + mousePos.y;

  writeMessage(canvas,message);

},false);*/

window.onresize = function(event) {
  w_x = document.getElementById("map-canvas").offsetWidth;
  if(w_x >= 900){ map.setZoom(13);}
  else if(w_x >= 650 && w_x < 900){map.setZoom(12);}
  else if(w_x >= 400 && w_x < 650){map.setZoom(11);}
  else {map.setZoom(10);}
  
  map.setCenter(new google.maps.LatLng(centerLatMap, centerLonMap));
};
	
//Key Events listener
document.addEventListener("keydown", function(e) {
  //Fullscreen
  if (e.keyCode == 13) {//ENTER Key
    toggleFullScreen();
    draggable('one');
  }
  //Restoring original position
  if (e.keyCode == 8) {//ENTER backspace
    map.setCenter(new google.maps.LatLng(centerLatMap, centerLonMap));
  }
  //Zoom out
  if (e.keyCode == 81) {// 'q' key
    map.setZoom(map.getZoom()-1);
    console.log(map.getZoom());
  }
  //Zoom in
  if (e.keyCode == 87) {// 'w' key
    map.setZoom(map.getZoom()+1);
    console.log(map.getZoom());
  }
  //Scale the Screen View Polygon
  if(e.keyCode == 79) { // o
    multipler = multipler -0.1;
    ilat = (screenmap.getPath().getAt(0).lng()+screenmap.getPath().getAt(1).lng())/2;
    ilon = (screenmap.getPath().getAt(1).lat()+screenmap.getPath().getAt(2).lat())/2;
    scaledScreen(ilon,ilat,multipler);
  }
  //Scale the Screen View Polygon
  if(e.keyCode == 80) { // p
    multipler = multipler +0.1;
    ilat = (screenmap.getPath().getAt(0).lng()+screenmap.getPath().getAt(1).lng())/2;
    ilon = (screenmap.getPath().getAt(1).lat()+screenmap.getPath().getAt(2).lat())/2;
    scaledScreen(ilon,ilat,multipler);
  }

}, false);



//Functions called by the script
/** Canvas 2D interaction*/
/*
function writeMessage(canvas, message){
  var context = canvas.getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);
  context.font = '18pt Arial';
  context.fillStyle = 'black';
  context.fillText(message,10,25);
}

function getMousePos(canvas,evt){
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  }
}
*/

/** initialize() uses the google maps api for initialize the map with the options that correspond */
function initialize() {
  var mapOptions = {
    zoom: parseInt(zoomlevel),
    center: new google.maps.LatLng(centerLatMap, centerLonMap),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };
  var myStyles = [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [
        {visibility: "off"}
      ]
    }
  ];

  map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
  map.setOptions({
    draggable: false, 
    zoomControl: false, 
    streetViewControl:false,
    panControl: false,
    mapTypeControl:false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    styles: myStyles
  });
  // Construct the polygon.
  var polygonMask = new google.maps.Polygon({
    map:map,
    strokeColor: colorTheme,
    strokeOpacity: 1.0,
    strokeWeight: 3,
    fillColor: '#FFFFFF',
    fillOpacity: 1.0,
    paths: maskmap //This mask map variable is defined in the JS file GmapsMask.js
  });

  polygonMask.setMap(map);

  scaledScreen(ilat,ilon,multipler);

  google.maps.event.addListener(map, 'click', function (event) {
    displayCoordinates(event.latLng);
  });	
}

function setRectangle(center,sbs){
    var res = new Array();
    sbs = sbs/2;

    var scale = Math.pow(2,map.getZoom());
    var proj = map.getProjection();
    var wc = proj.fromLatLngToPoint(center);
    var bounds = new google.maps.LatLngBounds();
    var sw = new google.maps.Point(((wc.x * scale) - sbs)/ scale, ((wc.y * scale) - sbs)/ scale);
    bounds.extend(proj.fromPointToLatLng(sw));
    var ne = new google.maps.Point(((wc.x * scale) + sbs)/ scale, ((wc.y * scale) + sbs)/ scale);
    bounds.extend(proj.fromPointToLatLng(ne));

    var opts = {
        bounds: bounds,
        map: map,
        editable:true
    }
   res.push(bounds.getNorthEast().lat()-bounds.getSouthWest().lat());
   res.push(bounds.getNorthEast().lng()-bounds.getSouthWest().lng());
   return res;
   
}


/** Function for dislplaying thr mask of what is showed in the main screen */
function scaledScreen(lat1, lon1,mult){
  if(typeof screenmap !== 'undefined'){
    screenmap.setMap(null);
  }
  lat1 = lat1*Math.PI/180; 	// lat
  lon1 = lon1*Math.PI/180; 	// lon
  var d2 = 0.80 * mult;     	// half x-axis d
  var d1 = 0.45 * mult;  	// half y-axis d
  var brng = 0;     		// direction in degrees (clockwise from north)
  var R = 6371;			// radius of the earth in km
		
  var boundingbox = new Array();		
			
  for(i=0;i<4;i++) {
    if(i%2 == 0){
      var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d1/R) + Math.cos(lat1)*Math.sin(d1/R)*Math.cos(brng) );
      var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d1/R)*Math.cos(lat1), Math.cos(d1/R)-Math.sin(lat1)*Math.sin(lat2));

      boundingbox.push([lat2*180/Math.PI,lon2*180/Math.PI]);
    }
    else {
      var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d2/R) + Math.cos(lat1)*Math.sin(d2/R)*Math.cos(brng) );
      var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d2/R)*Math.cos(lat1), Math.cos(d2/R)-Math.sin(lat1)*Math.sin(lat2));

      boundingbox.push([lat2*180/Math.PI,lon2*180/Math.PI]);
    }	
    brng += (i+1*90)*Math.PI/180 ;
  }
  var screencoords = [
    new google.maps.LatLng(boundingbox[0][0],boundingbox[3][1]),
    new google.maps.LatLng(boundingbox[0][0],boundingbox[1][1]),
    new google.maps.LatLng(boundingbox[2][0],boundingbox[1][1]),
    new google.maps.LatLng(boundingbox[2][0],boundingbox[3][1])
  ];
  screenmap = new google.maps.Polygon({
    paths: screencoords,
    strokeColor: colorTheme,
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: colorTheme,
    fillOpacity: 0.35,
    draggable:true,
    zIndex: 50
  });
  //Disabled the ScreenMap polygon Interaction untill finding out how to get the current zoom level that is modified every geoposition_message
  //screenmap.setMap(map);       

  addListenerOnPolygon(screenmap);

}

/** displayCoordinates(pnt) show on the console the lat lng values of the Geoposition object pnt */
function displayCoordinates(pnt) {
  var lat = pnt.lat();
  lat = lat.toFixed(4);
  var lng = pnt.lng();
  lng = lng.toFixed(4);
   
  var res = setRectangle(new google.maps.LatLng(lat,lng), selBoxSize);
  
  sendMessageData("SEND_GEOPOSITION_MESSAGE",[lat,lng,res[0],res[1]]);
  console.log("Latitude: " + lat + "  Longitude: " + lng);
}

/** Function for switching to the fullscreen mode from the starndard browser mode */
function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) 
  {  // current working methods
    if (document.documentElement.requestFullscreen) 
    {
      document.documentElement.requestFullscreen();
    }
    else if (document.documentElement.msRequestFullscreen)
    {
      document.documentElement.msRequestFullscreen();
    }
    else if (document.documentElement.mozRequestFullScreen)
    {
      document.documentElement.mozRequestFullScreen();
    }
    else if (document.documentElement.webkitRequestFullscreen)
    {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  }
  else
  {
    if (document.exitFullscreen)
    {
      document.exitFullscreen();
    }
    else if (document.msExitFullscreen)
    {
      document.msExitFullscreen();
    }
    else if (document.mozCancelFullScreen)
    {
      document.mozCancelFullScreen();
    }
    else if (document.webkitExitFullscreen)
    {
      document.webkitExitFullscreen();
    }
  }
}

/** point_it(event) gets the posx posy values of the cavas layer assigned */
function point_it(event){
  pos_x = event.clientX - document.getElementById("left").offsetWidth;
  pos_y = event.clientY;
 
  //alert("Hello World - px " + pos_x+ " py "+ pos_y);
}

 function drop()
    {
      
       
      for(var i=0; i<vpois.length;i++)
      {
        setTimeout(function(){
	  addMarker();
	},i,50);
      }
    }
    function addMarker(){
      vmarkers.push(new google.maps.Marker({
        position:vpois[iterator],
        map:map,
        draggable:false,
        icon: imageM,
        clickable: false,
        animation: google.maps.Animation.DROP
      }));
      iterator++;
    }

function deleteM(){
      for(var i=0; i < vmarkers.length ; i++)
      {
        vmarkers[i].setMap(null);
      }
      vmarkers = [];
      iterator = 0;
      vpois = [];
     }

function deleteS(){
  for(i=0; i< vshapes.length; i++){
    vshapes[i].setMap(null);

  }
}




