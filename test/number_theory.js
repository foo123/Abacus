var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;


var o, o2;

echo('Abacus.Number Theory Functions (VERSION = '+Abacus.VERSION+')');
echo('---');

// GCD, LCM, Modular Arithmetic, Number Theory functions
echo('Modular Arithmetic');
echo('o=Abacus.Math.addm(4, 2, 5)');
echo(o=Abacus.Math.addm(4, 2, 5));

echo('o=Abacus.Math.mulm(4, 2, 5)');
echo(o=Abacus.Math.mulm(4, 2, 5));

echo('o=Abacus.Math.negm(4, 5)');
echo(o=Abacus.Math.negm(4, 5));

echo('o=Abacus.Math.invm(4, 5)');
echo(o=Abacus.Math.invm(4, 5));

echo('o=Abacus.Math.powm(4, 2, 5)');
echo(o=Abacus.Math.powm(4, 2, 5));

echo('---');

echo('Integer Square roots');
echo('o=Abacus.Math.isqrt(1)');
echo(o=Abacus.Math.isqrt(1));

echo('o=Abacus.Math.isqrt(2)');
echo(o=Abacus.Math.isqrt(2));

echo('o=Abacus.Math.isqrt(4)');
echo(o=Abacus.Math.isqrt(4));

echo('o=Abacus.Math.isqrt(5)');
echo(o=Abacus.Math.isqrt(5));

echo('o=Abacus.Math.isqrt(10)');
echo(o=Abacus.Math.isqrt(10));

echo('---');

echo('Integer kth roots');
echo('o=Abacus.Math.ikthroot(1, 3)');
echo(o=Abacus.Math.ikthroot(1, 3));

echo('o=Abacus.Math.ikthroot(2, 2)');
echo(o=Abacus.Math.ikthroot(2, 2));

echo('o=Abacus.Math.ikthroot(4, 2)');
echo(o=Abacus.Math.ikthroot(4, 2));

echo('o=Abacus.Math.ikthroot(27, 3)');
echo(o=Abacus.Math.ikthroot(27, 3));

echo('o=Abacus.Math.ikthroot(81, 4)');
echo(o=Abacus.Math.ikthroot(81, 4));

echo('o=Abacus.Math.ikthroot(90, 4)');
echo(o=Abacus.Math.ikthroot(90, 4));

echo('---');

echo('Integer Divisors');
echo('o=Abacus.Math.divisors(1)');
echo(o=Abacus.Math.divisors(1));

echo('o=Abacus.Math.divisors(2)');
echo(o=Abacus.Math.divisors(2));

echo('o=Abacus.Math.divisors(4)');
echo(o=Abacus.Math.divisors(4));

echo('o=Abacus.Math.divisors(5)');
echo(o=Abacus.Math.divisors(5));

echo('o=Abacus.Math.divisors(10)');
echo(o=Abacus.Math.divisors(10));

echo('o=Abacus.Math.divisors(100)');
echo(o=Abacus.Math.divisors(100));

echo('o=Abacus.Math.divisors(1000, true).get()');
echo('o2=Abacus.Math.divisors(10000, true).get()');
o=Abacus.Math.divisors(1000, true);
o2=Abacus.Math.divisors(10000, true);
echo(o.get());
echo(o2.get());
echo('---');

echo('Square Root modulo Prime');
echo('o=Abacus.Math.isqrtp(10, 13)');
echo(o=Abacus.Math.isqrtp(10, 13), 13-o);
echo((o * o) % 13, 10);

echo('o=Abacus.Math.isqrtp(56, 101)');
echo(o=Abacus.Math.isqrtp(56, 101), 101-o);
echo((o * o ) % 101, 56);

echo('o=Abacus.Math.isqrtp(1030, 10009)');
echo(o=Abacus.Math.isqrtp(1030, 10009), 10009-o);
echo((o * o) % 10009, 1030);

echo('o=Abacus.Math.isqrtp(44402, 100049)');
echo(o=Abacus.Math.isqrtp(44402, 100049), 100049-o);
echo((o * o) % 100049, 44402);

echo('---');

echo('Moebius Function');
echo('o=Abacus.Math.moebius(1)');
echo(o=Abacus.Math.moebius(1));

echo('o=Abacus.Math.moebius(2)');
echo(o=Abacus.Math.moebius(2));

echo('o=Abacus.Math.moebius(6)');
echo(o=Abacus.Math.moebius(6));

echo('o=Abacus.Math.moebius(17)');
echo(o=Abacus.Math.moebius(17));

echo('o=Abacus.Math.moebius(25)');
echo(o=Abacus.Math.moebius(25));

echo('---');

echo('GCD of multiple numbers');
echo('o=Abacus.Math.gcd(1, 2)');
echo(o=Abacus.Math.gcd(1, 2));

echo('o=Abacus.Math.gcd(0, 0)');
echo(o=Abacus.Math.gcd(0, 0));

echo('o=Abacus.Math.gcd(0, 2)');
echo(o=Abacus.Math.gcd(0, 2));

echo('o=Abacus.Math.gcd(2, 0)');
echo(o=Abacus.Math.gcd(2, 0));

echo('o=Abacus.Math.gcd(0, 0, 2)');
echo(o=Abacus.Math.gcd(0, 0, 2));

echo('o=Abacus.Math.gcd(2, 0, 0)');
echo(o=Abacus.Math.gcd(2, 0, 0));

echo('o=Abacus.Math.gcd(2, 0, 0, 3)');
echo(o=Abacus.Math.gcd(2, 0, 0, 3));

echo('o=Abacus.Math.gcd(74, 32, 16, 153)');
echo(o=Abacus.Math.gcd(74, 32, 16, 153));

echo('---');

echo('LCM of multiple numbers');
echo('o=Abacus.Math.lcm(1, 2)');
echo(o=Abacus.Math.lcm(1, 2), 2);

echo('o=Abacus.Math.lcm(0, 0)');
echo(o=Abacus.Math.lcm(0, 0), 0);

echo('o=Abacus.Math.lcm(0, 2)');
echo(o=Abacus.Math.lcm(0, 2), 0);

echo('o=Abacus.Math.lcm(2, 0)');
echo(o=Abacus.Math.lcm(2, 0), 0);

echo('o=Abacus.Math.lcm(0, 0, 2)');
echo(o=Abacus.Math.lcm(0, 0, 2), 0);

echo('o=Abacus.Math.lcm(2, 0, 0)');
echo(o=Abacus.Math.lcm(2, 0, 0), 0);

echo('o=Abacus.Math.lcm(2, 0, 0, 3)');
echo(o=Abacus.Math.lcm(2, 0, 0, 3), 0);

echo('o=Abacus.Math.lcm(2, 2, 2, 2)');
echo(o=Abacus.Math.lcm(2, 2, 2, 2), 2);

echo('o=Abacus.Math.lcm(2, 2, 3, 3)');
echo(o=Abacus.Math.lcm(2, 2, 3, 3), 6);

echo('o=Abacus.Math.lcm(4, 6)');
echo(o=Abacus.Math.lcm(4, 6), 12);

echo('o=Abacus.Math.lcm(21, 6)');
echo(o=Abacus.Math.lcm(21, 6), 42);

echo('o=Abacus.Math.lcm(48, 180)');
echo(o=Abacus.Math.lcm(48, 180), 720);

echo('o=Abacus.Math.lcm(74, 32, 16, 153)');
echo(o=Abacus.Math.lcm(74, 32, 16, 153));

echo('---');

echo('Extended GCD of multiple numbers');
echo('o=Abacus.Math.xgcd(1)');
echo(o=Abacus.Math.xgcd(1));

echo('o=Abacus.Math.xgcd(-1)');
echo(o=Abacus.Math.xgcd(-1));

echo('o=Abacus.Math.xgcd(1, 2)');
echo(o=Abacus.Math.xgcd(1, 2));

echo('o=Abacus.Math.xgcd(0, 2)');
echo(o=Abacus.Math.xgcd(0, 2));

echo('o=Abacus.Math.xgcd(2, 0)');
echo(o=Abacus.Math.xgcd(2, 0));

echo('o=Abacus.Math.xgcd(2, 0, 4)');
echo(o=Abacus.Math.xgcd(2, 0, 4));

echo('o=Abacus.Math.xgcd(0, -2)');
echo(o=Abacus.Math.xgcd(0, -2));

echo('o=Abacus.Math.xgcd(-2, 0)');
echo(o=Abacus.Math.xgcd(-2, 0));

echo('o=Abacus.Math.xgcd(-2, 0, 4)');
echo(o=Abacus.Math.xgcd(-2, 0, 4));

echo('o=Abacus.Math.xgcd(-15, 0, 30)');
echo(o=Abacus.Math.xgcd(-15, 0, 30));

echo('o=Abacus.Math.xgcd(12, 34, 7)');
echo(o=Abacus.Math.xgcd(12, 34, 7));
echo(o[0],o[1]*12+o[2]*34+o[3]*7);

echo('o=Abacus.Math.xgcd(16, 153)');
echo(o=Abacus.Math.xgcd(16, 153));
echo(o[0],o[1]*16+o[2]*153);

echo('o=Abacus.Math.xgcd(16, -153)');
echo(o=Abacus.Math.xgcd(16, -153));
echo(o[0],o[1]*16-o[2]*153);

echo('o=Abacus.Math.xgcd(74, 32, 16, 153)');
echo(o=Abacus.Math.xgcd(74, 32, 16, 153));
echo(o[0],o[1]*74+o[2]*32+o[3]*16+o[4]*153);

echo('o=Abacus.Math.xgcd(74, 32, 16, -153)');
echo(o=Abacus.Math.xgcd(74, 32, 16, -153));
echo(o[0],o[1]*74+o[2]*32+o[3]*16-o[4]*153);

echo('o=Abacus.Math.xgcd(12, 4, 36, 128)');
echo(o=Abacus.Math.xgcd(12, 4, 36, 128));
echo(o[0],o[1]*12+o[2]*4+o[3]*36+o[4]*128);

echo('o=Abacus.Math.xgcd(12, -4, 36, -128)');
echo(o=Abacus.Math.xgcd(12, -4, 36, -128));
echo(o[0],o[1]*12-o[2]*4+o[3]*36-o[4]*128);

echo('o=Abacus.Math.xgcd(20, 4)');
echo(o=Abacus.Math.xgcd(20, 4));
echo(o[0],o[1]*20+o[2]*4);

echo('o=Abacus.Math.xgcd(25, 20)');
echo(o=Abacus.Math.xgcd(25, 20));
echo(o[0],o[1]*25+o[2]*20);

echo('o=Abacus.Math.xgcd(25, 20, 4)');
echo(o=Abacus.Math.xgcd(25, 20, 4));
echo(o[0],o[1]*25+o[2]*20+o[3]*4);

echo('---');
