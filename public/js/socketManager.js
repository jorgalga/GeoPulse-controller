var socket = io.connect(socketIP);
var topicsData = []; // List of topics with data.
var topicsTree = []; // List of the id Topics grouped by level
var topicsID = [];  // List of the id Topics

var MtopicLan;
var StopicLan = [];

var vmarkers = [];
var vpois = [];
var vshapes = [];
var iterator= 0; 
//SENDING Socket Events Functions
function testConnection(){
	socket.emit('test',{my:'data'});
}

function sendMessage(event){
	socket.emit(event, {my:'data'});
}
function sendMessageData(event,data){
	socket.emit(event, {value: data});
}



//RECEIVING Socket Events Functions

socket.on('resp_GET_MTOPICS_BY_IDS1', function(data){
  var list = "";
  var rmenu = "";
  MtopicLan = data.result;
  for(i=0; i < data.result.length;i++)
  {
    list += "<li><div id='mtopic"+(i+1)+"' class='maintopic' onclick='dragSMenu("+(i+1)+");'><a href='#' id='smbutton"+(i+1)+"'   >";
    list += data.result[i][0].toUpperCase();
    list += "</a></div>";
    list += "<div id='roll"+(i+1)+"' style='display:none;'>";
    //Fake data
    //list += "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed fermentum interdum quam id egestas. Nam quis porttitor est, a cursus nisi. Morbi porttitor elit vitae velit dignissim ullamcorper. Suspendisse sollicitudin, lacus eget luctus convallis, lacus sem malesuada purus, id ullamcorper nunc enim vitae erat. Phasellus lorem ante, gravida id augue quis, fermentum mattis diam. Duis nec eros sed orci feugiat venenatis blandit eget est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras rhoncus, elit quis euismod dapibus, sapien lectus mattis nunc, sit amet malesuada purus ante quis nisi. Nam scelerisque tincidunt urna in pulvinar.</p>";
    list += "</div>"
    list += "</li>"
    
    //We build all the Buttons for the controlling the subtopics
    /*
    rmenu += "<div id='controllerDiv"+(i+1)+"' style='height:1200px;' >";
    rmenu += "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed fermentum interdum quam id egestas. Nam quis porttitor est, a cursus nisi. Morbi porttitor elit vitae velit dignissim ullamcorper. Suspendisse sollicitudin, lacus eget luctus convallis, lacus sem malesuada purus, id ullamcorper nunc enim vitae erat. Phasellus lorem ante, gravida id augue quis, fermentum mattis diam. Duis nec eros sed orci feugiat venenatis blandit eget est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras rhoncus, elit quis euismod dapibus, sapien lectus mattis nunc, sit amet malesuada purus ante quis nisi. Nam scelerisque tincidunt urna in pulvinar.</p>";
    rmenu += "</div>" 
    */
  }
  document.getElementById("thelist").innerHTML = list;
  //document.getElementById("scrollable").innerHTML = rmenu;
  
  sendMessageData('GET_SUBTOPICS_BY_IDS', [maintopics,languages.length]);
});

socket.on('resp_GET_SUBTOPICS_BY_IDS', function(data){
  var text = "";
  var rmenu = "";

  for(i=0; i < maintopics.length ; i++){ 
    //console.log(maintopics[i]);
    text = "<ul>";
    for(j=0; j < data.result.length; j++){
      if(maintopics[i] == data.result[j].parent_id){
        // If the subtopic parent_id matchs with the propper topic of the maintopics Array
        subtopics.push(data.result[j].name);

        switch(languages.length){
          case 2:{StopicLan.push([data.result[j].name, data.result[j].name_1]);break;}
          case 3:{StopicLan.push([data.result[j].name, data.result[j].name_1, data.result[j].name_2]);break;}
          case 4:{StopicLan.push([data.result[j].name, data.result[j].name_1, data.result[j].name_2, data.result[j].name_3]);break;}        
        }
       
        text  += "<li ><div class='subtopic' onclick='slideMenu("+(j+1)+","+ data.result[j].topic_type+","+data.result[j].id+");'><a href='#' id='stc"+(j+1)+"' >"+data.result[j].id+ " - " +data.result[j].name+"</a></div></li>";
	rmenu += "<div id='controllerDiv"+(j+1)+"' style='height:100%;display:none;' >";
        rmenu += "<div><h1 id='pcon"+(j+1)+"'> "+data.result[j].name+"</h1></div>";

        for(k = 0; k < controllers.length; k++) {
          if(controllers[k][0] == data.result[j].id ) {
            if(controllers[k][1] == "ExternalApp") {
           
              switch(parseInt(controllers[k][3])){
                case 0:{
                   rmenu += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonLEFT' id='btn"+k+"' type='button' onclick='sendControllerMessage("+k+")' ></div><div class='buttonCAMicon'></div><div style='border-color:"+colorTheme+";' class='buttonRIGHT' id='btn"+(k+1)+"' type='button' onclick='sendControllerMessage("+(k+1)+")' ></div> </div> ";k++;
                }break;
                //Case 1 is ignored because its suposed to be at the same time there is a case 0 so both are built at this last one. 
                       
                default:{
                  rmenu += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonN' id='btn"+k+"' type='button' onclick='sendControllerMessage("+k+")' ><p id='tsp"+k+"' style='color:"+colorTheme+";'>"+controllers[k][4]+"</p></div> </div> ";
                }
              }
            } else if(controllers[k][1] == "SpecialTopic") {
              rmenu += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonN' id='btn"+k+"' onclick='sendControllerMessage("+k+")' ><p id='tsp"+k+"' style='color:"+colorTheme+";'>"+controllers[k][3]+"</p></div> </div> ";
            } else if(controllers[k][1] == "TimeSet") {
              rmenu += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonN' id='btn"+k+"' onclick='sendControllerMessage("+k+")' ><p id='tsp"+k+"' style='color:"+colorTheme+";'>TimeSet: "+controllers[k][2]+"</p></div> </div> ";
            }else if(controllers[k][1] == "POISelect") {
              rmenu += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonLEFT' id='btn"+k+"' type='button' onclick='sendControllerMessage("+k+")' ></div><div class='buttonPOIicon'></div><div style='border-color:"+colorTheme+";' class='buttonRIGHT' id='btn"+(k+1)+"' type='button' onclick='sendControllerMessage("+(k+1)+")' ></div> </div> ";k++;
            } else if(controllers[k][1] == "ObjectSet") {
              rmenu += "<div style='margin-bottom:5px;width:200px;display:inline-block;'>";
              rmenu += "<div><p id='pcon"+(j+1)+"' style='font-weight:600;margin:auto;color:"+colorTheme+";' > Objectset Controller</p></div>";
              for(l=0; l< controllers[k][3].length; l++){
                rmenu += "<div id='os"+controllers[k][3][l][0]+"' class='nonhighlighted' onmouseover='markSelector("+controllers[k][3][l][0]+" , "+controllers[k][2]+")' style='border-color:"+colorTheme+";'><p style='font-size:12px;color:"+colorTheme+";'>"+controllers[k][3][l][1]+"</p></div>";
              }
              rmenu += "</div>";
            } else if(controllers[k][1] == "MapController") {
              //Map Position Controller
              rmenu += "<div class='GeoMapController' style='margin-bottom:10px;display:inline-block;width:150px;'><div class='row1'><div class='buttonUP' onclick='geoMapController(1)' style='border-color:"+colorTheme+";'></div></div><div class='row2'><div class='buttonLEFT' onclick='geoMapController(4)' style='border-color:"+colorTheme+";'></div><div class='buttonRIGHT' onclick='geoMapController(2)' style='border-color:"+colorTheme+";'></div></div><div class='row3'><div class='buttonDOWN' onclick='geoMapController(3)' style='border-color:"+colorTheme+";'></div></div></div> <div class='ZoomMapController' style='margin-top:10px;margin-left:25px;display:inline-block;width:50px;'><div class='buttonPLUS' onclick='geoMapController(5)' style='border-color:"+colorTheme+";'></div><div class='buttonZOOMicon'></div><div class='buttonMINUS' onclick='geoMapController(6)' style='border-color:"+colorTheme+";'></div></div>";
            }
          }
        }
        rmenu += "</div>";
        document.getElementById("scrollable").innerHTML = rmenu;
      }
    }
    text += "</ul>";
    //We get the scrollable div id and assign the text container with the html code
    document.getElementById("roll"+(i+1)).innerHTML = text;
  }
  //Building the selectors
  var lanlist = "";
  if(languages.length > 1){
    for(i = 0; i < languages.length; i++ ){
     lanlist += "<div id='lsel"+i+"' onclick='changeLan("+i+")' class='lanSel'><p>"+languages[i][0]+"</p></div>";
    }
  }

  document.getElementById("lanSelector").innerHTML = lanlist;
  document.getElementById("lsel0").style.backgroundColor = colorTheme;
  document.getElementById("lsel0").style.borderColor = colorTheme;
  document.getElementById("lsel0").style.color = "#FFF";
  if(languages.length > 1){
     for(i = 1; i < languages.length; i++ ){
        document.getElementById("lsel"+i).style.backgroundColor = "#FFF";
        document.getElementById("lsel"+i).style.color = colorTheme;
     }
  }
 
});






socket.on('resp_POI_TOPIC_DEPLOYMENT', function(data) {
  for(var i=0; i < data.result.rows.length ; i++)
  {
    vpois[i] = new google.maps.LatLng(data.result.rows[i].latitude,data.result.rows[i].longitude);
  }
  drop();
});


socket.on('resp_POISHAPE_TOPIC_DEPLOYMENT', function(data) {
  //console.log("-----------------------------------");
  //console.log(data.result);
  var parsed = jQuery.parseJSON(data.result);
  var coordinates = parsed.coordinates;
  
    
  jQuery.each(coordinates, function(){
        
    var polygon = [];        
    jQuery.each(this[0], function(i,val){
      polygon.push(new google.maps.LatLng(val[1],val[0]));
    });
       
    var somePolygon = new google.maps.Polygon({
      paths: polygon,
      strokeColor: '#fff',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: colorTheme,
      fillOpacity: 0.35
    });
    somePolygon.setMap(map);
   
    addListenerOnPolygon(somePolygon);
    vshapes.push(somePolygon);  
  }); 
});


socket.on('resp_AllTable', function(data) {
  topicsData = data;

  

  var parents = [0];
  var parentsperlevel = [];
  var paux = [];
  var vlevel = [];
  var counter = 0;
   
  while(counter < data.result.length){ 
    vlevel = [];

    for(i = 0; i < data.result.length; i++){
      if(isInArray(data.result[i].parent_id , parents)){
        counter ++;        
        
        vlevel.push([data.result[i].id , data.result[i].parent_id]);
        paux.push(data.result[i].id);
        
      }
    }

    parentsperlevel.push(paux);
    parents = [];
    parents = paux;
    paux = [];
    
    topicsTree.push(vlevel);  
  } 
  //console.log(topicsTree);

  if(isOnlySon(100) == false){console.log("It is not child");}else{console.log("It is Child");}
  //getNameById(100);
  var rmenu = [];
  var parents = [];
  var totallength = topicsTree.length;

  for(i=0 ; i < totallength ; i++)
  { 
    var ln = topicsTree[i].length;
    var auxvec = new Array();
    auxvec = topicsTree[i];
    
    if(i==0){
      rmenu[0] = "";
      for(j=0; j < ln ; j++){
        rmenu[0] += "<li><div id='nodelevel1_"+(j+1)+"' class='nodeLevel1' "; 
        
        if(isOnlySon(auxvec[j][0]) == false)
        {
          console.log("It is not son");
          rmenu[0] += "onclick='dragNodeList(2,"+(j+1)+")' ><a>";
        }
        else {
          var ttype = getTypeById(auxvec[j][0]);
          rmenu[0] += "onclick='slideMenuV2("+auxvec[j][0]+","+ttype+","+auxvec[j][0]+")' ><a id='stc"+auxvec[j][0]+"'>";
        }
        rmenu[0] += getNameById(auxvec[j][0]).toUpperCase()+"</a></div>";
        rmenu[0] += "<ul id='list_level2_"+(j+1)+"' style='display:none;'></ul></li>";
      }      
      document.getElementById("thelist2").innerHTML = rmenu[0];           
    }
    else if(i==1){
      for(j=0 ; j < parentsperlevel[0].length ;  j++ ){rmenu[j] = "";}
      for(j=0 ; j < ln ; j++) {  
        var container = parentsperlevel[0].indexOf(auxvec[j][1]);

        rmenu[container] += "<li><div id='nodelevel2_"+(j+1)+"' class='nodeLevel2'";

        if(isOnlySon(auxvec[j][0]) == false){
          rmenu[container] += "onclick='dragNodeList(3,"+(j+1)+")' ><a>";
        }
        else{
          var ttype = getTypeById(auxvec[j][0]);
          rmenu[container] += "onclick='slideMenuV2("+auxvec[j][0]+","+ttype+","+auxvec[j][0]+")' ><a id='stc"+auxvec[j][0]+"'>";
        }
        rmenu[container] += getNameById(auxvec[j][0])+"</a></div>";
        rmenu[container] += "<ul id='list_level3_"+(j+1)+"' style='display:none;'></ul></li>";
      } 
      for(j=0 ; j < parentsperlevel[0].length ;  j++ ){
        document.getElementById("list_level2_"+(j+1)).innerHTML = rmenu[j];
      }
      //console.log(rmenu);
    }
    else if(i == 2){
      
      for(j=0 ; j < parentsperlevel[1].length ;  j++ ){rmenu[j] = "";}
      for(j=0 ; j < ln ; j++) {
        var container = parentsperlevel[1].indexOf(auxvec[j][1]);
        rmenu[container] += "<li><div id='nodelevel3_"+(j+1)+"' class='nodeLevel3'"; 
        
        if(isOnlySon(auxvec[j][0]) == false){
          rmenu[container] += "onclick='dragNodeList(4,"+(j+1)+")' ><a>";
        }
        else{
          var ttype = getTypeById(auxvec[j][0]);
          rmenu[container] += "onclick='slideMenuV2("+auxvec[j][0]+","+ttype+","+auxvec[j][0]+")' ><a id='stc"+auxvec[j][0]+"'>";
          
        }
        rmenu[container] += getNameById(auxvec[j][0])+"</a></div>";             
        rmenu[container] += "<ul id='list_level4_"+(j+1)+"' style='display:none;'></ul></li>";
      }
      for(j=0 ; j < parentsperlevel[1].length ;  j++ ){
        document.getElementById("list_level3_"+(j+1)).innerHTML = rmenu[j];
      }
      
    }
    else if(i == 3){
      for(j=0 ; j < parentsperlevel[2].length ;  j++ ){rmenu[j] = "";}
      for(j=0 ; j < ln ; j++) {
        var container = parentsperlevel[2].indexOf(auxvec[j][1]);
        rmenu[container] += "<li><div id='nodelevel4_"+(j+1)+"' class='nodeLevel4' ><a>"+getNameById(auxvec[j][0])+"</a></div>";

        
        rmenu[container] += "<ul id='list_level5_"+(j+1)+"' style='display:none;'></ul></li>";
      }
      for(j=0 ; j < parentsperlevel[2].length ;  j++ ){
        document.getElementById("list_level4_"+(j+1)).innerHTML = rmenu[j];
      }
      
    }
  }
  
  var Cdiv = "";   
  for(ind=0 ; ind < data.result.length ; ind++){
     topicsID.push(data.result[ind].id);
     //console.log(data.result[ind].id); 
     if(isOnlySon(data.result[ind].id) == true){
       //console.log("It is child");
       
       Cdiv += "<div id='controllerDivTopic"+(data.result[ind].id)+"' style='height:100%;display:none;' >";
       Cdiv += "<div><h1 id='controllerDiv"+(data.result[ind].id)+"'> "+data.result[ind].name+"</h1></div>";
       console.log(data.result[ind].name);
      

       console.log(controllers.length);
       for(k = 0; k < controllers.length; k++) {
          if(controllers[k][0] == data.result[ind].id ) {
            //console.log("Match controller");
            if(controllers[k][1] == "ExternalApp") {
           
              switch(parseInt(controllers[k][3])){
                case 0:{
                   Cdiv += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonLEFT' id='btn"+k+"' type='button' onclick='sendControllerMessage("+k+")' ></div><div class='buttonCAMicon'></div><div style='border-color:"+colorTheme+";' class='buttonRIGHT' id='btn"+(k+1)+"' type='button' onclick='sendControllerMessage("+(k+1)+")' ></div> </div> ";k++;
                }break;
                //Case 1 is ignored because its suposed to be at the same time there is a case 0 so both are built at this last one. 
                       
                default:{
                  Cdiv += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonN' id='btn"+k+"' type='button' onclick='sendControllerMessage("+k+")' ><p id='tsp"+k+"' style='color:"+colorTheme+";'>"+controllers[k][4]+"</p></div> </div> ";
                }
              }
            } else if(controllers[k][1] == "SpecialTopic") {
              Cdiv += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonN' id='btn"+k+"' onclick='sendControllerMessage("+k+")' ><p id='tsp"+k+"' style='color:"+colorTheme+";'>"+controllers[k][3]+"</p></div> </div> ";
            } else if(controllers[k][1] == "TimeSet") {
              Cdiv += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonN' id='btn"+k+"' onclick='sendControllerMessage("+k+")' ><p id='tsp"+k+"' style='color:"+colorTheme+";'>TimeSet: "+controllers[k][2]+"</p></div> </div> ";
            }else if(controllers[k][1] == "POISelect") {
              Cdiv += "<div style='margin-bottom:10px;'><div style='border-color:"+colorTheme+";' class='buttonLEFT' id='btn"+k+"' type='button' onclick='sendControllerMessage("+k+")' ></div><div class='buttonPOIicon'></div><div style='border-color:"+colorTheme+";' class='buttonRIGHT' id='btn"+(k+1)+"' type='button' onclick='sendControllerMessage("+(k+1)+")' ></div> </div> ";k++;
            } else if(controllers[k][1] == "ObjectSet") {
              Cdiv += "<div style='margin-bottom:5px;width:200px;display:inline-block;'>";
              Cdiv += "<div><p id='pcon"+(j+1)+"' style='font-weight:600;margin:auto;color:"+colorTheme+";' > Objectset Controller</p></div>";
              for(l=0; l< controllers[k][3].length; l++){
                Cdiv += "<div id='os"+controllers[k][3][l][0]+"' class='nonhighlighted' onmouseover='markSelector("+controllers[k][3][l][0]+" , "+controllers[k][2]+")' style='border-color:"+colorTheme+";'><p style='font-size:12px;color:"+colorTheme+";'>"+controllers[k][3][l][1]+"</p></div>";
              }
              Cdiv += "</div>";
            } else if(controllers[k][1] == "MapController") {
              //Map Position Controller
              rmenu += "<div class='GeoMapController' style='margin-bottom:10px;display:inline-block;width:150px;'><div class='row1'><div class='buttonUP' onclick='geoMapController(1)' style='border-color:"+colorTheme+";'></div></div><div class='row2'><div class='buttonLEFT' onclick='geoMapController(4)' style='border-color:"+colorTheme+";'></div><div class='buttonRIGHT' onclick='geoMapController(2)' style='border-color:"+colorTheme+";'></div></div><div class='row3'><div class='buttonDOWN' onclick='geoMapController(3)' style='border-color:"+colorTheme+";'></div></div></div> <div class='ZoomMapController' style='margin-top:10px;margin-left:25px;display:inline-block;width:50px;'><div class='buttonPLUS' onclick='geoMapController(5)' style='border-color:"+colorTheme+";'></div><div class='buttonZOOMicon'></div><div class='buttonMINUS' onclick='geoMapController(6)' style='border-color:"+colorTheme+";'></div></div>";
            }  
          }
        }
       Cdiv += "</div>";
     }     
   }
   
   document.getElementById("scrollable").innerHTML = Cdiv;
});

function isInArray(value, array){
  return array.indexOf(value) > -1;
}
function isOnlySon(value){
  for(index=0; index < topicsData.result.length; index++){

    if(topicsData.result[index].parent_id == value){
      return false;
    }
  }
  return true;
}

function getNameById(value){
  for(index=0; index < topicsData.result.length; index++){
    if(topicsData.result[index].id == value){
      return topicsData.result[index].name;
    }
  }
}
function getTypeById(value){
  for(index=0; index < topicsData.result.length; index++){
    if(topicsData.result[index].id == value){
      return topicsData.result[index].topic_type;
    }
  }
}     

