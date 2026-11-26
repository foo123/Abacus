### Example API

```javascript
const o = Abacus.Permutation(4);
console.log(String(o.total()));
console.log('---');
for (let item of o)
{
    console.log(item.join(','));
}
```

```text
24
---
0,1,2,3
0,1,3,2
0,2,1,3
0,2,3,1
0,3,1,2
0,3,2,1
1,0,2,3
1,0,3,2
1,2,0,3
1,2,3,0
1,3,0,2
1,3,2,0
2,0,1,3
2,0,3,1
2,1,0,3
2,1,3,0
2,3,0,1
2,3,1,0
3,0,1,2
3,0,2,1
3,1,0,2
3,1,2,0
3,2,0,1
3,2,1,0
```

```javascript
const o = Abacus.Partition(6);
console.log(String(o.total()));
console.log('---');
for (let item of o)
{
    console.log(item.join('+'));
}
```

```text
11
---
1+1+1+1+1+1
2+1+1+1+1
2+2+1+1
2+2+2
3+1+1+1
3+2+1
3+3
4+1+1
4+2
5+1
6
```

```javascript
const p = Abacus.Expr("ax^2 + bx + c").toPoly("x");
console.log(p.discriminant().toString());

const ring = Abacus.Ring.Q("x", "y");
const p1 = ring.fromString("x^2*y + x^3");
const p2 = ring.fromString("(x + y)^2");
const p3 = ring.fromString("x^2 + x*y^2 + x*y + x + y^3 + y");
console.log(ring.gcd(p1, p2, p3).toString());

console.log(ring.fromString("x^2+y").resultant(ring.fromString("x-2*y"), "x").toString());
console.log(ring.fromString("x^2+y").resultant(ring.fromString("x-2*y"), "y").toString());
```

```text
-4*a*c + b^2

x + y

4*y^2 + y
2*x^2 + x
```

```javascript
const field1 = Abacus.Ring.Q("x").associatedField();

const m1 = Abacus.Matrix(field1, [
    ["x-1", "x^2-1"],
    ["x^2-1", "x-1"]
]);

console.log(m1.toString());
console.log(m1.inv().toString());
console.log(m1.inv().mul(m1).toString());

const field2 = Abacus.Ring.Q("x","y").associatedField();

const m2 = Abacus.Matrix(field2, [
    ["x^2 + x*y", "x*y + y^2"],
    ["x*y + y^2", "x^2 + x*y"]
]);

console.log(m2.toString());
console.log(m2.inv().toString());
console.log(m2.inv().mul(m2).toString());
```

```text
[  x-1 x^2-1]
[x^2-1   x-1]

[   -1/(x^3+x^2-2*x) (x+1)/(x^3+x^2-2*x)]
[(x+1)/(x^3+x^2-2*x)    -1/(x^3+x^2-2*x)]

[1 0]
[0 1]

[x^2 + x*y x*y + y^2]
[x*y + y^2 x^2 + x*y]

[ x/(x^3 + x^2*y - x*y^2 - y^3)      -y/(x^3 + x^2*y - x*y^2 - y^3)]
[-y/(x^3 + x^2*y - x*y^2 - y^3) x*y/(x^3*y + x^2*y^2 - x*y^3 - y^4)]

[1 0]
[0 1]
```

```javascript
const exp = (x) => Abacus.PowerSeries("exp("+x+")", "x");

console.log(exp("x").toString());
console.log(exp("x").mul(exp("-x")).toString());
```

```text
1 + x + (1/2)*x^2 + (1/6)*x^3 + (1/24)*x^4 + (1/120)*x^5 + ...
1
```
