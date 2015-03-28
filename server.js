var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
    res.sendfile('1.html');
});

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
          if(pq[i][1] < pq[i+1][1]) {
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
    //On reçoit le graphe
    socket.on('input_value', function(data) {
        var valeur = data.split(" "); //valeur[0]=sommets, valeur [1] = densite
        var sommets = valeur[0];
        var densite = valeur[1];
        var nb_arretes = Math.round(((sommets*(sommets-1))/2)* (densite/100));

        //Creation du JSON de sortie
        var matrix = [];

        var json = {
          nodes: [],
          edges: []
        };

        for (var i = 0; i < sommets; i++) {
          var temp = i.toString();
          json.nodes.push(temp);
          matrix[i] = [];
          for (var v=0; v < sommets; v++) {
            matrix[i][v]=0;
          }
        }
                
        var nbedges = 0;
        var min = 0; var max = sommets;
        var edges = [];

        while (nbedges !== nb_arretes) {
          var depart = Math.floor(Math.random() * (max- min) + min); var source = depart.toString();
          var dest = Math.floor(Math.random() * (max - min) + min); var target = dest.toString();
          var weight = Math.floor(Math.random()* (10 - 1) + 1); var poids = weight.toString();
          var couleur = getRandomColor();

          var temp = [source, target, weight, {color:couleur, label: poids}];
          var node1 = [dest, weight];
          var node2 = [depart, weight];
          var exist = false;
          edges.forEach(function(e) {
            if (source === e[0] && target === e[1]) exist =true;
            if (source === e[1] && target === e[0]) exist =true;
          });
          if (source === target) exist = true;
          if (!exist) {
            matrix[depart][dest] = node1;
            matrix[dest][depart] = node2;
            json.edges.push(temp)
            edges.push(temp);
            nbedges++;
          }
        }
                
        //Envoyer la matrice au browser. Il sera affiche dans la console du browser
        console.log (matrix);
        socket.emit ('matrix', matrix);
        //Envoyer le json au browser. Il sera affiche dans la console du browser
        socket.emit('graph_json', json);
        console.log(json); //affiche dans la console du serveur
    });
    
    socket.on('matrix_input', function(data) {
      var matrice_prim = data;

      var cost = 0;
      var n = matrice_prim.length;
      var PriorityQueue = [];
      var visited = [];
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
        if (!visited[curr[0]]) {
          inTree++;
          visited[curr[0]] = true;
          cost += curr[1];
          for (var i=0; i < matrice_prim[curr[0]].length; i++) {
            if (matrice_prim[curr[0]][i] !== 0) {
              PriorityQueue.push (matrice_prim[curr[0]][i]);
            }
          }
          PriorityQueue = tri(PriorityQueue);
        }
      }

    
    socket.emit('prim', cost);
    console.log (cost);
  });
});
