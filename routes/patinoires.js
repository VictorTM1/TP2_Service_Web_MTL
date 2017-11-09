var http = require("http");
var xmldom = require("xmldom");
var db_pat = require('./db_patinoires.js');
var db_glis = require('./db_glissades.js');


function updateBDGlissades(){
  //Source liste Glissoire XML
  var options_glissade = {
    host: "www2.ville.montreal.qc.ca",
    path: "/services_citoyens/pdf_transfert/L29_GLISSADE.xml"
  };
  console.log("start");
  //Requete Http sur options_glissade
  var request = http.get(options_glissade, function (result) {
    //verification code erreur 200
    console.log("ok");
    if (result.statusCode !== 200) {
      callback("HTTP Error: " + result.statusCode);
    } else {
      //Reception du fichier XML
      var xml_glissades = "";
      result.setEncoding("utf-8");
      result.on("data", function(morceau){
        xml_glissades += morceau;
      });
      result.on("end", function(){
        //Parse xml_patinoires
        console.log("ok1");
        var domRoot = new xmldom.DOMParser().parseFromString(xml_glissades);
        var list_glissades = domRoot.getElementsByTagName("glissade");
        var json_glissades = glissadesToJson(list_glissades);

        insertJsonDBGlissades(json_glissades, "glissade");
        });
    }
  });
}


function updateBDPatinoires(){
  //Source liste patinoires XML
  var options_patinoires = {
    host: "www2.ville.montreal.qc.ca",
    path: "/services_citoyens/pdf_transfert/L29_PATINOIRE.xml"
  };
  //Requete Http sur options_patinoires
  var request = http.get(options_patinoires, function (result) {
    //verification code erreur 200
    if (result.statusCode !== 200) {
      callback("HTTP Error: " + result.statusCode);
    } else {
      //Reception du fichier XML
      var xml_patinoires = "";
      result.setEncoding("utf-8");
      result.on("data", function(morceau){
        xml_patinoires += morceau;
      });
      result.on("end", function(){
        //Parse xml_patinoires
        var domRoot = new xmldom.DOMParser().parseFromString(xml_patinoires);
        var list_patinoires = domRoot.getElementsByTagName("patinoire");
        var json_patinoires = patinoiresToJson(list_patinoires);

        insertJsonDdPatinoires(json_patinoires);
        });
    }
  });
}


function insertJsonDbPatinoires(json){
  //appel de la fonction getConnection de la classe db_patinoires.js
  db_pat.getConnection(function(err, db){
    if(err){
      console.log("erreur");
    }else{
      db.collection('patinoires', function (err, patinoires){
          patinoires.insert(json);
          console.log("patinoire");
      });
      db.close();
    }
  });
}

function insertJsonDBGlissades(json){
  //appel de la fonction getConnection de la classe db_glissades.js
  db_glis.getConnection(function(err, db){
    if(err){
      console.log("erreur");
    }else{
      db.collection('glissades', function (err, glissades){
          glissades.insert(json);
          console.log("glissade");
      });
      db.close();
    }
  });
}

function glissadesToJson(list_glissades){
  //Formation du JSON
  var tab_glissade = [];
  for(var i = 0; i < list_glissades.length; i++){
    var glissade = list_glissades[i];
    //GET valeurs glissade i
    var nom = glissade.getElementsByTagName("nom")[0].childNodes[0].nodeValue;
    var arrondissement = glissade.getElementsByTagName("arrondissement")[0];
      var nom_arr = arrondissement.getElementsByTagName("nom_arr")[0].childNodes[0].nodeValue;
      var cle_arr = arrondissement.getElementsByTagName("cle")[0].childNodes[0].nodeValue;
      var date_maj = arrondissement.getElementsByTagName("date_maj")[0].childNodes[0].nodeValue;
    if(glissade.getElementsByTagName("ouvert")[0].childNodes[0]){
      var ouvert = glissade.getElementsByTagName("ouvert")[0].childNodes[0].nodeValue;
    }
    if(glissade.getElementsByTagName("deblaye")[0].childNodes[0]){
      var deblaye = glissade.getElementsByTagName("deblaye")[0].childNodes[0].nodeValue;
    }
    if(glissade.getElementsByTagName("condition")[0].childNodes[0]){
      var condition = glissade.getElementsByTagName("condition")[0].childNodes[0].nodeValue;
    }
  }
  //Push glissade i
  tab_glissade.push({
    "nom" : nom,
    "nom_arr" : nom_arr,
    "cle_arr" : cle_arr,
    "date_maj" : date_maj,
    "deblaye" : deblaye,
    "condition" : condition,
    "ouvert" : ouvert
  });
}

function patinoiresToJson(list_patinoires){
  //Formation du JSON
  var tab_patinoire = [];
  //itere patinoires
  for(var i = 0; i < list_patinoires.length; i++){
    var patinoire = list_patinoires[i];
    //GET valeurs patinoire i
    var nom = patinoire.getElementsByTagName("nom")[0].childNodes[0].nodeValue;
    var arrondissement = patinoire.getElementsByTagName("arrondissement")[0];
      var nom_arr = arrondissement.getElementsByTagName("nom_arr")[0].childNodes[0].nodeValue;
      var cle_arr = arrondissement.getElementsByTagName("cle")[0].childNodes[0].nodeValue;
      var date_maj = arrondissement.getElementsByTagName("date_maj")[0].childNodes[0].nodeValue;
    if(patinoire.getElementsByTagName("ouvert")[0].childNodes[0]){
      var ouvert = patinoire.getElementsByTagName("ouvert")[0].childNodes[0].nodeValue;
    }
    if(patinoire.getElementsByTagName("deblaye")[0].childNodes[0]){
      var deblaye = patinoire.getElementsByTagName("deblaye")[0].childNodes[0].nodeValue;
    }
    if(patinoire.getElementsByTagName("arrose")[0].childNodes[0]){
      var arrose = patinoire.getElementsByTagName("arrose")[0].childNodes[0].nodeValue;
    }
    if(patinoire.getElementsByTagName("resurface")[0].childNodes[0]){
      var resurface = patinoire.getElementsByTagName("resurface")[0].childNodes[0].nodeValue;
    }
    if(patinoire.getElementsByTagName("condition")[0].childNodes[0]){
      var condition = patinoire.getElementsByTagName("condition")[0].childNodes[0].nodeValue;
    }
    //Push patinoire i
    tab_patinoire.push({
      "nom" : nom,
      "nom_arr" : nom_arr,
      "cle_arr" : cle_arr,
      "date_maj" : date_maj,
      "deblaye" : deblaye,
      "arrose" : arrose,
      "resurface" : resurface,
      "condition" : condition,
      "ouvert" : ouvert
    });
  }
  return tab_patinoire;
}

function testBd(){
  db_pat.getConnection(function(err, db){
    if(err){
      console.log("erreur");
    }else{
      db.collection('patinoires', function (err, patinoires){
        patinoires.count(function (err, result){
          console.log(result);
        });
        patinoires.find({nom_arr:"Saint-Léonard"}).toArray(function (err, patinoires){
          console.log(patinoires);
        });
      });
      db.close();
    }
  });
}

//Main
//updateBDPatinoires();
//updateBDGlissades();
testBd();
