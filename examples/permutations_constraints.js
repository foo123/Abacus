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

function kcycles(N, k)
{
    return Abacus.SetPartition(N, {"parts=":k}).fuse(
    (partition, permutation) => {
        if (!Array.isArray(permutation[0])) permutation = [permutation];
        return Abacus.Permutation.fromCycles(partition.filter(p => 1 < p.length).map((p, i) => [p[p.length-1]].concat(Abacus.Permutation.permute(p.slice(0, -1), permutation[i], true))), N);
    }, Abacus.CombinatorialProxy(item => item.reverse().reduce((p,i) => 1 < i.length ? Abacus.Permutation(i.length-1).juxtaposeWith(p) : p, null)));
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


solutions = kcycles(5, 3).get();
echo(''+solutions.length+' 3-cycle permutations of 5 elements');
echo(solutions.map(String).join("\n"));
