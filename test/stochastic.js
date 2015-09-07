var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;
var Permutation = Abacus.Permutation, total = 10, i, c,
    n = 3, p = Permutation( n ), s, P = [ [ 0, 1, 0 ], [ 1/2, 0, 1/2 ], [ 1/2, 0, 1/2 ] ];

// permutation from singly-stochastic matrix
for(i=1,c=0; i<=total; i++)
{
    s = p.stochastic(P);
    if ( 2 === s[1] ) c++;
    echo(s);
}
echo('Singly-Stochastic '+total+' rounds: '+c+', '+(total-c));

// permutation from doubly-stochastic matrix
for(i=1,c=0; i<=total; i++)
{
    s = p.stochastic2(P);
    if ( 2 === s[1] ) c++;
    echo(s);
}
echo('Doubly-Stochastic '+total+' rounds: '+c+', '+(total-c));
