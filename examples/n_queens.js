var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

var solutions, N;
// solve exactly the N-queens problem by Combinatorial methods using Abacus

// utility functions
function row_column(item)
{
    // convert num in 0..N^2-1 to associated row and column in NxN grid
    var N = item.length, i, output = new Array(N);
    for(i=0; i<N; i++) output[i] = [~~(item[i] / N)/* associated row*/, item[i] % N/* associated column*/];
    return output;
}
function row_column_perm(item)
{
    // convert permutation of N queens each on different row of NxN grid
    var N = item.length, i, output = new Array(N);
    for(i=0; i<N; i++) output[i] = [i/* different row */, item[i]/* permutation of column*/];
    return output;
}
function is_valid(solution)
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
function make_grid(queens)
{
    // generate an empty NxN grid and place queens given on given (row,col) positions
    var N = queens.length, grid = new Array(N), i, j;
    for(i=0; i<N; i++)
    {
        grid[i] = new Array(N);
        for(j=0; j<N; j++) grid[i][j] = 'O'; // empty
    }
    for(i=0; i<N; i++)
    {
        grid[queens[i][0]][queens[i][1]] = 'X'; // queen
    }
    return grid;
}
function from_latin_square(latin_square, symbol)
{
    // generate a n-queens solution from given pan-diagonal latin square
    var N = latin_square.length, i, j;
    symbol = symbol || N;
    for(i=0; i<N; i++)
    {
        for(j=0; j<N; j++)
        {
            latin_square[i][j] = symbol === latin_square[i][j] ? 'X' : 'O';
        }
    }
    return latin_square;
}
function print_grid(grid)
{
    for(var out='',i=0,N=grid.length; i<N; i++)
        out += grid[i].join(' ') + (i+1<N?"\n":"");
    return out;
}

N = 4; // 4-Queens
// try filtering from all possible combinations of positions placed on NxN grid
solutions = Abacus.Combination(N*N, N, {output:row_column}).filterBy(is_valid).get();

echo(''+solutions.length+' Solutions for '+N+' Queens (exhaustive search):');
echo(solutions.map(function(solution){return print_grid(make_grid(solution));}).join("\n---\n"));

echo('---');

N = 3; // 3-Queens
// try filtering from all possible combinations of positions placed on NxN grid
solutions = Abacus.Combination(N*N, N, {output:row_column}).filterBy(is_valid).get();

echo(''+solutions.length+' Solutions for '+N+' Queens (exhaustive search):');
echo(solutions.map(function(solution){return print_grid(make_grid(solution));}).join("\n---\n"));

echo('---');

N = 4; // 4-Queens
// try reducing original search space by using only permutation of N!, each queen on different row
solutions = Abacus.Permutation(N, {output:row_column_perm}).filterBy(is_valid).get();

echo(''+solutions.length+' Solutions for '+N+' Queens (reduced exhaustive search):');
echo(solutions.map(function(solution){return print_grid(make_grid(solution));}).join("\n---\n"));

echo('---');

N = 3; // 3-Queens
// try reducing original search space by using only permutation of N!, each queen on different row
solutions = Abacus.Permutation(N, {output:row_column_perm}).filterBy(is_valid).get();

echo(''+solutions.length+' Solutions for '+N+' Queens (reduced exhaustive search):');
echo(solutions.map(function(solution){return print_grid(make_grid(solution));}).join("\n---\n"));

echo('---');

// for some cases can construct N-queens solution from associated pan-diagonal magic/latin squares
N = 5; // 5-Queens
solutions = [Abacus.LatinSquare.make(N)];

echo(''+solutions.length+' Solution for '+N+' Queens (pan-diagonal latin square):');
echo(solutions.map(function(solution){return print_grid(from_latin_square(solution));}).join("\n---\n"));
