var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

var o, N;
// solve exactly the N-queens problem by Combinatorial methods using Abacus

// utility functions
function toRowColumn(item)
{
    // convert num in 0..N^2-1 to associated row and column in NxN grid
    var N = item.length, i, output = new Array(N);
    for(i=0; i<N; i++) output[i] = [~~(item[i] / N)/* associated row*/, item[i] % N/* associated column*/];
    return output;
}
function toRowColumnP(item)
{
    // convert permutation of N queens each on different row of NxN grid
    var N = item.length, i, output = new Array(N);
    for(i=0; i<N; i++) output[i] = [i/* different row */, item[i]/* permutation of column*/];
    return output;
}
function isValid(solution)
{
    var N = solution.length, i, j;
    for(i=0; i<N; i++)
    {
        
        for(j=0; j<N; j++)
        {
            if ( i === j ) continue;
            if ( solution[i][0]===solution[j][0] /* same row */ || solution[i][1]===solution[j][1] /* same column */ || solution[i][0]-solution[i][1]===solution[j][0]-solution[j][1] /* same diagonal */ || solution[i][0]+solution[i][1]===solution[j][0]+solution[j][1] /* same anti-diagonal */ )
                return false;
        }
    }
    return true;
}

N = 4; // 4-Queens
// try filtering from all possible combinations of positions placed on NxN grid
o = Abacus.Combination(N*N, N, {output:toRowColumn}).filterBy(isValid);

echo(''+N+' Queens solutions (exhaustive search): START');
for(let solution of o) echo(solution);
echo(''+N+' Queens solutions (exhaustive search): END');

echo('---');

N = 3; // 3-Queens
// try filtering from all possible combinations of positions placed on NxN grid
o = Abacus.Combination(N*N, N, {output:toRowColumn}).filterBy(isValid);

echo(''+N+' Queens solutions (exhaustive search): START');
for(let solution of o) echo(solution);
echo(''+N+' Queens solutions (exhaustive search): END');

echo('---');

N = 4; // 4-Queens
// try reducing original search space by using only permutation of N!, each queen on different row
o = Abacus.Permutation(N, {output:toRowColumnP}).filterBy(isValid);

echo(''+N+' Queens solutions (reduced exhaustive search): START');
for(let solution of o) echo(solution);
echo(''+N+' Queens solutions (reduced exhaustive search): END');

echo('---');

// for some cases can construct N-queens solution from associated pan-diagonal magic/latin squares
N = 5; // 5-Queens
o = Abacus.LatinSquare.make(N);
echo(''+N+' Queens solution (pan-diagonal latin square): START');
o.forEach(function(oi){echo(oi.map(function(x){ return N===x ? 'X' : 'O'}).join(' '));});
echo(''+N+' Queen solutions (pan-diagonal latin square): END');
