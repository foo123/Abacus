// utility methods
var  PROTO = 'prototype', CLASS = 'constructor'
    ,slice = Array[PROTO].slice
    ,HAS = Object[PROTO].hasOwnProperty
    ,KEYS = Object.keys
    ,def = Object.defineProperty
    ,toString = Object[PROTO].toString
    ,log2 = stdMath.log2 || function(x) {return stdMath.log(x) / stdMath.LN2;}

    ,trim_re = /^\s+|\s+$/g
    ,trim = String[PROTO].trim ? function(s) {return s.trim();} : function(s) {return s.replace(trim_re, '');}
;
function Merge(/* args */)
{
    var args = arguments, l = args.length, a, b, i, p;
    a = (l ? args[0] : {}) || {}; i = 1;
    for (;i<l;++i)
    {
        b = args[i];
        if (null == b) continue;
        for (p in b) if (HAS.call(b, p)) a[p] = b[p];
    }
    return a;
}
function Class(supr, proto)
{
    if (1 === arguments.length) {proto = supr; supr = null;/*Object;*/}
    supr = supr || null;
    var klass = proto[CLASS] || function() {};
    if (!proto[CLASS]) proto[CLASS] = klass;
    if (HAS.call(proto, '__static__')) {klass = Merge(klass, proto.__static__); delete proto.__static__;}
    klass[PROTO] = supr ? Merge(Object.create(supr[PROTO]), proto) : proto;
    return klass;
}
function NOP() {}
function Obj()
{
    return Object.create(null);
}
function NotImplemented()
{
    throw new Error("Method not implemented!");
}
function ID(x)
{
    return x;
}
function is_callable(x)
{
    return "function" === typeof x;
}
function is_instance(x, C)
{
    // x is object of class C
    if (is_array(C))
    {
        for (var i=0,n=C.length; i<n; ++i)
        {
            if (is_callable(C[i]) && (x instanceof C[i]))
                return true;

        }
    }
    else if (is_callable(C))
    {
        return (x instanceof C);
    }
    return false;
}
function is_class(C1, C2)
{
    // C1 is same class as C2, or is a subclass of C2
    if (is_callable(C1))
    {
        if (is_array(C2))
        {
            for (var i=0,n=C2.length; i<n; ++i)
            {
                if (is_callable(C2[i]) && ((C1 === C2[i]) || is_instance(C1[PROTO], C2[i])))
                    return true;

            }
        }
        else if (is_callable(C2))
        {
            return (C1 === C2) || is_instance(C1[PROTO], C2);
        }
    }
    return false;
}
function is_array(x)
{
    return (x instanceof Array) || ('[object Array]' === toString.call(x));
}
function is_args(x)
{
    return ('[object Arguments]' === toString.call(x)) && (null != x.length);
}
function is_obj(x)
{
    return /*(x instanceof Object) ||*/ ('[object Object]' === toString.call(x));
}
function is_string(x)
{
    return (x instanceof String) || ('[object String]' === toString.call(x));
}
function is_number(x)
{
    return "number" === typeof x;
}
function to_fixed_binary_string_32(b)
{
    var bs = b.toString(2), n = 32-bs.length;
    return n > 0 ? new Array(n+1).join('0') + bs : bs;
}
function to_tex(s)
{
    var p = String(s).split('_');
    return p[0] + (p.length > 1 ? ('_{' + p[1] + '}') : '');
}
function Tex(s)
{
    return is_callable(s.toTex) ? s.toTex() : String(s);
}

// https://github.com/foo123/FnList.js
function operate(F, F0, x, i0, i1, ik, strict)
{
    var Fv = F0, i, ii, ikk, di, i0r, i00, i11,
        rem, last = null, x_array = x && (is_array(x) || is_args(x));
    if (x_array)
    {
        if (null == i0) i0 = 0;
        if (null == i1) i1 = x.length-1;
    }
    if (null == ik) ik = i0 > i1 ? -1 : 1;
    if ((0 === ik) || (x_array && !x.length) || (0 >= stdMath.floor((i1-i0)/ik)+1)) return Fv;

    if (0 > ik)
    {
        // remove not reachable range (not multiple of step ik)
        rem = (i0-i1) % (-ik); if (rem) last = i1;
        i1 += rem; i00 = i1; i11 = i0;
        di = -1; ikk = -((-ik) << 4);
    }
    else
    {
        // remove not reachable range (not multiple of step ik)
        rem = (i1-i0) % ik; if (rem) last = i1;
        i1 -= rem; i00 = i0; i11 = i1;
        di = 1; ikk = (ik << 4);
    }
    // unroll the rest range mod 16 + remainder
    i0r = i0+ik*(stdMath.floor((i1-i0)/ik+1)&15);

    if (x_array)
    {
        i00 = stdMath.max(0, i00); i11 = stdMath.min(x.length-1, i11);
        for (i=i0; i00<=i && i<=i11 && 0<di*(i0r-i); i+=ik) Fv = F(Fv, x[i], i);
        for (ii=i0r; i00<=ii && ii<=i11; ii+=ikk)
        {
            i =ii; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
            i+=ik; Fv = F(Fv, x[i], i);
        }
        if ((true === strict) && (null !== last) && (0 <= last && last < x.length)) Fv = F(Fv, x[last], last);
    }
    else
    {
        for (i=i0; i00<=i && i<=i11 && 0<di*(i0r-i); i+=ik) Fv = F(Fv, i, i);
        for (ii=i0r; i00<=ii && ii<=i11; ii+=ikk)
        {
            i =ii; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
            i+=ik; Fv = F(Fv, i, i);
        }
        if ((true === strict) && (null !== last)) Fv = F(Fv, last, last);
    }
    return Fv;
}
function array(n, x0, xs)
{
    var x = is_args(n) ? slice.call(n) : (is_array(n) ? n : ((n=(n|0)) > 0 ? new Array(n) : []));
    n = x.length;
    if ((0 < n) && (null != x0))
    {
        xs = xs||0;
        var xk = x0;
        operate(is_callable(x0) ? function(x ,xi, i) {
            x[i] = x0(i, x); return x;
        } : (x0 === +x0 ? function(x, xi, i) {
            x[i] = xk; xk += xs; return x;
        } : function(x, xi, i) {
            x[i] = x0; return x;
        }), x, x);
    }
    return x;
}
function flatten(array)
{
    return array.reduce(function(flat, item) {
        if (is_array(item)) flat.push.apply(flat, flatten(item));
        else flat.push(item);
        return flat;
    }, []);
}
function pluck(b, a, k)
{
    return operate(function(b, ai, i) {
        b[i] = ai[k]; return b;
    }, b, a);
}
function complementation(b, a, n, a0, a1)
{
    if (null == a) return b;
    return operate(is_array(n) ? function(b, ai, i) {
        b[i] = n[i]-1-ai; return b;
    } : function(b, ai, i) {
        b[i] = n-1-ai; return b;
    }, b, a, a0, a1);
}
function reflection(b, a, n, a0, a1)
{
    if (null == a) return b;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    if (b!==a || a0<a1) for (var t,l=a0,r=a1; l<=r; ++l,--r) {t = a[l]; b[l] = a[r]; b[r] = t;}
    return b;
}
function reversion(n, n0)
{
    if (null == n0) n0 = 0;
    return is_array(n) ? array(n, is_array(n0) ? function(i) {
        return n0[i]-1-n[n.length-1-i];
    } : function(i) {
        return n0-n[i];
    }) : ((n === +n) && (n0 === +n0) ? (n0-n) : Abacus.Arithmetic.sub(Abacus.Arithmetic.num(n0), n));
}
function gray(b, a, n, a0, a1)
{
    // adapted from https://en.wikipedia.org/wiki/Gray_code#n-ary_Gray_code
    if (null == a) return b;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i) {
        b[i] = n[i]>0 ? (ai + s) % n[i] : 0; s += n[i]-b[i]; return b;
    } : function(b, ai, i) {
        b[i] = (ai + s) % n; s += n-b[i]; return b;
    }, b, a, a0, a1);
}
function igray(b, a, n, a0, a1)
{
    if (null == a) return b;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i) {
        b[i] = n[i]>0 ? (ai + s) % n[i] : 0; s += ai; return b;
    } : function(b, ai, i) {
        b[i] = (ai + s) % n; s += ai; return b;
    }, b, a, a0, a1);
}
/*function ngray(b, a, n, a0, a1)
{
    // adapted from https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.119.1344&rep=rep1&type=pdf
    if (null == a) return b;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i) {
        b[i] = s & 1 ? (0 < n[i] ? n[i]-1-ai : 0) : ai; s += b[i]; return b;
    } : function(b, ai, i) {
        b[i] = s & 1 ? n-1-ai : ai; s += b[i]; return b;
    }, b, a, a0, a1);
}
function ingray(b, a, n, a0, a1)
{
    // adapted from https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.119.1344&rep=rep1&type=pdf
    if (null == a) return b;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i) {
        b[i] = s & 1 ? (0 < n[i] ? n[i]-1-ai : 0) : ai; s += ai; return b;
    } : function(b, ai, i) {
        b[i] = s & 1 ? n-1-ai : ai; s += ai; return b;
    }, b, a, a0, a1);
}*/
function grayn(n)
{
    // adapted from https://en.wikipedia.org/wiki/Gray_code
    var Arithmetic = Abacus.Arithmetic;
    n = Arithmetic.num(n);
    return Arithmetic.xor(n, Arithmetic.shr(n, Arithmetic.I));
}
function igrayn(n)
{
    // adapted from https://en.wikipedia.org/wiki/Gray_code
    var Arithmetic = Abacus.Arithmetic, inv = Arithmetic.O;
    n = Arithmetic.num(n);
    // Taking xor until n becomes zero
    while (Arithmetic.gt(n, Arithmetic.O))
    {
        inv = Arithmetic.xor(inv, n);
        n = Arithmetic.shr(n, Arithmetic.I);
    }
    return inv;
}
function shift(b, a, k, a0, a1)
{
    if (null == a) return b;
    if (null == a1) a1 = a.length-1;
    if (null == a0) a0 = 0;
    return b!==a || 0!==k ? operate(function(b, ai, i) {
        b[i+k] = ai; return b;
    }, b, a, 0 > k ? a0 : a1, 0 > k ? a1 : a0, 0 > k ? 1 : -1) : b;
}
function fdiff/*finite_difference*/(b, a, c1, c0, a0, a1, b0, b1)
{
    if (null == a) return null;
    if (null == c1) c1 = 1;
    if (null == c0) c0 = 0;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    if (null == b0) b0 = a0;
    if (null == b1) b1 = a1;
    var d0 = 0, bk = b0 > b1 ? -1 : 1, bi = b0;
    return operate(function(b, ai, i) {
        ai=c0+c1*ai; b[bi] = ai-d0; d0 = ai; bi+=bk; return b;
    }, b, a, a0, a1);
}
function psum/*partial_sum*/(b, a, c1, c0, a0, a1, b0, b1)
{
    if (null == a) return null;
    if (null == c1) c1 = 1;
    if (null == c0) c0 = 0;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    if (null == b0) b0 = a0;
    if (null == b1) b1 = a1;
    var s = 0, bk = b0 > b1 ? -1 : 1, bi = b0;
    return operate(function(b, ai, i) {
        s+=ai; b[bi] = c0+c1*s; bi+=bk; return b;
    }, b, a, a0, a1);
}
function unique(a, a0, a1)
{
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;

    var n = a1-a0+1, dict, key, uniq, ul;
    if (1 >= n) return 1 === n ? [a[a0]] : [];
    dict = Obj(); uniq = new Array(n); ul = 0;
    while (a0 <= a1)
    {
        key = String(a[a0]);
        if (1 !== dict[key]) {uniq[ul++] = a[a0]; dict[key] = 1;}
        a0++;
    }
    // truncate if needed
    if (uniq.length > ul) uniq.length = ul;
    return uniq;
}
function intersection(comm, a, b, dir, a0, a1, b0, b1)
{
    dir = -1 === dir ? -1 : 1;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    if (null == b0) b0 = 0;
    if (null == b1) b1 = b.length-1;

    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ai = a0, bi = b0, il = 0;
    if (null == comm) comm = new Array(stdMath.min(al,bl));
    if (0 === comm.length) return comm;

    // O(min(al,bl))
    // assume lists are already sorted ascending/descending (indepentantly)
    while ((0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)))
    {
        if      ((1 === dir && a[ai] < b[bi]) || (-1 === dir && a[ai] > b[bi]))
        {
            ai += ak;
        }
        else if ((1 === dir && a[ai] > b[bi]) || (-1 === dir && a[ai] < b[bi]))
        {
            bi += bk;
        }
        else // they're equal
        {
            comm[il++] = a[ai];
            ai += ak; bi += bk;
        }
    }
    // truncate if needed
    if (il < comm.length) comm.length = il;
    return comm;
}
function difference/*complement*/(diff, a, b, dir, a0, a1, b0, b1, duplicates)
{
    duplicates = true === duplicates;
    dir = -1 === dir ? -1 : 1;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a === +a ? a-1 : a.length-1;
    if (null == b0) b0 = 0;
    if (null == b1) b1 = b ? b.length-1 : -1;

    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ai = a0, bi = b0, dl = 0;
    if (!b || !b.length) return a === +a ? array(a, a0, ak) : (a ? a.slice() : a);
    if (null == diff) diff = new Array(duplicates ? 2*al : al);

    // O(al)
    // assume lists are already sorted ascending/descending (independantly)
    if (a === +a)
    {
        while ((0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)))
        {
            if      (ai === b[bi])
            {
                if (duplicates) diff[dl++] = ai;
                ai += ak; bi += bk;
            }
            else if ((1 === dir && ai > b[bi]) || (-1 === dir && ai < b[bi]))
            {
                bi += bk;
            }
            else//if ((1 === dir && ai < b[bi]) || (-1 === dir && ai > b[bi]))
            {
                diff[dl++] = ai; ai += ak;
            }
        }
        while (0 <= ak*(a1-ai)) {diff[dl++] = ai; ai += ak;}
    }
    else
    {
        while ((0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)))
        {
            if      (a[ai] === b[bi])
            {
                if (duplicates) diff[dl++] = a[ai];
                ai += ak; bi += bk;
            }
            else if ((1 === dir && a[ai] > b[bi]) || (-1 === dir && a[ai] < b[bi]))
            {
                bi += bk;
            }
            else//if ((1 === dir && a[ai] < b[bi]) || (-1 === dir && a[ai] > b[bi]))
            {
                diff[dl++] = a[ai]; ai += ak;
            }
        }
        while (0 <= ak*(a1-ai)) {diff[dl++] = a[ai]; ai += ak;}
    }
    // truncate if needed
    if (dl < diff.length) diff.length = dl;
    return diff;
}
function multi_difference(diff, mult, a, b, a0, a1, b0, b1)
{
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    if (null == b0) b0 = 0;
    if (null == b1) b1 = b ? b.length-1 : -1;

    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ai = a0, bi = b0, dl = 0;
    if (!b || !b.length) return a ? a.slice() : a;
    if (null == diff) diff = new Array(al);

    // O(al)
    // assume lists are already sorted ascending/descending (independantly)
    while ((0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)))
    {
        if      (a[ai] === b[bi])
        {
            if (1 < mult[a[ai]])
            {
                --mult[a[ai]];
            }
            else
            {
                ai += ak;
                bi += bk;
            }
        }
        else if (a[ai] > b[bi])
        {
            bi += bk;
        }
        else//if (a[ai] < b[bi])
        {
            diff[dl++] = a[ai];
            --mult[a[ai]];
            ai += ak;
        }
    }
    while (0 <= ak*(a1-ai))
    {
        if (0 < mult[a[ai]]) diff[dl++] = a[ai];
        --mult[a[ai]]; ai += ak;
    }
    // truncate if needed
    if (dl < diff.length) diff.length = dl;
    return diff;
}
function merge/*union*/(union, a, b, dir, a0, a1, b0, b1, indices, unique, inplace)
{
    dir = -1 === dir ? -1 : 1;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    if (null == b0) b0 = 0;
    if (null == b1) b1 = b.length-1;
    if (true === indices)
    {
        unique = false;
    }
    else
    {
        indices = false;
        unique = false !== unique;
    }
    inplace = true === inplace;

    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ul = al+bl,
        ai = a0, bi = b0, ui = 0, last = null, with_duplicates = !unique;
    if (null == union) union = new Array(ul);
    if (0 === union.length) return inplace ? a : union;

    // O(al+bl)
    // assume lists are already sorted ascending/descending (independantly), even with duplicate values
    while ((0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)))
    {
        if      (unique && ui) // handle any possible duplicates inside SAME list
        {
            if (a[ai] === last)
            {
                ai+=ak;
                continue;
            }
            else if (b[bi] === last)
            {
                bi+=bk;
                continue;
            }
        }
        if (indices)
        {
            if      ((1 === dir && a[ai][0] < b[bi][0]) || (-1 === dir && a[ai][0] > b[bi][0]))
            {
                union[ui++] = last=a[ai];
                ai+=ak;
            }
            else if ((1 === dir && a[ai][0] > b[bi][0]) || (-1 === dir && a[ai][0] < b[bi][0]))
            {
                union[ui++] = last=b[bi];
                bi+=bk;
            }
            else // they're equal, push one unique
            {
                // make it stable
                if ((1 === dir && a[ai][1] < b[bi][1]) || (-1 === dir && a[ai][1] > b[bi][1]))
                {
                    union[ui++] = last=a[ai];
                    if (with_duplicates) union[ui++] = b[bi];
                }
                else
                {
                    union[ui++] = last=b[bi];
                    if (with_duplicates) union[ui++] = a[ai];
                }
                ai += ak; bi += bk;
            }
        }
        else
        {
            if      ((1 === dir && a[ai] < b[bi]) || (-1 === dir && a[ai] > b[bi]))
            {
                union[ui++] = last=a[ai];
                ai += ak;
            }
            else if ((1 === dir && a[ai] > b[bi]) || (-1 === dir && a[ai] < b[bi]))
            {
                union[ui++] = last=b[bi];
                bi += bk;
            }
            else // they're equal, push one unique
            {
                union[ui++] = last=a[ai];
                if (with_duplicates) union[ui++] = b[bi];
                ai += ak; bi += bk;
            }
        }
    }
    while (0 <= ak*(a1-ai))
    {
        if (with_duplicates || (a[ai]!==last))
        {
            union[ui++] = last=a[ai];
            ai += ak;
        }
    }
    while (0 <= bk*(b1-bi))
    {
        if (with_duplicates || (b[bi]!==last))
        {
            union[ui++] = last=b[bi];
            bi += bk;
        }
    }
    if (inplace)
    {
        // move the merged back to the a array
        for (ai=0>ak?a1:a0,ui=0; ui<ul; ++ui,++ai) a[ai] = union[ui];
        return a;
    }
    else
    {
        // truncate if needed
        if (ui < union.length) union.length = ui;
        return union;
    }
}
function sortedrun(a, a0, a1, index, indices, dir)
{
    // find already sorted chunks either ascending or descending
    var ap, ai, i, i0, i1, d0, i2, i3, d1;
    index[0] = -1; index[1] = -1; index[2] = 0;
    index[3] = -1; index[4] = -1; index[5] = 0;
    d0 = 0; d1 = 0;
    i0 = a0; i1 = -1;
    for (ap=indices?a[i0][0]:a[i0],i=i0+1; i<=a1; ++i)
    {
        ai = indices ? a[i][0] : a[i];
        if (ap < ai)
        {
            if (-1 === d0) {i1 = i-1; break;}
            else if (0 === d0) d0 = 1;
        }
        else if (ap > ai)
        {
            if (1 === d0) {i1 = i-1; break;}
            else if (0 === d0) d0 = -1;
        }
        ap = ai;
    }
    if (0 === d0) d0 = dir;
    if (-1 === i1)
    {
        i1 = a1; index[0] = i0; index[1] = i1; index[2] = d0;
    }
    else
    {
        i2 = i1+1; i3 = -1;
        for (ap=indices?a[i2][0]:a[i2],i=i2+1; i<=a1; ++i)
        {
            ai = indices ? a[i][0] : a[i];
            if (ap < ai)
            {
                if (-1 === d1) {i3 = i-1; break;}
                else if (0 === d1) d1 = 1;
            }
            else if (ap > ai)
            {
                if (1 === d1) {i3 = i-1; break;}
                else if (0 === d1) d1 = -1;
            }
            ap = ai;
        }
        if (-1 === i3) i3 = a1;
        if (0 === d1) d1 = dir;
        index[0] = i0; index[1] = i1; index[2] = d0;
        index[3] = i2; index[4] = i3; index[5] = d1;
    }
}
function mergesort(a, dir, natural, indices, a0, a1)
{
    // http://en.wikipedia.org/wiki/Merge_sort
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    if (!a.length) return a;
    var ak = a0 > a1 ? -1 : 1, N = ak*(a1-a0)+1;
    indices = true === indices;
    // in-place
    if (1 >= N) return indices ? (1 === N ? [a0] : []) : a;
    dir = -1 === dir ? -1 : 1;
    var logN = N, size = 1, size2 = 2, min = stdMath.min, aux = new Array(N),
        index, i0, i1, i0p, i1p;
    if (indices)
    {
        a = operate(function(b, ai, i) {b[i-a0] = [ai,i]; return b;}, new Array(N), a, a0, a1, 1);
        a0 = 0; a1 = N-1;
    }
    if (true === natural)
    {
        // O(N) average, O(NlgN) worst case
        i0p = a0; i1p = -1;
        index = [-1,-1,0,-1,-1,0];
        do {
            // find already sorted chunks
            // O(n)
            sortedrun(a, a0, a1, index, indices, dir);
            if (-1 === index[3])
            {
                // already sorted, reflect if sorted reversely
                // O(n)
                if (dir !== index[2] && a0 < a1) reflection(a, a, 0/*dummy*/, a0, a1);
                i0 = a0; i1 = a1;
            }
            else
            {
                // merge partialy sorted chunks appropriately into one run
                // O(n)
                index[2] = dir !== index[2] ? 1 : 0; index[5] = dir !== index[5] ? 1 : 0;
                merge(aux, a, a, dir, index[2] ? index[1] : index[0], index[2] ? index[0] : index[1], index[5] ? index[4] : index[3], index[5] ? index[3] : index[4], indices, false, true);
                i0 = index[0]; i1 = index[4];
            }
            // merge with the previous run
            // O(n)
            if (-1 !== i1p) merge(aux, a, a, dir, i0p, i1p, i0, i1, indices, false, true);
            // update starting point for next chunk
            i1p = i1; a0 = i1+1;
        } while (a0 <= a1);
    }
    else
    {
        // O(NlgN)
        while (0 < logN)
        {
            operate(function(_ , j) {
                merge(aux, a, a, dir, a0+ak*j, a0+ak*(j+size-1), a0+ak*(j+size), a0+ak*min(j+size2-1, N-1), indices, false, true);
            }, null, null, 0, N-size-1, size2);
            size <<= 1; size2 <<= 1; logN >>= 1;
        }
    }
    return indices ? pluck(a, a, 1) : a;
}
function is_sorted(a, dir, a0, a1)
{
    var i, ap, ai, n = a.length, N;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = n-1;
    // O(n)
    if (null == dir || 0 === dir)
    {
        // find out if and how it is sorted
        dir = 0;
        for (ap=a[a0],i=a0+1; i<=a1; ++i)
        {
            ai = a[i];
            if (ap < ai)
            {
                if (-1 === dir) return 0;
                else if (0 === dir) dir = 1;
            }
            else if (ap > ai)
            {
                if (1 === dir) return 0;
                else if (0 === dir) dir = -1;
            }
            ap = ai;
        }
        return 0 === dir ? 1 : dir;
    }
    else
    {
        // check that it is sorted by dir
        dir = -1 === dir ? -1 : 1;
        if (a0 >= a1) return dir;
        if (-1 === dir)
        {
            // reverse sorted, descending
            for (ap=a[a0],i=a0+1; i<=a1; ++i)
            {
                ai = a[i];
                if (ap < ai) return 0;
                else ap = ai;
            }
        }
        else
        {
            // sorted, ascending
            for (ap=a[a0],i=a0+1; i<=a1; ++i)
            {
                ai = a[i];
                if (ap > ai) return 0;
                else ap = ai;
            }
        }
        return dir;
    }
}
function shuffle(a, connected, a0, a1)
{
    // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Sattolo.27s_algorithm
    var rndInt = Abacus.Math.rndInt, N, offset = true === connected ? 1 : 0;
    // O(n)
    if (is_array(a0))
    {
        if (1 < (N=a0.length)) operate(function(a) {
            if (offset < N--)
            {
                var perm = rndInt(0, N-offset), swap = a[a0[N]];
                a[a0[N]] = a[a0[perm]]; a[a0[perm]] = swap;
            }
            return a;
        }, a, a0, 0, N-1);
    }
    else
    {
        if (null == a0) a0 = 0;
        if (null == a1) a1 = a.length-1;
        if (1 < (N=a1-a0+1)) operate(function(a) {
            if (offset < N--)
            {
                var perm = rndInt(0, N-offset), swap = a[a0+N];
                a[a0+N] = a[a0+perm]; a[a0+perm] = swap;
            }
            return a;
        }, a, a, 0, N-1);
    }
    return a;
}
function pick(a, k, sorted, repeated, backup, a0, a1)
{
    // http://stackoverflow.com/a/32035986/3591273
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    var rndInt = Abacus.Math.rndInt,
        picked, i, selected, value, n = a1-a0+1;
    k = stdMath.min(k, n);
    sorted = true === sorted;

    picked = new Array(k);
    if (true === repeated)
    {
        n = n-1;
        for (i=0; i<k; ++i) // O(k) times
            picked[i] = a[a0+rndInt(0, n)];
        if (sorted) mergesort(picked);// O(klogk) times, average/worst-case
        return picked;
    }

    // partially shuffle the array, and generate unbiased selection simultaneously
    // this is a variation on fisher-yates-knuth shuffle
    for (i=0; i<k; ++i) // O(k) times
    {
        selected = rndInt(0, --n); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
        value = a[a0+selected];
        a[a0+selected] = a[a0+n];
        a[a0+n] = value;
        picked[i] = value;
        backup && (backup[i] = selected);
    }
    if (backup)
    {
        // restore partially shuffled input array from backup
        for (i=k-1; i>=0; --i) // O(k) times
        {
            selected = backup[i];
            value = a[a0+n];
            a[a0+n] = a[a0+selected];
            a[a0+selected] = value;
            ++n;
        }
    }
    if (sorted) mergesort(picked);// O(klogk) times, average/worst-case
    return picked;
}
function binarysearch(v, a, dir, a0, a1, eq, lt)
{
    // binary search O(logn)
    eq = eq || function(a, b) {return a == b;};
    lt = lt || function(a, b) {return a < b;};
    dir = -1 === dir ? -1 : 1;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    var l = stdMath.max(a0, 0), r = stdMath.min(a1, a.length-1), m, am;

    if (l > r || lt(v, a[l]) || lt(a[r], v)) return -1;
    else if (eq(v, a[l])) return l;
    else if (eq(v, a[r])) return r;

    if (-1 === dir)
    {
        while (l < r)
        {
            m = ((l+r)>>>1); am = a[m];
            if (eq(v, am)) return m;
            else if (lt(am, v)) r = m-1;
            else l = m+1;
        }
    }
    else
    {
        while (l < r)
        {
            m = ((l+r)>>>1); am = a[m];
            if (eq(v, am)) return m;
            else if (lt(v, am)) r = m-1;
            else l = m+1;
        }
    }
    return -1;
}
function bisect(list, item, dir, lo, hi, lt)
{
    // binary search O(logn) for point of insertion (either left or right depending on dir)
    // adapted from python's c source code, module bisect
    // https://github.com/python/cpython/blob/master/Modules/_bisectmodule.c
    lt = lt || function(a, b) {return a < b};
    if (null == lo) lo = 0;
    if (null == hi) hi = list.length;
    dir = -1 === dir ? -1 : 1; // left, else right bisection
    var mid, litem;
    if (0 > lo) return -1;
    if (-1 === dir)
    {
        while (lo < hi)
        {
            mid = ((lo+hi)>>>1); litem = list[mid];
            if (lt(litem, item)) lo = mid+1;
            else hi = mid;
        }
    }
    else
    {
        while (lo < hi)
        {
            mid = ((lo+hi)>>>1); litem = list[mid];
            if (lt(item, litem)) hi = mid;
            else lo = mid+1;
        }
    }
    return lo;
}
function bitreverse(b, nbits)
{
    b = +b;
    var r = b & 1;
    if (null == nbits)
        while (b >>= 1) {r <<= 1; r |= b & 1;}
    else
        while (--nbits) {r <<= 1; b >>= 1; r |= b & 1;}
    return r;
}
function is_mirror_image(x)
{
    var i, j;
    if (is_array(x) || is_args(x))
    {
        if (1 >= x.length) return true;
        for (i=0,j=x.length-1; i<j; ++i,--j)
            if (x[i] !== x[j])
                return false;
    }
    else
    {
        x = String(x);
        if (1 >= x.length) return true;
        for (i=0,j=x.length-1; i<j; ++i,--j)
            if (x.charAt(i) !== x.charAt(j))
                return false;
    }
    return true;
}
function cmp_with_indices(cmp)
{
    return function(a, b) {
        var res = cmp(a[0], b[0]);
        return 0 > res ? -1 : (0 < res ? 1 : (a[1] - b[1]));
    };
}
function with_indices(arr)
{
    var n = arr.length, vi = new Array(n), i;
    for (i=0; i<n; ++i) vi[i] = [arr[i], i];
    return vi;
}
function get_indices(vi, inv)
{
    var n = vi.length, i = new Array(n), j;
    if (inv)
    {
        for (j=0; j<n; ++j) i[vi[j][1]] = j;
    }
    else
    {
        for (j=0; j<n; ++j) i[j] = vi[j][1];
    }
    return i;
}
/*function cmp_from_dist(dist, a0, b0)
{
    return [
    function cmp_aa(a_0, a_1) {
        var res = dist(a_0[0], b0) - dist(a_1[0], b0);
        return 0 > res ? -1 : (0 < res ? 1 : (a_0[1] - a_1[1]));
    },
    function cmp_bb(b_0, b_1) {
        var res = dist(a0, b_0[0]) - dist(a0, b_1[0]);
        return 0 > res ? -1 : (0 < res ? 1 : (b_0[1] - b_1[1]));
    }
    ];
}*/
function cmp(a, b)
{
    return a < b ? -1 : (a > b ? 1 : 0);
}
function dist(a, b)
{
    return stdMath.abs(a - b);
}
function align_sequences(A, B, dist_AB, cmp_AA, cmp_BB)
{
    // https://stackoverflow.com/a/78740257/3591273
    /*
    Examples
    note: "alignment" is like the permutation (and/or warping) of (parts of) `b` that minimizes total given distance with `a`
    a:0,1,2 b:0,1,2 alignment:0,1,2
    a:0,1,2 b:2,1,0 alignment:2,1,0
    a:2,1,0 b:0,1,2 alignment:2,1,0
    a:2,1,0 b:2,1,0 alignment:0,1,2
    a:0,1,2 b:0,1 alignment:0,1,1
    a:0,1,2 b:1,0 alignment:1,0,0
    a:2,1,0 b:0,1 alignment:1,1,0
    a:2,1,0 b:1,0 alignment:0,0,1
    a:2,1,0,3,4 b:1,0,2 alignment:2,0,1,2,2
    a:2,3,1,4,0 b:1,3,2 alignment:2,1,0,1,0
    a:-1,2,3,1,4,0,5 b:1,3,2 alignment:0,2,1,0,1,0,1
    a:3,4,2,1,0 b:1,2 alignment:1,1,1,0,0
    a:2,1,0,3,4 b:0,2 alignment:1,1,0,1,1
    a:0,1,2 b:-2,-1,0,1,2 alignment:2,3,4
    a:0,1,2 b:2,1,0,4,3 alignment:2,1,0
    a:2,1,0 b:-2,-1,0,1,2 alignment:4,3,2
    a:2,1,0 b:2,1,0,4,3 alignment:0,1,2
    a:2,1,0 b:0,2,4,1,3 alignment:1,3,0
    */
    var n = A.length, m = B.length, i, j, k, s, sm, sM, jm, km, perm_A, perm_B, iperm_A, /*iperm_B,*/ alignment;
    if (n && m)
    {
        // O(NlogN), N = max(n,m)
        // assume that cmp_AA, cmp_BB, dist_AB are "compatible" in that:
        // (0 > cmp_AA(A, A') and 0 > cmp_BB(B, B')) ==> (dist_AB(A, B) + dist_AB(A', B')) <= (dist_AB(A', B) + dist_AB(A, B'))
        // in other words, minimum overall distance is when alignment implies similarly sorted sequences
        dist_AB = dist_AB || dist;
        perm_A = get_indices(with_indices(A).sort(cmp_with_indices(cmp_AA || cmp)));
        perm_B = get_indices(with_indices(B).sort(cmp_with_indices(cmp_BB || cmp)));
        alignment = new Array(n);
        if (n > m)
        {
            iperm_A = new Array(n);
            for (i=0; i<n; ++i)
            {
                iperm_A[perm_A[i]] = i;
            }
            sm = Infinity; km = 0;
            for (k=0; k+m<=n; ++k)
            {
                s = 0;
                for (i=0; i<m; ++i) s += dist_AB(A[perm_A[i+k]], B[perm_B[i]]);
                if (s < sm)
                {
                    // best shift for min distance
                    sm = s;
                    km = k;
                }
            }
            for (i=0; i<m; ++i)
            {
                alignment[perm_A[i+km]] = perm_B[i];
            }
            for (i=0; i<n; ++i)
            {
                if (null == alignment[i])
                {
                    // pad/interpolate
                    //j = stdMath.round(stdMath.max(0, iperm_A[i]-km)*(m-1)/(n-1-km));
                    k = iperm_A[i]-km;
                    j = k<=0 ? 0 : (k>=m ? (m-1) : k);
                    s = dist_AB(A[i], B[perm_B[j]]);
                    sm = j-1>=0 ? dist_AB(A[i], B[perm_B[j-1]]) : Infinity;
                    sM = j+1<m ? dist_AB(A[i], B[perm_B[j+1]]) : Infinity;
                    jm = j;
                    if (sm < s)
                    {
                        s = sm;
                        jm = j-1;
                    }
                    if (sM < s)
                    {
                        s = sM;
                        jm = j+1;
                    }
                    alignment[i] = perm_B[jm];
                }
            }
        }
        else if (n < m)
        {
            sm = Infinity; km = 0;
            for (k=0; k+n<=m; ++k)
            {
                s = 0;
                for (i=0; i<n; ++i) s += dist_AB(A[perm_A[i]], B[perm_B[i+k]]);
                if (s < sm)
                {
                    // best shift for min distance
                    sm = s;
                    km = k;
                }
            }
            /*iperm_A = new Array(n);
            for (i=0; i<n; ++i) iperm_A[perm_A[i]] = i;
            iperm_B = new Array(m);
            for (i=0; i<m; ++i) iperm_B[perm_B[i]] = i;*/
            for (i=0; i<n; ++i)
            {
                alignment[perm_A[i]] = /*i*/perm_B[/*iperm_A[*/i/*]*/+km];
            }
        }
        else// if (n === m)
        {
            /*for (i=0; i<m; ++i)
            {
                alignment[perm_A[perm_B[i]]] = i;
            }*/
            for (i=0; i<n; ++i)
            {
                alignment[perm_A[i]] = perm_B[i];
            }
        }
        return alignment;
    }
    return [];
}
align_sequences.cmp = cmp;
align_sequences.dist = dist;
function merge_sequences(A, B, combAB, compAB)
{
    // combine A and B assumed to be in sorted order
    if (!is_callable(compAB)) compAB = merge_sequences.cmp;
    if (!is_callable(combAB)) combAB = null;

    var i = 0, j = 0, k = 0,
        nA = A.length, nB = B.length,
        C = new Array(nA+nB), order, output;

    while ((i < nA) && (j < nB))
    {
        order = compAB(A[i], B[j]);
        if (0 > order)
        {
            // A[i] before B[j]
            output = combAB ? combAB(A[i], null) : A[i];
            if (null != output) C[k++] = output;
            ++i;
        }
        else if (0 < order)
        {
            // B[j] before A[i]
            output = combAB ? combAB(null, B[j]) : B[j];
            if (null != output) C[k++] = output;
            ++j;
        }
        else
        {
            // equal, combine
            output = combAB ? combAB(A[i], B[j]) : A[i];
            if (null != output) C[k++] = output;
            ++i; ++j;
        }
    }
    while (i < nA)
    {
        output = combAB ? combAB(A[i], null) : A[i];
        if (null != output) C[k++] = output;
        ++i;
    }
    while (j < nB)
    {
        output = combAB ? combAB(null, B[j]) : B[j];
        if (null != output) C[k++] = output;
        ++j;
    }
    if (C.length > k) C.length = k; // truncate if needed
    return C;
}
merge_sequences.cmp = cmp;
function sorter(Arithmetic)
{
    return true === Arithmetic ? function(a, b) {return a.equ(b) ? 0 : (a.lt(b) ? -1 : 1);} : (Arithmetic ? function(a, b) {return Arithmetic.equ(a, b) ? 0 : (Arithmetic.lt(a, b) ? -1 : 1);} : function(a, b) {return a === b ? 0 : (a < b ? -1 : 1);});
}
function pad(x, n, s)
{
    var l = x.length;
    s = s || ' ';
    return l < n ? ((new Array(n-l+1)).join(s) + x) : x;
}
// combinatorial utilities, available as static methods of respective objects
function kronecker(/* var args here */)
{
    var args = arguments, nv = args.length, k, a, r, l, i, j,
        vv, tensor, tl, kl, product;

    if (!nv) return [];

    if (true === args[0])
    {
        // flat tensor product
        for (kl=args[1].length,k=2; k<nv; ++k) kl *= args[k].length;
        product = new Array(kl);
        for (k=0; k<kl; ++k)
        {
            tensor = 0;
            for (j=1,r=k,a=1; a<nv; ++a)
            {
                l = args[a].length;
                i = r % l;
                r = ~~(r / l);
                vv = args[a][i];
                tensor += j*vv;
                j *= l;
            }
            product[k] = tensor;
        }
    }
    else
    {
        // component tensor product
        for (kl=args[0].length,k=1; k<nv; ++k) kl *= args[k].length;
        product = new Array(kl);
        for (k=0; k<kl; ++k)
        {
            tensor = new Array(nv); tl = 0;
            for (r=k,a=nv-1; a>=0; --a)
            {
                l = args[a].length;
                i = r % l;
                r = ~~(r / l);
                vv = args[a][i];
                if (is_array(vv) || is_args(vv))
                {
                    // kronecker can be re-used to create higher-order products
                    // i.e kronecker(alpha, beta, gamma) and kronecker(kronecker(alpha, beta), gamma)
                    // should produce exactly same results
                    for (j=vv.length-1; j>=0; --j) tensor[nv-(++tl)] = vv[j];
                }
                else
                {
                    tensor[nv-(++tl)] = vv;
                }
            }
            product[k] = tensor;
        }
    }
    return product;
}
function cartesian(/* var args here */)
{
    // direct sum product, since the final dimensions = sum of component dimensions it is like cartesian product
    // whereas tensor product has final dimensions = product of component dimensions
    var v = arguments, nv = v.length, n=0, k, j;
    for (j=0; j<nv; ++j) n += v[j].length;
    k = 0; j = 0;
    return array(n, function(i) {
        if (i >= k+v[j].length) k += v[j++].length;
        return k + v[j][i-k];
    });
}
function summation(a, b, Arithmetic, do_subtraction)
{
    // O(max(n1,n2))
    var i, j, n1 = a.length, n2 = b.length, c;
    if (true === Arithmetic)
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i) {
            return i >= n1 ? b[i].neg() : (i >= n2 ? a[i] : a[i].sub(b[i]));
        } : function(i) {
            return i >= n1 ? b[i] : (i >= n2 ? a[i] : a[i].add(b[i]));
        });
    }
    else if (Arithmetic)
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i) {
            return i >= n1 ? Arithmetic.neg(b[i]) : (i >= n2 ? a[i] : Arithmetic.sub(a[i], b[i]));
        } : function(i) {
            return i >= n1 ? b[i] : (i >= n2 ? a[i] : Arithmetic.add(a[i], b[i]));
        });
    }
    else
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i) {
            return i >= n1 ? -b[i] : (i >= n2 ? a[i] : a[i] - b[i]);
        } : function(i) {
            return i >= n1 ? b[i] : (i >= n2 ? a[i] : a[i] + b[i]);
        });
    }
    return c;
}
function convolution(a, b, Arithmetic)
{
    // O(n1*n2), can be done a bit faster
    // 1. by using FFT multiplication, not implemented here
    // 2. by Divide&Conquer and using eg. Strassen multiplication, not implemented here
    var i, j, n1 = a.length, n2 = b.length, c;
    if (true === Arithmetic)
    {
        c = array(n1+n2-1, function() {return 0;});
        for (i=0; i<n1; ++i)
            for (j=0; j<n2; ++j)
                c[i+j] = 0 === c[i+j] ? a[i].mul(b[j]) : c[i+j].add(a[i].mul(b[j]));
    }
    else if (Arithmetic)
    {
        c = array(n1+n2-1, function() {return Arithmetic.O;});
        for (i=0; i<n1; ++i)
            for (j=0; j<n2; ++j)
                c[i+j] = Arithmetic.add(c[i+j], Arithmetic.mul(a[i], b[j]));
    }
    else
    {
        c = array(n1+n2-1, function() {return 0;});
        for (i=0; i<n1; ++i)
            for (j=0; j<n2; ++j)
                c[i+j] += a[i] * b[j];
    }
    return c;
}
function complement(n, item, sort/*, dupl*/)
{
    if ((null == item) || (!item.length) || (1 >= item.length))
        return 1 === item.length ? array(n-1, function(i) {return i < item[0] ? i : i+1;}) : array(n, 0, 1);
    if (true === sort)
    {
        var d = is_sorted(item);
        if (-1 === d) item = reflection(new Array(item.length), item);
        else if (0 === d) item = mergesort(item.slice(), 1, true);
    }
    return difference(null, n, item/*, 1, null, null, null, null, dupl*/);
}
function permute(a, p, copy)
{
    var n = a.length, m = p.length;
    if (true === copy)
    {
        // O(n) time, O(n) space
        return operate((
            n < m
            ? function(ap, i) {ap[i] = p[i] < n ? a[p[i]] : a[i]; return ap;}
            : (n > m
            ? function(ap, i) {ap[i] = i < m ? a[p[i]] : a[i]; return ap;}
            : function(ap, i) {ap[i] = a[p[i]]; return ap;}
       )), new Array(n), null, 0, n-1, 1);
    }
    else
    {
        // O(n) time, O(n) space
        for (var aa=a.slice(),i=0; i<n; ++i) a[i] = aa[p[i]];
        return a;
    }
}
function find(a, b, nested)
{
    if (nested)
    {
        if (!a || !a.length) return -1;
        var index, found, i, j, k, n = a.length, m = b.length;
        for (i=0; i<n; ++i)
        {
            k = a[i];
            found = true;
            for (j=0; j<m; ++j)
            {
                if (b[j] !== k[j])
                {
                    found = false;
                    break;
                }
            }
            if (found) return i;
        }
        return -1;
    }
    else
    {
        return a && a.length ? a.indexOf(b) : -1;
    }
}
function remove_duplicates(a, KEY)
{
    KEY = is_callable(KEY) ? KEY : String;
    var hash = Obj(), dupl = [], k, i, l;
    for (i=0,l=a.length; i<l; ++i)
    {
        k = KEY(a[i]);
        if (HAS.call(hash, k)) dupl.push(i);
        else hash[k] = i;
    }
    while (dupl.length) a.splice(dupl.pop(), 1);
    return a;
}
function trailing_zeroes(n, bits, with_remaining)
{
    var Arithmetic = Abacus.Arithmetic, z = 0, i;
    bits = bits || Arithmetic.digits(n, 2);
    i = bits.length-1;
    while (0 <= i && '0' === bits.charAt(i)) {--i; ++z;}
    return with_remaining ? [z, 0 > i ? '0' : bits.slice(0, i+1)] : z;
}
var dec_pattern = /^(-)?(\d+)(\.(\d+)?(\[\d+\])?)?(e-?\d+)?$/;
function dec2frac(dec, simplify)
{
    // compute fraction (num/denom) for given decimal number (can include repeating decimals through special notation)
    // eg -123.23[456] , last 456 digits are repeating infinitely
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        i, n, d, m, g, k, e, ten, fraction, N = Arithmetic.num,
        is_neg = false, is_zero, non_repeating = null, repeating = null;

    dec = trim(String(dec)); // convert to string if not already
    m = dec.match(dec_pattern);
    if (!m) return null; // not valid decimal

    if (m[1]) is_neg = true; // negative number, keep track

    i = N(m[2]); // integer part

    fraction = [O, I];
    ten = N(10);

    if (!m[3] || (!m[4] && !m[5]))
    {
        fraction[0] = is_neg ? Arithmetic.neg(i) : i;
        if (m[6])
        {
            e = N(m[6].slice(1));
            if (Arithmetic.lt(e, O)) fraction[1] = Arithmetic.pow(ten, Arithmetic.neg(e));
            else fraction[0] = Arithmetic.mul(fraction[0], Arithmetic.pow(ten, e));
        }
        return fraction; // just integer, no decimal part
    }

    if (m[4])
    {
        non_repeating = m[4];
    }
    if (m[5])
    {
        repeating = m[5].slice(1,-1); // remove surrounding brackets
        is_zero = true;
        for (k=repeating.length-1; k>=0; --k)
        {
            if (repeating.charAt(k) !== '0')
            {
                is_zero = false;
                break;
            }
        }
        if (is_zero) repeating = null; // repeating zeroes are trivial
    }

    if (!repeating)
    {
        // no repeating decimals
        // remove unnecessary trailing zeroes
        while (non_repeating && (non_repeating.slice(-1) === '0')) non_repeating = non_repeating.slice(0, -1);
        if (!non_repeating || !non_repeating.length)
        {
            d = I;
            n = i; // only integer part
        }
        else
        {
            d = Arithmetic.pow(ten, non_repeating.length);
            n = Arithmetic.add(Arithmetic.mul(d, i), N(non_repeating));
        }
        if (m[6])
        {
            e = N(m[6].slice(1));
            if (Arithmetic.lt(e, O)) d = Arithmetic.mul(d, Arithmetic.pow(ten, Arithmetic.neg(e)));
            else n = Arithmetic.mul(n, Arithmetic.pow(ten, e));
        }
    }
    else
    {
        // with repeating decimals
        if (non_repeating)
        {
            // remove common repeating digits from non_repeating digits, in case they are included
            while ((non_repeating.length >= repeating.length) && (non_repeating.slice(-repeating.length) === repeating))
                non_repeating = non_repeating.slice(0, -repeating.length);
            if (!non_repeating.length) non_repeating = null;
        }
        d = Arithmetic.sub(Arithmetic.pow(ten, (non_repeating ? non_repeating.length : 0)+repeating.length), non_repeating ? Arithmetic.pow(ten, non_repeating.length) : I);
        n = Arithmetic.add(Arithmetic.mul(d, i), Arithmetic.sub(N((non_repeating ? non_repeating : '')+repeating), non_repeating ? N(non_repeating) : O));
    }

    if (false !== simplify)
    {
        // remove common factors, simplify
        g = gcd(n, d);
        n = Arithmetic.div(n, g);
        d = Arithmetic.div(d, g);
    }
    fraction[0] = is_neg ? Arithmetic.neg(n) : n;
    fraction[1] = d;
    return fraction;
}
function default_eq(a, b)
{
    // default equality between a and b
    return a === b;
}
function floyd_cycle_detection(f, x0, eq)
{
    // https://en.wikipedia.org/wiki/Cycle_detection#Floyd's_Tortoise_and_Hare
    // floyd tortoise-hare algorithm for cycle detection
    var tortoise, hare, mu, lam;
    eq = eq || default_eq;
    tortoise = f(x0); hare = f(tortoise);
    while (!eq(tortoise, hare))
    {
        tortoise = f(tortoise);
        hare = f(f(hare));
    }
    mu = 0;
    tortoise = x0;
    while (!eq(tortoise, hare))
    {
        tortoise = f(tortoise);
        hare = f(hare);
        ++mu;
    }
    lam = 1;
    hare = f(tortoise);
    while (!eq(tortoise, hare))
    {
        hare = f(hare);
        ++lam;
    }
    return [lam/*period*/, mu/*first_repeat*/];
}
function frac2dec(n, d)
{
    // fraction to decimal, with optional repeating digits
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        q, r, t, decimal, period, i, c, ten,
        dot, whole, repeating, non_repeating, is_neg = false, is_zero;

    if (Arithmetic.equ(O, d)) return null; // not valid fraction

    is_neg = (Arithmetic.lt(O, n) && Arithmetic.gt(O, d)) || (Arithmetic.lt(O, d) && Arithmetic.gt(O, n)); // keep track if negative number

    n = Arithmetic.abs(n); d = Arithmetic.abs(d);
    q = Arithmetic.div(n, d); r = Arithmetic.mod(n, d);

    whole = (is_neg ? '-' : '') + String(q); decimal = [];

    ten = Arithmetic.num(10);
    period = floyd_cycle_detection(
        function(r) {
            return Arithmetic.mod(Arithmetic.mul(ten, r), d);
        },
        r,
        function(a, b) {
            return Arithmetic.equ(a, b);
        }
   );

    for (i=0,c=period[0]+period[1]; i<c; ++i)
    {
        // long division up to repeating digits
        t = Arithmetic.mul(ten, r);
        q = Arithmetic.div(t, d);
        r = Arithmetic.mod(t, d);
        decimal.push(String(q));
    }

    repeating = decimal.slice(period[1]).join('');
    if (repeating.length)
    {
        is_zero = true;
        for (i=repeating.length-1; i>=0; --i)
        {
            if ('0' !== repeating.charAt(i))
            {
                is_zero = false;
                break;
            }
        }
        if (is_zero) repeating = ''; // repeating zeroes are trivial
        else repeating = '['+repeating+']';
    }

    non_repeating = decimal.slice(0, period[1]).join('');
    if (non_repeating.length)
    {
        is_zero = true;
        for (i=non_repeating.length-1; i>=0; --i)
        {
            if ('0' !== non_repeating.charAt(i))
            {
                is_zero = false;
                break;
            }
        }
        if (is_zero && !repeating.length) non_repeating = ''; // zeroes are trivial
    }

    dot = non_repeating.length || repeating.length ? '.' : '';
    return whole + dot + non_repeating + repeating;
}

Abacus.Class = Class;

// array/list utilities
Abacus.Util = {
     array: array
    ,operate: operate
    ,flatten: flatten
    ,unique: unique
    ,intersection: intersection
    ,difference: difference
    ,multi_difference: multi_difference
    ,union: merge
    ,bsearch: binarysearch
    ,bisect: bisect
    ,complementation: complementation
    ,reflection: reflection
    ,reversion: reversion
    ,align: align_sequences
    ,merge: merge_sequences
    ,gray: gray
    ,igray: igray
    ,grayn: grayn
    ,igrayn: igrayn
    ,finitedifference: fdiff
    ,partialsum: psum
    ,convolution: convolution
    ,summation: summation
    ,wheel: wheel
    ,sort: mergesort
    ,shuffle: shuffle
    ,pick: pick
    ,pluck: pluck
    ,is_mirror_image: is_mirror_image
    ,cycle_detection: floyd_cycle_detection
};
