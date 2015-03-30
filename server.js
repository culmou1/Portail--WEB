var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.get('/', function(req, res) {
    res.sendfile('index.html');
});

app.get('/Daehli',function(req,res){
  res.send("Bonjour sur la page à daehli");
});

app.use(express.static(__dirname +'/script'));
/* Maintenant le fichier script dans notre PATH est un serveur */
/* On peut maintenant faire le lien dans le script. <script type="text/javascript" src="/springy_m.js"></script>

server.listen(8070, function(){
  console.log('listening on localhost:8070');
});

function getRandomColor () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function tri (pq) {
    for(var d=pq.length; d > 0; d--) {
      for(var i=0; i<d-1; i++) {
          if(pq[i][2] < pq[i+1][2]) {
              var tmp= pq[i];
              pq[i]=pq[i+1];
              pq[i+1]=tmp;
          }
      }
    }
    return pq;
}

io.on('connection', function(socket) {
    console.log('a user connected');

    //Reçoit le nombre de sommets et la densité et renvoie le JSON du graphe
    socket.on('input_value', function(data) {
        var valeur = data.split(" "); //valeur[0]=sommets, valeur[1]=densite
        var sommets = valeur[0];
        var densite = valeur[1];
        //Calcul le nombre total d'arretes en fonction de la densité
        var nb_arretes = Math.round(((sommets*(sommets-1))/2)* (densite/100));

        //Creation du JSON de sortie
        var json = {
          nodes: [],
          edges: []
        };

        //Creation de la liste d'ajacence de sortie
        var adjalist = [];

        for (var i = 0; i < sommets; i++) {
          var temp = i.toString();
          json.nodes.push(temp); //Implemente la liste de sommets du JSON
          adjalist[i] = [];
          for (var v=0; v < sommets; v++) {
            adjalist[i][v]=0;
          }
        }

        var nbedges = 0;
        var min = 0; var max = sommets;

        while (nbedges !== nb_arretes) {
          //Genere aleatoirement des arretes, leur poids (entre 1 et 10) et leur couleur
          var depart = Math.floor(Math.random() * (max- min) + min); var source = depart.toString();
          var dest = Math.floor(Math.random() * (max - min) + min); var target = dest.toString();
          var weight = Math.floor(Math.random()* (10 - 1) + 1); var poids = weight.toString();
          var couleur = getRandomColor();

          var temp = [source, target, weight, {color:couleur, label: poids}];
          var edge1 = [depart, dest, weight];
          var edge2 = [dest, depart, weight];
          var exist = false;
          json.edges.forEach(function(e) {
            if (source === e[0] && target === e[1]) exist =true;
            if (source === e[1] && target === e[0]) exist =true;
          });
          if (source === target) exist = true;
          if (!exist) {
            adjalist[depart][dest] = edge1; //Implemente la liste d'adjacence
            adjalist[dest][depart] = edge2;
            json.edges.push(temp);  //Implemente la liste d'arretes du JSON
            nbedges++;
          }
        }

        //Envoie la liste au browser. Elle sera affiche dans la console du browser
        socket.emit ('adjalist', adjalist);
        console.log (adjalist); //affiche dans la console du serveur
        //Envoie le json au browser. Il sera affiche dans la console du browser
        socket.emit('graph_json', json);
        console.log(json); //affiche dans la console du serveur
    });

    //Reçoit la liste d'adjacence du graphe et calcul le poids total de son MST
    socket.on('list_input', function(data) {
      var matrice_prim = data[0];
      var json = data[1];

      var cost = 0;
      var n = matrice_prim.length;
      var PriorityQueue = []; //Liste de priorité
      var visited = []; //Liste des arretes visitées
      for (var i = 0; i < n; i++) {
        visited[i] = false;
      }
      var inTree =1;
      visited[0] = true;
      for (var i=0; i < matrice_prim[0].length; i++) {
        if (matrice_prim[0][i] !== 0) {
          PriorityQueue.push(matrice_prim[0][i]);
        }
      }
      PriorityQueue = tri(PriorityQueue);
      while (PriorityQueue.length !== 0 && inTree < n) {
        var curr = PriorityQueue [PriorityQueue.length-1]; //curr [0] = index, curr[1]= weight
        PriorityQueue.pop();
        if (!visited[curr[1]]) {
          inTree++;
          visited[curr[1]] = true;
          cost += curr[2];


          for (var i=0; i < json.edges.length; i++) {
            if (curr[0].toString() === json.edges[i][0] && curr[1].toString() === json.edges[i][1]) json.edges[i][3].color = '#000000';
            if (curr[0].toString() === json.edges[i][1] && curr[1].toString() === json.edges[i][0]) json.edges[i][3].color = '#000000';
          }

          for (var i=0; i < matrice_prim[curr[1]].length; i++) {
            if (matrice_prim[curr[1]][i] !== 0) {
              PriorityQueue.push (matrice_prim[curr[1]][i]);
            }
          }
          PriorityQueue = tri(PriorityQueue);
        }
      }

    var output = [cost, json];
    socket.emit('prim', output);
    console.log (cost);
  });
});
