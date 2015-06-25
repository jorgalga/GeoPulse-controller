//XML Builder of the topics and Specific menus for the site.
var dscroll = document.getElementById("scroller");
var xmlDoc = loadXMLDoc("xml/settings.xml");

//Global variables loaded from the xml
var languages = new Array();
var maintopics = new Array();
var subtopics = new Array();
var controllers = new Array();
var districts = new Array(); 		// List of all the subtopics which require to display the shapefiles of the table districts 

var socketIP;
var centerLatMap;
var centerLonMap;
var zoomlevel;
var latToShow;
var lonToShow;
var selBoxSize;
var centerLatScr;
var centerLonScr;
var colorTheme;

var ogg;
if(xmlDoc != null) {
  //We get the list of object groups which in fact are the main topics
  var og = xmlDoc.getElementsByTagName("socket");
  socketIP = og[0].childNodes[0].nodeValue;
    
  og = xmlDoc.getElementsByTagName("lonMapPos");
  centerLonMap = og[0].childNodes[0].nodeValue;
  og = xmlDoc.getElementsByTagName("latMapPos");
  centerLatMap = og[0].childNodes[0].nodeValue;
    
  og = xmlDoc.getElementsByTagName("centerLonScr");
  centerLonScr = og[0].childNodes[0].nodeValue;
  og = xmlDoc.getElementsByTagName("centerLatScr");
  centerLatScr = og[0].childNodes[0].nodeValue;

  og = xmlDoc.getElementsByTagName("zoomLevel");
  zoomlevel = og[0].childNodes[0].nodeValue;   

  og = xmlDoc.getElementsByTagName("latToShow");
  latToShow = og[0].childNodes[0].nodeValue; 
  og = xmlDoc.getElementsByTagName("lonToShow");
  lonToShow = og[0].childNodes[0].nodeValue;

  og = xmlDoc.getElementsByTagName("selBoxSize");
  selBoxSize = og[0].childNodes[0].nodeValue;
      
  og = xmlDoc.getElementsByTagName("idTop");
  for(i=0; i <og.length ; i++){
    maintopics[i] = og[i].childNodes[0].nodeValue;
  }

  og = xmlDoc.getElementsByTagName("colorTheme");
  colorTheme = og[0].childNodes[0].nodeValue;
  console.log(colorTheme);


  og = xmlDoc.getElementsByTagName("LanguageList");
  for(i = 0; i < og.length ; i++){
    ogg = og[i].getElementsByTagName("lan");

    for(j = 0; j < ogg.length; j++) {
      languages.push([ogg[j].getAttribute("id"),ogg[j].childNodes[0].nodeValue]);
      console.log(ogg[j].getAttribute("id")+ " - "+ogg[j].childNodes[0].nodeValue)
    }
  }
  og = xmlDoc.getElementsByTagName("ObjectGroup");
  for(i=0; i < og.length ; i++){
    
    if(og[i].getAttribute("districts") == "true"){districts.push(og[i].getAttribute("Topic"));}

    ogg = og[i].getElementsByTagName("GUIObject");
    for(j=0; j < ogg.length; j++) {
      //console.log(j+" "+ ogg[j].getAttribute("ObjectType"));

      if(ogg[j].getAttribute("ObjectType") == "ExternalApp" ){
        controllers.push([og[i].getAttribute("Topic"),ogg[j].getAttribute("ObjectType"),ogg[j].getAttribute("AppId"),ogg[j].getAttribute("ButtonId"),ogg[j].getAttribute("name"),ogg[j].getAttribute("btnType"), false]);
      } else if(ogg[j].getAttribute("ObjectType") == "SpecialTopic") {
        controllers.push([og[i].getAttribute("Topic"),ogg[j].getAttribute("ObjectType"),getCodeFromCommand(ogg[j].getAttribute("Command")),ogg[j].getAttribute("name")]);
      } else if(ogg[j].getAttribute("ObjectType") == "TimeSet") {
        controllers.push([og[i].getAttribute("Topic"),ogg[j].getAttribute("ObjectType"),ogg[j].getAttribute("Year")]);
      } else if(ogg[j].getAttribute("ObjectType") == "POISelect"){
        controllers.push([og[i].getAttribute("Topic"),ogg[j].getAttribute("ObjectType"),ogg[j].getAttribute("Select")]);
      } else if(ogg[j].getAttribute("ObjectType") == "ObjectSet") {
        var oggg = ogg[j].getElementsByTagName("Element");
        var vecElements = new Array();
        console.log("Num selectors: "+oggg.length);
        
        for(k=0; k < oggg.length ; k++){
          vecElements.push([oggg[k].getAttribute("Id"),oggg[k].getAttribute("name")]);
          console.log("Element Id:"+oggg[k].getAttribute("Id"));
        }
        controllers.push([og[i].getAttribute("Topic"),ogg[j].getAttribute("ObjectType"),ogg[j].getAttribute("Type"),vecElements]);
      } else if(ogg[j].getAttribute("ObjectType") == "MapController") {
         controllers.push([og[i].getAttribute("Topic"),ogg[j].getAttribute("ObjectType"),ogg[j].getAttribute("name")]);
      }
    }
  }
  console.log(controllers.length); 
  //printAllControllers();
}

function printAllControllers(){
  var str;
  for(i = 0; i < controllers.length; i++){
    str = "";
    for(j=0;j< controllers[i].length; j++){
      str += controllers[i][j]  + " "; 
    }
    console.log(str);
  }
}
function loadXMLDoc(XMLFile) {
  var xmlDoc;
  if(window.XMLHttpRequest) {
    xmlDoc = new window.XMLHttpRequest();
    xmlDoc.open("GET", XMLFile, false);
    xmlDoc.send("");
    return xmlDoc.responseXML;
  }
  // para IE 5 y IE 6
  else if (ActiveXObject("Microsoft.XMLDOM")) {
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.load(XMLFile);
    return xmlDoc;
  }
  alert("Error cargando el documento.");
  return null;
}

function getCodeFromCommand(str) {
  if(str == "GoToPast"){return 45;}
  if(str == "Reset"){return 44;} 
  if(str == "GoToFuture"){return 46;}
}


