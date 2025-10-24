// math utilities
function addn(s, a)
{
    return s + a;
}
function muln(p, a)
{
    return p * a;
}
function sum(x, i0, i1, ik)
{
    var Arithmetic = Abacus.Arithmetic;
    return operate(function(s, x) {
        return s instanceof INumber ? s.add(x) : (x instanceof INumber ? x.add(s) : Arithmetic.add(s, x));
    }, Arithmetic.O, x, i0, i1, ik);
}
function product(x, i0, i1, ik)
{
    var Arithmetic = Abacus.Arithmetic;
    return operate(function(p, x) {
        return p instanceof INumber ? p.mul(x) : (x instanceof INumber ? x.mul(p) : Arithmetic.mul(p, x));
    }, Arithmetic.I, x, i0, i1, ik);
}
// modular arithmetic
function negm(a, m)
{
    // modulo additive inverse, supports Exact Big Integer Arithmetic if plugged in
    var Arithmetic = Abacus.Arithmetic;
    //m = Arithmetic.num(m);
    if (Arithmetic.equ(m, Arithmetic.I)) return Arithmetic.O;
    return Arithmetic.mod(Arithmetic.sub(m, a), m);
}
function addm(a, b, m)
{
    // modulo addition, supports Exact Big Integer Arithmetic if plugged in
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num;
    //m = N(m);
    if (Arithmetic.equ(m, Arithmetic.I)) return Arithmetic.O;
    return Arithmetic.mod(Arithmetic.add(/*N(*/a/*)*/, /*N(*/b/*)*/), m);
}
function mulm(a, b, m)
{
    // modulo multiplication, supports Exact Big Integer Arithmetic if plugged in
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num;
    //m = N(m);
    if (Arithmetic.equ(m, Arithmetic.I)) return Arithmetic.O;
    a = Arithmetic.mod(/*N(*/a/*)*/, m);
    b = Arithmetic.mod(/*N(*/b/*)*/, m);
    return Arithmetic.mod(Arithmetic.mul(a, b), m);
}
function invm(a, m)
{
    // modulo multiplicative inverse, supports Exact Big Integer Arithmetic if plugged in
    // https://en.wikipedia.org/wiki/Modular_multiplicative_inverse
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, N = Arithmetic.num,
        inv = Arithmetic.J, q, r, r1, r2, t, t1 = O, t2 = I;

    //a = N(a); m = N(m);
    r1 = m; r2 = a;
    while (!Arithmetic.equ(O, r2))
    {
        q = Arithmetic.div(r1, r2);
        r = Arithmetic.mod(r1, r2);
        r1 = r2;
        r2 = r;

        t = Arithmetic.sub(t1, Arithmetic.mul(q, t2));
        t1 = t2;
        t2 = t;
    }
    if (Arithmetic.equ(I, r1)) inv = t1;
    if (Arithmetic.gt(O, inv)) inv = Arithmetic.add(inv, m);
    return inv;
}
function powm(b, e, m)
{
    // modulo power, supports Exact Big Integer Arithmetic if plugged in
    // https://en.wikipedia.org/wiki/Modular_exponentiation#Pseudocode
    // https://en.wikipedia.org/wiki/Exponentiation_by_squaring
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I,
        N = Arithmetic.num, two, pow;

    //b = N(b); m = N(m); e = N(e);
    if (Arithmetic.equ(I, m)) return O;
    else if (Arithmetic.equ(O, e)) return I;
    pow = I;
    b = Arithmetic.mod(b, m);
    if (Arithmetic.gt(O, e))
    {
        e = Arithmetic.abs(e);
        b = invm(b, m);
    }
    if (Arithmetic.equ(I, e)) return b;
    if (Arithmetic.isDefault() || Arithmetic.lte(e, MAX_DEFAULT))
    {
        // use bitwise operators for usual (small integer) exponents
        e = Arithmetic.val(e);
        while (0 !== e)
        {
            if (e & 1) pow = mulm(pow, b, m);
            e >>= 1;
            b = mulm(b, b, m);
        }
    }
    else
    {
        two = Arithmetic.II;
        while (!Arithmetic.equ(e, O))
        {
            if (Arithmetic.equ(I, Arithmetic.mod(e, two))) pow = mulm(pow, b, m);
            e = Arithmetic.div(e, two);
            b = mulm(b, b, m);
        }
    }
    return pow;
}
function powsq(b, e)
{
    // power, supports Exact Big Integer Arithmetic if plugged in
    // https://en.wikipedia.org/wiki/Exponentiation_by_squaring
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I,
        N = Arithmetic.num, two, pow;

    //b = N(b); e = N(e);

    if (Arithmetic.gt(O, e)) return null; // does not support negative powers for integers
    else if (Arithmetic.equ(O, e)) return I;
    else if (Arithmetic.equ(I, e)) return b;

    pow = I;
    if (Arithmetic.isDefault() || Arithmetic.lte(e, MAX_DEFAULT))
    {
        // use bitwise operators for usual (small integer) exponents
        e = Arithmetic.val(e);
        while (0 !== e)
        {
            if (e & 1) pow = Arithmetic.mul(pow, b);
            e >>= 1;
            b = Arithmetic.mul(b, b);
        }
    }
    else
    {
        two = Arithmetic.II;
        while (!Arithmetic.equ(O, e))
        {
            if (Arithmetic.equ(I, Arithmetic.mod(e, two))) pow = Arithmetic.mul(pow, b);
            e = Arithmetic.div(e, two);
            b = Arithmetic.mul(b, b);
        }
    }
    return pow;
}
function isqrt(n)
{
    // integer square root
    // https://en.wikipedia.org/wiki/Integer_square_root
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
        start, end, mid, mid2, sqrt, two;
    //n = N(n);
    //n = Arithmetic.abs(n);

    if (Arithmetic.equ(n, O) || Arithmetic.equ(n, I)) return n;

    // for default arithmetic and numbers use built-in square root, floored
    if (Arithmetic.isDefault() || Arithmetic.lte(n, MAX_DEFAULT))
        return Arithmetic.num(stdMath.floor(stdMath.sqrt(Arithmetic.val(n))));

    two = Arithmetic.II;
    // Binary Search (O(logn))
    start = I; end = Arithmetic.div(n, two); sqrt = start;
    while (Arithmetic.lte(start, end))
    {
        mid = Arithmetic.div(Arithmetic.add(start, end), two);
        mid2 = Arithmetic.mul(mid, mid);

        if (Arithmetic.equ(mid2, n)) return mid;

        if (Arithmetic.lt(mid2, n))
        {
            start = Arithmetic.add(mid, I);
            sqrt = mid;
        }
        else
        {
            end = Arithmetic.sub(mid, I);
        }
    }
    return sqrt;
}
function jskthroot(x, k)
{
    var kg, r, p;
    k = +k;
    if (0 === k) return null;
    if (0 > k)
    {
        x = 1.0/x;
        k = -k;
    }
    if (1 === k) return x;
    kg = k & 1;
    if ((1 === kg) && (0 > x)) x = -x;
    r = stdMath.pow(x, 1.0/k); p = stdMath.pow(r, k);

    if ((stdMath.abs(x-p) < 1.0) && ((0 < x) === (0 < p)))
        return kg && (0 > x) ? -r : r;
    return 1;
}
function ikthroot(n, k)
{
    // Return the integer k-th root of a number by Newton's method
    var Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, u, r, k_1;

    if (Arithmetic.gt(I, k)) return null; // undefined
    else if (Arithmetic.equ(I, k) || Arithmetic.equ(n, I) || Arithmetic.equ(n, Arithmetic.O)) return n;

    if (Arithmetic.isDefault() || Arithmetic.lte(n, MAX_DEFAULT))
        return Arithmetic.num(stdMath.floor(jskthroot(Arithmetic.val(n), Arithmetic.val(k))));

    k_1 = Arithmetic.sub(k, I);
    u = n;
    r = Arithmetic.add(n, I);
    while (Arithmetic.lt(u, r))
    {
        r = u;
        u = Arithmetic.div(Arithmetic.add(Arithmetic.mul(r, k_1), Arithmetic.div(n, Arithmetic.pow(r, k_1))), k);
    }
    return r;
}
/*function quadres(a, n)
{
    // https://en.wikipedia.org/wiki/Quadratic_residue
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        q, x, z;
    a = N(a); n = N(n);
    q = Arithmetic.div(Arithmetic.sub(n, I), two);
    x = q; //Arithmetic.pow(q, I);
    if (Arithmetic.equ(x, O)) return I;

    a = Arithmetic.mod(a, n);
    z = I;
    while (!Arithmetic.equ(x, O))
    {
        if (Arithmetic.equ(O, Arithmetic.mod(x, two)))
        {
            a = Arithmetic.mod(Arithmetic.mul(a, a), n);
            x = Arithmetic.div(x, two);
        }
        else
        {
            x = Arithmetic.sub(x, I);
            z = Arithmetic.mod(Arithmetic.mul(z, a), n);
        }
    }
    return z;
}*/
function jacobi_symbol(m, n, g)
{
    // https://en.wikipedia.org/wiki/Jacobi_symbol
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, O = Arithmetic.O,
        J = Arithmetic.J, I = Arithmetic.I, two = Arithmetic.II,
        j, t, three, four, five, eight;

    if (Arithmetic.lt(n, O) || Arithmetic.equ(O, Arithmetic.mod(n, two))) return null; //n should be an odd positive integer
    if (Arithmetic.lt(m, O) || Arithmetic.gt(m, n)) m = Arithmetic.mod(m, n);
    if (Arithmetic.equ(O, m)) return Arithmetic.equ(I, n) ? I : O;
    if (Arithmetic.equ(I, n) || Arithmetic.equ(I, m)) return I;
    if (null == g) g = gcd(m, n);
    if (!Arithmetic.equ(I, g)) return O;

    three = N(3); four = N(4); five = N(5); eight = N(8);
    j = I;
    if (Arithmetic.lt(m, O))
    {
        m = Arithmetic.mul(J, m);
        if (Arithmetic.equ(Arithmetic.mod(n, four), three)) j = Arithmetic.mul(J, j);
    }
    while (!Arithmetic.equ(O, m))
    {
        while (Arithmetic.gt(m, O) && Arithmetic.equ(O, Arithmetic.mod(m, two)))
        {
            m = Arithmetic.div(m, two);
            t = Arithmetic.mod(n, eight);
            if (Arithmetic.equ(t, three) || Arithmetic.equ(t, five)) j = Arithmetic.mul(J, j);
        }
        t = m; m = n; n = t;
        if (Arithmetic.equ(three, Arithmetic.mod(m, four)) && Arithmetic.equ(three, Arithmetic.mod(n, four))) j = Arithmetic.mul(J, j);
        m = Arithmetic.mod(m, n);
    }
    if (!Arithmetic.equ(I, n)) j = O;

    return j;
}
function legendre_symbol(a, p)
{
    // https://en.wikipedia.org/wiki/Legendre_symbol
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, I = Arithmetic.I, two = Arithmetic.II;
    //a = N(a); p = N(p);
    // built-in powm uses exponention by squaring thus is efficient
    return powm(a, Arithmetic.div(Arithmetic.sub(p, I), two), p);
}
function isqrtp(n, p)
{
    // square root modulo prime p
    // https://en.wikipedia.org/wiki/Quadratic_residue
    // https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
    two, p_1, q, s, z, c, r, r2, t, m, t2, b, i;

    //n = N(n); p = N(p);

    if (!Arithmetic.equ(I, legendre_symbol(n, p))) return null; // not a square (mod p)

    two = Arithmetic.II;
    p_1 = Arithmetic.sub(p, I);
    q = p_1;
    s = 0
    while (Arithmetic.equ(O, Arithmetic.mod(q, two)))
    {
        q  = Arithmetic.div(q, two);
        s += 1;
    }
    if (1 === s) return powm(n, Arithmetic.div(Arithmetic.add(p, I), 4), p);

    for (z=O; Arithmetic.lt(z, p); z=Arithmetic.add(z, I))
    {
        if (Arithmetic.equ(p_1, legendre_symbol(z, p)))
            break;
    }
    c = powm(z, q, p);
    r = powm(n, Arithmetic.div(Arithmetic.add(q, I), two), p);
    t = powm(n, q, p);
    m = s;
    t2 = O
    while (!Arithmetic.equ(O, Arithmetic.mod(Arithmetic.sub(t, I), p)))
    {
        t2 = mulm(t, t, p);
        for (i=1; i<m; ++i)
        {
            if (Arithmetic.equ(O, Arithmetic.mod(Arithmetic.sub(t2, I), p))) break;
            t2 = mulm(t2, t2, p);
        }
        b = powm(c, Arithmetic.shl(I, m-i-1), p);
        r = mulm(r, b, p);
        c = mulm(b, b, p);
        t = mulm(t, c, p);
        m = i
    }
    // r and p-r are roots, return smallest
    r2 = Arithmetic.sub(p, r);
    return Arithmetic.lt(r2, r) ? r2 : r;
}
function ikthrootp(n, k, p)
{
    // kth root of n modulo prime p
    // https://www3.nd.edu/~sevens/13187unit16.pdf
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, g;

    //if (Arithmetic.equ(O, Arithmetic.mod(n, p))) return null; // not supported
    g = xgcd(k, Arithmetic.sub(p, I));
    //if (!Arithmetic.equ(I, g[0])) return null; // not supported
    return powm(n, g[1], p);
}
function ilog(x, b)
{
    // integer logarithm, greatest integer l such that b^l <= x.
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, log = O;

    if (Arithmetic.lt(b, Arithmetic.II)) return O; // 0 or 1 as base, return 0

    if (Arithmetic.lte(x, b)) return Arithmetic.equ(x, b) ? I : O; // base greater or equal to x, either 0 or 1

    if (Arithmetic.isDefault() || Arithmetic.lte(x, MAX_DEFAULT))
        return Arithmetic.num(stdMath.floor(stdMath.log(Arithmetic.val(x))/stdMath.log(Arithmetic.val(b))));

    while (Arithmetic.gte(x, b))
    {
        x = Arithmetic.div(x, b);
        log = Arithmetic.add(log, I);
    }
    return log;
}
function small_primes()
{
    var N = Abacus.Arithmetic.num;
    if (!small_primes.list)
    {
        // a list of the first primes up to a limit (first 2000 primes)
        small_primes.list = [N(2),N(3),N(5),N(7),N(11),N(13),N(17),N(19),N(23),N(29),N(31),N(37),N(41),N(43),N(47),N(53),N(59),N(61),N(67),N(71),N(73),N(79),N(83),N(89),N(97),N(101),N(103),N(107),N(109),N(113),N(127),N(131),N(137),N(139),N(149),N(151),N(157),N(163),N(167),N(173),N(179),N(181),N(191),N(193),N(197),N(199),N(211),N(223),N(227),N(229),N(233),N(239),N(241),N(251),N(257),N(263),N(269),N(271),N(277),N(281),N(283),N(293),N(307),N(311),N(313),N(317),N(331),N(337),N(347),N(349),N(353),N(359),N(367),N(373),N(379),N(383),N(389),N(397),N(401),N(409),N(419),N(421),N(431),N(433),N(439),N(443),N(449),N(457),N(461),N(463),N(467),N(479),N(487),N(491),N(499),N(503),N(509),N(521),N(523),N(541),N(547),N(557),N(563),N(569),N(571),N(577),N(587),N(593),N(599),N(601),N(607),N(613),N(617),N(619),N(631),N(641),N(643),N(647),N(653),N(659),N(661),N(673),N(677),N(683),N(691),N(701),N(709),N(719),N(727),N(733),N(739),N(743),N(751),N(757),N(761),N(769),N(773),N(787),N(797),N(809),N(811),N(821),N(823),N(827),N(829),N(839),N(853),N(857),N(859),N(863),N(877),N(881),N(883),N(887),N(907),N(911),N(919),N(929),N(937),N(941),N(947),N(953),N(967),N(971),N(977),N(983),N(991),N(997),N(1009),N(1013),N(1019),N(1021),N(1031),N(1033),N(1039),N(1049),N(1051),N(1061),N(1063),N(1069),N(1087),N(1091),N(1093),N(1097),N(1103),N(1109),N(1117),N(1123),N(1129),N(1151),N(1153),N(1163),N(1171),N(1181),N(1187),N(1193),N(1201),N(1213),N(1217),N(1223),N(1229),N(1231),N(1237),N(1249),N(1259),N(1277),N(1279),N(1283),N(1289),N(1291),N(1297),N(1301),N(1303),N(1307),N(1319),N(1321),N(1327),N(1361),N(1367),N(1373),N(1381),N(1399),N(1409),N(1423),N(1427),N(1429),N(1433),N(1439),N(1447),N(1451),N(1453),N(1459),N(1471),N(1481),N(1483),N(1487),N(1489),N(1493),N(1499),N(1511),N(1523),N(1531),N(1543),N(1549),N(1553),N(1559),N(1567),N(1571),N(1579),N(1583),N(1597),N(1601),N(1607),N(1609),N(1613),N(1619),N(1621),N(1627),N(1637),N(1657),N(1663),N(1667),N(1669),N(1693),N(1697),N(1699),N(1709),N(1721),N(1723),N(1733),N(1741),N(1747),N(1753),N(1759),N(1777),N(1783),N(1787),N(1789),N(1801),N(1811),N(1823),N(1831),N(1847),N(1861),N(1867),N(1871),N(1873),N(1877),N(1879),N(1889),N(1901),N(1907),N(1913),N(1931),N(1933),N(1949),N(1951),N(1973),N(1979),N(1987),N(1993),N(1997),N(1999),N(2003),N(2011),N(2017),N(2027),N(2029),N(2039),N(2053),N(2063),N(2069),N(2081),N(2083),N(2087),N(2089),N(2099),N(2111),N(2113),N(2129),N(2131),N(2137),N(2141),N(2143),N(2153),N(2161),N(2179),N(2203),N(2207),N(2213),N(2221),N(2237),N(2239),N(2243),N(2251),N(2267),N(2269),N(2273),N(2281),N(2287),N(2293),N(2297),N(2309),N(2311),N(2333),N(2339),N(2341),N(2347),N(2351),N(2357),N(2371),N(2377),N(2381),N(2383),N(2389),N(2393),N(2399),N(2411),N(2417),N(2423),N(2437),N(2441),N(2447),N(2459),N(2467),N(2473),N(2477),N(2503),N(2521),N(2531),N(2539),N(2543),N(2549),N(2551),N(2557),N(2579),N(2591),N(2593),N(2609),N(2617),N(2621),N(2633),N(2647),N(2657),N(2659),N(2663),N(2671),N(2677),N(2683),N(2687),N(2689),N(2693),N(2699),N(2707),N(2711),N(2713),N(2719),N(2729),N(2731),N(2741),N(2749),N(2753),N(2767),N(2777),N(2789),N(2791),N(2797),N(2801),N(2803),N(2819),N(2833),N(2837),N(2843),N(2851),N(2857),N(2861),N(2879),N(2887),N(2897),N(2903),N(2909),N(2917),N(2927),N(2939),N(2953),N(2957),N(2963),N(2969),N(2971),N(2999),N(3001),N(3011),N(3019),N(3023),N(3037),N(3041),N(3049),N(3061),N(3067),N(3079),N(3083),N(3089),N(3109),N(3119),N(3121),N(3137),N(3163),N(3167),N(3169),N(3181),N(3187),N(3191),N(3203),N(3209),N(3217),N(3221),N(3229),N(3251),N(3253),N(3257),N(3259),N(3271),N(3299),N(3301),N(3307),N(3313),N(3319),N(3323),N(3329),N(3331),N(3343),N(3347),N(3359),N(3361),N(3371),N(3373),N(3389),N(3391),N(3407),N(3413),N(3433),N(3449),N(3457),N(3461),N(3463),N(3467),N(3469),N(3491),N(3499),N(3511),N(3517),N(3527),N(3529),N(3533),N(3539),N(3541),N(3547),N(3557),N(3559),N(3571),N(3581),N(3583),N(3593),N(3607),N(3613),N(3617),N(3623),N(3631),N(3637),N(3643),N(3659),N(3671),N(3673),N(3677),N(3691),N(3697),N(3701),N(3709),N(3719),N(3727),N(3733),N(3739),N(3761),N(3767),N(3769),N(3779),N(3793),N(3797),N(3803),N(3821),N(3823),N(3833),N(3847),N(3851),N(3853),N(3863),N(3877),N(3881),N(3889),N(3907),N(3911),N(3917),N(3919),N(3923),N(3929),N(3931),N(3943),N(3947),N(3967),N(3989),N(4001),N(4003),N(4007),N(4013),N(4019),N(4021),N(4027),N(4049),N(4051),N(4057),N(4073),N(4079),N(4091),N(4093),N(4099),N(4111),N(4127),N(4129),N(4133),N(4139),N(4153),N(4157),N(4159),N(4177),N(4201),N(4211),N(4217),N(4219),N(4229),N(4231),N(4241),N(4243),N(4253),N(4259),N(4261),N(4271),N(4273),N(4283),N(4289),N(4297),N(4327),N(4337),N(4339),N(4349),N(4357),N(4363),N(4373),N(4391),N(4397),N(4409),N(4421),N(4423),N(4441),N(4447),N(4451),N(4457),N(4463),N(4481),N(4483),N(4493),N(4507),N(4513),N(4517),N(4519),N(4523),N(4547),N(4549),N(4561),N(4567),N(4583),N(4591),N(4597),N(4603),N(4621),N(4637),N(4639),N(4643),N(4649),N(4651),N(4657),N(4663),N(4673),N(4679),N(4691),N(4703),N(4721),N(4723),N(4729),N(4733),N(4751),N(4759),N(4783),N(4787),N(4789),N(4793),N(4799),N(4801),N(4813),N(4817),N(4831),N(4861),N(4871),N(4877),N(4889),N(4903),N(4909),N(4919),N(4931),N(4933),N(4937),N(4943),N(4951),N(4957),N(4967),N(4969),N(4973),N(4987),N(4993),N(4999),N(5003),N(5009),N(5011),N(5021),N(5023),N(5039),N(5051),N(5059),N(5077),N(5081),N(5087),N(5099),N(5101),N(5107),N(5113),N(5119),N(5147),N(5153),N(5167),N(5171),N(5179),N(5189),N(5197),N(5209),N(5227),N(5231),N(5233),N(5237),N(5261),N(5273),N(5279),N(5281),N(5297),N(5303),N(5309),N(5323),N(5333),N(5347),N(5351),N(5381),N(5387),N(5393),N(5399),N(5407),N(5413),N(5417),N(5419),N(5431),N(5437),N(5441),N(5443),N(5449),N(5471),N(5477),N(5479),N(5483),N(5501),N(5503),N(5507),N(5519),N(5521),N(5527),N(5531),N(5557),N(5563),N(5569),N(5573),N(5581),N(5591),N(5623),N(5639),N(5641),N(5647),N(5651),N(5653),N(5657),N(5659),N(5669),N(5683),N(5689),N(5693),N(5701),N(5711),N(5717),N(5737),N(5741),N(5743),N(5749),N(5779),N(5783),N(5791),N(5801),N(5807),N(5813),N(5821),N(5827),N(5839),N(5843),N(5849),N(5851),N(5857),N(5861),N(5867),N(5869),N(5879),N(5881),N(5897),N(5903),N(5923),N(5927),N(5939),N(5953),N(5981),N(5987),N(6007),N(6011),N(6029),N(6037),N(6043),N(6047),N(6053),N(6067),N(6073),N(6079),N(6089),N(6091),N(6101),N(6113),N(6121),N(6131),N(6133),N(6143),N(6151),N(6163),N(6173),N(6197),N(6199),N(6203),N(6211),N(6217),N(6221),N(6229),N(6247),N(6257),N(6263),N(6269),N(6271),N(6277),N(6287),N(6299),N(6301),N(6311),N(6317),N(6323),N(6329),N(6337),N(6343),N(6353),N(6359),N(6361),N(6367),N(6373),N(6379),N(6389),N(6397),N(6421),N(6427),N(6449),N(6451),N(6469),N(6473),N(6481),N(6491),N(6521),N(6529),N(6547),N(6551),N(6553),N(6563),N(6569),N(6571),N(6577),N(6581),N(6599),N(6607),N(6619),N(6637),N(6653),N(6659),N(6661),N(6673),N(6679),N(6689),N(6691),N(6701),N(6703),N(6709),N(6719),N(6733),N(6737),N(6761),N(6763),N(6779),N(6781),N(6791),N(6793),N(6803),N(6823),N(6827),N(6829),N(6833),N(6841),N(6857),N(6863),N(6869),N(6871),N(6883),N(6899),N(6907),N(6911),N(6917),N(6947),N(6949),N(6959),N(6961),N(6967),N(6971),N(6977),N(6983),N(6991),N(6997),N(7001),N(7013),N(7019),N(7027),N(7039),N(7043),N(7057),N(7069),N(7079),N(7103),N(7109),N(7121),N(7127),N(7129),N(7151),N(7159),N(7177),N(7187),N(7193),N(7207),N(7211),N(7213),N(7219),N(7229),N(7237),N(7243),N(7247),N(7253),N(7283),N(7297),N(7307),N(7309),N(7321),N(7331),N(7333),N(7349),N(7351),N(7369),N(7393),N(7411),N(7417),N(7433),N(7451),N(7457),N(7459),N(7477),N(7481),N(7487),N(7489),N(7499),N(7507),N(7517),N(7523),N(7529),N(7537),N(7541),N(7547),N(7549),N(7559),N(7561),N(7573),N(7577),N(7583),N(7589),N(7591),N(7603),N(7607),N(7621),N(7639),N(7643),N(7649),N(7669),N(7673),N(7681),N(7687),N(7691),N(7699),N(7703),N(7717),N(7723),N(7727),N(7741),N(7753),N(7757),N(7759),N(7789),N(7793),N(7817),N(7823),N(7829),N(7841),N(7853),N(7867),N(7873),N(7877),N(7879),N(7883),N(7901),N(7907),N(7919),N(7927),N(7933),N(7937),N(7949),N(7951),N(7963),N(7993),N(8009),N(8011),N(8017),N(8039),N(8053),N(8059),N(8069),N(8081),N(8087),N(8089),N(8093),N(8101),N(8111),N(8117),N(8123),N(8147),N(8161),N(8167),N(8171),N(8179),N(8191),N(8209),N(8219),N(8221),N(8231),N(8233),N(8237),N(8243),N(8263),N(8269),N(8273),N(8287),N(8291),N(8293),N(8297),N(8311),N(8317),N(8329),N(8353),N(8363),N(8369),N(8377),N(8387),N(8389),N(8419),N(8423),N(8429),N(8431),N(8443),N(8447),N(8461),N(8467),N(8501),N(8513),N(8521),N(8527),N(8537),N(8539),N(8543),N(8563),N(8573),N(8581),N(8597),N(8599),N(8609),N(8623),N(8627),N(8629),N(8641),N(8647),N(8663),N(8669),N(8677),N(8681),N(8689),N(8693),N(8699),N(8707),N(8713),N(8719),N(8731),N(8737),N(8741),N(8747),N(8753),N(8761),N(8779),N(8783),N(8803),N(8807),N(8819),N(8821),N(8831),N(8837),N(8839),N(8849),N(8861),N(8863),N(8867),N(8887),N(8893),N(8923),N(8929),N(8933),N(8941),N(8951),N(8963),N(8969),N(8971),N(8999),N(9001),N(9007),N(9011),N(9013),N(9029),N(9041),N(9043),N(9049),N(9059),N(9067),N(9091),N(9103),N(9109),N(9127),N(9133),N(9137),N(9151),N(9157),N(9161),N(9173),N(9181),N(9187),N(9199),N(9203),N(9209),N(9221),N(9227),N(9239),N(9241),N(9257),N(9277),N(9281),N(9283),N(9293),N(9311),N(9319),N(9323),N(9337),N(9341),N(9343),N(9349),N(9371),N(9377),N(9391),N(9397),N(9403),N(9413),N(9419),N(9421),N(9431),N(9433),N(9437),N(9439),N(9461),N(9463),N(9467),N(9473),N(9479),N(9491),N(9497),N(9511),N(9521),N(9533),N(9539),N(9547),N(9551),N(9587),N(9601),N(9613),N(9619),N(9623),N(9629),N(9631),N(9643),N(9649),N(9661),N(9677),N(9679),N(9689),N(9697),N(9719),N(9721),N(9733),N(9739),N(9743),N(9749),N(9767),N(9769),N(9781),N(9787),N(9791),N(9803),N(9811),N(9817),N(9829),N(9833),N(9839),N(9851),N(9857),N(9859),N(9871),N(9883),N(9887),N(9901),N(9907),N(9923),N(9929),N(9931),N(9941),N(9949),N(9967),N(9973),N(10007),N(10009),N(10037),N(10039),N(10061),N(10067),N(10069),N(10079),N(10091),N(10093),N(10099),N(10103),N(10111),N(10133),N(10139),N(10141),N(10151),N(10159),N(10163),N(10169),N(10177),N(10181),N(10193),N(10211),N(10223),N(10243),N(10247),N(10253),N(10259),N(10267),N(10271),N(10273),N(10289),N(10301),N(10303),N(10313),N(10321),N(10331),N(10333),N(10337),N(10343),N(10357),N(10369),N(10391),N(10399),N(10427),N(10429),N(10433),N(10453),N(10457),N(10459),N(10463),N(10477),N(10487),N(10499),N(10501),N(10513),N(10529),N(10531),N(10559),N(10567),N(10589),N(10597),N(10601),N(10607),N(10613),N(10627),N(10631),N(10639),N(10651),N(10657),N(10663),N(10667),N(10687),N(10691),N(10709),N(10711),N(10723),N(10729),N(10733),N(10739),N(10753),N(10771),N(10781),N(10789),N(10799),N(10831),N(10837),N(10847),N(10853),N(10859),N(10861),N(10867),N(10883),N(10889),N(10891),N(10903),N(10909),N(10937),N(10939),N(10949),N(10957),N(10973),N(10979),N(10987),N(10993),N(11003),N(11027),N(11047),N(11057),N(11059),N(11069),N(11071),N(11083),N(11087),N(11093),N(11113),N(11117),N(11119),N(11131),N(11149),N(11159),N(11161),N(11171),N(11173),N(11177),N(11197),N(11213),N(11239),N(11243),N(11251),N(11257),N(11261),N(11273),N(11279),N(11287),N(11299),N(11311),N(11317),N(11321),N(11329),N(11351),N(11353),N(11369),N(11383),N(11393),N(11399),N(11411),N(11423),N(11437),N(11443),N(11447),N(11467),N(11471),N(11483),N(11489),N(11491),N(11497),N(11503),N(11519),N(11527),N(11549),N(11551),N(11579),N(11587),N(11593),N(11597),N(11617),N(11621),N(11633),N(11657),N(11677),N(11681),N(11689),N(11699),N(11701),N(11717),N(11719),N(11731),N(11743),N(11777),N(11779),N(11783),N(11789),N(11801),N(11807),N(11813),N(11821),N(11827),N(11831),N(11833),N(11839),N(11863),N(11867),N(11887),N(11897),N(11903),N(11909),N(11923),N(11927),N(11933),N(11939),N(11941),N(11953),N(11959),N(11969),N(11971),N(11981),N(11987),N(12007),N(12011),N(12037),N(12041),N(12043),N(12049),N(12071),N(12073),N(12097),N(12101),N(12107),N(12109),N(12113),N(12119),N(12143),N(12149),N(12157),N(12161),N(12163),N(12197),N(12203),N(12211),N(12227),N(12239),N(12241),N(12251),N(12253),N(12263),N(12269),N(12277),N(12281),N(12289),N(12301),N(12323),N(12329),N(12343),N(12347),N(12373),N(12377),N(12379),N(12391),N(12401),N(12409),N(12413),N(12421),N(12433),N(12437),N(12451),N(12457),N(12473),N(12479),N(12487),N(12491),N(12497),N(12503),N(12511),N(12517),N(12527),N(12539),N(12541),N(12547),N(12553),N(12569),N(12577),N(12583),N(12589),N(12601),N(12611),N(12613),N(12619),N(12637),N(12641),N(12647),N(12653),N(12659),N(12671),N(12689),N(12697),N(12703),N(12713),N(12721),N(12739),N(12743),N(12757),N(12763),N(12781),N(12791),N(12799),N(12809),N(12821),N(12823),N(12829),N(12841),N(12853),N(12889),N(12893),N(12899),N(12907),N(12911),N(12917),N(12919),N(12923),N(12941),N(12953),N(12959),N(12967),N(12973),N(12979),N(12983),N(13001),N(13003),N(13007),N(13009),N(13033),N(13037),N(13043),N(13049),N(13063),N(13093),N(13099),N(13103),N(13109),N(13121),N(13127),N(13147),N(13151),N(13159),N(13163),N(13171),N(13177),N(13183),N(13187),N(13217),N(13219),N(13229),N(13241),N(13249),N(13259),N(13267),N(13291),N(13297),N(13309),N(13313),N(13327),N(13331),N(13337),N(13339),N(13367),N(13381),N(13397),N(13399),N(13411),N(13417),N(13421),N(13441),N(13451),N(13457),N(13463),N(13469),N(13477),N(13487),N(13499),N(13513),N(13523),N(13537),N(13553),N(13567),N(13577),N(13591),N(13597),N(13613),N(13619),N(13627),N(13633),N(13649),N(13669),N(13679),N(13681),N(13687),N(13691),N(13693),N(13697),N(13709),N(13711),N(13721),N(13723),N(13729),N(13751),N(13757),N(13759),N(13763),N(13781),N(13789),N(13799),N(13807),N(13829),N(13831),N(13841),N(13859),N(13873),N(13877),N(13879),N(13883),N(13901),N(13903),N(13907),N(13913),N(13921),N(13931),N(13933),N(13963),N(13967),N(13997),N(13999),N(14009),N(14011),N(14029),N(14033),N(14051),N(14057),N(14071),N(14081),N(14083),N(14087),N(14107),N(14143),N(14149),N(14153),N(14159),N(14173),N(14177),N(14197),N(14207),N(14221),N(14243),N(14249),N(14251),N(14281),N(14293),N(14303),N(14321),N(14323),N(14327),N(14341),N(14347),N(14369),N(14387),N(14389),N(14401),N(14407),N(14411),N(14419),N(14423),N(14431),N(14437),N(14447),N(14449),N(14461),N(14479),N(14489),N(14503),N(14519),N(14533),N(14537),N(14543),N(14549),N(14551),N(14557),N(14561),N(14563),N(14591),N(14593),N(14621),N(14627),N(14629),N(14633),N(14639),N(14653),N(14657),N(14669),N(14683),N(14699),N(14713),N(14717),N(14723),N(14731),N(14737),N(14741),N(14747),N(14753),N(14759),N(14767),N(14771),N(14779),N(14783),N(14797),N(14813),N(14821),N(14827),N(14831),N(14843),N(14851),N(14867),N(14869),N(14879),N(14887),N(14891),N(14897),N(14923),N(14929),N(14939),N(14947),N(14951),N(14957),N(14969),N(14983),N(15013),N(15017),N(15031),N(15053),N(15061),N(15073),N(15077),N(15083),N(15091),N(15101),N(15107),N(15121),N(15131),N(15137),N(15139),N(15149),N(15161),N(15173),N(15187),N(15193),N(15199),N(15217),N(15227),N(15233),N(15241),N(15259),N(15263),N(15269),N(15271),N(15277),N(15287),N(15289),N(15299),N(15307),N(15313),N(15319),N(15329),N(15331),N(15349),N(15359),N(15361),N(15373),N(15377),N(15383),N(15391),N(15401),N(15413),N(15427),N(15439),N(15443),N(15451),N(15461),N(15467),N(15473),N(15493),N(15497),N(15511),N(15527),N(15541),N(15551),N(15559),N(15569),N(15581),N(15583),N(15601),N(15607),N(15619),N(15629),N(15641),N(15643),N(15647),N(15649),N(15661),N(15667),N(15671),N(15679),N(15683),N(15727),N(15731),N(15733),N(15737),N(15739),N(15749),N(15761),N(15767),N(15773),N(15787),N(15791),N(15797),N(15803),N(15809),N(15817),N(15823),N(15859),N(15877),N(15881),N(15887),N(15889),N(15901),N(15907),N(15913),N(15919),N(15923),N(15937),N(15959),N(15971),N(15973),N(15991),N(16001),N(16007),N(16033),N(16057),N(16061),N(16063),N(16067),N(16069),N(16073),N(16087),N(16091),N(16097),N(16103),N(16111),N(16127),N(16139),N(16141),N(16183),N(16187),N(16189),N(16193),N(16217),N(16223),N(16229),N(16231),N(16249),N(16253),N(16267),N(16273),N(16301),N(16319),N(16333),N(16339),N(16349),N(16361),N(16363),N(16369),N(16381),N(16411),N(16417),N(16421),N(16427),N(16433),N(16447),N(16451),N(16453),N(16477),N(16481),N(16487),N(16493),N(16519),N(16529),N(16547),N(16553),N(16561),N(16567),N(16573),N(16603),N(16607),N(16619),N(16631),N(16633),N(16649),N(16651),N(16657),N(16661),N(16673),N(16691),N(16693),N(16699),N(16703),N(16729),N(16741),N(16747),N(16759),N(16763),N(16787),N(16811),N(16823),N(16829),N(16831),N(16843),N(16871),N(16879),N(16883),N(16889),N(16901),N(16903),N(16921),N(16927),N(16931),N(16937),N(16943),N(16963),N(16979),N(16981),N(16987),N(16993),N(17011),N(17021),N(17027),N(17029),N(17033),N(17041),N(17047),N(17053),N(17077),N(17093),N(17099),N(17107),N(17117),N(17123),N(17137),N(17159),N(17167),N(17183),N(17189),N(17191),N(17203),N(17207),N(17209),N(17231),N(17239),N(17257),N(17291),N(17293),N(17299),N(17317),N(17321),N(17327),N(17333),N(17341),N(17351),N(17359),N(17377),N(17383),N(17387),N(17389)];
    }
    return small_primes.list;
}
/*function fermat_test(n, k)
{
    // https://en.wikipedia.org/wiki/Fermat_primality_test
    // https://en.wikipedia.org/wiki/Fermat_pseudoprime
    var Arithmetic = Abacus.Arithmetic,
        I = Arithmetic.I, two = Arithmetic.II, n_1, n_2, i, kl, a;

    if (Arithmetic.lt(n, two)) return false;
    else if (Arithmetic.equ(n, two) || Arithmetic.equ(n, 3)) return true;

    n_1 = Arithmetic.sub(n, I);

    if (null == k) k = 3;
    if (is_array(k))
    {
        for (i=0,kl=k.length; i<kl; i++)
        {
            if (!Arithmetic.equ(I, powm(k[i], n_1, n)))
                return false;
        }
    }
    else
    {
        k = +k;
        n_2 = Arithmetic.sub(n, two);
        for (i=0; i<k; i++)
        {
            a = Arithmetic.rnd(two, n_2);
            if (!Arithmetic.equ(I, gcd(a, n)) || !Arithmetic.equ(I, powm(a, n_1, n))) return false;
        }
    }
    return true;
}
function euler_test(n, k)
{
    // https://en.wikipedia.org/wiki/Euler_pseudoprime
    var Arithmetic = Abacus.Arithmetic,
        I = Arithmetic.I, two = Arithmetic.II, n_1, n_2, n_12, i, kl, a, m;

    if (Arithmetic.lt(n, two)) return false;
    else if (Arithmetic.equ(n, two) || Arithmetic.equ(n, 3)) return true;

    n_1 = Arithmetic.sub(n, I);
    n_12 = Arithmetic.div(n_1, two);

    if (null == k) k = 3;
    if (is_array(k))
    {
        for (i=0,kl=k.length; i<kl; i++)
        {
            m = powm(k[i], n_12, n);
            if (!Arithmetic.equ(I, m) || !Arithmetic.equ(n_1, m))
                return false;
        }
    }
    else
    {
        k = +k;
        n_2 = Arithmetic.sub(n, two);
        for (i=0; i<k; i++)
        {
            a = Arithmetic.rnd(two, n_2);
            if (!Arithmetic.equ(I, gcd(a, n)))
                return false;
            m = powm(a, n_12, n);
            if (!Arithmetic.equ(I, m) || !Arithmetic.equ(n_1, m))
                return false;
        }
    }
    return true;
}*/
function miller_rabin_test(n, k, kextra)
{
    // https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test
    //  O(num_trials*log^3(n))
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II, n_1, n_2, s, d, q, r, i, kl;

    // write n-1 as 2^s * d
    // repeatedly try to divide n-1 by 2
    n_1 = Arithmetic.sub(n, I);
    n_2 = Arithmetic.sub(n_1, I);
    d = n_1;
    s = 0;//O;
    for (;;)
    {
        q = Arithmetic.div(d, two);
        r = Arithmetic.mod(d, two);
        if (Arithmetic.equ(r, I)) break;
        s = s+1;//Arithmetic.add(s, I);
        d = q;
    }

    // test the base a to see whether it is a witness for the compositeness of n
    function try_composite(a)
    {
        var x, r;
        x = powm(a, d, n);
        if (Arithmetic.equ(x, I) || Arithmetic.equ(x, n_1)) return false;
        for (r=1; r<s; ++r)
        {
            x = Arithmetic.mod(Arithmetic.mul(x, x), n);
            if (Arithmetic.equ(x, I)) return true;
            else if (Arithmetic.equ(x, n_1)) return false;
        }
        return true; // n is definitely composite
    };

    if (null == k) k = 5;

    if (is_array(k))
    {
        for (i=0,kl=k.length; i<kl; ++i)
            if (try_composite(k[i]))
                return false;
        // extra tests
        if (null != kextra)
        {
            kextra = +kextra;
            for (i=0; i<kextra; ++i)
                if (try_composite(Arithmetic.rnd(two, n_2)))
                    return false;
        }
    }
    else
    {
        k = +k;
        for (i=0; i<k; ++i)
            if (try_composite(Arithmetic.rnd(two, n_2)))
                return false;
    }
    return true; // no base tested showed n as composite
}
function lucas_sequence(n, P, Q, k, bits)
{
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, J = Arithmetic.J,
        I = Arithmetic.I, two = Arithmetic.II, D, U, V, U0, V0, Qk, b, bit;

    //if (Arithmetic.lt(n, two)) return null; //n must be >= 2
    //else if (Arithmetic.lt(k, O)) return null; //k must be >= 0

    D = Arithmetic.sub(Arithmetic.mul(P, P), Arithmetic.mul(Q, 4));

    if (Arithmetic.equ(O, D)) return null; //D must not be zero

    bits = bits || Arithmetic.digits(k, 2);
    if ('0' === bits /*|| Arithmetic.equ(O, k)*/) return [O, two, Q];

    U = I; V = P; Qk = Q;
    b = bits.length;

    if (Arithmetic.equ(I, Q))
    {
        // Optimization for extra strong tests.
        for (bit=1; bit<b; ++bit)/*while (1 < b)*/
        {
            U = Arithmetic.mod(Arithmetic.mul(U, V), n);
            V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), two), n);
            //b -= 1;
            if ('1' === bits.charAt(bit) /*(k >> (b - 1)) & 1*/)
            {
                U0 = U; V0 = V;
                U = Arithmetic.add(Arithmetic.mul(U0, P), V0);
                V = Arithmetic.add(Arithmetic.mul(V0, P), Arithmetic.mul(U0, D));
                if (Arithmetic.equ(I, Arithmetic.mod(U, two))) U = Arithmetic.add(U, n);
                if (Arithmetic.equ(I, Arithmetic.mod(V, two))) V = Arithmetic.add(V, n);
                U = Arithmetic.div(U, two);
                V = Arithmetic.div(V, two);
            }
        }
    }
    else if (Arithmetic.equ(I, P) && Arithmetic.equ(J, Q))
    {
        // Small optimization for 50% of Selfridge parameters.
        for (bit=1; bit<b; ++bit)/*while (1 < b)*/
        {
            U = Arithmetic.mod(Arithmetic.mul(U, V), n);
            if (Arithmetic.equ(I, Qk))
            {
                V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), two), n);
            }
            else
            {
                V = Arithmetic.mod(Arithmetic.add(Arithmetic.mul(V, V), two), n);
                Qk = I;
            }
            //b -= 1;
            if ('1' === bits.charAt(bit) /*(k >> (b - 1)) & 1*/)
            {
                U0 = U; V0 = V;
                U = Arithmetic.add(U0, V0);
                V = Arithmetic.add(V0, Arithmetic.mul(U0, D));
                if (Arithmetic.equ(I, Arithmetic.mod(U, two))) U = Arithmetic.add(U, n);
                if (Arithmetic.equ(I, Arithmetic.mod(V, two))) V = Arithmetic.add(V, n);
                U = Arithmetic.div(U, two);
                V = Arithmetic.div(V, two);
                Qk = J;
            }
        }
    }
    else
    {
        // The general case with any P and Q.
        for (bit=1; bit<b; ++bit)/*while (1 < b)*/
        {
            U = Arithmetic.mod(Arithmetic.mul(U, V), n);
            V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), Arithmetic.mul(two, Qk)), n);
            Qk = Arithmetic.mul(Qk, Qk);
            //b -= 1;
            if ('1' === bits.charAt(bit) /*(k >> (b - 1)) & 1*/)
            {
                U0 = U; V0 = V;
                U = Arithmetic.add(Arithmetic.mul(U0, P), V0);
                V = Arithmetic.add(Arithmetic.mul(V0, P), Arithmetic.mul(U0, D));
                if (Arithmetic.equ(I, Arithmetic.mod(U, two))) U = Arithmetic.add(U, n);
                if (Arithmetic.equ(I, Arithmetic.mod(V, two))) V = Arithmetic.add(V, n);
                U = Arithmetic.div(U, two);
                V = Arithmetic.div(V, two);
                Qk = Arithmetic.mul(Qk, Q);
            }
            Qk = Arithmetic.mod(Qk, n);
        }
    }
    return [Arithmetic.mod(U, n), Arithmetic.mod(V, n), Qk];
}
/*function lucas_selfridge_params(n)
{
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, J = Arithmetic.J,
        I = Arithmetic.I, two = Arithmetic.II, D, g;

    D = Arithmetic.num(5);
    for (;;)
    {
        g = gcd(D, n);
        if (Arithmetic.gt(g, I) && !Arithmetic.equ(g, n)) return [O, O, O];
        if (Arithmetic.equ(J, jacobi_symbol(D, n, g))) break;
        D = Arithmetic.gt(D, O) ? Arithmetic.sub(Arithmetic.mul(J, D), two) : Arithmetic.add(Arithmetic.mul(J, D), two);
    }
    return [D, I, Arithmetic.div(Arithmetic.sub(I, D), 4)];
}*/
function lucas_extrastrong_params(n)
{
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, O = Arithmetic.O, J = Arithmetic.J,
        I = Arithmetic.I, two = Arithmetic.II, P, Q, D, g, four = N(4);
    P = N(3); Q = I; D = N(5);
    for (;;)
    {
        g = gcd(D, n);
        if (Arithmetic.gt(g, I) && !Arithmetic.equ(g, n)) return [O, O, O];
        if (Arithmetic.equ(J, jacobi_symbol(D, n, g))) break;
        P = Arithmetic.add(P, I);
        D = Arithmetic.sub(Arithmetic.mul(P, P), four);
    }
    return [D, P, Q];
}
/*function lucas_test(n)
{
    // https://en.wikipedia.org/wiki/Lucas_primality_test
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    // http://mpqs.free.fr/LucasPseudoprimes.pdf
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        sqrt, PQ, UV;

    //if (Arithmetic.equ(n, two)) return true;
    //if (Arithmetic.lt(n, two) || Arithmetic.equ(O, Arithmetic.mod(n, two))) return false;

    // Check that the number isn't a square number, as this will throw out
    // calculating the correct value of D later on (and means we have a composite number)
    sqrt = isqrt(n); //ikthroot(n, two);
    if (Arithmetic.equ(n, Arithmetic.mul(sqrt, sqrt))) return false;

    PQ = lucas_selfridge_params(n);
    if (Arithmetic.equ(O, PQ[0])) return false;

    UV = lucas_sequence(n, PQ[1], PQ[2], Arithmetic.add(n, I));
    return Arithmetic.equ(O, U[0]);
}
function strong_lucas_test(n)
{
    // https://en.wikipedia.org/wiki/Lucas_primality_test
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    // http://mpqs.free.fr/LucasPseudoprimes.pdf
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        sqrt, PQ, UV, U, V, Qk, s, k, r, bits_k, n_1;

    //if (Arithmetic.equ(n, two)) return true;
    //if (Arithmetic.lt(n, two) || Arithmetic.equ(O, Arithmetic.mod(n, two))) return false;

    // Check that the number isn't a square number, as this will throw out
    // calculating the correct value of D later on (and means we have a composite number)
    sqrt = isqrt(n); //ikthroot(n, two);
    if (Arithmetic.equ(n, Arithmetic.mul(sqrt, sqrt))) return false;

    PQ = lucas_selfridge_params(n);
    if (Arithmetic.equ(O, PQ[0])) return false;

    // remove powers of 2 from n+1 (= k * 2**s)
    n_1 = Arithmetic.add(n, I);
    s = trailing_zeroes(n_1, null, true);
    bits_k = s[1]; s = s[0];
    k = O; //Arithmetic.shr(n_1, s);

    UV = lucas_sequence(n, PQ[1], PQ[2], k, bits_k);
    U = UV[0]; V = UV[1]; Qk = UV[2];

    if (Arithmetic.equ(O, U) || Arithmetic.equ(O, V)) return true;
    for (r=1; r<s; r++)
    {
        V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), Arithmetic.mul(two, Qk)), n);
        if (Arithmetic.equ(O, V)) return true;
        Qk = Arithmetic.mod(Arithmetic.mul(Qk, Qk), n);
    }
    return false;
}*/
function extra_strong_lucas_test(n)
{
    // https://en.wikipedia.org/wiki/Lucas_primality_test
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    // http://mpqs.free.fr/LucasPseudoprimes.pdf
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        sqrt, PQ, UV, U, V, s, k, r, bits_k, n_1;

    //if (Arithmetic.equ(n, two)) return true;
    //if (Arithmetic.lt(n, two) || Arithmetic.equ(O, Arithmetic.mod(n, two))) return false;

    // Check that the number isn't a square number, as this will throw out
    // calculating the correct value of D later on (and means we have a composite number)
    sqrt = isqrt(n); //ikthroot(n, two);
    if (Arithmetic.equ(n, Arithmetic.mul(sqrt, sqrt))) return false;

    PQ = lucas_extrastrong_params(n);
    if (Arithmetic.equ(O, PQ[0])) return false;

    // remove powers of 2 from n+1 (= k * 2**s)
    n_1 = Arithmetic.add(n, I);
    s = trailing_zeroes(n_1, null, true);
    bits_k = s[1]; s = s[0];
    k = O; //Arithmetic.shr(n_1, s);

    UV = lucas_sequence(n, PQ[1], PQ[2], k, bits_k);
    U = UV[0]; V = UV[1];

    if (Arithmetic.equ(O, U) && (Arithmetic.equ(two, V) || Arithmetic.equ(V, Arithmetic.sub(n, two)))) return true;
    if (Arithmetic.equ(O, V)) return true;
    for (r=1; r<s; ++r)
    {
        V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), two), n);
        if (Arithmetic.equ(O, V)) return true;
    }
    return false;
}
function baillie_psw_test(n, extra_mr)
{
    // https://en.wikipedia.org/wiki/Baillie%E2%80%93PSW_primality_test
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, two = Arithmetic.II,
        i, l, p, primes = small_primes();

    // Check divisibility by a short list of small primes
    if (Arithmetic.lt(n, primes[0])) return false;
    for (i=0,l=stdMath.min(primes.length,100); i<l; ++i)
    {
        p = primes[i];
        if (Arithmetic.equ(n, p)) return true;
        else if (Arithmetic.equ(O, Arithmetic.mod(n, p))) return false;
    }

    // Perform the Miller-Rabin primality test with base 2 (plus any extra miller-rabin tests as well)
    if (!miller_rabin_test(n, [two], extra_mr||null)) return false;

    // Finally perform the (strong) Lucas primality test
    return extra_strong_lucas_test(n);
}
function is_probable_prime(n)
{
    // https://en.wikipedia.org/wiki/Primality_test
    // https://primes.utm.edu/prove/prove2_3.html#quick
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        i, l, p, primes = small_primes();

    // Check divisibility by a short list of small primes
    if (Arithmetic.lt(n, primes[0])) return false;
    for (i=0,l=stdMath.min(primes.length,70); i<l; ++i)
    {
        p = primes[i];
        if (Arithmetic.equ(n, p)) return true;
        else if (Arithmetic.equ(O, Arithmetic.mod(n, p))) return false;
    }
    // do a sufficient miller-rabin probabilistic test
    return miller_rabin_test(n, 7);
}
function wheel(/* args */)
{
    var base = arguments.length && is_array(arguments[0]) ? arguments[0] : arguments,
        w, j, k, l = base.length, all, prod;

    if (!l || !base[0]) return null;

    prod = 1;
    for (k=0; k<l; ++k) prod *= base[k];
    w = [];

    prod += 1;
    for (j=base[0]; j<=prod; ++j)
    {
        all = true;
        for (k=0; k<l; ++k)
        {
            if (!(j % base[k]))
            {
                all = false;
                break;
            }
        }
        if (all)
        {
            w.push(j);
        }
    }
    return [w, array(w.length, function(i){return i+1 < w.length ? (w[i+1]-w[i]) : (w[0]+prod-1-w[i]);})];
}
function wheel_trial_div_test(n)
{
    // https://en.wikipedia.org/wiki/Primality_test
    // https://en.wikipedia.org/wiki/Trial_division
    // https://en.wikipedia.org/wiki/Wheel_factorization
    // O(sqrt(n)), sufficiently fast for small numbers ie less than 20 digits
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II, sqrt,
        three, five, seven, four, six, eight, ten, inc, i, p;

    // trial division with a wheel of {2,3,5,7}, faster than simple trial division
    if (!wheel_trial_div_test.wheel)
    {
        // compute only once
        four = N(4); six = N(6); eight = N(8); ten = N(10);
        wheel_trial_div_test.wheel = {
            base: [two, N(3), N(5), N(7)],
            next: N(11), next2: N(121),
            inc: [two,four,two,four,six,two,six,four,two,four,six,six,two,six,four,two,six,four,six,eight,four,two,four,
            two,four,eight,six,four,six,two,four,six,two,six,six,four,two,four,six,two,six,four,two,four,two,ten,two,ten]
        };
    }
    three = wheel_trial_div_test.wheel.base[1];
    five = wheel_trial_div_test.wheel.base[2];
    seven = wheel_trial_div_test.wheel.base[3];

    if (Arithmetic.lt(n, two)) return false;
    else if (Arithmetic.equ(n, two)) return true;
    else if (Arithmetic.equ(n, three)) return true;
    else if (Arithmetic.equ(n, five)) return true;
    else if (Arithmetic.equ(n, seven)) return true;
    else if (Arithmetic.equ(O, Arithmetic.mod(n, two)) ||
            Arithmetic.equ(O, Arithmetic.mod(n, three)) ||
            Arithmetic.equ(O, Arithmetic.mod(n, five)) ||
            Arithmetic.equ(O, Arithmetic.mod(n, seven))) return false;

    if (Arithmetic.lt(n, wheel_trial_div_test.wheel.next2)) return true;

    inc = wheel_trial_div_test.wheel.inc; i = 0;
    p = wheel_trial_div_test.wheel.next; sqrt = isqrt(n);
    while (Arithmetic.lte(p, sqrt))
    {
        if (Arithmetic.equ(O, Arithmetic.mod(n, p))) return false;
        p = Arithmetic.add(p, inc[i++]);
        if (i === inc.length) i = 0;
    }
    return true; // is definately prime
}
function apr_cl_test(n)
{
    // https://en.wikipedia.org/wiki/Primality_test
    // https://en.wikipedia.org/wiki/Adleman%E2%80%93Pomerance%E2%80%93Rumely_primality_test
    // O(log(n)^(log log log (n))), sufficiently fast for medium numbers ie less than 2000 digits
    // TODO
    return true;
}
function is_prime(n)
{
    // https://en.wikipedia.org/wiki/Primality_test
    // https://primes.utm.edu/prove/prove2_3.html#quick
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, two = Arithmetic.II, ndigits, r;
    //n = Arithmetic.abs(/*N(*/n/*)*/);
    ndigits = Arithmetic.digits(n).length;
    // try to use fastest algorithm based on size of number (number of digits)
    if (ndigits <= 6)
    {
        // deterministic test
        return wheel_trial_div_test(n);
    }
    else if (ndigits <= 20)
    {
        // deterministic test
        /*
        If n < 1373653 is a both 2 and 3-SPRP, then n is prime [PSW80].
        If n < 25326001 is a 2, 3 and 5-SPRP, then n is prime [PSW80].
        If n < 25000000000 is a 2, 3, 5 and 7-SPRP, then either n = 3215031751 or n is prime [PSW80]. (This is actually true for n < 118670087467 [Jaeschke93].)
        If n < 2152302898747 is a 2, 3, 5, 7 and 11-SPRP, then n is prime [Jaeschke93].
        If n < 3474749660383 is a 2, 3, 5, 7, 11 and 13-SPRP, then n is prime [Jaeschke93].
        If n < 341550071728321 is a 2, 3, 5, 7, 11, 13 and 17-SPRP, then n is prime [Jaeschke93].
        */
        if (Arithmetic.lt(n, N(1373653)))
            return miller_rabin_test(n, [two, N(3)]);
        else if (Arithmetic.lt(n, N("25326001")))
            return miller_rabin_test(n, [two, N(3), N(5)]);
        else if (Arithmetic.lt(n, N("25000000000")))
            return Arithmetic.equ(n, N("3215031751")) ? false : miller_rabin_test(n, [two, N(3), N(5), N(7)]);
        else if (Arithmetic.lt(n, N("2152302898747")))
            return miller_rabin_test(n, [two, N(3), N(5), N(7), N(11)]);
        else if (Arithmetic.lt(n, N("3474749660383")))
            return miller_rabin_test(n, [two, N(3), N(5), N(7), N(11), N(13)]);
        else if (Arithmetic.lt(n, N("341550071728321")))
            return miller_rabin_test(n, [two, N(3), N(5), N(7), N(11), N(13), N(17)]);

        //return apr_cl_test(n);
        return baillie_psw_test(n, 7);
    }
    else
    {
        // fast deterministic test, TODO
        //return apr_cl_test(n);
        // strong probabilistic test for very large numbers ie > 1000 digits
        return baillie_psw_test(n, 7);
    }
}
function next_prime(n, dir)
{
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II, x;
    //n = Arithmetic.abs(/*N(*/n/*)*/);
    dir = -1 === dir ? -1 : 1;

    if (0 > dir)
    {
        // previous prime
        if (Arithmetic.lte(n, two)) return null; // no previous prime
        else if (Arithmetic.equ(n, 3)) return two; // first prime

        for (x=Arithmetic.sub(n, Arithmetic.equ(O, Arithmetic.mod(n, two)) ? I : two);;x=Arithmetic.sub(x,two))
            if (is_probable_prime(x) && is_prime(x)) return x;
    }
    else
    {
        // next prime
        if (Arithmetic.lt(n, two)) return two; // first prime
        for (x=Arithmetic.add(n, Arithmetic.equ(O, Arithmetic.mod(n, two)) ? I : two);;x=Arithmetic.add(x,two))
            if (is_probable_prime(x) && is_prime(x)) return x;
    }
}
function pollard_rho(n, s, a, retries, max_steps, F)
{
    // find a non-trivial factor of n using the Pollard-Rho heuristic
    // http://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm
    // https://en.wikipedia.org/wiki/Pohlig%E2%80%93Hellman_algorithm
    // https://en.wikipedia.org/wiki/Pollard%27s_kangaroo_algorithm
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        two = Arithmetic.II, V, U, i, j, g, n_1, n_3;

    if (Arithmetic.lte(n, 5)) return Arithmetic.equ(n, 4) ? two : n; // 0,1,2,3,4(=2*2),5

    if (null == s) s = two;
    if (null == a) a = I;
    if (null == retries) retries = 5;

    n_1 = Arithmetic.sub(n, I);
    n_3 = Arithmetic.sub(n, 3);
    retries = +(retries || 0);
    max_steps = max_steps || null;
    F = F || null;

    V = s;
    for (i=0; i<=retries; ++i)
    {
        U = V;
        j = 0;
        if (!is_callable(F))
            F = function(x) {
                return Arithmetic.mod(Arithmetic.add(Arithmetic.mod(Arithmetic.mul(x, x), n), a), n);
            };
        for (;;)
        {
            if ((null != max_steps) && (j > max_steps)) break;
            j += 1;
            U = F(U);
            V = F(F(V));  // V is 2x further along than U
            g = gcd(Arithmetic.sub(U, V), n);
            if (Arithmetic.equ(I, g)) continue;
            if (Arithmetic.equ(n, g)) break;
            return g;
        }
        V = Arithmetic.rnd(O, n_1);
        a = Arithmetic.rnd(I, n_3)  // for x^2 + a, a%n should not be 0 or -2
        F = null;
    }
    return null;
}
function pollard_pm1(n, B, a, retries)
{
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        i, aM, p, e, g, n_2, B_1, ip,
        primes = small_primes(), pl = primes.length;

    if (null == retries) retries = 0;
    if (null == a) a = two;
    if (null == B) B = N(10);
    retries = +retries;
    //a = N(a); B = N(B);

    if (Arithmetic.lt(n, 4) || Arithmetic.lt(B, 3)) return null;

    n_2 = Arithmetic.sub(n, two); //B_1 = Arithmetic.add(B, I);
    // computing a**lcm(1,2,3,..B) % n for B > 2
    // it looks weird, but it's right: primes run [2, B]
    // and the answer's not right until the loop is done.
    for (i=0; i<=retries; ++i)
    {
        aM = a;
        for (ip=0; ip<pl; ++ip)
        {
            // these are pre-computed (small) primes and may not cover whole range up to B
            // for small values of B, no problem, else it will cover up to largest pre-computed small prime
            p = primes[ip];
            if (Arithmetic.gt(p, B)) break;
            e = ilog(B, p);
            aM = powm(aM, Arithmetic.pow(p, e), n);
        }
        g = gcd(Arithmetic.sub(aM, I), n);
        if (Arithmetic.gt(g, I) && Arithmetic.lt(g, n)) return g;

        // get a new a:
        // since the exponent, lcm(1..B), is even, if we allow 'a' to be 'n-1'
        // then (n - 1)**even % n will be 1 which will give a g of 0 and 1 will
        // give a zero, too, so we set the range as [2, n-2]. Some references
        // say 'a' should be coprime to n, but either will detect factors.
        a = Arithmetic.rnd(two, n_2);
    }
    return null;
}
function trial_div_fac(n, maxlimit)
{
    // https://en.wikipedia.org/wiki/Trial_division
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, factors, f, e, f1, L,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        /*three, five, seven, four, six, eight, ten, inc,*/ n0, i, l, p, p2, fac,
        primes = small_primes();

    if (!primes.length) primes = [two, N(3)];
    if (Arithmetic.equ(primes[primes.length-1], two)) primes.push(N(3));

    factors = null; f1 = null; L = 0;

    n0 = n;
    for (i=0,l=primes.length; i<l; ++i)
    {
        p = primes[i];
        if (Arithmetic.equ(n0, p)) return [[p, I]];

        p2 = Arithmetic.mul(p, p);

        if (Arithmetic.gt(p2, n) || ((null != maxlimit) && Arithmetic.gt(p2, maxlimit))) break;

        if (Arithmetic.equ(O, Arithmetic.mod(n, p)))
        {
            e = I; n = Arithmetic.div(n, p);
            while (Arithmetic.equ(O, Arithmetic.mod(n, p)))
            {
                e = Arithmetic.add(I, e);
                n = Arithmetic.div(n, p);
            }
            // add last
            f = new Node([p, e]);
            f.l = f1;
            if (f1) f1.r = f;
            f1 = f; ++L;
            if (!factors) factors = f1;
        }
    }
    if (i >= l)
    {
        p = Arithmetic.add(p, two); p2 = Arithmetic.mul(p, p);
        while (Arithmetic.lte(p2, n) && ((null == maxlimit) || Arithmetic.lte(p2, maxlimit)))
        {
            e = O;
            while (Arithmetic.equ(O, Arithmetic.mod(n, p)))
            {
                e = Arithmetic.add(I, e);
                n = Arithmetic.div(n, p);
            }
            if (Arithmetic.lt(O, e))
            {
                // add last
                f = new Node([p, e]);
                f.l = f1;
                if (f1) f1.r = f;
                f1 = f; ++L;
                if (!factors) factors = f1;
            }
            p = Arithmetic.add(p, two); p2 = Arithmetic.mul(p, p);
        }
    }
    if ((null == maxlimit) && Arithmetic.gt(n, I))
    {
        // add last
        f = new Node([n, I]);
        f.l = f1;
        if (f1) f1.r = f;
        f1 = f; ++L;
        if (!factors) factors = f1;
    }

    // traverse list of factors and return array
    fac = array(L, function() {
        var f = factors, factor = f.v;
        factors = factors.r;
        f.dispose(); // dispose
        if (factors) factors.l = null;
        return factor;
    });
    return null == maxlimit ? fac : [fac, n]; // return factorization up to limit + remainder
}
function siqs_fac(n)
{
    // https://en.wikipedia.org/wiki/Quadratic_sieve
    // TODO
    return [[n, Abacus.Arithmetic.I]];
}
function merge_factors(f1, f2)
{
    var Arithmetic = Abacus.Arithmetic, i1 = 0, i2 = 0, l1 = f1.length, l2 = f2.length, l = 0, f12;
    f12 = new Array(l1+l2);
    while (i1 < l1 && i2 < l2)
    {
        if (Arithmetic.equ(f1[i1][0], f2[i2][0]))
        {
            if (l && Arithmetic.equ(f12[l-1][0], f1[i1][0]))
            {
                f12[l-1][1] = Arithmetic.add(f12[l-1][1], Arithmetic.add(f1[i1][1], f2[i2][1]));
            }
            else
            {
                f12[l++] = [f1[i1][0], Arithmetic.add(f1[i1][1], f2[i2][1])];
            }
            ++i1; ++i2;
        }
        else if (Arithmetic.lt(f1[i1][0], f2[i2][0]))
        {
            if (l && Arithmetic.equ(f12[l-1][0], f1[i1][0]))
            {
                f12[l-1][1] = Arithmetic.add(f12[l-1][1], f1[i1][1]);
            }
            else
            {
                f12[l++] = f1[i1];
            }
            ++i1;
        }
        else //if (Arithmetic.gt(f1[i1][0], f2[i2][0]))
        {
            if (l && Arithmetic.equ(f12[l-1][0], f2[i2][0]))
            {
                f12[l-1][1] = Arithmetic.add(f12[l-1][1], f2[i2][1]);
            }
            else
            {
                f12[l++] = f2[i2];
            }
            ++i2;
        }
    }
    while (i1 < l1)
    {
        if (l && Arithmetic.equ(f12[l-1][0], f1[i1][0]))
        {
            f12[l-1][1] = Arithmetic.add(f12[l-1][1], f1[i1][1]);
        }
        else
        {
            f12[l++] = f1[i1];
        }
        ++i1;
    }
    while (i2 < l2)
    {
        if (l && Arithmetic.equ(f12[l-1][0], f2[i2][0]))
        {
            f12[l-1][1] = Arithmetic.add(f12[l-1][1], f2[i2][1]);
        }
        else
        {
            f12[l++] = f2[i2];
        }
        ++i2;
    }
    // truncate if needed
    if (f12.length > l) f12.length = l;
    return f12;
}
function factorize(n)
{
    // https://en.wikipedia.org/wiki/Integer_factorization
    var Arithmetic = Abacus.Arithmetic, INT = null, ndigits, f, factors;
    if (is_instance(n, Integer))
    {
        INT = n[CLASS];
        n = n.num;
    }
    ndigits = Arithmetic.digits(n).length;
    // try to use fastest algorithm based on size of number (number of digits)
    if (ndigits <= 20)
    {
        // trial division for small numbers
        factors = trial_div_fac(n);
    }
    else //if (ndigits <= 1000)
    {
        // recursive (heuristic) factorization for medium-to-large numbers
        f = pollard_rho(n, Arithmetic.II, Arithmetic.I, 5, 100, null);
        // try another heuristic as well
        if (null == f) f = pollard_pm1(n, Arithmetic.num(10), Arithmetic.II, 5);
        if (null == f) factors = [[n, Arithmetic.I]];
        else factors = merge_factors(factorize(f), factorize(Arithmetic.div(n, f)));
    }
    /*else
    {
        // self-initialising quadratic sieve for (very) large numbers TODO
        factors = siqs_fac(n);
    }*/
    return INT ? factors.map(function(f){return [new INT(f[0]), new INT(f[1])];}) : factors;
}
function gcd(/* args */)
{
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Greatest_common_divisor
    // supports Exact Big Integer Arithmetic if plugged in
    // note: returns always positive gcd (even of negative numbers)
    // note2: any zero arguments are skipped
    // note3: gcd(0,0,..,0) is conventionaly set to 0
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, a, b, t, i, zeroes,
        Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I;
    if (0 === c) return O;

    i = 0;
    while ((i < c) && Arithmetic.equ(O, a=args[i++]));
    a = Arithmetic.abs(a);
    while (i < c)
    {
        // break early
        if (Arithmetic.equ(a, I)) return I;
        while ((i < c) && Arithmetic.equ(O, b=args[i++]));
        b = Arithmetic.abs(b);
        // break early
        if (Arithmetic.equ(b, I)) return I;
        else if (Arithmetic.equ(b, a)) continue;
        else if (Arithmetic.equ(b, O)) break;
        // swap them (a >= b)
        if (Arithmetic.lt(a, b)) {t = b; b = a; a = t;}
        while (!Arithmetic.equ(O, b)) {t = b; b = Arithmetic.mod(a, t); a = t;}
    }
    return a;
}
function lcm2(a, b)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, aa = Arithmetic.abs(a), bb = Arithmetic.abs(b);
    if (Arithmetic.equ(aa, bb)) return sign(a) === sign(b) ? aa : Arithmetic.neg(aa);
    return Arithmetic.mul(Arithmetic.div(a, gcd(a, b)), b);
}
function lcm(/* args */)
{
    // least common multiple
    // https://en.wikipedia.org/wiki/Least_common_multiple
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        i, l = args.length, LCM, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
    if (1 >= l) return 1 === l ? args[0] : O;
    if (Arithmetic.equ(O, args[0]) || Arithmetic.equ(O, args[1])) return O;
    LCM = lcm2(args[0], args[1]);
    for (i=2; i<l; ++i)
    {
        if (Arithmetic.equ(O, args[i])) return O;
        LCM = lcm2(LCM, args[i]);
    }
    return LCM;
}
function xgcd(/* args */)
{
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Integer_relation_algorithm
    // supports Exact Big Integer Arithmetic if plugged in
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
        a, b, a1 = I, b1 = O, a2 = O, b2 = I, quot, gcd, asign = I, bsign = I;

    if (0 === k) return;

    a = args[0];
    if (Arithmetic.gt(O, a)) {a = Arithmetic.abs(a); asign = J;}
    if (1 === k)
    {
        return [a, asign];
    }
    else //if (2 <= k)
    {
        // recursive on number of arguments
        // compute xgcd on rest arguments and combine with current
        // based on recursive property: gcd(a,b,c,..) = gcd(a, gcd(b, c,..))
        // for coefficients this translates to:
        // gcd(a,b,c,..) = ax + by + cz + .. =
        // gcd(a, gcd(b, c, ..)) = ax + k gcd(b,c,..) = (given gcd(b,c,..) = nb + mc + ..)
        // gcd(a, gcd(b, c, ..)) = ax + k (nb + mc + ..) = ax + b(kn) + c(km) + .. = ax + by +cz + ..
        // also for possible negative numbers we can do (note gcd(a,b,c,..) is always positive):
        // a*(sign(a)*x) + b*(sign(b)*y) + c*(sign(c)*z) + .. = gcd(|a|,|b|,|c|,..) so factors are same only adjusted by sign(.) to match always positive GCD
        // note: returns always positive gcd (even of negative numbers)
        // note2: any zero arguments are skipped and do not break xGCD computation
        // note3: gcd(0,0,..,0) is conventionaly set to 0 with 1's as factors
        gcd = 2 === k ? [args[1], I] : xgcd(slice.call(args, 1));
        b = gcd[0];
        if (Arithmetic.gt(O, b)) {b = Arithmetic.abs(b); bsign = J;}

        // gcd with zero factor, take into account
        if (Arithmetic.equ(O, a))
            return array(gcd.length+1,function(i) {
                return 0 === i ? b : (1 === i ? asign : Arithmetic.mul(bsign, gcd[i-1]));
            });
        else if (Arithmetic.equ(O, b))
            return array(gcd.length+1,function(i) {
                return 0 === i ? a : (1 === i ? asign : Arithmetic.mul(bsign, gcd[i-1]));
            });

        for (;;)
        {
            quot = Arithmetic.div(a, b);
            a = Arithmetic.mod(a, b);
            a1 = Arithmetic.sub(a1, Arithmetic.mul(quot, a2));
            b1 = Arithmetic.sub(b1, Arithmetic.mul(quot, b2));
            if (Arithmetic.equ(O, a))
            {
                a2 = Arithmetic.mul(a2, asign); b2 = Arithmetic.mul(b2, bsign);
                return array(gcd.length+1,function(i) {
                    return 0 === i ? b : (1 === i ? a2 : Arithmetic.mul(b2, gcd[i-1]));
                });
            }

            quot = Arithmetic.div(b, a);
            b = Arithmetic.mod(b, a);
            a2 = Arithmetic.sub(a2, Arithmetic.mul(quot, a1));
            b2 = Arithmetic.sub(b2, Arithmetic.mul(quot, b1));
            if (Arithmetic.equ(O, b))
            {
                a1 = Arithmetic.mul(a1, asign); b1 = Arithmetic.mul(b1, bsign);
                return array(gcd.length+1, function(i) {
                    return 0 === i ? a : (1 === i ? a1 : Arithmetic.mul(b1, gcd[i-1]));
                });
            }
        }
    }
}
function moebius(n)
{
    // https://en.wikipedia.org/wiki/M%C3%B6bius_function
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        three, five, seven, four, six, eight, ten, inc, i, p, p2, m;

    // use factorization of n
    p = factorize(n); m = p.length;
    for (i=0; i<m; ++i)
        if (Arithmetic.lt(I, p[i][1]))
            return O; // is not square-free
    return m & 1 ? I : Arithmetic.J;
}
function divisors(n, as_generator)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        list = null, D2 = null, D1 = null, L1 = 0, L2 = 0, node, sqrn, i, n_i, next, factors, INT = null;

    if (is_instance(n, Integer)) {INT = n[CLASS]; n = n.num;}

    n = Arithmetic.abs(n);
    if (true === as_generator)
    {
        if (Arithmetic.gte(n, 1000))
        {
            // for very large numbers,
            // compute divisors through prime factorisation
            // using a tensor combinatorial iterator/generator
            factors = factorize(n);
            return Tensor(factors.map(function(factor) {
                return Arithmetic.val(factor[1]) + 1;
            })).mapTo(function(selection) {
                var d = selection.reduce(function(divisor, e, i) {
                    return 0 === e ? divisor : Arithmetic.mul(divisor, Arithmetic.pow(factors[i][0], e));
                }, I);
                return INT ? new INT(d) : d;
            });
        }
        else
        {
            // time+space O(sqrt(n)) to find all distinct divisors of n (including 1 and n itself)
            sqrn = isqrt(n);
            i = I; next = null;
            // return iterator/generator
            return Iterator(function(k, dir, state, first) {
                // note will NOT return divisors sorted in order
                if (0 > dir) return null; // only forward
                if (first)
                {
                    i = I;
                    if (!Arithmetic.equ(I, n)) next = n;
                    return INT ? new INT(I) : I;
                }
                if (next)
                {
                    k = next;
                    next = null;
                    return INT ? new INT(k) : k;
                }
                i = Arithmetic.add(i, I);
                while (Arithmetic.lte(i, sqrn))
                {
                    if (Arithmetic.equ(O, Arithmetic.mod(n, i)))
                    {
                        n_i = Arithmetic.div(n, i);
                        if (!Arithmetic.equ(n_i, i))
                        {
                            // two distinct divisors
                            next = n_i;
                        }
                        return INT ? new INT(i) : i;
                    }
                    i = Arithmetic.add(i, I);
                }
                return null;
            });
        }
    }
    else
    {
        // time+space O(sqrt(n)) to find all distinct divisors of n (including 1 and n itself)
        sqrn = isqrt(n);
        for (i=I; Arithmetic.lte(i,sqrn); i=Arithmetic.add(i,I))
        {
            if (Arithmetic.equ(O, Arithmetic.mod(n, i)))
            {
                n_i = Arithmetic.div(n, i);
                if (Arithmetic.equ(n_i, i))
                {
                    // one distinct divisor, add to small list (after current)
                    node = new Node(i, D1, null); ++L1;
                    if (D1) D1.r = node;
                    D1 = node;
                }
                else
                {
                    // two distinct divisors, add to small list (after current) and add to large list (before current)
                    node = new Node(i, D1, null); ++L1;
                    if (D1) D1.r = node;
                    D1 = node;
                    node = new Node(n_i, null, D2); ++L2;
                    if (D2) D2.l = node;
                    D2 = node;
                }
                // take note of the start of the divisors list
                if (!list) list = D1;
            }
        }
        if (D1)
        {
            // connect the two lists (small then large)
            D1.r = D2;
            if (D2) D2.l = D1;
        }
        D1 = null; D2 = null;
        // return all divisors sorted from smaller to larger (traverse divisors list and return items in order)
        return array(L1+L2, function() {
            var curr = list, divisor = curr.v; // get current list item
            list = curr.r; // shift list to next item in order from left to right
            curr.dispose(); // dispose previous list item
            if (list) list.l = null;
            return INT ? new INT(divisor) : divisor;
        });
    }
}
function symbolic_divisors(c)
{
    var Arithmetic = Abacus.Arithmetic;
    if (Arithmetic.isNumber(c)) c = Integer(c);
    if (c.equ(Arithmetic.O))
    {
        // return just 0 for completeness
        return Iterator([c[CLASS].Zero(c.symbol || null, c.ring || null)]);
    }
    else if (is_instance(c, Numeric))
    {
        return (is_instance(c, Complex) && !c.isReal() && !c.isImag()
            ? Iterator((function(c) {
                var iter_gcd = symbolic_divisors(Rational.gcd(c.real(), c.imag())),
                    iter_i = [Complex.One(), Complex.Img()], i, g;
                return function(curr, dir, state, init) {
                    if (init)
                    {
                        iter_gcd.rewind();
                        g = iter_gcd.next();
                        i = 0;
                    }
                    if (i >= iter_i.length)
                    {
                        i = 0;
                        g = iter_gcd.next();
                    }
                    if (null == g) return null;
                    ++i;
                    return iter_i[i-1].mul(g);
                };
            })(c))
            : Iterator((function(c, is_imag) {
                var iter_num = divisors(Arithmetic.abs(c.num), true),
                    iter_den = divisors(c.den, true),
                    img = Complex.Img(),
                    num, den, with_img, ret;
                return function(curr, dir, state, init) {
                    if (init)
                    {
                        with_img = false;
                        iter_num.rewind();
                        iter_den.rewind();
                        den = iter_den.next();
                    }
                    if (is_imag)
                    {
                        if (!with_img) num = iter_num.next();
                    }
                    else
                    {
                        num = iter_num.next();
                    }
                    if (null == num)
                    {
                        with_img = false;
                        iter_num.rewind();
                        num = iter_num.next();
                        den = iter_den.next();
                    }
                    if (null == den) return null;
                    if (is_imag)
                    {
                        ret = with_img ? img.mul(Rational(num, den)) : Rational(num, den);
                        with_img = !with_img;
                    }
                    else
                    {
                        ret = is_instance(c, Integer) ? Integer(num) : Rational(num, den);
                    }
                    return ret;
                };
            })(c.isImag() ? c.imag() : c.real(), c.isImag())));
    }
    else if (is_instance(c, RationalFunc))
    {
        return Iterator((function(c) {
            var iter_num = symbolic_divisors(c.num),
                iter_den = symbolic_divisors(c.den),
                num, den;
            return function(curr, dir, state, init) {
                if (init)
                {
                    iter_num.rewind();
                    iter_den.rewind();
                    den = iter_den.next();
                }
                num = iter_num.next();
                if (null == num)
                {
                    iter_num.rewind();
                    num = iter_num.next();
                    den = iter_den.next();
                }
                if (null == den) return null;
                return RationalFunc(num, den);
            };
        })(c));
    }
    else if (is_instance(c, MultiPolynomial))
    {
        return Iterator((function(p, f) {
            var iter_c = symbolic_divisors(f[1]),
                iter_q = Tensor(f[0].map(function(fi) {return fi[1]+1;})),
                c, q;
            return function(curr, dir, state, init) {
                if (init)
                {
                    iter_c.rewind();
                    iter_q.rewind();
                    c = iter_c.next();
                }
                q = iter_q.next();
                if (null == q)
                {
                    iter_q.rewind();
                    q = iter_q.next();
                    c = iter_c.next();
                }
                if (null == c) return null;
                return q.reduce(function(q, ei, i) {
                    return 0 === ei ? q : (1 === ei ? (q._mul(f[0][i][0])) : (q._mul(f[0][i][0].pow(ei))));
                }, MultiPolynomial.Const(c, p.symbol, p.ring));
            };
        })(c, c.factors()));
    }
    else
    {
        // trivial divisors
        return Iterator(c.equ(Arithmetic.I) ? [c] : [c[CLASS].One(c.symbol || null, c.ring || null), c]);
    }
}
function dotp(a, b, Arithmetic)
{
    Arithmetic = Arithmetic || Abacus.DefaultArithmetic;
    var c = Arithmetic.O, n = stdMath.min(a.length, b.length), i;
    for (i=0; i<n; ++i)
    {
        // support dot product of numeric/symbolic as well
        if (is_instance(c, INumber))
        {
            if (is_instance(a[i], INumber))
                c = c.add(a[i].mul(b[i]));
            else if (is_instance(b[i], INumber))
                c = c.add(b[i].mul(a[i]));
            else
                c = c.add(Arithmetic.mul(a[i], b[i]));
        }
        else
        {
            if (is_instance(a[i], INumber))
                c = a[i].mul(b[i]).add(c);
            else if (is_instance(b[i], INumber))
                c = b[i].mul(a[i]).add(c);
            else
                c = Arithmetic.add(c, Arithmetic.mul(a[i], b[i]));
        }
    }
    return c;
}
function gramschmidt(v)
{
    // https://en.wikipedia.org/wiki/Gram%E2%80%93Schmidt_process
    // exact integer fraction-free, only orthogonal basis not necessarily orthonormal
    if (!v.length) return [];
    var Arithmetic = Abacus.Arithmetic, n = v.length, igcd,
        u = new Array(n), pjj = new Array(n), ui, uj, vi, pij, i, j, k, kl, g;
    // O(k*n^2)
    if (is_instance(v[0][0], INumber))
    {
        igcd = v[0][0][CLASS].gcd || gcd;
        for (i=0; i<n; ++i)
        {
            vi = v[i]; u[i] = ui = vi.slice();
            kl = ui.length;
            for (j=0; j<i; ++j)
            {
                uj = u[j]; pij = dotp(/*0===j?*/vi/*:u[j-1]*//*modified g-s*/, uj, Arithmetic);
                for (k=0; k<kl; ++k) ui[k] = pjj[j].mul(ui[k]).sub(pij.mul(uj[k]));
            }
            g = igcd(ui);
            if (g.gt(Arithmetic.I))
                for (k=0; k<kl; ++k) ui[k] = ui[k].div(g);
            pjj[i] = dotp(ui, ui, Arithmetic);
        }
    }
    else
    {
        igcd = gcd;
        for (i=0; i<n; ++i)
        {
            vi = v[i]; u[i] = ui = vi.slice();
            kl = ui.length;
            for (j=0; j<i; ++j)
            {
                uj = u[j]; pij = dotp(/*0===j?*/vi/*:u[j-1]*//*modified g-s*/, uj, Arithmetic);
                for (k=0; k<kl; ++k) ui[k] = Arithmetic.sub(Arithmetic.mul(pjj[j], ui[k]), Arithmetic.mul(pij, uj[k]));
            }
            g = igcd(ui);
            if (Arithmetic.gt(g, Arithmetic.I))
                for (k=0; k<kl; ++k) ui[k] = Arithmetic.div(ui[k], g);
            pjj[i] = dotp(ui, ui, Arithmetic);
        }
    }
    return u;
}
function indexOf(item, set)
{
    var i, l = set.length, eq;
    if (!l) return -1;
    eq = is_instance(item, INumber) ? function(it, si) {return it.equ(si);} : default_eq;
    for (i=0; i<l; ++i)
        if (eq(item, set[i]))
            return i;
    return -1;
}
function spoly(f, g)
{
    var PolynomialClass = f[CLASS],
        flt = f.ltm(), glt = g.ltm(), num = PolynomialClass.Term.lcm(flt, glt);

    return f.mul(PolynomialClass([num.div(flt)], f.symbol)).sub(g.mul(PolynomialClass([num.div(glt)], g.symbol)));
}
function buchberger_groebner(Basis)
{
    // https://en.wikipedia.org/wiki/Gr%C3%B6bner_basis
    // https://en.wikipedia.org/wiki/Buchberger%27s_algorithm
    /*
    Return the unique reduced Groebner basis for (multivariate) polynomial set Basis.

    Uses Buchberger's algorithm to build a Groebner basis, then minimizes
    and reduces the basis. This is not a high-performance implementation.
    (adapted from https://github.com/tim-becker/pyalgebra)
    */
    var Arithmetic = Abacus.Arithmetic, PolynomialClass = MultiPolynomial,
        pairs, pair, extraBasis, newBasis, s, f, g, i, n, found, others, lt, lts;

    Basis = Basis.map(function(b) {return b.monic();});
    if (1 < Basis.length)
    {
        PolynomialClass = Basis[0][CLASS];

        // Build a Groebner basis using Buchberger's algorithm.
        pairs = Combination(Basis.length, 2).mapTo(function(i) {return [Basis[i[0]], Basis[i[1]]];});
        for (;;)
        {
            newBasis = [];
            while (pairs.hasNext())
            {
                pair = pairs.next();
                f = pair[0]; g = pair[1];
                s = spoly(f, g).multimod(Basis);
                if (!s.equ(Arithmetic.O))
                {
                    s = s.monic();
                    if ((-1 === indexOf(s, newBasis)) && (-1 === indexOf(s, Basis)))
                        newBasis.push(s);
                }
            }
            pairs.dispose(true);

            // We've stabilized.
            if (!newBasis.length) break;

            extraBasis = newBasis;
            pairs = 1 === extraBasis.length ? Tensor(Basis.length, extraBasis.length).mapTo(function(i) {return [Basis[i[0]], extraBasis[i[1]]];}) : CombinatorialIterator([
                Tensor(Basis.length, extraBasis.length).mapTo(function(i) {return [Basis[i[0]], extraBasis[i[1]]];}),
                Combination(extraBasis.length, 2).mapTo(function(i) {return [extraBasis[i[0]], extraBasis[i[1]]];})
            ]);
            Basis = Basis.concat(extraBasis);
        }

        // Minimize it.
        lts = Basis.map(function(g) {return g.ltm(true);});
        while (lts.length)
        {
            found = false;
            for (i=0,n=lts.length; i<n; ++i)
            {
                lt = lts[i];
                others = lts.slice(0, i).concat(lts.slice(i+1));
                if (others.length && lt.multimod(others).equ(Arithmetic.O))
                {
                    lts = others;
                    Basis.splice(i, 1);
                    found = true;
                    break;
                }
            }
            if (!found) break;
        }

        // Reduce it.
        for (i=0,n=Basis.length; i<n; ++i)
        {
            g = Basis[i];
            others = Basis.slice(0,i).concat(Basis.slice(i+1));
            if (others.length) Basis[i] = g.multimod(others);
        }

        // Sort it.
        Basis = Basis.sort(function(a, b) {
            return PolynomialClass.Term.cmp(b.ltm(), a.ltm(), true);
        });
    }
    return Basis;
}
function solvedioph2(a, b, param)
{
    // solve general linear diophantine equation in 2 variables
    // a1 x_1 + a2 x_2 = b
    // https://en.wikipedia.org/wiki/Diophantine_equation
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, d, x0, xp;

    // assume all coefficients are already non-zero, does not handle this case, handled in general solution below
    d = gcd(a);

    // no solution
    if (!Arithmetic.equ(O, Arithmetic.mod(b, d))) return null;

    // infinite solutions parametrized by 1 free parameter
    if (!Arithmetic.equ(I, d))
    {
        a = [Arithmetic.div(a[0], d), Arithmetic.div(a[1], d)];
        b = Arithmetic.div(b, d);
    }

    if (Arithmetic.equ(b, O))
    {
        // homogeneous
        xp = [O, O];
    }
    else
    {
        // non-homogeneous
        xp = xgcd(a);
        xp = [Arithmetic.mul(b, xp[1]), Arithmetic.mul(b, xp[2])];
    }
    // fix sign to be always positive for 1st variable
    if (Arithmetic.gt(O, a[1])) {a[0] = Arithmetic.neg(a[0]); a[1] = Arithmetic.neg(a[1]);}
    x0 = [a[1], Arithmetic.neg(a[0])];

    return [
    // general solution = any particular solution of non-homogeneous + general solution of homogeneous
    Expr('+', [xp[0], Expr('*', [x0[0], param])]),
    Expr('+', [xp[1], Expr('*', [x0[1], param])])
    ];
}
function solvedioph(a, b, with_param, with_free_vars)
{
    // solve general linear diophantine equation in k variables
    // a1 x_1 + a2 x_2 + a3 x_3 + .. + ak x_k = b
    // where a is k-array of (integer) coefficients: [a1, a2, a3, .. , ak]
    // and b is (integer) right hand side factor (default 0)
    // https://en.wikipedia.org/wiki/Diophantine_equation
    // https://arxiv.org/ftp/math/papers/0010/0010134.pdf
    // solution adapted from sympy/solvers/diophantine.py
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        ok = a.length, k = ok, d, p, index, i, j, m, n, l, symbols, pnew,
        pos = [], ab, sol2, tot_x, tot_y, solutions, parameters, free_vars,
        symbol = is_string(with_param) && with_param.length ? with_param : 'i';

    if (!ok) return null;

    // filter out zero coefficients and mark positions of non-zero coeffs to restore later
    a = a.filter(function(ai, i) {
        var NZ = !Arithmetic.equ(O, ai);
        if (NZ) pos.push(i);
        return NZ;
    });
    k = a.length;
    free_vars = [];

    if (0 === k)
    {
        // degenerate case where all coefficients are 0, either infinite or no solutions depending on value of b
        index = 0;
        solutions = Arithmetic.equ(O, b) ? array(ok, function(i) {
            var param = symbol + '_' + String(++index);
            free_vars.push(param);
            return Expr('', param);
        }) /* infinite */ : null /* none */;
    }

    else if (1 === k)
    {
        // equation of 1 variable has infinite (if other zero variables) or only 1 (if only 1 variable) or 0 solutions
        index = 0;
        solutions = Arithmetic.equ(O, Arithmetic.mod(b, a[0])) ? array(ok, function(i) {
            var param;
            if ((1 < ok) && i !== pos[0])
            {
                param = symbol + '_' + String(++index);
                free_vars.push(param);
            }
            return i === pos[0] ? Expr('', Arithmetic.div(b, a[0])) : Expr('', param);
        }) /* one/infinite */: null /* none */
    }

    else if (2 === k)
    {
        // equation with only 2 (non-zero) variables
        sol2 = solvedioph2(a, b, symbol + '_1');
        p = 0; index = 0;
        if (sol2) free_vars.push(symbol + '_1');
        solutions = null == sol2 ? null : array(ok, function(i) {
            var param;
            if ((p < pos.length) && (i === pos[p]))
            {
                ++p;
                return sol2[p-1];
            }
            else
            {
                param = symbol + '_' + String(pos.length+(index++));
                free_vars.push(param);
                return Expr('', param);
            }
        });
    }

    else
    {
        /*
        more than 2 variables,
        recursive method based on recursive property of gcd and decomposition of equation (adapted from sympy)

        Consider the following:
        a_0*x_0 + a_1*x_1 + a_2*x_2 = c
        which can be re-written as:
        a_0*x_0 + g_0*y_0 = c
        where
        g_0 = gcd(a_1, a_2)
        and
        y = (a_1*x_1)/g_0 + (a_2*x_2)/g_0
        Consider the trivariate linear equation:
        4*x_0 + 6*x_1 + 3*x_2 = 2
        This can be re-written as:
        4*x_0 + 3*y_0 = 2
        where
        y_0 = 2*x_1 + x_2
        (Note that gcd(3, 6) = 3)
        The complete integral solution to this equation is:
        x_0 =  2 + 3*t_0
        y_0 = -2 - 4*t_0
        where 't_0' is any integer.
        Now that we have a solution for 'x_0', find 'x_1' and 'x_2':
        2*x_1 + x_2 = -2 - 4*t_0
        We can then solve for '-2' and '-4' independently,
        and combine the results:
        2*x_1a + x_2a = -2
        x_1a = 0 + t_0
        x_2a = -2 - 2*t_0
        2*x_1b + x_2b = -4*t_0
        x_1b = 0*t_0 + t_1
        x_2b = -4*t_0 - 2*t_1
        ==>
        x_1 = t_0 + t_1
        x_2 = -2 - 6*t_0 - 2*t_1
        where 't_0' and 't_1' are any integers.
        Note that:
        4*(2 + 3*t_0) + 6*(t_0 + t_1) + 3*(-2 - 6*t_0 - 2*t_1) = 2
        for any integral values of 't_0', 't_1'; as required.
        This method is generalised for many variables, below.
        */
        ab = [gcd(a[k-2], a[k-1])];
        a[k-2] = Arithmetic.div(a[k-2], ab[0]);
        a[k-1] = Arithmetic.div(a[k-1], ab[0]);
        for (i=k-3; i>0; --i)
        {
            d = gcd(ab[0], a[i]);
            ab[0] = Arithmetic.div(ab[0], d);
            a[i] = Arithmetic.div(a[i], d);
            ab.unshift(d);
        }
        ab.push(a[k-1]);

        solutions = [];
        parameters = array(k, function(i) {return symbol + '_' + String(i+1); });
        b = Expr('', b);
        for (i=0,l=ab.length; i<l; ++i)
        {
            tot_x = []; tot_y = [];
            symbols = b.symbols();
            for (j=0,m=symbols.length; j<m; ++j)
            {
                n = b.terms[symbols[j]].c.num;
                if ('1' === symbols[j])
                {
                    // constant term
                    p = '1';
                    pnew = parameters[0];
                }
                else
                {
                    // parameter term
                    p = symbols[j];
                    pnew = parameters[parameters.indexOf(p)+1];
                }

                sol2 = solvedioph2([a[i], ab[i]], n, pnew);
                if (null == sol2) return null; // no solutions

                if ('1' !== p)
                {
                    // re-express partial solution in terms of original symbol
                    sol2[0] = Expr('+', [Expr('*', [sol2[0].c(), p]), sol2[0].terms[pnew].e]).expand();
                    sol2[1] = Expr('+', [Expr('*', [sol2[1].c(), p]), sol2[1].terms[pnew].e]).expand();
                }
                if (-1 === free_vars.indexOf(pnew)) free_vars.push(pnew);

                tot_x.push(sol2[0]); tot_y.push(sol2[1]);
            }
            solutions.push(Expr('+', tot_x).expand());
            b = Expr('+', tot_y).expand();
        }
        solutions.push(b);

        p = 0; index = 0;
        solutions = array(ok, function(i) {
            var param;
            if (p < pos.length && i === pos[p])
            {
                ++p;
                return solutions[p-1];
            }
            else
            {
                param = symbol + '_' + String(pos.length + (index++));
                free_vars.push(param);
                return Expr('', param);
            }
        });
    }

    solutions = null == solutions ? null : (false === with_param ? solutions.map(function(x) {
        // return particular solution (as number), not general (as expression)
        return x.c().num;
    }) : solutions);
    free_vars.symbol = symbol;
    return null == solutions ? null : (true === with_free_vars ? [solutions, free_vars] : solutions);
}
function solvediophs(a, b, with_param, with_free_vars)
{
    // solve general system of m linear diophantine equations in k variables
    // a11 x_1 + a12 x_2 + a13 x_3 + .. + a1k x_k = b1, a21 x_1 + a22 x_2 + a23 x_3 + .. + a2k x_k = b2,..
    // where a is m x k-matrix of (integer) coefficients: [[a11, a12, a13, .. , a1k],..,[am1, am2, am3, .. , amk]]
    // and b is m-array right hand side factor (default [0,..,0])
    // https://arxiv.org/ftp/math/papers/0010/0010134.pdf
    // https://www.math.uwaterloo.ca/~wgilbert/Research/GilbertPathria.pdf
    var ring = Ring.Z(), O = ring.Zero(), I = ring.One(),
        m, k, solutions = null, symbol = is_string(with_param) && with_param.length ? with_param : 'i',
        tmp, ref, aug, pivots, rank, Rt, Tt, i, j, t, p, free_vars;

    if (!is_instance(a, Matrix)) a = Matrix(ring, a);
    else if (!is_class(a.ring.NumberClass, Integer)) a = Matrix(ring, a);
    m = a.nr; if (!m) return null;
    k = a.nc; if (!k) return null;
    if (is_instance(b, Matrix)) b = b.col(0);
    b = ring.cast(b);
    // concat with zeroes
    if (m > b.length) b = b.concat(array(m-b.length, function(i) {return O;}));
    // A*X = B <=> iref(A.t|I) = R|T <=> iif R.t*P = B has int solutions P => X = T.t*P
    tmp = a.t()/*.concat(Matrix.I(ring, k))*/.ref(true/*, [k, m]*/);
    ref = tmp[0]; aug = tmp[3]; pivots = tmp[1]; rank = pivots.length;
    Tt = aug/*ref.slice(0,m,-1,-1)*/.t(); Rt = ref/*ref.slice(0,0,k-1,m-1)*/.t();
    p = new Array(k); free_vars = new Array(k-rank);

    // R.t*P can be easily solved by substitution
    for (i=0; i<k; ++i)
    {
        if (i >= rank)
        {
            free_vars[i-rank] = symbol + '_' + String(i-rank+1);
            p[i] = Expr('', free_vars[i-rank]); // free variable
        }
        else
        {
            for (t=O,j=0; j<i; ++j) t = t.add(Rt.val[i][j].mul(p[j].c().num));
            p[i] = b[i].sub(t);
            if (Rt.val[i][i].equ(O))
            {
                if (p[i].equ(O)) p[i] = Expr('', symbol + '_' + String(i+1)); // free variable
                else return null; // no integer solution
            }
            else if (Rt.val[i][i].divides(p[i]))
            {
                p[i] = Expr('', p[i].div(Rt.val[i][i]));
            }
            else
            {
                // no integer solution
                return null;
            }
        }
    }
    // X = T.t*P
    solutions = array(k, function(i) {
        return Expr('+', array(k, function(j) {
            return p[j].mul(Tt.val[i][j]);
        })).expand();
    });

    // if over-determined system (m > k)
    // check if additional rows are satisfied by solution as well
    for (i=k; i<m; ++i)
        if (!Expr('+', solutions.map(function(xj) {return xj.mul(a.val[i][j]);})).equ(b[i]))
            return null; // no solution

    solutions = null == solutions ? null : (false === with_param ? solutions.map(function(x) {
        // return particular solution (as number), not general (as expression)
        return x.c().num;
    }) : solutions);
    free_vars.symbol = symbol;
    return null == solutions ? null : (true === with_free_vars ? [solutions, free_vars] : solutions);
}
function solvecongr(a, b, m, with_param, with_free_vars)
{
    // solve linear congruence using the associated linear diophantine equation
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, solution, free_vars;
    if (!a.length) return null;
    with_free_vars = (true === with_free_vars);
    solution = solvedioph(a.concat(m), b, with_param, with_free_vars);
    if (solution && with_free_vars)
    {
        free_vars = solution[1];
        // skip last variable
        //free_vars.pop();
        solution = solution[0];
    }
    // skip last variable
    solution = null == solution ? null : array(solution.length-1, function(i) {
        // make positive constant terms modulo m
        var x = solution[i];
        if (false === with_param)
        {
            // a particular solution (as number)
            if (Arithmetic.gt(O, x))
                x = Arithmetic.add(x, m);
        }
        else
        {
            // general solution (as expression)
            if (x.c().lt(O))
                x = x.add(m).expand();
        }
        return x;
    });

    return null == solution ? null : (with_free_vars ? [solution, free_vars] : solution);
}
function solvecongrs(a, b, m, with_param, with_free_vars)
{
    // solve linear congruence using the associated linear diophantine equation
    var ring = Ring.Z(), Arithmetic = Abacus.Arithmetic, O = ring.Zero(), solution, M, MM, mc, free_vars;
    if (!is_instance(a, Matrix)) a = Matrix(ring, a);
    else if (!is_class(a.ring.NumberClass, Integer)) a = Matrix(ring, a);
    if (!a.nr || !a.nc) return null;
    if (!is_array(m) && !is_args(m) && !is_instance(m, Matrix))
    {
        //m = cast(m);
        m = array(a.nr, function(i) {return m;});
    }
    if (is_array(m) || is_args(m)) m = Matrix(ring, m);
    if (is_array(b) || is_args(b)) b = Matrix(ring, b);
    // convert to equivalent system of congruences but with single modulus = LCM(m[1..n])
    // http://www.math.harvard.edu/~knill/preprints/linear.pdf
    mc = m.col(0); M = ring.lcm(mc);
    a = a.concat(m);
    with_free_vars = (true === with_free_vars);
    solution = solvediophs(a, b, with_param, true);
    if (null != solution)
    {
        free_vars = solution[1];
        // skip last variable
        //free_vars.pop();
        solution = solution[0];
    }
    // skip last variable
    solution = null == solution ? null : array(solution.length-1, function(i) {
        // make positive constant terms modulo LCM(m)
        var x = solution[i], add_M = true, t, param;
        if (false === with_param)
        {
            // a particular solution (as number)
            if (Arithmetic.gt(Arithmetic.O, x))
                x = Arithmetic.add(x, M.num);
        }
        else
        {
            // general solution (as expression)
            for (t in x.terms)
            {
                if (!HAS.call(x.terms, t) || ('1' === t)) continue;
                if (Arithmetic.equ(Arithmetic.O, Arithmetic.mod(M.num, x.terms[t].c.num)))
                {
                    add_M = false;
                    break;
                }
            }
            if (add_M)
            {
                param = free_vars.symbol + '_' + String(free_vars.length+1);
                free_vars.push(param);
                x = x.add(Expr('*', [M, param])).expand();
            }
            if (x.c().lt(O))
                x = x.add(M).expand();
        }
        return x;
    });

    return null == solution ? null : (with_free_vars ? [solution, free_vars] : solution);
}
function solvelinears(a, b, x)
{
    // solve general arbitrary system of m linear equations in k variables
    // a11 x_1 + a12 x_2 + a13 x_3 + .. + a1k x_k = b1, a21 x_1 + a22 x_2 + a23 x_3 + .. + a2k x_k = b2,..
    // where a is m x k-matrix of coefficients: [[a11, a12, a13, .. , a1k],..,[am1, am2, am3, .. , amk]]
    // and b is m-array right hand side factor (default [0,..,0])
    // can also produce least-squares solution to given system
    // https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_inverse#Applications
    var apinv, bp, ns;

    if (!is_instance(a, Matrix)) a = Matrix(Ring.Q(), a);
    else if (!a.ring.isField()) a = Matrix(a.ring.associatedField(), a);
    if (!a.nr || !a.nc) return null;
    b = Matrix(a.ring, b);
    apinv = a.ginv(); bp = apinv.mul(b);
    if (true === x) return bp.col(0); // least squares solution
    else if (!a.mul(bp).equ(b)) return null; // no solutions exist
    if (false === x)
    {
        // particular solution
        return bp.col(0);
    }
    else
    {
        // general solution(s)
        ns = Matrix.I(a.ring, bp.nr).sub(apinv.mul(a));
        if (is_string(x)) x = array(ns.nc, function(i) {return x + '_' + String(i+1);});
        else if (is_array(x) && ns.nc > x.length) x = x.concat(array(ns.nc-x.length, function(i) {return x[x.length-1].split('_')[0] + '_' + String(x.length+i+1);}));
        return array(bp.nr, function(i) {
            return Expr('+', array(ns.nc, function(j) {
                return Expr('*', [ns.val[i][j], x[j]]);
            })).add(bp.val[i][0]).expand();
        });
    }
}
function solvelineqs(a, b, x)
{
    // solve general arbitrary system of m linear inequalities in k variables
    // a11 x_1 + a12 x_2 + a13 x_3 + .. + a1k x_k <= b1, a21 x_1 + a22 x_2 + a23 x_3 + .. + a2k x_k <= b2,..
    // where a is m x k-matrix of coefficients: [[a11, a12, a13, .. , a1k],..,[am1, am2, am3, .. , amk]]
    // and b is m-array right hand side factor (default [0,..,0])
    // https://en.wikipedia.org/wiki/Fourier%E2%80%93Motzkin_elimination
    var rel0, rel, sol, k, m, i, j, l, p, n, z, pi, ni;

    if (!is_instance(a, Matrix)) a = Matrix(Ring.Q(), a);
    if (!a.nr || !a.nc || !Ring.Q().equ(a.ring)) return null;
    b = Matrix(a.ring, b).col(0);
    k = a.nc; m = a.nr;

    if (!x) x = 'x';
    if (is_string(x)) x = array(k, function(i) {return x + '_' + String(i+1);});
    else if (is_array(x) && (k > x.length)) x = x.concat(array(k-x.length, function(i) {return (x[x.length-1].split('_')[0]) + '_' + String(x.length+i+1);}));

    rel0 = array(m, function(j) {
        return Expr('<=', [Expr('+', a.row(j).map(function(v, i) {return Expr('*', [v, x[i]]);})), b[j]]);
    });

    sol = [];
    rel = rel0.slice();
    for (i=k-1; i>=0; --i)
    {
        p = []; n = [], z = [];
        rel.forEach(function(s) {
            var f = s.lhs.term(x[i]).c.sub(s.rhs.term(x[i]).c),
                e = s.rhs.sub(s.rhs.term(x[i]).e).sub(s.lhs.sub(s.lhs.term(x[i]).e));
            if (f.gt(0)) p.push(e.div(f).expand());
            else if (f.lt(0)) n.push(e.div(f).expand());
            else z.push(e.expand());
        });
        if (!p.length || !n.length)
        {
            l = z.length;
            rel = new Array(l);
            for (j=0; j<l; ++j)
            {
                if (z[j].isConst() && z[j].lt(0)) return null; // no solution
                rel[j] = Expr('<=', [Expr.Zero(), z[j]]);
            }
            if (p.length || n.length)
            {
                sol.unshift(p.length ? [Expr('<=', [x[i], 1 === p.length ? p[0] : Expr('min()', p)])] : (n.length ? [Expr('<=', [1 === n.length ? n[0] : Expr('max()', n), x[i]])] : []));
            }
        }
        else
        {
            l = p.length * n.length + z.length;
            rel = new Array(l);
            for (j=0; j<l; ++j)
            {
                if (j < z.length)
                {
                    if (z[j].isConst() && z[j].lt(0)) return null; // no solution
                    rel[j] = Expr('<=', [Expr.Zero(), z[j]]);
                }
                /*else if (!p.length)
                {
                    rel[j] = Expr('<=', [n[j-z.length], x[i]]);
                }
                else if (!n.length)
                {
                    rel[j] = Expr('<=', [x[i], p[j-z.length]]);
                }*/
                else
                {
                    pi = stdMath.floor((j-z.length) / n.length);
                    ni = (j-z.length) % n.length;
                    if (p[pi].isConst() && n[ni].isConst() && p[pi].lt(n[ni])) return null; // no solution
                    rel[j] = Expr('<=', [n[ni], p[pi]]);
                }
            }
            sol.unshift([
                Expr('<=', [1 === n.length ? n[0] : Expr('max()', n), x[i]]),
                Expr('<=', [x[i], 1 === p.length ? p[0] : Expr('min()', p)])
            ]);
        }
    }
    return sol;
}
function sign(x)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
    if (is_instance(x, INumber)) return x.equ(O) ? 0 : (x.lt(O) ? -1 : 1);
    else return Arithmetic.equ(O, x) ? 0 : (Arithmetic.gt(O, x) ? -1 : 1);
}
function solvepythag(a, with_param)
{
    // solve pythagorean diophantine equation in k variables
    // a1^2 x_1^2 + a2^2 x_2^2 + a3&2 x_3^2 + .. + a{k-1}^2 x_{k-1}^2 - ak^2x_k = 0
    // where a is k-array of (integer) coefficients: [a1^2, a2^2, a3^2, .. , ak^2]
    // eg. to generate pythagorean triples solve for [1,1,-1] ==> x^2 + y^2 - z^2 = 0
    // solution adapted from sympy/solvers/diophantine.py
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        k = a.length, index, solutions, sol, param, i, ith, L, ilcm, s, pos, neg, //z,
        symbol = is_string(with_param) && with_param.length ? with_param : 'i';

    if (!k) return null;

    // NOTE: assume all coefficients are perfect squares and non-zero
    pos = a.filter(function(ai) {return  1 === sign(ai);}).length;
    neg = a.filter(function(ai) {return -1 === sign(ai);}).length;
    //z = k-pos-neg;

    if ((1 === k) || (0 === pos) || (0 === neg))
        // trivial solution: sum of (same sign) integer squares to be zero, all terms have to be zero
        return array(k, function() {return Expr.Zero(); /* zero */});

    s = array(k, function(i) {return isqrt(Arithmetic.abs(a[i]));});

    if (k !== a.filter(function(ai, i) {return Arithmetic.equ(Arithmetic.abs(ai), Arithmetic.mul(s[i], s[i]));}).length)
        // no general solution in integers, coefficients are not perfect squares, return trivial solution
        return array(k, function() {return Expr.Zero(); /* zero */});

    param = array(k-1, function(i) {return symbol + '_' + String(i+1);});

    if (2 === k)
        // different sign, parametrised solution:
        // a1^2 x1^2 = a2^2 x2^2 ==> x1 = a2*i_1, x2 = a1*i_1
        return [
            Expr('*', [s[1], param[0]]),
            Expr('*', [s[0], param[0]])
        ];

    // k >= 3
    if (0 > sign(a[0]) + sign(a[1]) + sign(a[2]))
        a = a.map(function(ai) {return Arithmetic.neg(ai);});

    index = 0;
    for (i=0; i<k; ++i)
        if (-1 === sign(a[i]))
            index = i; // find last negative coefficient, to be solved with respect to that

    ith = Expr('+', array(param.length, function(i) {return Expr('^', [param[i], 2]);}));
    L = [
        Expr('+', [ith, Expr('*', [Arithmetic.mul(J, two), Expr('^', [param[k-2], 2])])]).expand()
    ].concat(array(k-2, function(i) {
        return Expr('*', [two, param[i], param[k-2]]);
    }));
    solutions = L.slice(0, index).concat(ith).concat(L.slice(index));

    ilcm = I;
    for (i=0; i<k; ++i)
    {
        if ((i === index) || ((0 < index) && (0 === i)) || ((0 === index) && (1 === i)))
            ilcm = lcm(ilcm, s[i]);
        else
            ilcm = lcm(ilcm, Arithmetic.equ(O, Arithmetic.mod(s[i], two)) ? Arithmetic.div(s[i], two) : s[i]);
    }
    for (i=0; i<k; ++i)
    {
        sol = solutions[i];
        solutions[i] = solutions[i].mul(Arithmetic.div(ilcm, s[i])).expand();
        // has a remainder, since it is always a multiple of 2, add 1 only
        if (!Arithmetic.equ(O, Arithmetic.mod(ilcm, s[i])))
            solutions[i] = solutions[i].add(sol.div(two)).expand();
    }
    return solutions;
}
function solvesemilinears(polys, symbol, x)
{
    // solve general system of semi-linear polynomial equations
    // where polynomials must be linear in at least some of the terms
    // so they can be solved with exact symbolic operations wrt the rest
    if (!polys || !polys.length) return polys;
    var maxdeg, triang, solve_for, free_vars, j, has_solution, solution;
    maxdeg = polys.map(function(pi) {
        var terms = 0,
            deg = symbol.map(function(xj) {
                var dij = pi.maxdeg(xj);
                terms += 0 < dij ? 1 : 0;
                return dij;
            });
        return {deg:deg, terms:terms};
    });
    // triangularization
    triang = {};
    polys.forEach(function(pi, i) {
        symbol.forEach(function(xj, j) {
            if ((1 === maxdeg[i].deg[j]) && !pi.term(pi.symbol.map(function(xi) {return xj === xi ? 1 : 0;}), true).equ(0))
            {
                if (!HAS.call(triang, xj))
                {
                    triang[xj] = i;
                }
                else if (maxdeg[i].terms < maxdeg[triang[xj]].terms)
                {
                    triang[xj] = i; // has fewer terms
                }
            }
        });
    });
    solve_for = KEYS(triang);
    if (!solve_for.length) return null; // not semi-linear

    j = 0;
    free_vars = symbol.reduce(function(free_vars, xi) {
        if (!HAS.call(triang, xi))
        {
            free_vars[xi] = x ? Expr('', String(x)+'_'+String(++j)) : Expr('', Rational.Zero());
        }
        return free_vars;
    }, {});
    // back-substitution
    solution = {};
    KEYS(free_vars).forEach(function(xi) {
        solution[xi] = free_vars[xi];
    });
    solve_for.sort(function(a, b) {
        return maxdeg[triang[a]].terms - maxdeg[triang[b]].terms;
    }).forEach(function(xi) {
        var pi = polys[triang[xi]],
            term = pi.term(pi.symbol.map(function(xj) {return xj === xi ? 1 : 0;}), true);
        solution[xi] = pi.sub(term).div(term.lc().neg()).toExpr().compose(free_vars);
        free_vars[xi] = solution[xi]; // use it in subsequent substitutions
    });
    KEYS(solution).forEach(function(xi) {
        solution[xi] = solution[xi].compose(free_vars); // do any additional substitutions left
    });
    has_solution = (polys.filter(function(pi) {
        return to_expr(pi).compose(solution).expand().equ(0);
    }).length === polys.length);
    return has_solution ? symbol.map(function(xi) {return solution[xi];}) : null;
}
function solvepolys(p, x, type)
{
    if (!p || !p.length) return p;

    //type = String(type || 'exact').toLowerCase();
    type = 'exact';
    var xo = x, param = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(function(s) {return -1 === xo.indexOf(s);}).pop();

    function recursively_solve(p, x, start)
    {
        var basis, pnew, xnew,
            linear_eqs, semi_linear_eqs,
            i, j, bj, be, pj, xi, n, z, ab,
            zeros, solution, solutions;

        basis = buchberger_groebner(p);
        if ((1 === basis.length) && basis[0].isConst())
        {
            // Infinite or Inconsistent
            return basis[0].equ(0) ? [x.map(function(xi, i) {return Expr('', param+'_'+String(i+1))})] : null;
        }

        bj = -1;
        xi = '';
        linear_eqs = [];
        semi_linear_eqs = false;
        for (j=0,n=basis.length; j<n; ++j)
        {
            pj = basis[j];
            if (!semi_linear_eqs && pj.symbol.filter(function(xi) {return 1 === pj.maxdeg(xi);}).length)
            {
                semi_linear_eqs = true;
            }
            if (1 === pj.maxdeg(true))
            {
                linear_eqs.push(pj);
            }
            if (-1 === bj)
            {
                for (i=x.length-1; i>=0; --i)
                {
                    if (pj.isUni(x[i], true))
                    {
                        bj = j;
                        xi = i;
                        break;
                    }
                }
            }
        }

        if ((!linear_eqs.length) && (!semi_linear_eqs) && ((basis.length < x.length) || (-1 === bj)))
        {
            // No solution
            return null;
        }

        if (-1 === bj)
        {
            if (linear_eqs.length)
            {
                // solve underdetermined linear system
                ab = linear_eqs.reduce(function(ab, eq) {
                    ab.a.push(x.map(function(xi) {return eq.lc(xi);}));
                    ab.b.push(eq.c().neg());
                    return ab;
                }, {
                    a:[],
                    b:[]
                });
                solution = solvelinears(Matrix(linear_eqs[0].ring, ab.a), ab.b, param || false);
                if (!solution) return null; // no solution
                zeros = basis.filter(function(b) {
                    if (-1 < linear_eqs.indexOf(b)) return true;
                    return to_expr(b).compose(solution).expand().equ(0);
                });
                // if system satisfied
                return zeros.length === basis.length ? [solution.map(to_expr)] : null;
            }
            if (semi_linear_eqs)
            {
                // solve underdetermined semi-linear system
                solution = solvesemilinears(basis, x, param || false);
                // if system satisfied
                return solution ? [solution.map(to_expr)] : null;
            }
            // No solution
            return null;
        }

        // find exact rational solutions for univariate poly if any
        zeros = Polynomial(basis[bj], x[xi]).roots().map(function(z) {return z[0];}).map(to_expr); // TODO exactroots()

        if (!zeros.length)
        {
            // No rational solutions
            return [];
        }

        // single variable
        if (1 === basis.length)
        {
            return zeros.map(function(z) {return [z];});
        }

        // recursively solve for the rest
        solutions = [];
        xnew = x.filter(function(xj) {return xj !== x[xi];});
        for (i=0,n=zeros.length; i<n; ++i)
        {
            z = zeros[i];
            pnew = basis.reduce(function(pnew, b, j) {
                if (j !== bj)
                {
                    var eq = to_expr(b).substitute(z, x[xi]).expand();
                    if (!eq.equ(0)) pnew.push(eq.toPoly(xo, b.ring));
                }
                return pnew;
            }, []);
            if (pnew.length)
            {
                solution = recursively_solve(pnew, xnew);
                if (!solution || !solution.length) return solution; // no solution
                solutions = solutions.concat(solution.map(function(s) {
                    s.splice(xi, 0, z);
                    return s;
                }));
            }
            else
            {
                j = 0;
                solutions.push(x.map(function(xj) {
                    return xj === x[xi] ? z : Expr('', String(param)+'_'+String(++j));
                }));
            }
        }

        return solutions;
    }

    return recursively_solve(p, x, true);
}
function pow2(n)
{
    if (is_instance(n, Integer))
        return new n[CLASS](pow2(n.num));
    else if (is_instance(n, Rational))
        return new n[CLASS](pow2(n.num), pow2(n.den));
    var Arithmetic = Abacus.Arithmetic;
    return Arithmetic.shl(Arithmetic.I, Arithmetic.num(n));
}
function exp(n, k)
{
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num;
    k = is_instance(k, Integer) ? k.num : N(k);
    if (is_instance(n, Integer))
        return new n[CLASS](exp(n.num, k));
    else if (is_instance(n, Rational))
        return new n[CLASS](exp(n.num, k), exp(n.den, k));
    return Arithmetic.pow(N(n), k);
}
/*function prime_factorial(n)
{
    // compute factorial by its prime factorization
    // eg https://janmr.com/blog/2010/10/prime-factors-of-factorial-numbers/
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        fac = Arithmetic.I, e, p, pp, d, i, l, primes_up_to_n = PrimeSieve();

    // compute exponents for each prime of the prime factorisation of n!
    p = primes_up_to_n.next();
    while (null!=p && Arithmetic.lte(p, n))
    {
        e = O; pp = p; d = Arithmetic.div(n, pp);
        while (!Arithmetic.equ(O, d))
        {
            e = Arithmetic.add(e, d);
            pp = Arithmetic.mul(pp, p);
            d = Arithmetic.div(n, pp);
        }
        if (!Arithmetic.equ(O, e))
            fac = Arithmetic.mul(fac, Arithmetic.pow(p, e));

        // get next prime up to n
        p = primes_up_to_n.next();
    }
    primes_up_to_n.dispose();

    return fac;
}*/
function split_product(list, start, end)
{
    var Arithmetic = Abacus.Arithmetic;
    if (start > end) return Arithmetic.I;
    if (start === end) return list[start];
    var middle = ((start + end) >>> 1);
    return Arithmetic.mul(split_product(list, start, middle), split_product(list, middle+1, end));
}
function dsc_factorial(n)
{
    // divide-swing-conquer fast factorial computation
    // https://oeis.org/A000142/a000142.pdf
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        I = Arithmetic.I, two = Arithmetic.II, three = Arithmetic.num(3),
        swing, odd_factorial, bits, primes, sieve;

    swing = function swing(m, primes) {
        var s, d, e, g, factors, prime, p, q, i;
        if (Arithmetic.lt(m, 4)) return ([I,I,I,three])[Arithmetic.val(m)];
        s = bisect(primes, Arithmetic.add(I, isqrt(m)), -1, null, null, Arithmetic.lt);
        d = bisect(primes, Arithmetic.add(I, Arithmetic.div(m, three)), -1, null, null, Arithmetic.lt);
        e = bisect(primes, Arithmetic.add(I, Arithmetic.div(m, two)), -1, null, null, Arithmetic.lt);
        g = bisect(primes, Arithmetic.add(I, m), -1, null, null, Arithmetic.lt);
        factors = primes.slice(e, g).concat(primes.slice(s, d).filter(function(p) {return Arithmetic.equ(I, Arithmetic.mod(Arithmetic.div(m, p), two));}));
        for (i=1; i<s; ++i)
        {
            prime = primes[i]; // prime in primes[1:s]
            p = I; q = m;
            for (;;)
            {
                q = Arithmetic.div(q, prime);
                if (Arithmetic.equ(O, q)) break;
                if (! Arithmetic.equ(O, Arithmetic.mod(q, two))) p = Arithmetic.mul(p, prime);
            }
            if (Arithmetic.gt(p, I)) factors.push(p);
        }
        return split_product(factors, 0, factors.length-1);
    };

    odd_factorial = function odd_factorial(n, primes) {
        if (Arithmetic.lt(n, two)) return I;
        var f = odd_factorial(Arithmetic.div(n, two), primes);
        return Arithmetic.mul(Arithmetic.mul(f, f), swing(n, primes));
    };

    if (Arithmetic.lt(n, two)) return I;
    bits = Arithmetic.sub(n, Arithmetic.digits(n, 2).split('').reduce(function(s, d) {return Arithmetic.add(s, '1'===d?I:O);}, O));
    sieve = PrimeSieve();
    primes = sieve.get(function(p) {return Arithmetic.lte(p, n);});
    sieve.dispose();
    return Arithmetic.mul(odd_factorial(n, primes), pow2(bits));
}
function factorial(n, m)
{
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        NUM = Arithmetic.num, VAL = Arithmetic.val,
        add = Arithmetic.add, sub = Arithmetic.sub,
        div = Arithmetic.div, mul = Arithmetic.mul, mod = Arithmetic.mod,
        key, res = O, i, f, MAXMEM = Abacus.Options.MAXMEM;

    if (is_instance(n, Integer)) return new n[CLASS](factorial(n.num, m));

    n = NUM(n);

    if (null == m)
    {
        // http://www.luschny.de/math/factorial/index.html
        // https://en.wikipedia.org/wiki/Factorial
        // simple factorial = F(n) = n F(n-1) = n!
        if (Arithmetic.lte(n, 12)) return Arithmetic.lt(n, O) ? O : NUM(([1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600 /*MAX: 2147483647*/])[VAL(n)]);

        // for large factorials, use the swinging factorial or the prime factorisation of n!
        if (Arithmetic.gte(n, 100)) return dsc_factorial(n); //prime_factorial(n);

        key = String(n)/*+'!'*/;
        if (null == factorial.mem1[key])
        {
            // iterative
            //res = operate(mul, I, null, 2, n);
            // recursive and memoized
            // simple factorial = F(n) = n F(n-1) = n!
            res = mul(factorial(sub(n, I)), n);
            //res = fproduct(n, 1);
            // memoize only up to MAXMEM results
            if (Arithmetic.lt(n, MAXMEM))
                factorial.mem1[key] = res;
        }
        else
        {
            res = factorial.mem1[key];
        }
    }
    else if (false === m)
    {
        // http://mathworld.wolfram.com/Subfactorial.html
        // https://en.wikipedia.org/wiki/Derangement
        // https://en.wikipedia.org/wiki/Rencontres_numbers
        // derangement sub-factorial D(n) = n D(n-1) + (-1)^n = !n = [(n!+1)/e]
        // for given number of fixed points k > 0: D(n,k) = C(n,k) D(n-k)
        if (Arithmetic.lte(n, 12)) return Arithmetic.equ(n, O) ? I : (Arithmetic.lte(n, I) ? O : NUM(([1,2,9,44,265,1854,14833,133496,1334961,14684570,176214841])[VAL(sub(n, two))]));
        key = '!' + String(n);
        if (null == factorial.mem2[key])
        {
            //factorial.mem2[key] = Math.floor((factorial(n)+1)/Math.E);
            /*factorial.mem2[key] = operate(function(N, n){
                return add(n&1 ? J : I, mul(N,n));
            }, I, null, 3, n);*/
            if (Arithmetic.gt(n, 10000))
            {
                for (res=O,f=I,i=O; Arithmetic.lte(i, n); i=add(i, I))
                {
                    res = add(res, mul(f, mul(factorial(n, i), factorial(sub(n, i)))));
                    f = Arithmetic.neg(f);
                }
            }
            else
            {
                // recursive and memoized
                // derangement sub-factorial D(n) = n D(n-1) + (-1)^n = (n-1) (D(n-1) + D(n-2)) = !n = [(n!+1)/e]
                res = add(Arithmetic.equ(O, mod(n, two)) ? I : J, mul(factorial(sub(n, I), false), n));
            }
            // memoize only up to MAXMEM results
            if (Arithmetic.lt(n, MAXMEM))
                factorial.mem2[key] = res;
        }
        else
        {
            res = factorial.mem2[key];
        }
    }
    else if (true === m)
    {
        // involution factorial = I(n) = I(n-1) + (n-1) I(n-2)
        // http://oeis.org/A000085
        // I(n) = \sum_{k=0}^{\lfloor n/2 \rfloor}\binom{n}{2k}\frac{(2k)!}{k!2^k}
        if (Arithmetic.lte(n, 18)) return Arithmetic.lt(n, O) ? O : NUM(([1,1,2,4,10,26,76,232,764,2620,9496,35696,140152,568504,2390480,10349536,46206736,211799312,997313824])[VAL(n)]);
        key = 'I' + String(n);
        if (null == factorial.mem2[key])
        {
            // recursive and memoized
            // involution factorial = I(n) = I(n-1) + (n-1) I(n-2)
            res = add(factorial(sub(n, I), true), mul(factorial(sub(n, two), true), sub(n, I)));
            // memoize only up to MAXMEM results
            if (Arithmetic.lt(n, MAXMEM))
                factorial.mem2[key] = res;
        }
        else
        {
            res = factorial.mem2[key];
        }
    }
    else if (is_array(m))
    {
        // https://en.wikipedia.org/wiki/Multinomial_theorem
        // multinomial = n!/m1!..mk!
        if (!m.length) return Arithmetic.lt(n, O) ? O : factorial(n);
        else if (Arithmetic.lt(n, O)) return O;
        if (is_array(m[0]))
        {
            m = m[0];
            if (!m.length) return Arithmetic.lt(n, O) ? O : factorial(n);
            else if (1 === m.length) return factorial(n, m[0]);
            res = operate(function(N, mk) {return add(N, mk);}, O, m);
            if (Arithmetic.equ(res, O)) return n;
            else if (Arithmetic.gt(res, n)) return O;
            key = String(n) + '@' + mergesort(m.map(String),1,true).join(',') + '@';
            if (null == factorial.mem3[key])
            {
                i = sub(res, I); res = I;
                while (Arithmetic.gte(i, O))
                {
                    res = mul(res, sub(n, i));
                    i = sub(i, I);
                }
                res = operate(function(N, mk) {return div(N, factorial(mk));}, res, m);
                // memoize only up to MAXMEM results
                if (Arithmetic.lt(n, MAXMEM))
                    factorial.mem3[key] = res;
            }
            else
            {
                res = factorial.mem3[key];
            }
        }
        else
        {
            key = String(n) + '@' + mergesort(m.map(String),1,true).join(',');
            if (null == factorial.mem3[key])
            {
                res = operate(function(N, mk) {return div(N, factorial(mk));}, factorial(n), m);
                // memoize only up to MAXMEM results
                if (Arithmetic.lt(n, MAXMEM))
                    factorial.mem3[key] = res;
            }
            else
            {
                res = factorial.mem3[key];
            }
        }
    }
    else if (Arithmetic.isNumber(m) || is_instance(m, Integer))
    {
        m = is_instance(m, Integer) ? m.num : NUM(m);

        if (Arithmetic.lt(m, O))
        {
            // selections, ie m!C(n,m) = n!/(n-m)! = (n-m+1)*..(n-1)*n
            if (Arithmetic.lte(n, Arithmetic.neg(m))) return Arithmetic.equ(n, Arithmetic.neg(m)) ? factorial(n) : O;
            key = String(n) + '@' + String(m);
            if (null == factorial.mem3[key])
            {
                i = add(n, m);
                if (Arithmetic.gt(sub(n, i), 500))
                {
                    res = div(factorial(n), factorial(i));
                }
                else
                {
                    i = add(i, I); res = i;
                    while (Arithmetic.lt(i, n))
                    {
                        i = add(i, I);
                        res = mul(res, i);
                    }
                }
                // memoize only up to MAXMEM results
                if (Arithmetic.lt(n, MAXMEM))
                    factorial.mem3[key] = res;
            }
            else
            {
                res = factorial.mem3[key];
            }
        }
        else
        {
            // https://en.wikipedia.org/wiki/Binomial_coefficient
            // binomial = C(n,m) = C(n-1,m-1)+C(n-1,m) = n!/m!(n-m)!
            if (Arithmetic.lt(m, O) || Arithmetic.lt(n, O) || Arithmetic.gt(m, n)) return O;
            if (Arithmetic.lt(n, mul(m, two))) m = sub(n, m); // take advantage of symmetry
            if (Arithmetic.equ(m, O) || Arithmetic.equ(n, I)) return I;
            else if (Arithmetic.equ(m, I)) return n;
            key = String(n) + '@' + String(m);
            if (null == factorial.mem3[key])
            {
                // recursive and memoized
                // binomial = C(n,m) = C(n-1,m-1)+C(n-1,m) = n!/m!(n-m)!
                if (Arithmetic.lte(n, 20))
                {
                    res = add(factorial(sub(n, I), sub(m, I)), factorial(sub(n, I), m));/*div(factorial(n,-m), factorial(m))*/
                }
                else if (Arithmetic.isDefault())
                {
                    res = stdMath.round(operate(function(Cnm,i) {
                        // this is faster and will not overflow unnecesarily for default arithmetic
                        return Cnm * (1+n/i);
                    }, (n=n-m)+1, null, 2, m));
                }
                else
                {
                    i = sub(n, m);
                    if (Arithmetic.gt(sub(n, i), 500))
                    {
                        res = div(factorial(n), mul(factorial(m), factorial(i)));
                    }
                    else
                    {
                        i = add(i, I); res = i;
                        while (Arithmetic.lt(i, n))
                        {
                            i = add(i, I);
                            res = mul(res, i);
                        }
                        res = div(res, factorial(m));
                    }
                }
                // memoize only up to MAXMEM results
                if (Arithmetic.lt(n, MAXMEM))
                    factorial.mem3[key] = res;
            }
            else
            {
                res = factorial.mem3[key];
            }
        }
    }
    return res;
}
factorial.mem1 = Obj();
factorial.mem2 = Obj();
factorial.mem3 = Obj();
function stirling(n, k, s)
{
    // https://en.wikipedia.org/wiki/Stirling_number
    // https://en.wikipedia.org/wiki/Stirling_numbers_of_the_first_kind
    // https://en.wikipedia.org/wiki/Stirling_numbers_of_the_second_kind
    // https://en.wikipedia.org/wiki/Lah_number
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        key, res = O, MAXMEM = Abacus.Options.MAXMEM;

    if (is_instance(n, Integer)) return new n[CLASS](stirling(n.num, is_instance(k, Integer) ? k.num : k, s));

    if (is_instance(k, Integer)) k = k.num;

    n = Arithmetic.num(n); k = Arithmetic.num(k); s = +s;

    if (Arithmetic.lt(n, O) || Arithmetic.lt(k, O) || Arithmetic.gt(k, n)) return O;
    if (3 === s)
    {
        // third kind: Lah number  L(n,k) = {n-1 \choose k-1} \frac{n!}{k!},
        // L(n+1,k)=(n+k)L(n,k)+L(n,k-1)
        if (Arithmetic.equ(k, O)) return O;
        else if (Arithmetic.equ(k, I) && Arithmetic.equ(n, I)) return I;
        key = String(n) + ',' + String(k);
        if (null == stirling.mem3[key])
        {
            n = sub(n, I);
            res = add(mul(add(n, k), stirling(n, k, 3)), stirling(n, sub(k, I), 3));
            // memoize only up to MAXMEM results
            if (Arithmetic.lt(n, MAXMEM))
                stirling.mem3[key] = res;
        }
        else
        {
            res = stirling.mem3[key];
        }
    }
    else if (2 === s)
    {
        // second kind: S{n,k} = k S{n-1,k} + S{n-1,k-1}
        if (Arithmetic.equ(n, k) || (Arithmetic.equ(k, I) && Arithmetic.lt(n, O))) return I;
        else if (Arithmetic.equ(n, O) || Arithmetic.equ(k, O)) return O;
        key = String(n) + ',' + String(k);
        if (null == stirling.mem2[key])
        {
            res = add(stirling(sub(n, I), sub(k, I), 2), mul(stirling(sub(n, I), k, 2), k));
            // memoize only up to MAXMEM results
            if (Arithmetic.lt(n, MAXMEM))
                stirling.mem2[key] = res;
        }
        else
        {
            res = stirling.mem2[key];
        }
    }
    else if (-1 === s)
    {
        // signed first kind: S[n,k] = -(n-1) S[n-1,k] + S[n-1,k-1]
        if (Arithmetic.equ(k, O) && Arithmetic.lt(n, O)) return O;
        else if (Arithmetic.equ(n, k)) return I;
        key = String(n) + ',' + String(k)+'-';
        if (null == stirling.mem1[key])
        {
            res = add(stirling(sub(n, I), sub(k, I), -1), mul(stirling(sub(n, I), k, -1), sub(I, n)));
            // memoize only up to MAXMEM results
            if (Arithmetic.lt(n, MAXMEM))
                stirling.mem1[key] = res;
        }
        else
        {
            res = stirling.mem1[key];
        }
    }
    else //if (1 === s)
    {
        // unsigned first kind: S[n,k] = (n-1) S[n-1,k] + S[n-1,k-1]
        if (Arithmetic.equ(k, O) && Arithmetic.lt(n, O)) return O;
        else if (Arithmetic.equ(n, k)) return I;
        else if (Arithmetic.equ(k, I)) return factorial(sub(n, I));
        /*key = '+'+String(n)+','+String(k);
        if (null == stirling.mem1[key])
            stirling.mem1[key] = add(stirling(n-1,k-1,1), mul(stirling(n-1,k,1),n-1));
        return stirling.mem1[key];*/
        res = Arithmetic.equ(O, Arithmetic.mod(sub(n, k), Arithmetic.II)) ? stirling(n, k, -1) : Arithmetic.neg(stirling(n, k, -1));
    }
    return res;
}
stirling.mem1 = Obj();
stirling.mem2 = Obj();
stirling.mem3 = Obj();
function catalan(n)
{
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        NUM = Arithmetic.num, VAL = Arithmetic.val,
        add = Arithmetic.add, sub = Arithmetic.sub,
        div = Arithmetic.div, mul = Arithmetic.mul,
        key, res = O, MAXMEM = Abacus.Options.MAXMEM;

    // https://en.wikipedia.org/wiki/Catalan_number
    // https://rosettacode.org/wiki/Catalan_numbers
    // https://anonymouscoders.wordpress.com/2015/07/20/its-all-about-catalan/
    // catalan numbers C(n) = (4n+2)C(n-1)/(n+1)
    if (is_instance(n, Integer)) return new n[CLASS](catalan(n.num));

    n = NUM(n);
    if (Arithmetic.lte(n, 17)) return Arithmetic.lt(n, O) ? O : NUM(([1,1,2,5,14,42,132,429,1430,4862,16796,58786,208012,742900,2674440,9694845,35357670,129644790])[VAL(n)]);
    key = String(n);
    if (null == catalan.mem[key])
    {
        // memoize only up to MAXMEM results
        if (Arithmetic.lt(n, MAXMEM))
        {
            /*res = operate(function(c,i){return add(c,mul(catalan(i),catalan(n-1-i)));},O,null,0,n-1,1);*/
            res = div(mul(catalan(sub(n, I)), sub(mul(n, 4), two)), add(n, I));/* n -> n-1 */
            catalan.mem[key] = res;
        }
        else
        {
            res = div(factorial(mul(n, two), n), add(n, I)) /*operate(function(c, k){
                return div(mul(c, k+n), k);
            }, I, null, 2, n)*/;
        }
    }
    else
    {
        res = catalan.mem[key];
    }
    return res;
}
catalan.mem = Obj();
function bell(n)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        NUM = Arithmetic.num, VAL = Arithmetic.val,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        key, res = O, i, MAXMEM = Abacus.Options.MAXMEM;
    // https://en.wikipedia.org/wiki/Bell_number
    // https://en.wikipedia.org/wiki/Bell_triangle
    // http://fredrikj.net/blog/2015/08/computing-bell-numbers/
    // bell numbers B(n) = SUM[k:0->n-1] (C(n-1,k) B(k))
    if (is_instance(n, Integer)) return new n[CLASS](bell(n.num));

    n = NUM(n);
    if (Arithmetic.lte(n, 14)) return Arithmetic.lt(n, O) ? O : NUM(([1,1,2,5,15,52,203,877,4140,21147,115975,678570,4213597,27644437,190899322])[VAL(n)]);
    key = String(n);
    if (null == bell.mem[key])
    {
        res = O; i = O; n = sub(n, I);
        while (Arithmetic.lte(i, n))
        {
            res = add(res, mul(factorial(n, i), bell(i)));
            i = add(i, I);
        }
        // memoize only up to MAXMEM results
        if (Arithmetic.lt(n, MAXMEM))
            bell.mem[key] = res;
    }
    else
    {
        res = bell.mem[key];
    }
    return res;
}
bell.mem = Obj();
function fibonacci(n)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        NUM = Arithmetic.num, VAL = Arithmetic.val, k, f1, f0,
        key, res = O, MAXMEM = Abacus.Options.MAXMEM;
    // http://en.wikipedia.org/wiki/Fibonacci_number
    // fibonacci numbers F(n) = F(n-1) + F(n-2)
    if (is_instance(n, Integer)) return new n[CLASS](fibonacci(n.num));

    n = NUM(n);
    if (Arithmetic.lte(n, 36)) return Arithmetic.lt(n, O) ? O : NUM(([0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765,10946,17711,28657,46368,75025,121393,196418,317811,514229,832040,1346269,2178309,3524578,5702887,9227465,14930352])[VAL(n)]);
    key = String(n);
    if (null == fibonacci.mem[key])
    {
        // recursive and memoized
        // fibonacci numbers F(n) = F(n-1) + F(n-2)
        //f1 = fibonacci(n-1); f0 = fibonacci(n-2);
        //res = Arithmetic.add(f1,f0);

        // https://www.nayuki.io/page/fast-fibonacci-algorithms
        // recursive and memoized and fast doubling
        // fibonacci numbers F(2k) = F(k)(2F(k+1)-F(k)), F(2k+1) = F(k+1)^2 + F(k)^2
        k = Arithmetic.div(n, two);
        f1 = fibonacci(Arithmetic.add(k, I)); f0 = fibonacci(k);
        if (Arithmetic.equ(O, Arithmetic.mod(n, two))) // 2k
            res = Arithmetic.mul(f0, Arithmetic.sub(Arithmetic.mul(f1, Arithmetic.II), f0));
        else // 2k+1
            res = Arithmetic.add(Arithmetic.mul(f1, f1), Arithmetic.mul(f0, f0));
        // memoize only up to MAXMEM results
        if (Arithmetic.lt(n, MAXMEM))
            fibonacci.mem[key] = res;
    }
    else
    {
        res = fibonacci.mem[key];
    }
    return res;
}
fibonacci.mem = Obj();
function polygonal(n, k)
{
    // https://en.wikipedia.org/wiki/Figurate_number
    // https://en.wikipedia.org/wiki/Polygonal_number
    // https://en.wikipedia.org/wiki/Triangular_number
    // https://en.wikipedia.org/wiki/Square_number
    // https://en.wikipedia.org/wiki/Pentagonal_number
    // https://en.wikipedia.org/wiki/Hexagonal_number
    // https://en.wikipedia.org/wiki/Heptagonal_number
    // https://en.wikipedia.org/wiki/Octagonal_number
    // https://en.wikipedia.org/wiki/Nonagonal_number
    // https://en.wikipedia.org/wiki/Decagonal_number
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        NUM = Arithmetic.num, number;
    if (is_instance(k, Integer)) k = k.num;
    k = NUM(k);
    if (Arithmetic.lt(k, 3)) return null;
    if (is_instance(n, Integer)) return new n[CLASS](polygonal(n.num, k));
    n = NUM(n);
    number = Arithmetic.div(Arithmetic.mul(n, Arithmetic.sub(Arithmetic.mul(n, Arithmetic.sub(k, two)), Arithmetic.sub(k, 4))), two);
    return number;
}
function sum_nk(n, k)
{
    // https://brilliant.org/wiki/sum-of-n-n2-or-n3/
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I,
        add = Arithmetic.add, sub = Arithmetic.sub,
        mul = Arithmetic.mul, div = Arithmetic.div, pow = Arithmetic.pow,
        NUM = Arithmetic.num, sum = O, m, f, k1, key, MAXMEM = Abacus.Options.MAXMEM;
    if (is_instance(n, Integer)) return new n[CLASS](polygonal(n.num, k));
    n = NUM(n);
    if (is_instance(k, Integer)) k = k.num;
    k = NUM(k);
    if (Arithmetic.lte(n, O) || Arithmetic.lt(k, O)) return sum;
    if (Arithmetic.equ(k, O))
    {
        sum = n;
    }
    else if (Arithmetic.equ(k, I))
    {
        sum = div(mul(n, add(n, I)), 2);
    }
    else if (Arithmetic.equ(k, 2))
    {
        sum = div(mul(n, mul(add(n, I), add(mul(n, 2), I))), 6);
    }
    else if (Arithmetic.equ(k, 3))
    {
        sum = div(mul(pow(n, 2), pow(add(n, I), 2)), 4);
    }
    else
    {
        key = String(n) + ',' + String(k);
        if (null == sum_nk.mem[key])
        {
            if (Arithmetic.lt(k, n))
            {
                /*
                compute it using recurrence relation on k
                s_{k,n} = \sum\limits_{i=1}^n i^k.

                n^{k+1} = \binom{k+1}1 s_{k,n} - \binom{k+1}2 s_{k-1,n} + \binom{k+1}3 s_{k-2,n} - \cdots + (-1)^{k-1} \binom{k+1}{k} s_{1,n} + (-1)^k n
                */
                m = I; f = I; k1 = add(k, I);
                sum = pow(n, k1);
                while (Arithmetic.lte(m, k))
                {
                    sum = add(sum, mul(f, mul(factorial(k1, add(m, I)), sum_nk(n, sub(k, m)))));
                    m = add(m, I);
                    f = Arithmetic.neg(f);
                }
                sum = div(sum, k1);
            }
            else
            {
                // compute it directly, on iterating over n
                while (Arithmetic.gt(n, O))
                {
                    sum = add(sum, pow(n, k));
                    n = sub(n, I);
                }
            }
            // memoize only up to MAXMEM results
            if (Arithmetic.lt(n, MAXMEM))
                sum_nk.mem[key] = sum;
        }
        else
        {
            sum = sum_nk.mem[key];
        }
    }
    return sum;
}
sum_nk.mem = Obj();

function rndInt(m, M)
{
    return stdMath.round((M-m) * Abacus.Math.rnd() + m);
}
function is_approximately_equal(a, b, eps)
{
    if (null == eps) eps = Number.EPSILON;
    return stdMath.abs(a - b) < eps;
}

// options
Abacus.Options = {
    MAXMEM: 10000,
    RANDOM: "index"
};

DefaultArithmetic = Abacus.DefaultArithmetic = { // keep default arithmetic as distinct
     // whether using default arithmetic or using external implementation (eg big-int or other)
     isDefault: function() {
         return true;
     }
    ,isNumber: function(x) {
        var Arithmetic = this;
        if (Arithmetic.isDefault()) return is_number(x);
        return is_number(x) || is_instance(x, Arithmetic.O[CLASS]);
    }

    ,J: -1
    ,O: 0
    ,I: 1
    ,II: 2
    ,INF: {valueOf: function() {return Infinity;}, toString: function() {return "Infinity";}, toTex: function() {return "\\infty";}} // a representation of Infinity
    ,NINF: {valueOf: function() {return -Infinity;}, toString: function() {return "-Infinity";}, toTex: function() {return "-\\infty";}} // a representation of -Infinity

    ,nums: function(a) {
        var Arithmetic = this;
        if (is_array(a) || is_args(a))
        {
            for (var i=0,l=a.length; i<l; ++i) a[i] = Arithmetic.nums(a[i]); // recursive
            return a;
        }
        return Arithmetic.num(a);
    }
    ,num: function(a) {
        return is_number(a) ? stdMath.floor(a) : parseInt(a || 0, 10);
    }
    ,val: function(a) {
        return stdMath.floor(a.valueOf());
    }
    ,digits: function(a, base) {
        var s = a.toString(+(base || 10)); /* default base 10 */
        if ('-' === s.charAt(0)) s = s.slice(1); // dont include the sign in digits
        return s;
    }

    ,neg: function(a) {return -(+a);}
    ,inv: NotImplemented

    ,equ: function(a, b) {return a === b;}
    ,gte: function(a, b) {return a >= b;}
    ,lte: function(a, b) {return a <= b;}
    ,gt: function(a, b) {return a > b;}
    ,lt: function(a, b) {return a < b;}

    ,inside: function(a, m, M, closed) {return closed ? (a >= m) && (a <= M) : (a > m) && (a < M);}
    ,clamp: function(a, m, M) {return a < m ? m : (a > M ? M : a);}
    ,wrap: function(a, m, M) {return a < m ? M : (a > M ? m : a);}
    ,wrapR: function(a, M) {return a < 0 ? a + M : a;}

    ,add: addn
    ,sub: function(a, b) {return a - b;}
    ,mul: muln
    ,div: function(a, b) {return stdMath.floor(a / b);}
    ,divceil: function(a, b) {return stdMath.ceil(a / b);}
    ,mod: function(a, b) {return a % b;}
    ,pow: stdMath.pow

    ,shl: function(a, b) {return a << b;}
    ,shr: function(a, b) {return a >> b;}
    ,bor: function(a, b) {return a | b;}
    ,band: function(a, b) {return a & b;}
    ,xor: function(a, b) {return a ^ b;}

    ,abs: stdMath.abs
    ,min: stdMath.min
    ,max: stdMath.max
    ,rnd: rndInt
};

// pluggable arithmetics, eg biginteger exact Arithmetic
Abacus.Arithmetic = Merge({}, DefaultArithmetic, {
    isDefault: function() {
        return (0 === this.O) && (this.add === addn);
    }
    ,neg: function(a) {
        return Abacus.Arithmetic.mul(Abacus.Arithmetic.J, a);
    }
    ,abs: function(a) {
        return Abacus.Arithmetic.gt(Abacus.Arithmetic.O, a) ? Abacus.Arithmetic.neg(a) : a;
    }
    ,min: function(a, b) {
        return Abacus.Arithmetic.lt(a, b) ? a : b;
    }
    ,max: function(a, b) {
        return Abacus.Arithmetic.gt(a, b) ? a : b;
    }
    ,divceil: function(a, b) {
        if (null == b) return a;
        // https://stackoverflow.com/questions/921180/how-can-i-ensure-that-a-division-of-integers-is-always-rounded-up
        var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            roundedTowardsZeroQuotient, dividedEvenly, wasRoundedDown;

            roundedTowardsZeroQuotient = Arithmetic.div(a, b);
            dividedEvenly = Arithmetic.equ(O, Arithmetic.mod(a, b));
            if (dividedEvenly) return roundedTowardsZeroQuotient;
            wasRoundedDown = (Arithmetic.gt(a, O) === Arithmetic.gt(b, O));
            return wasRoundedDown ? Arithmetic.add(roundedTowardsZeroQuotient, I) : roundedTowardsZeroQuotient;
    }
});

// math / num theory utilities
Abacus.Math = {
     rnd: stdMath.random
    ,rndInt: rndInt

    ,factorial: factorial
    ,binomial: factorial
    ,stirling: stirling
    ,bell: bell
    ,catalan: catalan
    ,fibonacci: fibonacci
    ,polygonal: polygonal
    ,sum_nk: sum_nk

    ,sum: sum
    ,product: product
    ,pow2: pow2
    ,exp: exp

    ,powsq: function(b, e) {
        var Arithmetic = Abacus.Arithmetic;
        e = is_instance(e, Integer) ? e.num : Arithmetic.num(e);
        if (is_instance(b, Integer)) return new b[CLASS](powsq(b.num, e));
        return powsq(Arithmetic.num(b), e);
    }
    ,addm: function(a, b, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if (is_instance(a, Integer)) return new a[CLASS](addm(a.num, b, m));
        return addm(Arithmetic.num(a), b, m);
    }
    ,negm: function(a, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        if (is_instance(a, Integer)) return new a[CLASS](negm(a.num, m));
        return negm(Arithmetic.num(a), m);
    }
    ,mulm: function(a, b, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if (is_instance(a, Integer)) return new a[CLASS](mulm(a.num, b, m));
        return mulm(Arithmetic.num(a), b, m);
    }
    ,invm: function(a, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        if (is_instance(a, Integer)) return new a[CLASS](invm(a.num, m));
        return invm(Arithmetic.num(a), m);
    }
    ,powm: function(a, b, m) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if (is_instance(a, Integer)) return new a[CLASS](powm(a.num, b, m));
        return powm(Arithmetic.num(a), b, m);
    }
    ,isqrt: function(a) {
        var Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Integer)) return new a[CLASS](isqrt(a.num));
        return isqrt(Arithmetic.num(a));
    }
    ,ikthroot: function(a, k) {
        var Arithmetic = Abacus.Arithmetic;
        k = is_instance(k, Integer) ? k.num : Arithmetic.num(k);
        if (is_instance(a, Integer)) return new a[CLASS](ikthroot(a.num, k));
        return ikthroot(Arithmetic.num(a), k);
    }
    ,isqrtp: function(a, p) {
        var Arithmetic = Abacus.Arithmetic;
        p = is_instance(p, Integer) ? p.num : Arithmetic.num(p);
        if (is_instance(a, Integer)) return new a[CLASS](isqrtp(a.num, p));
        return isqrtp(Arithmetic.num(a), p);
    }
    ,ilog: function(x, b) {
        var Arithmetic = Abacus.Arithmetic;
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if (is_instance(x, Integer)) return new x[CLASS](ilog(x.num, b));
        return ilog(Arithmetic.num(x), b);
    }
    ,divisors: function(n, as_generator) {
        var Arithmetic = Abacus.Arithmetic;
        return divisors(is_instance(n, Integer) ? n : Arithmetic.num(n), true === as_generator);
    }
    ,symdivisors: function(x, as_generator) {
        var symdivs = symbolic_divisors(x);
        return true === as_generator ? symdivs : (symdivs.get());
    }
    ,legendre: function(a, p) {
        var Arithmetic = Abacus.Arithmetic;
        p = is_instance(p, Integer) ? p.num : Arithmetic.num(p);
        if (is_instance(a, Integer)) return new a[CLASS](legendre_symbol(a.num, p));
        return legendre_symbol(Arithmetic.num(a), p);
    }
    ,jacobi: function(a, n) {
        var Arithmetic = Abacus.Arithmetic;
        n = is_instance(n, Integer) ? n.num : Arithmetic.num(n);
        if (is_instance(a, Integer)) return new a[CLASS](jacobi_symbol(a.num, n));
        return jacobi_symbol(Arithmetic.num(a), n);
    }
    ,moebius: function(n) {
        var Arithmetic = Abacus.Arithmetic;
        if (is_instance(n, Integer)) return new n[CLASS](moebius(n.num));
        return moebius(Arithmetic.num(n));
    }
    ,pollardRho: function(n, s, a, retries, max_steps, F) {
        var N = Abacus.Arithmetic.num, f;
        if (null != a) a = is_instance(a, Integer) ? a.num : N(a);
        if (null != s) s = is_instance(s, Integer) ? s.num : N(s);
        if (is_instance(n, Integer))
        {
            f = pollard_rho(n.num, s, a, retries, max_steps||null, F||null);
            return null == f ? f : (new n[CLASS](f));
        }
        return pollard_rho(N(n), s, a, retries, max_steps || null, F || null);
    }
    ,factorize: function(n) {
        var Arithmetic = Abacus.Arithmetic;
        return factorize(is_instance(n, Integer) ? n : Arithmetic.num(n));
    }
    ,isProbablePrime: function(n) {
        var Arithmetic = Abacus.Arithmetic;
        return is_probable_prime(is_instance(n, Integer) ? n.num : Arithmetic.num(n));
    }
    ,isPrime: function(n) {
        var Arithmetic = Abacus.Arithmetic;
        return is_prime(is_instance(n, Integer) ? n.num : Arithmetic.num(n));
    }
    ,nextPrime: function(n, dir) {
        var Arithmetic = Abacus.Arithmetic;
        return next_prime(is_instance(n, Integer) ? n.num : Arithmetic.num(n), -1 === dir ? -1 : 1);
    }

    ,gcd: function(/* args */) {
        var Arithmetic = Abacus.Arithmetic,
            args = slice.call(arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments),
            res, INT = null;
        res = gcd(args.map(function(a) {
            if (is_instance(a, Integer))
            {
                if (!INT) INT = a[CLASS];
                return a.num;
            }
            return Arithmetic.num(a);
        }));
        return INT ? new INT(res) : res;
    }
    ,xgcd: function(/* args */) {
        var Arithmetic = Abacus.Arithmetic,
            args = slice.call(arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments),
            res, INT = null;
        res = xgcd(args.map(function(a) {
            if (is_instance(a, Integer))
            {
                if (!INT) INT = a[CLASS];
                return a.num;
            }
            return Arithmetic.num(a);
        }));
        return INT && res ? res.map(function(g) {return new INT(g);}) : res;
    }
    ,lcm: function(/* args */) {
        var Arithmetic = Abacus.Arithmetic,
            args = slice.call(arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments),
            res, INT = null;
        res = lcm(args.map(function(a) {
            if (is_instance(a, Integer))
            {
                if (!INT) INT = a[CLASS];
                return a.num;
            }
            return Arithmetic.num(a);
        }));
        return INT ? new INT(res) : res;
    }

    ,diophantine: function(a, b, with_param, with_free_vars) {
        var Arithmetic = Abacus.Arithmetic;
        if ((!is_array(a) && !is_args(a)) || !a.length) return null;
        return solvedioph(Arithmetic.nums(a), Arithmetic.num(b||0), with_param, true === with_free_vars);
    }
    ,diophantines: function(a, b, with_param, with_free_vars) {
        var ring = Ring.Z();
        if (!is_instance(a, Matrix) && !is_array(a) && !is_args(a)) return null;
        if (is_instance(a, Matrix) && (!a.nr || !a.nc)) return null;
        if (!is_instance(a, Matrix) && !a.length) return null;
        //a = is_instance(a, Matrix) ? a : a;
        if (!is_instance(b, Matrix) && !is_array(b) && !is_args(b))
        {
            b = array(is_instance(a, Matrix) ? a.nr : a.length, function() {return b || 0;});
        }
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        return solvediophs(a, b, with_param, true === with_free_vars);
    }
    ,congruence: function(a, b, m, with_param, with_free_vars) {
        var Arithmetic = Abacus.Arithmetic;
        if ((!is_array(a) && !is_args(a)) || !a.length) return null;
        return solvecongr(Arithmetic.nums(a), Arithmetic.num(b || 0), Arithmetic.num(m || 0), with_param, true === with_free_vars);
    }
    ,congruences: function(a, b, m, with_param, with_free_vars) {
        var ring = Ring.Z();
        if (!is_instance(a, Matrix) && !is_array(a) && !is_args(a)) return null;
        if (is_instance(a, Matrix) && (!a.nr || !a.nc)) return null;
        if (!is_instance(a, Matrix) && !a.length) return null;
        a = is_instance(a, Matrix) ? a : ring.cast(a);
        if (!is_instance(b, Matrix) && !is_array(b) && !is_args(b))
        {
            b = array(is_instance(a, Matrix) ? a.nr : a.length, function() {return b || 0;});
        }
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        if (!is_instance(m, Matrix) && !is_array(m) && !is_args(m))
        {
            m = array(is_instance(a, Matrix) ? a.nr : a.length, function(){return m || 0;});
        }
        m = is_instance(m, Matrix) ? m : ring.cast(m);
        return solvecongrs(a, b, m, with_param, true === with_free_vars);
    }
    ,pythagorean: function(a, with_param) {
        var Arithmetic = Abacus.Arithmetic;
        if ((!is_array(a) && !is_args(a)) || !a.length) return null;
        return solvepythag(Arithmetic.nums(a), with_param)
    }
    ,linears: function(a, b, with_param) {
        var ring = Ring.Q();
        if (!is_instance(a, Matrix) && !is_array(a) && !is_args(a)) return null;
        if (is_instance(a, Matrix) && (!a.nr || !a.nc)) return null;
        if (!is_instance(a, Matrix) && !a.length) return null;
        //a = is_instance(a, Matrix) ? a : a;
        if (!is_instance(b, Matrix) && !is_array(b) && !is_args(b))
        {
            b = array(is_instance(a, Matrix) ? a.nr : a.length, function() {return b || 0;});
        }
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        return solvelinears(a, b, with_param);
    }
    ,polynomials: function(p, x, type) {
        return solvepolys(p, x, type);
    }
    ,lineqs: function(a, b, param) {
        var ring = Ring.Q();
        if (!is_instance(a, Matrix) && !is_array(a) && !is_args(a)) return null;
        if (is_instance(a, Matrix) && (!a.nr || !a.nc)) return null;
        if (!is_instance(a, Matrix) && !a.length) return null;
        //a = is_instance(a, Matrix) ? a : a;
        if (!is_instance(b, Matrix) && !is_array(b) && !is_args(b))
        {
            b = array(is_instance(a, Matrix) ? a.nr : a.length, function() {return b || 0;});
        }
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        return solvelineqs(a, b, param);
    }
    ,groebner: buchberger_groebner

    ,dotp: function(a, b) {
        var Arithmetic = Abacus.Arithmetic;
        return (is_array(a) || is_args(a)) && (is_array(b) || is_args(b)) ? dotp(a, b, Arithmetic) : Arithmetic.O;
    }
    ,orthogonalize: function(v) {
        return (is_array(v) || is_args(v)) && v.length ? gramschmidt(v) : [];
    }
};
