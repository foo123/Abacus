var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;


var o, m;

function print_base( m )
{
    for(var i=0; i<m.length; i++)
    {
        echo('Vector '+i+':');
        echo(m[i].toString());
    }
}
function print_dots( m )
{
    if ( !m.length ) return;
    for(var i=0; i<m.length; i++)
        for(var j=i+1; j<m.length; j++)
            echo('<'+i+','+j+'> = '+Abacus.Math.dotp(m[i].array(), m[j].array()));
    /*if ( 1 === m[0].nr )
    {
        // row vectors
        for(var i=0; i<m.length; i++)
            for(var j=i+1; j<m.length; j++)
                echo('<'+i+','+j+'> = '+m[i].mul(m[j].t()).coeff(0,0));
    }
    else
    {
        // column vectors
        for(var i=0; i<m.length; i++)
            for(var j=i+1; j<m.length; j++)
                echo('<'+i+','+j+'> = '+m[i].t().mul(m[j]).coeff(0,0));
    }*/
}

echo('Abacus.Matrices (VERSION = '+Abacus.VERSION+')');
echo('---');

echo('Matrices and Matrix operations');
echo('---');
echo('o=Abacus.Matrix(3)');
o=Abacus.Matrix(3);
echo('o.toString()');
echo(o.toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('o=Abacus.Matrix.I(3)');
o=Abacus.Matrix.I(3);
echo('o.toString()');
echo(o.toString());
echo('o.slice(0, 0, 1, 1)');
echo(o.slice(0, 0, 1, 1).toString());
echo('o.add(1)');
echo(o.add(1).toString());
echo('o.mul(2)');
echo(o.mul(2).toString());
echo('o.add(Abacus.Matrix.I(3))');
echo(o.add(Abacus.Matrix.I(3)).toString());
echo('o.mul(Abacus.Matrix.I(3))');
echo(o.mul(Abacus.Matrix.I(3)).toString());
echo('o.dispose()');
o.dispose();
echo('---');

echo('o=Abacus.Matrix([[1,2],[3,4]]).kron(Abacus.Matrix([[1,1],[2,2]]))');
o=Abacus.Matrix([[1,2],[3,4]]).kron(Abacus.Matrix([[1,1],[2,2]]));
echo(o.toString());
o.dispose();
echo('---');

//echo('o=Abacus.Matrix([[91, 1, 0],[21, 0, 1]])');
//o=Abacus.Matrix([[91, 1, 0],[21, 0, 1]]);
echo('o=Abacus.Matrix([91, 21]).concat(Abacus.Matrix.I(2))');
o=Abacus.Matrix([91, 21]).concat(Abacus.Matrix.I(2));
echo('o.toString()');
echo(o.toString());
echo('o.ref(false, [2, 1])');
m=o.ref(false, [2, 1]);
echo(m.toString());
m=m.slice(0, 1);
echo('o.ref(false, [2, 1]).slice(0, 1)');
echo(m.toString());
echo('o.ref(false, [2, 1]).slice(0, 1).mul(Abacus.Matrix([91, 21]))');
echo(m.mul(Abacus.Matrix([91, 21])).toString());
echo('o.ref(false, [2, 1]).slice(0, 1).t().mul(Abacus.Matrix([7, 0]))');
echo(m.t().mul(Abacus.Matrix([7, 0])).toString());
o.dispose();
echo('---');

//echo('o=Abacus.Matrix([[5, 6, 1, 0, 0],[6, -11, 0, 1, 0],[8, 7, 0, 0, 1]])');
//o=Abacus.Matrix([[5, 6, 1, 0, 0],[6, -11, 0, 1, 0],[8, 7, 0, 0, 1]]);
echo('o=Abacus.Matrix([[5, 6], [6, -11], [8, 7]]).concat(Abacus.Matrix.I(3))');
o=Abacus.Matrix([[5, 6], [6, -11], [8, 7]]).concat(Abacus.Matrix.I(3));
echo('o.toString()');
echo(o.toString());
echo('o.ref(false, [3, 2])');
m=o.ref();
echo(m.toString());
m=m.slice(0, 2);
echo('o.ref(false, [3, 2]).slice(0, 2)');
echo(m.toString());
echo('o.ref(false, [3, 2]).slice(0, 2).mul(Abacus.Matrix([[5, 6], [6, -11], [8, 7]]))');
echo(m.mul(Abacus.Matrix([[5, 6], [6, -11], [8, 7]])).toString());
echo('o.ref(false, [3, 2]).slice(0, 2).t().mul(Abacus.Matrix([[1, -17], [0, 13], [0, 0]]))');
echo(m.t().mul(Abacus.Matrix([[1, -17], [0, 13], [0, 0]])).toString());
o.dispose();
echo('---');

echo('o=Abacus.Matrix([91, 21])');
o=Abacus.Matrix([91, 21]);
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

echo('o=Abacus.Matrix([[5, 6], [6, -11], [8, 7]])');
o=Abacus.Matrix([[5, 6], [6, -11], [8, 7]]);
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

echo('o=Abacus.Matrix([[0, -2, 1], [1, 3, 1], [0, 0, 1], [1, 1, 5]])');
o=Abacus.Matrix([[0, -2, 1], [1, 3, 1], [0, 0, 1], [1, 1, 5]]);
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

echo('o=Abacus.Matrix(3, 3)');
o=Abacus.Matrix(3, 3);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base( m );
print_dots( m );
echo('o.colspace()');
m=o.colspace();
print_base( m );
print_dots( m );
echo('o.nullspace()');
m=o.nullspace();
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
echo('o.nullspace(true)');
m=o.nullspace(true);
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
o.dispose();
echo('---');

echo('o=Abacus.Matrix.I(3)');
o=Abacus.Matrix.I(3);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base( m );
print_dots( m );
echo('o.colspace()');
m=o.colspace();
print_base( m );
print_dots( m );
echo('o.nullspace()');
m=o.nullspace();
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
echo('o.nullspace(true)');
m=o.nullspace(true);
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
o.dispose();
echo('---');

echo('o=Abacus.Matrix([[ 1,  3, 0],[-2, -6, 0],[ 3,  9, 6]])');
o=Abacus.Matrix([[ 1,  3, 0],[-2, -6, 0],[ 3,  9, 6]]);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base( m );
print_dots( m );
echo('o.colspace()');
m=o.colspace();
print_base( m );
print_dots( m );
echo('o.nullspace()');
m=o.nullspace();
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
echo('o.nullspace(true)');
m=o.nullspace(true);
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
o.dispose();
echo('---');

echo('o=Abacus.Matrix([[5, 10, 7], [3, 6, 1], [7, 14, 0]])');
o=Abacus.Matrix([[5, 10, 7], [3, 6, 1], [7, 14, 0]]);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base( m );
print_dots( m );
echo('o.colspace()');
m=o.colspace();
print_base( m );
print_dots( m );
echo('o.nullspace()');
m=o.nullspace();
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
echo('o.nullspace(true)');
m=o.nullspace(true);
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
o.dispose();
echo('---');

echo('o=Abacus.Matrix([[5, 3, 7], [10, 6, 14], [8, 3, 1]])');
o=Abacus.Matrix([[5, 3, 7], [10, 6, 14], [8, 3, 1]]);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base( m );
print_dots( m );
echo('o.colspace()');
m=o.colspace();
print_base( m );
print_dots( m );
echo('o.nullspace()');
m=o.nullspace();
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
echo('o.nullspace(true)');
m=o.nullspace(true);
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
o.dispose();
echo('---');

echo('o=Abacus.Matrix([[1, 1, 1], [2, 2, 2], [3, 3, 3]])');
o=Abacus.Matrix([[1, 1, 1], [2, 2, 2], [3, 3, 3]]);
echo('o.toString()');
echo(o.toString());
echo('o.rowspace()');
m=o.rowspace();
print_base( m );
print_dots( m );
echo('o.colspace()');
m=o.colspace();
print_base( m );
print_dots( m );
echo('o.nullspace()');
m=o.nullspace();
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(o.mul(m[i]).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
echo('o.nullspace(true)');
m=o.nullspace(true);
for(var i=0; i<m.length; i++)
{
    echo('Vector '+i+'('+(m[i].mul(o).equ(0, true)?'true':'false')+'): ');
    echo(m[i].toString());
}
print_dots( m );
o.dispose();
echo('---');
