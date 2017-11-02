var http = require("http");
var xmldom = require("xmldom");
var db_pat = require('./db_patinoires.js');

  //Source list patinoires XML
  var options = {
    host: "www2.ville.montreal.qc.ca",
    path: "/services_citoyens/pdf_transfert/L29_PATINOIRE.xml"
  };
  //Requete Http sur options
  var request = http.get(options, function (result) {
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

        insertJsonDB(json_patinoires);


        });
    }
  });

function insertJsonDB(json_patinoires){
  //appel de la fonction getConnection de la classe db_patinoires.js
  db_pat.getConnection(function(err, db){
    if(err){
      console.log("erreur");
    }else{
      db.collection('patinoires', function (err, patinoires){
          patinoires.insert(json_patinoires);
      });
      db.close();
    }
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
