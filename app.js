//Database Conection
var connectionString = "pg://geopulse:GeoPulse@duffman.aec.at:5432/geopulse_fribourg";

var hostdg = "192.168.5.164";
//var hostdg = "192.168.5.100";
var portdg = 9292;
var dgram = require("dgram");
var udpclient = dgram.createSocket("udp4");
//HTTP express server with Socket.io 
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 1);

var test;

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8000; 
server.listen(port);

//Postgress module for SQL requests
var pg = require('pg'); 

//----------------------------------------------------------------------------------------
//SOCKET handle of the events ------------------------------------------------------------
io.on('connection', function(socket){
  console.log('SocketIO: User Connected...');
  
  //EVENT 'TOPIC_BUILD_DATALIST'
  socket.on('GET_MTOPICS_BY_IDS', function(data){
    console.log("Event entering");
    var MtopicNames = new Array();
    var TotalTopicList = new Array();
   
    
    pg.connect(connectionString, function(err, client,done) {
      if(err){
        console.log(err);
      }
      else{
        for(i=0; i < data.value[0].length ; i++)
        {
          var str = "SELECT name";
          for(j=1 ; j <data.value[1]; j++){str += ", name_"+j+"";}
          str += " FROM topic_table WHERE id="+data.value[0][i]+";";
          
          client.query (str, function(err,result){
            done();
            if(err){
              console.log(err);
            }
            else{                          
              switch(data.value[1]){   
                case 1:{MtopicNames.push([result.rows[0].name]);}break;
                case 2:{MtopicNames.push([result.rows[0].name,result.rows[0].name_1]);}break;
                case 3:{MtopicNames.push([result.rows[0].name,result.rows[0].name_1,result.rows[0].name_2]);}break;
                case 4:{MtopicNames.push([result.rows[0].name,result.rows[0].name_1,result.rows[0].name_2,result.rows[0].name_3]);}
 	      }              
            }
          });
        }  
      }
    });    
    setTimeout(function(){socket.emit('resp_GET_MTOPICS_BY_IDS', {result: MtopicNames});},100*data.value.length);   
    
     pg.connect(connectionString, function(err, client, done) {
      if(err){
        console.log(err);
      }
      else{
        var str = "SELECT * FROM topic_table ORDER BY id";
        client.query(str, function(err,result) {
          done();
          if(err){
            console.log(err);   
          }
          else{
            socket.emit('resp_AllTable',{result:result.rows});
          }
        });
      }
    });


  });

   socket.on('GET_SUBTOPICS_BY_IDS', function(data){
     var MtopicNames = new Array();
     pg.connect(connectionString, function(err, client,done) {
       if(err){
         console.log(err);
       }
       else{
         for(i=0; i < data.value[0].length ; i++){
           var str = "SELECT name,id, parent_id , topic_type";
           for(j = 1 ;  j < data.value[1];j++){str+=", name_"+j+"" ;}
           str += "  FROM topic_table WHERE parent_id="+data.value[0][i]+" AND active=TRUE;";
           client.query(str , function(err, result){
             done();
             if(err){
               console.log(err);
             }
             else{
               MtopicNames = MtopicNames.concat(result.rows);
             }
           });
         }
         //setTimeout(function(){socket.emit('resp_GET_SUBTOPICS_BY_IDS', {result: MtopicNames});},100*data.value.length);
         setTimeout(function(){
           socket.emit('resp_GET_SUBTOPICS_BY_IDS', {result: MtopicNames});
         },100*data.value.length);
       }
     });    
   });

   socket.on('GET_SUBTOPICS_BY_IDS_2', function(data){
     var MtopicNames = new Array();
     pg.connect(connectionString, function(err, client,done) {
       if(err){
         console.log(err);
       }
       else{
         for(i=0; i < data.value[0].length ; i++){
           var str = "SELECT name,id, parent_id , topic_type";
           for(j = 1 ;  j < data.value[1];j++){str+=", name_"+j+"" ;}
           str += "  FROM topic_table WHERE parent_id="+data.value[0][i]+" AND active=TRUE;";
           client.query(str , function(err, result){
             done();
             if(err){
               console.log(err);
             }
             else{
               MtopicNames = MtopicNames.concat(result.rows);
             }
           });
         }
         //setTimeout(function(){socket.emit('resp_GET_SUBTOPICS_BY_IDS', {result: MtopicNames});},100*data.value.length);
         setTimeout(function(){
           socket.emit('resp_GET_SUBTOPICS_BY_IDS_2', {result: MtopicNames});
         },100*data.value.length);
       }
     });    
   });
   
  socket.on('SEND_LINZTOPIC_MESSAGE', function(data){
    //console.log("TOPIC MESSAGE ID", data.value);     

    var message = new Buffer(24);

    message.writeUInt32LE(20,0);
    message.writeUInt32LE(10,4);  			// Message Code
    message.writeUInt32LE(1,8);
    message.writeUInt32LE(parseInt(data.value),12);
    message.writeUInt32LE(0,16);
    message.writeUInt32LE(0,20);
    
    //console.log(message,port,host);
    udpclient.send(message,0,message.length,portdg,hostdg);
  });
  
  socket.on('SEND_EXTERNAL_APP_CMD_MESSAGE', function(data) {
    var message = new Buffer(28);

    message.writeUInt32LE(24,0);
    message.writeUInt32LE(21,4);  			// Message Code
    message.writeUInt32LE(1,8);
    message.writeUInt32LE(parseInt(data.value[0]),12);
    message.writeUInt32LE(parseInt(data.value[1]),16);
    message.writeUInt32LE(0,20);
    message.writeUInt32LE(0,24);

    udpclient.send(message,0,message.length,portdg,hostdg);
  });

  socket.on('SEND_TOPICSPECIAL_MESSAGE', function(data){
    var message;
    console.log(data.value);   

    switch(parseInt(data.value)){
      
      case 45:{
        message = new Buffer(24);
        message.writeUInt32LE(20,0);
        message.writeUInt32LE(13,4); 			// Message Code
        message.writeUInt32LE(1,8);
        message.writeUInt32LE(0,12);
        message.writeUInt32LE(0,16);
        message.writeUInt32LE(4294967295,20);
        udpclient.send(message,0,message.length,portdg,hostdg);  
        
      }break;
      case 46:{
        message = new Buffer(24);
        message.writeUInt32LE(20,0);
        message.writeUInt32LE(13,4); 			// Message Code
        message.writeUInt32LE(1,8);
        message.writeUInt32LE(0,12);
        message.writeUInt32LE(0,16);
        message.writeUInt32LE(1,20);
        udpclient.send(message,0,message.length,portdg,hostdg);       
      }break;
      default: {
        message = new Buffer(24);
        message.writeUInt32LE(20,0);
        message.writeUInt32LE(18,4); 			// Message Code
        message.writeUInt32LE(1,8);
        message.writeUInt32LE(parseInt(data.value),12);
        message.writeUInt32LE(0,16);
        message.writeUInt32LE(0,20);
        udpclient.send(message,0,message.length,portdg,hostdg);
      }
    } 
  });
  
  socket.on('SEND_TIMESET_MESSAGE', function(data){
    var message = new Buffer(24);

    message.writeUInt32LE(20,0);
    message.writeUInt32LE(15,4); 			// Message Code
    message.writeUInt32LE(1,8);
    message.writeUInt32LE(parseInt(data.value),12);
    message.writeUInt32LE(0,16);
    message.writeUInt32LE(0,20);

    udpclient.send(message,0,message.length,portdg,hostdg);
  });

  socket.on('SEND_GEOPOSITION_MESSAGE', function(data){
    console.log(data.value[0]+" - "+data.value[1]+" - "+data.value[2]+" - "+data.value[3]);
    var message = new Buffer(40);
    
    message.writeUInt32LE(36,0);
    message.writeUInt32LE(11,4); 			// Message Code
    message.writeUInt32LE(1,8);
    message.writeFloatLE(parseFloat(data.value[0]),12);
    message.writeFloatLE(parseFloat(data.value[1]),16);
    message.writeFloatLE(parseFloat(data.value[2]),20);
    message.writeFloatLE(parseFloat(data.value[3]),24);
    message.writeUInt32LE(1,28);
    message.writeUInt32LE(0,32);
    message.writeUInt32LE(0,36);

    console.log(message);
    
    udpclient.send(message,0,message.length,portdg,hostdg);
  });

  socket.on('POI_TOPIC_DEPLOYMENT', function(data){
    console.log('poi topic deployment');

    pg.connect(connectionString, function(err, client,done) {
      if(err){
        console.log(err);
      }
      else{
        
        var poiShapes = new Array();
        var strquery1 = 'SELECT name,id,longitude,latitude FROM poi_table PT WHERE PT.id IN (SELECT poi_id FROM poi_topic_table WHERE topic_id = '+data.value+') AND PT.shape_id = 0';
        client.query(strquery1, function(err, result) {
          done();
          if(err) {
            console.log(err);
          }
          else{

            console.log(result.rows.length);
            socket.emit('resp_POI_TOPIC_DEPLOYMENT', { result: result});  
          }
        });
        var strquery2 = 'SELECT PT.shape_id FROM poi_table PT WHERE PT.id IN (SELECT poi_id FROM poi_topic_table WHERE topic_id = '+data.value+') AND PT.shape_id <> 0';
        client.query(strquery2, function(err, result) {
          done();
          if(err) {
            console.log(err);
          }
          else{
            for(i=0; i < result.rows.length ; i++ ){
              client.query("SELECT ST_AsGeoJSON(the_geom) FROM poi_shapes WHERE id="+result.rows[i].shape_id+";", function(err, result){
                if(err){
                  console.log(err);
                }
                else{
                   socket.emit('resp_POISHAPE_TOPIC_DEPLOYMENT', { result: result.rows[0].st_asgeojson});
                }
              });
            }
          }
        });
      }
    });
  });
  
  socket.on('SEND_DISTRICTS_DEPLOYMENT', function(data){
    console.log('Districts deployment');
    pg.connect(connectionString, function(err, client,done) {
      if(err){
        console.log(err);
      }
      else{
         client.query("SELECT ST_AsGeoJSON(the_geom) FROM districts" , function(err,result){
          if(err){
            
          }
          else{
            for(i=0; i < result.rows.length; i++){
              socket.emit('resp_POISHAPE_TOPIC_DEPLOYMENT', { result: result.rows[i].st_asgeojson});
            }
          }
        });      
      }
    });
  });

  socket.on('SEND_GEOMOVE_MESSAGE', function(data){
    console.log(data.value);
    var move;    
    var amount = 0.002;
    var amount2 = 10.0;

    switch(parseInt(data.value)){
      case 1:{move = 1;}break;
      case 2:{move = 2;}break;
      case 3:{move = 1; amount = amount * -1;}break;
      case 4:{move = 2; amount = amount * -1;}break;
      case 5:{move = 3; amount = amount2 * -1;}break;
      case 6:{move = 3; amount = amount2;}break;
    }    
    var message = new Buffer(28);
    
    message.writeUInt32LE(24,0);
    message.writeUInt32LE(12,4);			// Message Code
    message.writeUInt32LE(1,8);
    message.writeUInt32LE(move,12);
    message.writeFloatLE(amount,16);
    message.writeUInt32LE(0,20);
    message.writeUInt32LE(0,24);

    udpclient.send(message,0,message.length,portdg,hostdg);
  
  });

  socket.on('SEND_POISELECT_MESSAGE', function(data){
    console.log(data.value);
    var move;
    if(data.value == 'previous'){move=2;}
    if(data.value == 'next'){move=3;}

    var message = new Buffer(28);
    
    message.writeUInt32LE(24,0);
    message.writeUInt32LE(14,4);			// Message Code
    message.writeUInt32LE(1,8);
    message.writeUInt32LE(move,12);
    message.writeUInt32LE(0,16);
    message.writeUInt32LE(0,20);
    message.writeUInt32LE(0,24);

    udpclient.send(message,0,message.length,portdg,hostdg);
  });


  socket.on('SEND_OBJECT_SELECTION_MESSAGE', function(data) {
    console.log(data.value[0][1]);
    var message = new Buffer(20+(4*data.value.length)+4+4);

    message.writeUInt32LE(20+(4*data.value.length)+4,0);
    message.writeUInt32LE(20,4);			// Message Code
    message.writeUInt32LE(1,8);
    message.writeUInt32LE(data.value[0][1],12);
    message.writeUInt32LE(data.value.length,16);
    for(i=0; i< data.value.length; i++){
       message.writeUInt32LE(data.value[i][0],20+(4*i));
    }
    message.writeUInt32LE(0,20+(4*data.value.length))
    message.writeUInt32LE(0,20+(4*data.value.length)+4);

    udpclient.send(message,0,message.length,portdg,hostdg);
  });
  
  socket.on('SEND_LANGUAGE_MESSAGE', function(data){
     var message = new Buffer(24);

     message.writeUInt32LE(20,0);
     message.writeUInt32LE(23,4);			// Message Code
     message.writeUInt32LE(1,8); 
     message.writeUInt32LE(data.value,12);
     message.writeUInt32LE(0,16);
     message.writeUInt32LE(0,20);

     udpclient.send(message,0,message.length,portdg,hostdg);
  });

});// End of the Events handler scope






















