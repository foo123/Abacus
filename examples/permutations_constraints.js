var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

var N, solutions;

function constrained_permutations(N, constraints)
{
    var T = Abacus.Tensor(N,{type:"partial",data:constraints,ordering:"<>"});
    if ( T.dimension() < N ) T.completeWith(Abacus.Permutation(N-T.dimension()));
    return T;
}


solutions = constrained_permutations(6, {0:"{0..4}",1:"[0]+1",2:"[1]+1"}).get();
echo(''+solutions.length+' solutions');
echo(solutions.map(String).join("\n"));
