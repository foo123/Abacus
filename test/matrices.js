"use strict";

const isNode = ('undefined' !== typeof global) && ('[object global]' === {}.toString.call(global));
const echo = console.log;
const Abacus = isNode ? require('../build/js/Abacus.js') : window.Abacus;
const use_biginteger_arithmetic = isNode ? require('./biginteger/arithmetic.js') : window.use_biginteger_arithmetic;
use_biginteger_arithmetic(Abacus);


function print_base(m)
{
    for (let i=0; i<m.length; i++)
    {
        echo('Vector '+i+':');
        echo(m[i].toString());
    }
}
function print_dots(m)
{
    if (!m.length) return;
    for (let i=0; i<m.length; i++)
        for (let j=i+1; j<m.length; j++)
            echo('<'+i+','+j+'> = '+Abacus.Math.dotp(m[i].array(), m[j].array()));
}
let o, ring = Abacus.Ring.Z(), field = ring.associatedField(), m;

echo('Abacus.Matrices (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Matrices and Matrix operations');
echo('ring = Abacus.Ring.'+ring.toString()+' ('+ring.toTex()+') /* ring of integers */');
echo('---');
echo('o=Abacus.Matrix(ring, 3)');
o=Abacus.Matrix(ring, 3);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.dispose()');
o.dispose();
echo('---');

echo('o=Abacus.Matrix.I(ring, 3)');
o=Abacus.Matrix.I(ring, 3);
echo('o.toString()');
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
echo('o.slice(0, 0, 1, 1)');
echo(o.slice(0, 0, 1, 1).toString());
echo('o.add(1)');
echo(o.add(1).toString());
echo('o.mul(2)');
echo(o.mul(2).toString());
echo('o.add(Abacus.Matrix.I(ring, 3))');
echo(o.add(Abacus.Matrix.I(ring, 3)).toString());
echo('o.mul(Abacus.Matrix.I(ring, 3))');
echo(o.mul(Abacus.Matrix.I(ring, 3)).toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('o=Abacus.Matrix(ring, [[1,2],[3,4]]).prod(Abacus.Matrix(ring, [[1,1],[2,2]]))');
o=Abacus.Matrix(ring, [[1,2],[3,4]]).prod(Abacus.Matrix(ring, [[1,1],[2,2]]));
echo(o.toString());
echo('o.toTex()');
echo(o.toTex());
o.dispose();
echo('---');

//echo('o=Abacus.Matrix(ring, [[91, 1, 0],[21, 0, 1]])');
//o=Abacus.Matrix(ring, [[91, 1, 0],[21, 0, 1]]);
echo('o=Abacus.Matrix(ring, [91, 21]).concat(Abacus.Matrix.I(ring, 2))');
o=Abacus.Matrix(ring, [91, 21]).concat(Abacus.Matrix.I(ring, 2));
echo('o.toString()');
echo(o.toString());
echo('o.ref(false, [2, 1])');
m=o.ref(false, [2, 1]);
echo(m.toString());
m=m.slice(0, 1);
echo('o.ref(false, [2, 1]).slice(0, 1)');
echo(m.toString());
echo('o.ref(false, [2, 1]).slice(0, 1).mul(Abacus.Matrix(ring, [91, 21]))');
echo(m.mul(Abacus.Matrix(ring, [91, 21])).toString());
echo('o.ref(false, [2, 1]).slice(0, 1).t().mul(Abacus.Matrix(ring, [7, 0]))');
echo(m.t().mul(Abacus.Matrix(ring, [7, 0])).toString());
o.dispose();
echo('---');

//echo('o=Abacus.Matrix(ring, [[5, 6, 1, 0, 0],[6, -11, 0, 1, 0],[8, 7, 0, 0, 1]])');
//o=Abacus.Matrix(ring, [[5, 6, 1, 0, 0],[6, -11, 0, 1, 0],[8, 7, 0, 0, 1]]);
echo('o=Abacus.Matrix(ring, [[5, 6], [6, -11], [8, 7]]).concat(Abacus.Matrix.I(ring, 3))');
o=Abacus.Matrix(ring, [[5, 6], [6, -11], [8, 7]]).concat(Abacus.Matrix.I(ring, 3));
echo('o.toString()');
echo(o.toString());
echo('o.ref(false, [3, 2])');
m=o.ref();
echo(m.toString());
m=m.slice(0, 2);
echo('o.ref(false, [3, 2]).slice(0, 2)');
echo(m.toString());
echo('o.ref(false, [3, 2]).slice(0, 2).mul(Abacus.Matrix(ring, [[5, 6], [6, -11], [8, 7]]))');
echo(m.mul(Abacus.Matrix(ring, [[5, 6], [6, -11], [8, 7]])).toString());
echo('o.ref(false, [3, 2]).slice(0, 2).t().mul(Abacus.Matrix(ring, [[1, -17], [0, 13], [0, 0]]))');
echo(m.t().mul(Abacus.Matrix(ring, [[1, -17], [0, 13], [0, 0]])).toString());
o.dispose();
echo('---');

/*
Abacus.Rational.Epsilon(1e-2); // decrease irrational precision
echo('o=Abacus.Matrix.I(ring, 3)');
o=Abacus.Matrix.I(ring, 3);
echo('o.toString()');
echo(o.toString());
echo('o.evd()');
m=o.evd();
echo("U:");
echo(m[1].toDec(4));
echo("E:");
echo(m[0].toDec(4));
echo('o.svd()');
m=o.svd();
echo("U:");
echo(m[1].toDec(4));
echo("S:");
echo(m[0].toDec(4));
echo("V:");
echo(m[2].toDec(4));
echo('---');

echo('o=Abacus.Matrix(ring, [[2,0,0],[0,3,0],[0,0,1]])');
o=Abacus.Matrix(ring, [[2,0,0],[0,3,0],[0,0,1]]);
echo('o.toString()');
echo(o.toString());
echo('o.evd()');
m=o.evd();
echo("U:");
echo(m[1].toDec(4));
echo("E:");
echo(m[0].toDec(4));
echo('o.svd()');
m=o.svd();
echo("U:");
echo(m[1].toDec(4));
echo("S:");
echo(m[0].toDec(4));
echo("V:");
echo(m[2].toDec(4));
echo('---');

echo('o=Abacus.Matrix(ring, [[3,2,2], [2,3,-2]])');
o=Abacus.Matrix(ring, [[3,2,2], [2,3,-2]]);
echo('o.toString()');
echo(o.toString());
echo('o.svd()');
m=o.svd();
echo("U:");
echo(m[1].toString());
echo("S:");
echo(m[0].toString());
echo("V:");
echo(m[2].toString());
echo('---');

echo('o=Abacus.Matrix(ring, [[3,2,2], [0,2,3], [0,0,1]])');
o=Abacus.Matrix(ring, [[3,2,2], [0,2,3], [0,0,1]]);
echo('o.toString()');
echo(o.toString());
echo('o.svd()');
m=o.svd();
echo("U:");
echo(m[1].toString());
echo("S:");
echo(m[0].toString());
echo("V:");
echo(m[2].toString());
echo('---');
Abacus.Rational.Epsilon(true); // reset irrational precision to default
*/

echo('o=Abacus.Matrix(ring, [91, 21])');
o=Abacus.Matrix(ring, [91, 21]);
echo('o.toString()');
echo(o.toString());
echo('o.snf()');
m=o.snf();
echo("Left:");
echo(m[1].toString());
echo("Diagonal:");
echo(m[0].toString());
echo("Right:");
echo(m[2].toString());
echo("Reconstructed:");
echo(m[1].mul(m[0]).mul(m[2]).toString());
echo('o.lu()');
m=o.lu();
echo("P:");
echo(m[0].toString());
echo("L:");
echo(m[1].toString());
echo("D:");
echo(m[2].toString());
echo("U:");
echo(m[3].toString());
echo('o.qr()');
m=o.qr();
echo("Q:");
echo(m[0].toString());
echo("D:");
echo(m[1].toString());
echo("R:");
echo(m[2].toString());
o.dispose();
echo('---');

echo('o=Abacus.Matrix(ring, [[5, 6], [6, -11], [8, 7]])');
o=Abacus.Matrix(ring, [[5, 6], [6, -11], [8, 7]]);
echo('o.toString()');
echo(o.toString());
echo('o.snf()');
m=o.snf();
echo("Left:");
echo(m[1].toString());
echo("Diagonal:");
echo(m[0].toString());
echo("Right:");
echo(m[2].toString());
echo("Reconstructed:");
echo(m[1].mul(m[0]).mul(m[2]).toString());
echo('o.lu()');
m=o.lu();
echo("P:");
echo(m[0].toString());
echo("L:");
echo(m[1].toString());
echo("D:");
echo(m[2].toString());
echo("U:");
echo(m[3].toString());
echo('o.qr()');
m=o.qr();
echo("Q:");
echo(m[0].toString());
echo("D:");
echo(m[1].toString());
echo("R:");
echo(m[2].toString());
o.dispose();
echo('---');

echo('o=Abacus.Matrix(ring, [[0, -2, 1], [1, 3, 1], [0, 0, 1], [1, 1, 5]])');
o=Abacus.Matrix(ring, [[0, -2, 1], [1, 3, 1], [0, 0, 1], [1, 1, 5]]);
echo('o.toString()');
echo(o.toString());
echo('o.lu()');
m=o.lu();
echo("P:");
echo(m[0].toString());
echo("L:");
echo(m[1].toString());
echo("D:");
echo(m[2].toString());
echo("U:");
echo(m[3].toString());
echo('o.qr()');
m=o.qr();
echo("Q:");
echo(m[0].toString());
echo("D:");
echo(m[1].toString());
echo("R:");
echo(m[2].toString());
o.dispose();
echo('---');

echo('o=Abacus.Matrix(field, [[2, -1, 0], [-1, 2, -1], [0, -1, 1]])');
o=Abacus.Matrix(field, [[2, -1, 0], [-1, 2, -1], [0, -1, 1]]);
echo('o.toString()');
echo(o.toString());
echo('o.ldl()');
m=o.ldl();
echo("L:");
echo(m[0].toString());
echo("D:");
echo(m[1].toString(), m[0].mul(m[1]).mul(m[0].h()).equ(o));
o.dispose();
echo('---');

echo('o=Abacus.Matrix.I(field, 3)');
o=Abacus.Matrix.I(field, 3);
echo('o.toString()');
echo(o.toString());
echo('o.inv().toString()');
echo(o.inv().toString(), o.mul(o.inv()).equ(Abacus.Matrix.I(field, 3)));
echo('o.adj().toString()');
echo(o.adj().toString(), o.mul(o.adj()).equ(Abacus.Matrix.I(field, 3)));
echo('o.charpoly().toString()');
echo(o.charpoly().toString());
o.dispose();
echo();
echo('o=Abacus.Matrix(field, [[4,7],[2,6]])');
o=Abacus.Matrix(field, [[4,7],[2,6]]);
echo('o.toString()');
echo(o.toString());
echo('o.inv().toString()');
echo(o.inv().toString(), o.mul(o.inv()).equ(Abacus.Matrix.I(field, 2)));
echo('o.adj().toString()');
echo(o.adj().toString(), o.mul(o.adj()).equ(Abacus.Matrix.I(field, 2).mul(o.det())));
echo('o.charpoly().toString()');
echo(o.charpoly().toString());
o.dispose();
echo();
echo('o=Abacus.Matrix(ring, [[-3,2,-5],[-1,0,-2],[3,-4,1]])');
o=Abacus.Matrix(ring, [[-3,2,-5],[-1,0,-2],[3,-4,1]]);
echo('o.toString()');
echo(o.toString());
echo('o.adj().toString()');
echo(o.adj().toString(), o.mul(o.adj()).equ(Abacus.Matrix.I(ring, 3).mul(o.det())));
echo('o.charpoly().toString()');
echo(o.charpoly().toString());
o.dispose();
echo('---');

echo('o=Abacus.Matrix(field, [[1, 3, 1, 4],[2, 7, 3, 9],[1, 5, 3, 1],[1, 2, 0, 8]])');
o=Abacus.Matrix(field, [[1, 3, 1, 4],[2, 7, 3, 9],[1, 5, 3, 1],[1, 2, 0, 8]]);
echo('o.toString()');
echo(o.toString());
echo('o.rankf()');
m = o.rankf();
echo(m[0].toString());
echo(m[1].toString());
echo(m[0].mul(m[1]).equ(o))
o.dispose();
echo('---');

echo('o=Abacus.Matrix(field, [[0, 0],[0, 0]])');
o=Abacus.Matrix(field, [[0, 0],[0, 0]]);
echo('o.toString()');
echo(o.toString());
echo('o.ginv().toString()');
echo(o.ginv().toString(), o.mul(o.ginv()).mul(o).equ(o), o.ginv().mul(o).mul(o.ginv()).equ(o.ginv()));
o.dispose();
echo('o=Abacus.Matrix(field, [[1, 0],[1, 0]])');
o=Abacus.Matrix(field, [[1, 0],[1, 0]]);
echo('o.toString()');
echo(o.toString());
echo('o.ginv().toString()');
echo(o.ginv().toString(), o.mul(o.ginv()).mul(o).equ(o), o.ginv().mul(o).mul(o.ginv()).equ(o.ginv()));
o.dispose();
echo('o=Abacus.Matrix(field, [[1, 0],[2, 0]])');
o=Abacus.Matrix(field, [[1, 0],[2, 0]]);
echo('o.toString()');
echo(o.toString());
echo('o.ginv().toString()');
echo(o.ginv().toString(), o.mul(o.ginv()).mul(o).equ(o), o.ginv().mul(o).mul(o.ginv()).equ(o.ginv()));
o.dispose();
echo('o=Abacus.Matrix(field, [[1, 0],[0, 1],[0, 1]])');
o=Abacus.Matrix(field, [[1, 0],[0, 1],[0, 1]]);
echo('o.toString()');
echo(o.toString());
echo('o.ginv().toString()');
echo(o.ginv().toString(), o.mul(o.ginv()).mul(o).equ(o), o.ginv().mul(o).mul(o.ginv()).equ(o.ginv()));
o.dispose();
echo('---');

echo('o=Abacus.Matrix(ring, 3, 3)');
o=Abacus.Matrix(ring, 3, 3);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base(m);
print_dots(m);
echo('o.colspace()');
m=o.colspace();
print_base(m);
print_dots(m);
echo('o.nullspace()');
m=o.nullspace();
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
echo('o.nullspace(true)');
m=o.nullspace(true);
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
o.dispose();
echo('---');

echo('o=Abacus.Matrix.I(ring, 3)');
o=Abacus.Matrix.I(ring, 3);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base(m);
print_dots(m);
echo('o.colspace()');
m=o.colspace();
print_base(m);
print_dots(m);
echo('o.nullspace()');
m=o.nullspace();
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
echo('o.nullspace(true)');
m=o.nullspace(true);
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
o.dispose();
echo('---');

echo('o=Abacus.Matrix(ring, [[ 1,  3, 0],[-2, -6, 0],[ 3,  9, 6]])');
o=Abacus.Matrix(ring, [[ 1,  3, 0],[-2, -6, 0],[ 3,  9, 6]]);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base(m);
print_dots(m);
echo('o.colspace()');
m=o.colspace();
print_base(m);
print_dots(m);
echo('o.nullspace()');
m=o.nullspace();
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
echo('o.nullspace(true)');
m=o.nullspace(true);
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
o.dispose();
echo('---');

echo('o=Abacus.Matrix(ring, [[5, 10, 7], [3, 6, 1], [7, 14, 0]])');
o=Abacus.Matrix(ring, [[5, 10, 7], [3, 6, 1], [7, 14, 0]]);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base(m);
print_dots(m);
echo('o.colspace()');
m=o.colspace();
print_base(m);
print_dots(m);
echo('o.nullspace()');
m=o.nullspace();
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
echo('o.nullspace(true)');
m=o.nullspace(true);
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
o.dispose();
echo('---');

echo('o=Abacus.Matrix(ring, [[5, 3, 7], [10, 6, 14], [8, 3, 1]])');
o=Abacus.Matrix(ring, [[5, 3, 7], [10, 6, 14], [8, 3, 1]]);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base(m);
print_dots(m);
echo('o.colspace()');
m=o.colspace();
print_base(m);
print_dots(m);
echo('o.nullspace()');
m=o.nullspace();
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
echo('o.nullspace(true)');
m=o.nullspace(true);
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
o.dispose();
echo('---');

echo('o=Abacus.Matrix(ring, [[1, 1, 1], [2, 2, 2], [3, 3, 3]])');
o=Abacus.Matrix(ring, [[1, 1, 1], [2, 2, 2], [3, 3, 3]]);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base(m);
print_dots(m);
echo('o.colspace()');
m=o.colspace();
print_base(m);
print_dots(m);
echo('o.nullspace()');
m=o.nullspace();
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
echo('o.nullspace(true)');
m=o.nullspace(true);
for (let i=0; i<m.length; ++i)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots(m);
o.dispose();
echo('---');

ring = Abacus.Ring.Q("x"); field = ring.associatedField();
echo('ring = Abacus.Ring.'+ring.toString()+' ('+ring.toTex()+') /* ring of polynomials */');
echo('---');
echo('o=Abacus.Matrix.I(field, 3)');
o=Abacus.Matrix.I(field, 3);
echo('o.toString()');
echo(o.toString());
echo('o.inv().toString()');
echo(o.inv().toString(), o.inv().mul(o).equ(Abacus.Matrix.I(field, 3)));
echo('o.charpoly("y").toString()');
echo(o.charpoly("y").toString());
o.dispose();
echo();
echo('o=Abacus.Matrix(field, [[field.fromString("x-1"),field.fromString("x^2-1")],[field.fromString("x^2-1"),field.fromString("x-1")]])');
o=Abacus.Matrix(field, [[field.fromString("x-1"),field.fromString("x^2-1")],[field.fromString("x^2-1"),field.fromString("x-1")]]);
echo('o.toString()');
echo(o.toString());
echo('o.rref().toString()');
echo(o.rref().toString());
echo('o.inv().toString()');
echo(o.inv().toString(), o.inv().mul(o).equ(Abacus.Matrix.I(field, 2)));
echo('o.charpoly("y").toString()');
echo(o.charpoly("y").toString());
o.dispose();
echo('---');
