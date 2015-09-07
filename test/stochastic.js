var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var Permutation = Abacus.Permutation, total = 20, i, c,
    n = 3, p = Permutation( n ), P = [ [ 0, 1, 0 ], [ 1/2, 0, 1/2 ], [ 1/2, 0, 1/2 ] ];

// permutation from stochastic matrix
for(i=1,c=0; i<=total; i++)
{
    if ( 2 === p.stochastic(P)[1] ) c++;
}
echo('Stochastic '+total+' rounds: '+c+', '+(total-c));

// permutation from bi-stochastic matrix
for(i=1,c=0; i<=total; i++)
{
    if ( 2 === p.bistochastic(P)[1] ) c++;
}
echo('BiStochastic '+total+' rounds: '+c+', '+(total-c));
