var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

var N, solutions;

function exhaustive_search(N, constraints)
{
    return Abacus.Permutation(N).filterBy(function(p){
        for(var pos in constraints)
            if ( !constraints[pos](p) )
                return false;
        return true;
    });
}

function direct_generation(N, constraints)
{
    var T = Abacus.Tensor(N,{type:"partial",data:constraints,ordering:"<>"});
    if ( T.dimension() < N ) T.completeWith(Abacus.Permutation(N-T.dimension()));
    return T;
}


solutions = exhaustive_search(6, {
    0:function(p){return 0<=p[0]&&p[0]<=4;},
    1:function(p){return p[0]+1===p[1];},
    2:function(p){return p[1]+1===p[2];}
}).get();
echo(''+solutions.length+' solutions (exhaustive search)');
echo(solutions.map(String).join("\n"));

solutions = direct_generation(6, {0:"{0..4}",1:"[0]+1",2:"[1]+1"}).get();
echo(''+solutions.length+' solutions (combinatorial tensor)');
echo(solutions.map(String).join("\n"));
