"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;

let N, solutions;
// solve exactly the N-queens problem by Combinatorial methods using Abacus

// utility functions
function row_column(item)
{
    // convert num in 0..N^2-1 to associated row and column in NxN grid
    let N = item.length, i, output = new Array(N);
    for (i=0; i<N; ++i) output[i] = [~~(item[i] / N)/* associated row*/, item[i] % N/* associated column*/];
    return output;
}
function row_column_perm(item)
{
    // convert permutation of N queens each on different row of NxN grid
    let N = item.length, i, output = new Array(N);
    for (i=0; i<N; ++i) output[i] = [i/* different row */, item[i]/* permutation of column*/];
    return output;
}
function is_valid(solution)
{
    let N = solution.length, i, j;
    for (i=0; i<N; ++i)
    {

        for (j=0; j<N; ++j)
        {
            if (i === j) continue;
            if (solution[i][0] === solution[j][0] /* same row */ || solution[i][1] === solution[j][1] /* same column */ || solution[i][0]-solution[i][1] === solution[j][0]-solution[j][1] /* same diagonal */ || solution[i][0]+solution[i][1] === solution[j][0]+solution[j][1] /* same anti-diagonal */)
                return false;
        }
    }
    return true;
}
function make_grid(queens)
{
    // generate an empty NxN grid and place queens given on given (row,col) positions
    let N = queens.length, grid = new Array(N), i, j;
    for (i=0; i<N; ++i)
    {
        grid[i] = new Array(N);
        for (j=0; j<N; ++j) grid[i][j] = 'O'; // empty
    }
    for (i=0; i<N; ++i)
    {
        grid[queens[i][0]][queens[i][1]] = 'X'; // queen
    }
    return grid;
}
function from_latin_square(latin_square, symbol)
{
    // generate a N-queens solution from given pan-diagonal latin square
    let N = latin_square.length, grid = new Array(N), i, j;
    symbol = symbol || N;
    for (i=0; i<N; ++i)
    {
        grid[i] = new Array(N);
        for (j=0; j<N; ++j)
        {
            grid[i][j] = symbol === latin_square[i][j] ? 'X' : 'O';
        }
    }
    return grid;
}
function print_grid(grid)
{
    let out = '';
    for (let i=0,N=grid.length; i<N; ++i)
        out += grid[i].join(' ') + (i+1 < N ? "\n" : "");
    return out;
}

function exhaustive_search1(N)
{
    // try filtering from all possible combinations of positions placed on NxN grid
    return Abacus.Combination(N*N, N).mapTo(row_column).filterBy(is_valid).get().map(make_grid);
}

function exhaustive_search2(N)
{
    // try reducing original search space by using only permutation of N columns, each queen on different row
    return Abacus.Permutation(N).mapTo(row_column_perm).filterBy(is_valid).get().map(make_grid);
}

function latin_square(N)
{
    // for some cases can construct N-queens solution from associated pan-diagonal magic/latin squares
    let solutions = [], latin = Abacus.LatinSquare.make(N), i;
    for (i=1; i<=N; ++i) solutions.push(from_latin_square(latin, i));
    return solutions;
}

// 4-Queens
solutions = exhaustive_search1(N=4);
echo(''+solutions.length+' Solutions for '+N+' Queens (exhaustive search):');
echo(solutions.map(print_grid).join("\n---\n"));

echo('---');

// 3-Queens
solutions = exhaustive_search1(N=3);
echo(''+solutions.length+' Solutions for '+N+' Queens (exhaustive search):');
echo(solutions.map(print_grid).join("\n---\n"));

echo('---');

// 4-Queens
solutions = exhaustive_search2(N=4);
echo(''+solutions.length+' Solutions for '+N+' Queens (reduced exhaustive search):');
echo(solutions.map(print_grid).join("\n---\n"));

echo('---');

// 3-Queens
solutions = exhaustive_search2(N=3);
echo(''+solutions.length+' Solutions for '+N+' Queens (reduced exhaustive search):');
echo(solutions.map(print_grid).join("\n---\n"));

echo('---');

// 8-Queens (original problem)
solutions = exhaustive_search2(N=8);
echo(''+solutions.length+' Solutions for '+N+' Queens (reduced exhaustive search):');
//echo(solutions.map(print_grid).join("\n---\n"));

echo('---');

// 5-Queens
solutions = latin_square(N=5)
echo(''+solutions.length+' Solutions for '+N+' Queens (pan-diagonal latin square):');
echo(solutions.map(print_grid).join("\n---\n"));
