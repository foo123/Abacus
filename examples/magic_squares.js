var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

var solutions, N;
// compute all magic squares of order N by Combinatorial methods using Abacus

// utility functions
function square(item)
{
    // arrange a permutation of 0..N^2-1 to NxN grid of symbols 1..N^2
    var N = Math.floor(Math.sqrt(item.length)),
        i, j, k,
        output = new Array(N);
    for(i=0,k=0; i<N; i++)
    {
        output[i] = new Array(N);
        for(j=0; j<N; j++,k++) output[i][j] = item[k] + 1;
    }
    return output;
}
function format_num( n, l )
{
    var s = String(n), sl = s.length;
    return sl < l ? new Array(l-sl+1).join(' ')+s : s;
}
function print_square(grid)
{
    for(var out='',i=0,N=grid.length,LEN = String(N*N).length; i<N; i++)
        out += grid[i].map(function(x){ return format_num(x, LEN); }).join(' ') + (i+1<N?"\n":"");
    return out;
}
function permute_rows_cols(square, row_perm, col_perm)
{
    var N = square.length, i, j, output = new Array(N);
    for(i=0; i<N; i++)
    {
        output[i] = new Array(N);
        for(j=0; j<N; j++)
            output[i][j] = square[row_perm[i]][col_perm[j]];
    }
    return output;
}

function exhaustive_search( N )
{
    // try filtering from all possible permutations of 1..N^2
    return Abacus.Permutation(N*N).mapTo(square).filterBy(Abacus.MagicSquare.isMagic).get();
}

function limited_search( N )
{
    // try a limited search of variations of existing magic square
    var square = Abacus.MagicSquare.make(N);
    return (square ? Abacus.Permutation(N).juxtaposeWith(Abacus.Permutation(N)).get() : []).reduce(function(solutions, permutation){
        var permuted = permute_rows_cols(square, permutation[0], permutation[1]);
        if ( Abacus.MagicSquare.isMagic(permuted) ) solutions.push(permuted);
        return solutions;
    }, []);
}


// 3-Magic
solutions = exhaustive_search( N=3 );

echo(''+solutions.length+' Solutions for '+N+'x'+N+' Magic Squares (exhaustive search):');
echo(solutions.map(print_square).join("\n---\n"));

echo('---');

// 2-Magic
solutions = exhaustive_search( N=2 );

echo(''+solutions.length+' Solutions for '+N+'x'+N+' Magic Squares (exhaustive search):');
echo(solutions.map(print_square).join("\n---\n"));

echo('---');

// 4-Magic
solutions = limited_search( N=4 );

echo(''+solutions.length+' Solutions for '+N+'x'+N+' Magic Squares (limited search):');
echo(solutions.map(print_square).join("\n---\n"));

echo('---');

// 6-Magic
solutions = limited_search( N=6 );

echo(''+solutions.length+' Solutions for '+N+'x'+N+' Magic Squares (limited search):');
//echo(solutions.map(print_square).join("\n---\n"));

echo('---');
