// utility methods
function NotImplemented() { throw new Error("Method not implemented!"); }
function ID(x) { return x; }
function is_array(x) { return (x instanceof Array) || ('[object Array]' === toString.call(x)); }
function is_args(x) { return ('[object Arguments]' === toString.call(x)) && (null != x.length); }
function is_obj(x) { return /*(x instanceof Object) ||*/ ('[object Object]' === toString.call(x)); }
function is_string(x) { return (x instanceof String) || ('[object String]' === toString.call(x)); }
function is_number(x) { return "number"===typeof x; }
function is_callable(x) { return "function"===typeof x; }
function is_class(C1, C2)
{
    // C1 is same class as C2, or is a subclass of C2
    if (is_callable(C1))
    {
        if (is_array(C2))
        {
            for (var i=0,n=C2.length; i<n; i++)
            {
                if (is_callable(C2[i]) && ((C1===C2[i]) || (C1[PROTO] instanceof C2[i])))
                    return true;

            }
        }
        else if (is_callable(C2))
        {
            return (C1===C2) || (C1[PROTO] instanceof C2);
        }
    }
    return false;
}
function is_instance(x, C)
{
    // x is object of class C
    if (is_array(C))
    {
        for (var i=0,n=C.length; i<n; i++)
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
function to_fixed_binary_string_32(b)
{
    var bs = b.toString(2), n = 32-bs.length;
    return n > 0 ? new Array(n+1).join('0') + bs : bs;
}
function to_tex(s)
{
    var p = String(s).split('_');
    return p[0] + (p.length > 1 ? ('_{'+p[1]+'}') : '');
}
function Tex(s) { return is_callable(s.toTex) ? s.toTex() : String(s); }

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
        rem = (i0-i1)%(-ik); if (rem) last = i1;
        i1 += rem; i00 = i1; i11 = i0;
        di = -1; ikk = -((-ik) << 4);
    }
    else
    {
        // remove not reachable range (not multiple of step ik)
        rem = (i1-i0)%ik; if (rem) last = i1;
        i1 -= rem; i00 = i0; i11 = i1;
        di = 1; ikk = (ik << 4);
    }
    // unroll the rest range mod 16 + remainder
    i0r = i0+ik*(stdMath.floor((i1-i0)/ik+1)&15);

    if (x_array)
    {
        i00 = stdMath.max(0,i00); i11 = stdMath.min(x.length-1,i11);
        for (i=i0; i00<=i && i<=i11 && 0<di*(i0r-i); i+=ik) Fv = F(Fv,x[i],i);
        for (ii=i0r; i00<=ii && ii<=i11; ii+=ikk)
        {
            i =ii; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
        }
        if ((true===strict) && (null!==last) && (0<=last && last<x.length)) Fv = F(Fv,x[last],last);
    }
    else
    {
        for (i=i0; i00<=i && i<=i11 && 0<di*(i0r-i); i+=ik) Fv = F(Fv,i,i);
        for (ii=i0r; i00<=ii && ii<=i11; ii+=ikk)
        {
            i =ii; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
        }
        if ((true===strict) && (null!==last)) Fv = F(Fv,last,last);
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
        operate(is_callable(x0) ? function(x,xi,i){
            x[i] = x0(i); return x;
        } : (x0 === +x0 ? function(x,xi,i){
            x[i] = xk; xk += xs; return x;
        } : function(x,xi,i){
            x[i] = x0; return x;
        }), x, x);
    }
    return x;
}
function pluck(b, a, k)
{
    return operate(function(b, ai, i){
        b[i] = ai[k]; return b;
    }, b, a);
}
function complementation(b, a, n, a0, a1)
{
    if (null == a) return b;
    return operate(is_array(n) ? function(b, ai, i){
        b[i] = n[i]-1-ai; return b;
    } : function(b, ai, i){
        b[i] = n-1-ai; return b;
    }, b, a, a0, a1);
}
function reflection(b, a, n, a0, a1)
{
    if (null == a) return b;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    if (b!==a || a0<a1) for (var t,l=a0,r=a1; l<=r; l++,r--) { t = a[l]; b[l] = a[r]; b[r] = t; }
    return b;
}
function reversion(n, n0)
{
    if (null == n0) n0 = 0;
    return is_array(n) ? array(n, is_array(n0) ? function(i){
        return n0[i]-1-n[n.length-1-i];
    } : function(i){
        return n0-n[i];
    }) : ((n===+n)&&(n0===+n0) ? (n0-n) : Abacus.Arithmetic.sub(Abacus.Arithmetic.num(n0),n));
}
function gray(b, a, n, a0, a1)
{
    // adapted from https://en.wikipedia.org/wiki/Gray_code#n-ary_Gray_code
    if (null == a) return b;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i){
        b[i] = n[i]>0 ? (ai + s) % n[i] : 0; s += n[i]-b[i]; return b;
    } : function(b, ai, i){
        b[i] = (ai + s) % n; s += n-b[i]; return b;
    }, b, a, a0, a1);
}
function igray(b, a, n, a0, a1)
{
    if (null == a) return b;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i){
        b[i] = n[i]>0 ? (ai + s) % n[i] : 0; s += ai; return b;
    } : function(b, ai, i){
        b[i] = (ai + s) % n; s += ai; return b;
    }, b, a, a0, a1);
}
/*function ngray(b, a, n, a0, a1)
{
    // adapted from https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.119.1344&rep=rep1&type=pdf
    if (null == a) return b;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i){
        b[i] = s & 1 ? (0 < n[i] ? n[i]-1-ai : 0) : ai; s += b[i]; return b;
    } : function(b, ai, i){
        b[i] = s & 1 ? n-1-ai : ai; s += b[i]; return b;
    }, b, a, a0, a1);
}
function ingray(b, a, n, a0, a1)
{
    // adapted from https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.119.1344&rep=rep1&type=pdf
    if (null == a) return b;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i){
        b[i] = s & 1 ? (0 < n[i] ? n[i]-1-ai : 0) : ai; s += ai; return b;
    } : function(b, ai, i){
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
    return b!==a || 0!==k ? operate(function(b,ai,i){
        b[i+k] = ai; return b;
    }, b, a, 0>k?a0:a1, 0>k?a1:a0, 0>k?1:-1) : b;
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
    return operate(function(b, ai, i){
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
    return operate(function(b, ai, i){
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
        if (!dict[key]) { uniq[ul++] = a[a0]; dict[key] = 1; }
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
        if      ((1===dir && a[ai]<b[bi]) || (-1===dir && a[ai]>b[bi]))
        {
            ai+=ak;
        }
        else if ((1===dir && a[ai]>b[bi]) || (-1===dir && a[ai]<b[bi]))
        {
            bi+=bk;
        }
        else // they're equal
        {
            comm[il++] = a[ ai ];
            ai+=ak; bi+=bk;
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
    if (null == diff) diff = new Array(duplicates?2*al:al);

    // O(al)
    // assume lists are already sorted ascending/descending (independantly)
    if (a === +a)
    {
        while ((0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)))
        {
            if      (ai === b[bi])
            {
                if (duplicates) diff[dl++] = ai;
                ai+=ak; bi+=bk;
            }
            else if ((1===dir && ai>b[bi]) || (-1===dir && ai<b[bi]))
            {
                bi+=bk;
            }
            else//if ((1===dir && ai<b[bi]) || (-1===dir && ai>b[bi]))
            {
                diff[dl++] = ai; ai+=ak;
            }
        }
        while (0 <= ak*(a1-ai)) { diff[dl++] = ai; ai+=ak; }
    }
    else
    {
        while ((0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)))
        {
            if      (a[ai] === b[bi])
            {
                if (duplicates) diff[dl++] = a[ai];
                ai+=ak; bi+=bk;
            }
            else if ((1===dir && a[ai]>b[bi]) || (-1===dir && a[ai]<b[bi]))
            {
                bi+=bk;
            }
            else//if ((1===dir && a[ai]<b[bi]) || (-1===dir && a[ai]>b[bi]))
            {
                diff[dl++] = a[ ai ]; ai+=ak;
            }
        }
        while (0 <= ak*(a1-ai)) { diff[dl++] = a[ai]; ai+=ak; }
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
                mult[a[ai]]--;
            }
            else
            {
                ai+=ak;
                bi+=bk;
            }
        }
        else if (a[ai]>b[bi])
        {
            bi+=bk;
        }
        else//if (a[ai]<b[bi])
        {
            diff[dl++] = a[ai];
            mult[a[ai]]--;
            ai+=ak;
        }
    }
    while (0 <= ak*(a1-ai))
    {
        if (0 < mult[a[ai]]) diff[dl++] = a[ai];
        mult[a[ai]]--; ai+=ak;
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
            if      ((1===dir && a[ai][0]<b[bi][0]) || (-1===dir && a[ai][0]>b[bi][0]))
            {
                union[ui++] = last=a[ai];
                ai+=ak;
            }
            else if ((1===dir && a[ai][0]>b[bi][0]) || (-1===dir && a[ai][0]<b[bi][0]))
            {
                union[ui++] = last=b[bi];
                bi+=bk;
            }
            else // they're equal, push one unique
            {
                // make it stable
                if ((1===dir && a[ai][1]<b[bi][1]) || (-1===dir && a[ai][1]>b[bi][1]))
                {
                    union[ui++] = last=a[ai];
                    if (with_duplicates) union[ui++] = b[bi];
                }
                else
                {
                    union[ui++] = last=b[bi];
                    if (with_duplicates) union[ui++] = a[ai];
                }
                ai+=ak; bi+=bk;
            }
        }
        else
        {
            if      ((1===dir && a[ai]<b[bi]) || (-1===dir && a[ai]>b[bi]))
            {
                union[ui++] = last=a[ai];
                ai+=ak;
            }
            else if ((1===dir && a[ai]>b[bi]) || (-1===dir && a[ai]<b[bi]))
            {
                union[ui++] = last=b[bi];
                bi+=bk;
            }
            else // they're equal, push one unique
            {
                union[ui++] = last=a[ai];
                if (with_duplicates) union[ui++] = b[bi];
                ai+=ak; bi+=bk;
            }
        }
    }
    while (0 <= ak*(a1-ai))
    {
        if (with_duplicates || (a[ai]!==last))
        {
            union[ui++] = last=a[ai];
            ai+=ak;
        }
    }
    while (0 <= bk*(b1-bi))
    {
        if (with_duplicates || (b[bi]!==last))
        {
            union[ui++] = last=b[bi];
            bi+=bk;
        }
    }
    if (inplace)
    {
        // move the merged back to the a array
        for (ai=0>ak?a1:a0,ui=0; ui<ul; ui++,ai++) a[ai] = union[ui];
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
    // findout already sorted chunks either ascending or descending
    var ap, ai, i, i0, i1, d0, i2, i3, d1;
    index[0] = -1; index[1] = -1; index[2] = 0;
    index[3] = -1; index[4] = -1; index[5] = 0;
    d0 = 0; d1 = 0;
    i0 = a0; i1 = -1;
    for (ap=indices?a[i0][0]:a[i0],i=i0+1; i<=a1; i++)
    {
        ai = indices?a[i][0]:a[i];
        if (ap < ai)
        {
            if (-1 === d0) { i1 = i-1; break; }
            else if (0 === d0) d0 = 1;
        }
        else if (ap > ai)
        {
            if (1 === d0) { i1 = i-1; break; }
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
        for (ap=indices?a[i2][0]:a[i2],i=i2+1; i<=a1; i++)
        {
            ai = indices?a[i][0]:a[i];
            if (ap < ai)
            {
                if (-1 === d1) { i3 = i-1; break; }
                else if (0 === d1) d1 = 1;
            }
            else if (ap > ai)
            {
                if (1 === d1) { i3 = i-1; break; }
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
        a = operate(function(b,ai,i){b[i-a0]=[ai,i]; return b;}, new Array(N), a, a0, a1, 1);
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
                index[2] = dir!==index[2]?1:0; index[5] = dir!==index[5]?1:0;
                merge(aux, a, a, dir, index[2]?index[1]:index[0], index[2]?index[0]:index[1], index[5]?index[4]:index[3], index[5]?index[3]:index[4], indices, false, true);
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
            operate(function(_,j){
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
        // findout if and how it is sorted
        dir = 0;
        for (ap=a[a0],i=a0+1; i<=a1; i++)
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
            for (ap=a[a0],i=a0+1; i<=a1; i++)
            {
                ai = a[i];
                if (ap < ai) return 0;
                else ap = ai;
            }
        }
        else
        {
            // sorted, ascending
            for (ap=a[a0],i=a0+1; i<=a1; i++)
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
        if (1 < (N=a0.length)) operate(function(a){
            if (offset < N--)
            {
                var perm = rndInt(0, N-offset), swap = a[ a0[N] ];
                a[ a0[N] ] = a[ a0[perm] ]; a[ a0[perm] ] = swap;
            }
            return a;
        }, a, a0, 0, N-1);
    }
    else
    {
        if (null == a0) a0 = 0;
        if (null == a1) a1 = a.length-1;
        if (1 < (N=a1-a0+1)) operate(function(a){
            if (offset < N--)
            {
                var perm = rndInt(0, N-offset), swap = a[ a0+N ];
                a[ a0+N ] = a[ a0+perm ]; a[ a0+perm ] = swap;
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
        for (i=0; i<k; i++) // O(k) times
            picked[ i ] = a[ a0+rndInt(0, n) ];
        if (sorted) mergesort(picked);// O(klogk) times, average/worst-case
        return picked;
    }

    // partially shuffle the array, and generate unbiased selection simultaneously
    // this is a variation on fisher-yates-knuth shuffle
    for (i=0; i<k; i++) // O(k) times
    {
        selected = rndInt(0, --n); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
        value = a[ a0+selected ];
        a[ a0+selected ] = a[ a0+n ];
        a[ a0+n ] = value;
        picked[ i ] = value;
        backup && (backup[ i ] = selected);
    }
    if (backup)
    {
        // restore partially shuffled input array from backup
        for (i=k-1; i>=0; i--) // O(k) times
        {
            selected = backup[ i ];
            value = a[ a0+n ];
            a[ a0+n ] = a[ a0+selected ];
            a[ a0+selected ] = value;
            n++;
        }
    }
    if (sorted) mergesort(picked);// O(klogk) times, average/worst-case
    return picked;
}
function binarysearch(v, a, dir, a0, a1, eq, lt)
{
    // binary search O(logn)
    eq = eq || function(a, b){return a==b;};
    lt = lt || function(a, b){return a<b;};
    dir = -1 === dir ? -1 : 1;
    if (null == a0) a0 = 0;
    if (null == a1) a1 = a.length-1;
    var l=stdMath.max(a0, 0), r=stdMath.min(a1, a.length-1), m, am;

    if (l>r || lt(v, a[l]) || lt(a[r], v)) return -1;
    else if ( eq(v, a[l])) return l;
    else if (eq(v, a[r])) return r;

    if (-1===dir)
    {
        while (l<r)
        {
            m = ((l+r)>>>1); am = a[m];
            if (eq(v, am)) return m;
            else if (lt(am, v)) r = m-1;
            else l = m+1;
        }
    }
    else
    {
        while (l<r)
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
    lt = lt || function(a, b){return a<b};
    if (null == lo) lo = 0;
    if (null == hi) hi = list.length;
    dir = -1 === dir ? -1 : 1; // left, else right bisection
    var mid, litem;
    if (0 > lo) return -1;
    if (-1===dir)
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
        while (b >>= 1) { r <<= 1; r |= b & 1; }
    else
        while (--nbits) { r <<= 1; b >>= 1; r |= b & 1; }
    return r;
}
function is_mirror_image(x)
{
    var i, j;
    if (is_array(x) || is_args(x))
    {
        if (1 >= x.length) return true;
        for (i=0,j=x.length-1; i<j; i++,j--)
            if (x[i] !== x[j])
                return false;
    }
    else
    {
        x = String(x);
        if (1 >= x.length) return true;
        for (i=0,j=x.length-1; i<j; i++,j--)
            if (x.charAt(i) !== x.charAt(j))
                return false;
    }
    return true;
}
function lcs_key(path)
{
    return path.map(function(ij){return String(ij[0])+','+String(ij[1]);}).join('-');
}
function lcs_backtrack(L, a, b, i, j, eq, all)
{
    if (0 > i || 0 > j) return [];
    var L1 = 0 === i ? 0 : L[i-1][j], L2 = 0 === j ? 0 : L[i][j-1], out, lcs1, lcs2, visited;
    if (all)
    {
        if (eq(a[i], b[j]))
        {
            out = lcs_backtrack(L, a, b, i-1, j-1, eq, all);
            return out.length ? out.map(function(path){path.push([i, j]); return path;}) : [[[i, j]]];
        }
        out = [];
        // NOTE: below different paths, may lead to same LCS nevertheless, unless filtering is used
        lcs1 = L1 >= L2 ? lcs_backtrack(L, a, b, i-1, j, eq, all) : [];
        lcs2 = L2 >= L1 ? lcs_backtrack(L, a, b, i, j-1, eq, all) : [];
        if (lcs1.length && lcs2.length)
        {
            visited = lcs1.reduce(function(visited, path){visited[lcs_key(path)] = 1; return visited;}, Obj());
            lcs2 = lcs2.filter(function(path){return 1 !== visited[lcs_key(path)];});
        }
        out.push.apply(out, lcs1);
        out.push.apply(out, lcs2);
        return out;
    }
    else
    {
        if (eq(a[i], b[j]))
        {
            out = lcs_backtrack(L, a, b, i-1, j-1, eq, all);
            out.push([i, j]);
            return out;
        }
        return L1 >= L2 ? lcs_backtrack(L, a, b, i-1, j, eq, all) : lcs_backtrack(L, a, b, i, j-1, eq, all);
    }
}
function lcs(a, b, contiguous, ret, eq)
{
    var i, j, n = a.length, m = b.length, s, L, L1, L2, out, sizeOnly = 'size' === ret, all = 'all' === ret;
    if (!n || !m) return sizeOnly ? 0 : [];
    eq = eq || default_eq;
    if (contiguous)
    {
        // https://en.wikipedia.org/wiki/Longest_common_substring_problem
        // O(nm)
        s = 0;
        out = [];
        L = new Array(n);
        for (i=0; i<n; i++)
        {
            L[i] = new Array(m);
            for (j=0; j<m; j++)
            {
                if (eq(a[i], b[j]))
                {
                    L[i][j] = (0 === i || 0 === j ? 0 : L[i-1][j-1]) + 1;
                    if (L[i][j] > s)
                    {
                        s = L[i][j];
                        if (!sizeOnly) out = [[i-s+1, i, j-s+1, j]];
                    }
                    else if (all && L[i][j] === s)
                    {
                        out.push([i-s+1, i, j-s+1, j]);
                    }
                }
                else
                {
                    L[i][j] = 0;
                }
            }
        }
    }
    else
    {
        // https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
        // O(nm)
        L = new Array(n);
        out = [];
        for (i=0; i<n; i++)
        {
            L[i] = new Array(m);
            for (j=0; j<m; j++)
            {
                if (eq(a[i], b[j]))
                {
                    L[i][j] = (0 === i || 0 === j ? 0 : L[i-1][j-1]) + 1;
                }
                else
                {
                    L[i][j] = stdMath.max(0 === j ? 0 : L[i][j-1], 0 === i ? 0 : L[i-1][j]);
                }
            }
        }
        s = L[n-1][m-1];
        if (!sizeOnly) out = lcs_backtrack(L, a, b, n-1, m-1, eq, all);
    }
    return sizeOnly ? s : out;
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
function align(A, B, dist_AB, cmp_AA, cmp_BB)
{
    // https://stackoverflow.com/a/78740257/3591273
    /*
    Examples
    note: "alignment" is like the permutation of (parts of) `b` that minimizes total given distance with `a`
    a:0,1,2 b:0,1,2 alignment:0,1,2
    a:0,1,2 b:2,1,0 alignment:2,1,0
    a:2,1,0 b:0,1,2 alignment:2,1,0
    a:2,1,0 b:2,1,0 alignment:0,1,2
    a:0,1,2 b:0,1 alignment:0,1,1
    a:0,1,2 b:1,0 alignment:1,0,0
    a:2,1,0 b:0,1 alignment:1,1,0
    a:2,1,0 b:1,0 alignment:0,0,1
    a:0,1,2 b:-2,-1,0,1,2 alignment:2,3,4
    a:0,1,2 b:2,1,0,4,3 alignment:2,1,0
    a:2,1,0 b:-2,-1,0,1,2 alignment:4,3,2
    a:2,1,0 b:2,1,0,4,3 alignment:0,1,2
    */
    var n = A.length, m = B.length, i, j, k, s, sm, km, perm_A, perm_B, iperm_A, iperm_B, alignment;
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
            for (i=0; i<m; ++i)
            {
                alignment[perm_A[perm_B[i]]] = i;
            }
            for (i=0; i<n;)
            {
                if (null == alignment[i]) // pad/interpolate
                {
                    j = i-1;
                    k = i+1; while (k < n && null == alignment[k]) ++k;
                    if (0 > j)
                    {
                        while (i < k) alignment[i++] = alignment[k];
                    }
                    else if (k >= n)
                    {
                        while (i < n) alignment[i++] = alignment[j];
                    }
                    else
                    {
                        if (dist_AB(A[i], B[alignment[j]]) > dist_AB(A[i], B[alignment[k]]))
                        {
                            while (i < k) alignment[i++] = alignment[k];
                        }
                        else
                        {
                            alignment[i++] = alignment[j];
                        }
                    }
                }
                else // bypass
                {
                    ++i;
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
            iperm_A = new Array(n);
            for (i=0; i<n; ++i) iperm_A[perm_A[i]] = i;
            iperm_B = new Array(m);
            for (i=0; i<m; ++i) iperm_B[perm_B[i]] = i;
            for (i=0; i<n; ++i)
            {
                alignment[i] = iperm_B[iperm_A[i]+km];
            }
        }
        else// if (n === m)
        {
            for (i=0; i<m; ++i)
            {
                alignment[perm_A[perm_B[i]]] = i;
            }
        }
        return alignment;
    }
    return [];
}
align.cmp = cmp;
align.dist = dist;
function sorter(Arithmetic)
{
    return true===Arithmetic ? function(a, b){return a.equ(b) ? 0 : (a.lt(b) ? -1 : 1);} : (Arithmetic ? function(a, b){return Arithmetic.equ(a, b) ? 0 : (Arithmetic.lt(a, b) ? -1 : 1);} : function(a, b){return a===b ? 0 : (a<b ? -1 : 1);});
}
function pad(x, n, s)
{
    var l = x.length;
    s = s || ' ';
    return l < n ? (new Array(n-l+1).join(s)+x) : x;
}
function addn(s, a)
{
    return s+a;
}
function muln(p, a)
{
    return p*a;
}
function sum(x, i0, i1, ik)
{
    var Arithmetic = Abacus.Arithmetic;
    return operate(function(s, x){
        return s instanceof INumber ? s.add(x) : (x instanceof INumber ? x.add(s) : Arithmetic.add(s, x));
    }, Arithmetic.O, x, i0, i1, ik);
}
function product(x, i0, i1, ik)
{
    var Arithmetic = Abacus.Arithmetic;
    return operate(function(p, x){
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
    if ((1===kg) && (0>x)) x = -x;
    r = stdMath.pow(x, 1.0/k); p = stdMath.pow(r, k);

    if ((stdMath.abs(x-p)<1.0) && ((0<x) === (0<p)))
        return kg && (0>x) ? -r : r;
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
function polykthroot(p, k, limit)
{
    // Return the (possibly truncated) k-th root of a polynomial
    // https://math.stackexchange.com/questions/324385/algorithm-for-finding-the-square-root-of-a-polynomial
    // https://planetmath.org/SquareRootOfPolynomial
    // https://math.stackexchange.com/questions/3550942/algorithm-to-compute-nth-root-radical-sqrtnpx-of-polynomial
    // similarities with modified Newton's algorithm adapted for polynomials
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        PolynomialClass, k_1, r, rk, d, q, deg, nterms = 0;

    if (k.lt(I)) return null; // undefined
    else if ((k.equ(I)) || p.equ(O) || p.equ(I)) return p;

    PolynomialClass = p[CLASS];

    if (null == limit) limit = 6;
    limit = stdMath.abs(+limit);
    k_1 = k.sub(I);
    // using tail term .ttm(), correctly computes (taylor) power series approximation if p is not perfect kth power
    r = new PolynomialClass(p.ttm().rad(k), p.symbol, p.ring);
    deg = p.maxdeg(true); rk = r.pow(k_1); d = p.sub(rk.mul(r));
    while (!d.equ(O))
    {
        q = d.ttm(true).div(rk.mul(k).ttm(true));
        if (q.equ(O)) break; // no update anymore
        /*d = d.sub(q.mul(rk.add(q.pow(k_1))));*/ r = r.add(q); rk = r.pow(k_1); d = p.sub(rk.mul(r));
        // compute only up to some terms of power series (truncated power series approximation)
        // if p is not a perfect kth power and root begins to have powers not belonging to the root of p
        if (r.maxdeg(true)*k > deg) { nterms++; if ((r.terms.length >= limit) || (nterms >= limit)) break; }
    }
    // normalise r to have positive lead coeff
    // if k is multiple of 2 (since then both r and -r are roots)
    // and is not a (truncated) power series approximation
    return (0===nterms) && k.mod(two).equ(O) ? r.abs() : r;
}
function kthroot(x, k, limit)
{
    // https://en.wikipedia.org/wiki/Nth_root_algorithm
    // https://en.wikipedia.org/wiki/Shifting_nth_root_algorithm
    // Return the approximate k-th root of a rational number by Newton's method
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        ObjectClass, r, d, k_1, tries = 0, epsilon = Rational.Epsilon();
    if (k.equ(O)) return null;
    if ((is_instance(x, Numeric) && (x.equ(O) || x.equ(I))) || (Arithmetic.isNumber(x) && (Arithmetic.equ(O, x) || Arithmetic.equ(I, x)))) return x;
    ObjectClass = Arithmetic.isNumber(x) || is_instance(x, Integer) ? Rational :  x[CLASS];
    x = ObjectClass.cast(x);
    if (is_class(ObjectClass, Rational) && x.lt(O) && k.mod(two).equ(O))
    {
        // square root of negative real number, transform to complex
        ObjectClass = Complex;
        x = ObjectClass.cast(x);
    }
    if (k.lt(O))
    {
        x = x.inv();
        k = k.neg();
    }
    if (k.equ(I)) return x;

    if (is_class(ObjectClass, RationalFunc))
    {
        r = new ObjectClass(polykthroot(x.num, k), polykthroot(x.den, k));
    }
    else if (is_class(ObjectClass, Rational))
    {
        r = new ObjectClass(ikthroot(x.num, k.num), ikthroot(x.den, k.num));
    }
    else if (is_class(ObjectClass, Complex))
    {
        if (x.isReal() && (x.real().gte(O) || !k.mod(two).equ(O)))
        {
            r = new ObjectClass(Rational(ikthroot(x.real().num, k.num), ikthroot(x.real().den, k.num)), Rational.Zero());
        }
        else
        {
            r = new ObjectClass(I, I); // make sure a complex is used, not strictly real or imag
        }
    }
    else
    {
        r = ObjectClass.One();
    }
    //if (null == limit) limit = 6; // for up to 6 tries Newton method converges with 64bit precision
    //limit = stdMath.abs(+limit);
    k_1 = k.sub(I);
    if (is_class(ObjectClass, Complex))
    {
        do {
            d = x.div(r.pow(k_1)).sub(r).div(k);
            if (d.real().abs().lte(epsilon) && d.imag().abs().lte(epsilon)) break;
            r = r.add(d);
        } while (true);
    }
    else
    {
        do {
            d = x.div(r.pow(k_1)).sub(r).div(k);
            if (d.abs().lte(epsilon)) break;
            r = r.add(d);
        } while (true);
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
        for (i=1; i<m; i++)
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
function trailing_zeroes(n, bits, with_remaining)
{
    var Arithmetic = Abacus.Arithmetic, z = 0, i;
    bits = bits || Arithmetic.digits(n, 2);
    i = bits.length-1;
    while (0<=i && '0'===bits.charAt(i)) { i--; z++; }
    return with_remaining ? [z, 0 > i ? '0' : bits.slice(0, i+1)] : z;
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
    function try_composite(a) {
        var x, r;
        x = powm(a, d, n);
        if (Arithmetic.equ(x, I) || Arithmetic.equ(x, n_1)) return false;
        for (r=1; r<s; r++)
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
        for (i=0,kl=k.length; i<kl; i++)
            if (try_composite(k[i]))
                return false;
        // extra tests
        if (null != kextra)
        {
            kextra = +kextra;
            for (i=0; i<kextra; i++)
                if (try_composite(Arithmetic.rnd(two, n_2)))
                    return false;
        }
    }
    else
    {
        k = +k;
        for (i=0; i<k; i++)
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
    if ('0'===bits /*|| Arithmetic.equ(O, k)*/) return [O, two, Q];

    U = I; V = P; Qk = Q;
    b = bits.length;

    if (Arithmetic.equ(I, Q))
    {
        // Optimization for extra strong tests.
        for (bit=1; bit<b; bit++)/*while (1 < b)*/
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
        for (bit=1; bit<b; bit++)/*while (1 < b)*/
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
        for (bit=1; bit<b; bit++)/*while (1 < b)*/
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
    for (r=1; r<s; r++)
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
    for (i=0,l=stdMath.min(primes.length,100); i<l; i++)
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
    for (i=0,l=stdMath.min(primes.length,50); i<l; i++)
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
    for (k=0; k<l; k++) prod *= base[k];
    w = [];

    prod += 1;
    for (j=base[0]; j<=prod; j++)
    {
        all = true;
        for (k=0; k<l; k++)
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
    return [w, array(w.length, function(i){return i+1<w.length ? w[i+1]-w[i] : w[0]+prod-1-w[i];})];
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
    for (i=0; i<=retries; i++)
    {
        U = V;
        j = 0;
        if (!is_callable(F))
            F = function(x) {
                return Arithmetic.mod(Arithmetic.add(Arithmetic.mod(Arithmetic.mul(x, x), n), a), n);
            };
        for (;;)
        {
            if ((null!=max_steps) && (j>max_steps)) break;
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
    for (i=0; i<=retries; i++)
    {
        aM = a;
        for (ip=0; ip<pl; ip++)
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
    for (i=0,l=primes.length; i<l; i++)
    {
        p = primes[i];
        if (Arithmetic.equ(n0, p)) return [[p, I]];

        p2 = Arithmetic.mul(p, p);

        if (Arithmetic.gt(p2, n) || (null!=maxlimit && Arithmetic.gt(p2, maxlimit))) break;

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
            f1 = f; L++;
            if (!factors) factors = f1;
        }
    }
    if (i >= l)
    {
        p = Arithmetic.add(p, two); p2 = Arithmetic.mul(p, p);
        while (Arithmetic.lte(p2, n) && (null==maxlimit || Arithmetic.lte(p2, maxlimit)))
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
                f1 = f; L++;
                if (!factors) factors = f1;
            }
            p = Arithmetic.add(p, two); p2 = Arithmetic.mul(p, p);
        }
    }
    if ((null==maxlimit) && Arithmetic.gt(n, I))
    {
        // add last
        f = new Node([n, I]);
        f.l = f1;
        if (f1) f1.r = f;
        f1 = f; L++;
        if (!factors) factors = f1;
    }

    // traverse list of factors and return array
    fac = array(L, function(){
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
            i1++; i2++;
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
            i1++;
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
            i2++;
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
        i1++;
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
        i2++;
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
        for (k=repeating.length-1; k>=0; k--)
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
        while (non_repeating && (non_repeating.slice(-1)==='0')) non_repeating = non_repeating.slice(0, -1);
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
            while ((non_repeating.length>=repeating.length) && (non_repeating.slice(-repeating.length)===repeating))
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
    return a===b;
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
        mu++;
    }
    lam = 1;
    hare = f(tortoise);
    while (!eq(tortoise, hare))
    {
        hare = f(hare);
        lam++;
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

    for (i=0,c=period[0]+period[1]; i<c; i++)
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
        for (i=repeating.length-1; i>=0; i--)
        {
            if (repeating.charAt(i) !== '0')
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
        for (i=non_repeating.length-1; i>=0; i--)
        {
            if (non_repeating.charAt(i) !== '0')
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
    while (i<c && Arithmetic.equ(O, a=args[i++]));
    a = Arithmetic.abs(a);
    while (i<c)
    {
        // break early
        if (Arithmetic.equ(a, I)) return I;
        while (i<c && Arithmetic.equ(O, b=args[i++]));
        b = Arithmetic.abs(b);
        // break early
        if (Arithmetic.equ(b, I)) return I;
        else if (Arithmetic.equ(b, a)) continue;
        else if (Arithmetic.equ(b, O)) break;
        // swap them (a >= b)
        if (Arithmetic.lt(a, b)) { t=b; b=a; a=t; }
        while (!Arithmetic.equ(O, b)) { t = b; b = Arithmetic.mod(a, t); a = t; }
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
    if (1 >= l) return 1===l ? args[0] : O;
    if (Arithmetic.equ(O, args[0]) || Arithmetic.equ(O, args[1])) return O;
    LCM = lcm2(args[0], args[1]);
    for (i=2; i<l; i++)
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
            return array(gcd.length+1,function(i){
                return 0===i ? b : (1===i ? asign : Arithmetic.mul(bsign, gcd[i-1]));
            });
        else if (Arithmetic.equ(O, b))
            return array(gcd.length+1,function(i){
                return 0===i ? a : (1===i ? asign : Arithmetic.mul(bsign, gcd[i-1]));
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
                return array(gcd.length+1,function(i){
                    return 0===i ? b : (1===i ? a2 : Arithmetic.mul(b2, gcd[i-1]));
                });
            }

            quot = Arithmetic.div(b, a);
            b = Arithmetic.mod(b, a);
            a2 = Arithmetic.sub(a2, Arithmetic.mul(quot, a1));
            b2 = Arithmetic.sub(b2, Arithmetic.mul(quot, b1));
            if (Arithmetic.equ(O, b))
            {
                a1 = Arithmetic.mul(a1, asign); b1 = Arithmetic.mul(b1, bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : Arithmetic.mul(b1, gcd[i-1]));
                });
            }
        }
    }
}
function igcd(/* args */)
{
    // gcd of Integer numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return Integer(gcd(array(args.length, function(i){return args[i].num;})));
}
function ilcm(/* args */)
{
    // lcm of Integer numbers
    // https://math.stackexchange.com/questions/44836/rational-numbers-lcm-and-hcf
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return Integer(lcm(array(args.length, function(i){return args[i].num;})));
}
function ixgcd(/* args */)
{
    // xgcd of Integer numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    if (!args.length) return;
    return xgcd(array(args.length, function(i){return args[i].num;})).map(function(g){return Integer(g);});
}
function ngcd(/* args */)
{
    // gcd of Integer modulo numbers = min(n1,n2,..nk)
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, gcd = null, i, l = args.length;
    for (i=0; i<l; i++)
    {
        if (!args[i].equ(O) && (null==gcd || args[i].lt(gcd)))
            gcd = args[i];
    }
    return null==gcd ? args[0] : gcd;
}
function nxgcd(/* args */)
{
    // xgcd of Integer modulo numbers = min(n1,n2,..nk)
    var args = slice.call(arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments),
        Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, index = -1, gcd = null, i, l = args.length;
    if (!args.length) return;
    for (i=0; i<l; i++)
    {
        if (!args[i].equ(O) && (null==gcd || args[i].lt(gcd)))
        {
            gcd = args[i];
            index = i;
        }
    }
    return null==gcd ? array(args.length+1, function(i){
        return 0===i ? args[0] : (1===i ? IntegerMod.One(args[0].m) : IntegerMod.Zero(args[0].m));
    }) : array(args.length+1, function(i){
        return 0===i ? gcd : (index+1===i ? IntegerMod.One(args[0].m) : IntegerMod.Zero(args[0].m));
    });
}
function nlcm(/* args */)
{
    // least common multiple of Integers modulo = max(n1,n2,..nk)
    // https://en.wikipedia.org/wiki/Least_common_multiple
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        i, l = args.length, LCM, O = Abacus.Arithmetic.O;
    if (1 >= l) return 1===l ? args[0] : IntegerMod.Zero(2);
    if (args[0].equ(O) || args[1].equ(O)) return IntegerMod.Zero(args[0].m);
    LCM = nmax(args[0], args[1]);
    for (i=2; i<l; i++)
    {
        if (args[i].equ(O)) return IntegerMod.Zero(args[0].m);
        LCM = nmax(LCM, args[i]);
    }
    return LCM;
}
function rgcd(/* args */)
{
    // gcd of Rational numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        Arithmetic = Abacus.Arithmetic, denom;
    denom = operate(function(p, r){return Arithmetic.mul(p, r.den);}, Arithmetic.I, args);
    return Rational(gcd(array(args.length, function(i){return Arithmetic.mul(Arithmetic.div(denom, args[i].den), args[i].num);})), denom);
}
function rxgcd(/* args */)
{
    // xgcd of Rational numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, denom;
    if (!args.length) return;
    denom = operate(function(p, r){return Arithmetic.mul(p, r.den);}, I, args);
    return xgcd(array(args.length, function(i){return Arithmetic.mul(Arithmetic.div(denom, args[i].den), args[i].num);})).map(function(g, i){return 0===i ? Rational(g, denom) : Rational(g, I, true);});
}
function rlcm(/* args */)
{
    // lcm of Rational numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        Arithmetic = Abacus.Arithmetic, denom;
    denom = operate(function(p, r){return Arithmetic.mul(p, r.den);}, Arithmetic.I, args);
    return Rational(lcm(array(args.length, function(i){return Arithmetic.mul(Arithmetic.div(denom, args[i].den), args[i].num);})), denom);
}
function cgcd(/* args */)
{
    // Generalization of Euclid GCD Algorithm for complex numbers
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, a0, b0, a, b, t, r, i;

    if (0 === c) return Complex.Zero();

    i = 0;
    while (i<c && (a=args[i++]).equ(O)) ;
    while (i<c)
    {
        while (i<c && (b=args[i++]).equ(O)) ;
        if (b.equ(a)) continue;
        else if (b.equ(O)) break;
        // swap them (a >= b)
        if (b.norm().gt(a.norm())) { t=b; b=a; a=t; }
        while (!b.equ(O))
        {
            //a0 = a; b0 = b;
            r = a.mod(b); a = b; b = r;
            //if (a.equ(b0) && b.equ(a0)) break; // will not change anymore
        }
    }
    // normalize it
    if (a.real().abs().lt(a.imag().abs())) a = a.mul(Complex.Img());
    if (a.real().lt(O)) a = a.neg();
    return a;
}
function cxgcd(/* args */)
{
    // Generalization of Extended GCD Algorithm for complex numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, i, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        asign = Complex.One(), bsign = Complex.One(), t, a, b, a0, b0, a1, b1, a2, b2, qr, gcd;

    if (0 === k) return;

    a = args[0];

    if (1 === k)
    {
        // normalize it
        if (a.real().abs().lt(a.imag().abs())) { a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img()); }
        if (a.real().lt(O)) { a = a.neg(); asign = asign.neg(); }
        return [a, asign];
    }
    else //if (2 <= k)
    {
        // recursive on number of arguments
        // compute xgcd on rest arguments and combine with current
        // based on recursive property: gcd(a,b,c,..) = gcd(a, gcd(b, c,..))
        gcd = 2===k ? [args[1], Complex.One()] : cxgcd(slice.call(args, 1));
        b = gcd[0];

        // gcd with zero factor, take into account
        if (a.equ(O))
        {
            // normalize it
            if (b.real().abs().lt(b.imag().abs())) { b = b.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
            if (b.real().lt(O)) { b = b.neg(); asign = asign.neg(); bsign = bsign.neg(); }
            return array(gcd.length+1,function(i){
                return 0===i ? b : (1===i ? asign : gcd[i-1].mul(bsign));
            });
        }
        else if (b.equ(O))
        {
            // normalize it
            if (a.real().abs().lt(a.imag().abs())) { a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
            if (a.real().lt(O)) { a = a.neg(); asign = asign.neg(); bsign = bsign.neg(); }
            return array(gcd.length+1,function(i){
                return 0===i ? a : (1===i ? asign : gcd[i-1].mul(bsign));
            });
        }

        a1 = Complex.One();
        b1 = Complex.Zero();
        a2 = Complex.Zero();
        b2 = Complex.One();

        for (;;)
        {
            //a0 = a; b0 = b;

            qr = a.divmod(b);
            a = qr[1];
            a1 = a1.sub(qr[0].mul(a2))
            b1 = b1.sub(qr[0].mul(b2));
            if (a.equ(O))
            {
                // normalize it
                if (b.real().abs().lt(b.imag().abs())) { b = b.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
                if (b.real().lt(O)) { b = b.neg(); asign = asign.neg(); bsign = bsign.neg(); }
                a2 = a2.mul(asign); b2 = b2.mul(bsign);
                return array(gcd.length+1,function(i){
                    return 0===i ? b : (1===i ? a2 : gcd[i-1].mul(b2));
                });
            }

            qr = b.divmod(a);
            b = qr[1];
            a2 = a2.sub(qr[0].mul(a1));
            b2 = b2.sub(qr[0].mul(b1));
            if (b.equ(O))
            {
                // normalize it
                if (a.real().abs().lt(a.imag().abs())) { a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
                if (a.real().lt(O)) { a = a.neg(); asign = asign.neg(); bsign = bsign.neg(); }
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : gcd[i-1].mul(b1));
                });
            }

            /*if (a.equ(a0) && b.equ(b0))
            {
                // will not change anymore
                if (a.real().abs().lt(a.imag().abs())) { a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
                if (a.real().lt(O)) { a = a.neg(); asign = asign.neg(); bsign = bsign.neg(); }
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : gcd[i-1].mul(b1));
                });
            }*/
        }
    }
}
function clcm2(a, b)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, g = cgcd(a, b);
    return g.equ(O) ? g : a.div(g).mul(b);
}
function clcm(/* args */)
{
    // least common multiple
    // https://en.wikipedia.org/wiki/Least_common_multiple
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        i, l = args.length, LCM, O = Abacus.Arithmetic.O;
    if (1 >= l) return 1===l ? args[0] : Complex.Zero();
    if (args[0].equ(O) || args[1].equ(O)) return Complex.Zero();
    LCM = clcm2(args[0], args[1]);
    for (i=2; i<l; i++)
    {
        if (args[i].equ(O)) return Complex.Zero();
        LCM = clcm2(LCM, args[i]);
    }
    return LCM;
}
function polygcd(/* args */)
{
    // Generalization of Euclid GCD Algorithm for polynomials
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor
    // https://en.wikipedia.org/wiki/Euclidean_division_of_polynomials
    // https://en.wikipedia.org/wiki/Polynomial_long_division
    // should be a generalisation of number gcd, meaning for constant polynomials should coincide with gcd of respective numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, Arithmetic = Abacus.Arithmetic, PolynomialClass = Polynomial, are_const = true,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, a, b, a0, b0, t, r, i, p, q, field;

    if (0 === c) return PolynomialClass.Zero();
    PolynomialClass = args[0][CLASS];

    for (i=0; i<c; i++)
    {
        if (!args[i].isConst())
        {
            are_const = false;
            break;
        }
    }
    // defer to gcd of coefficients and transform back to polynomial
    if (are_const) return PolynomialClass(args[0].ring.gcd(array(args.length, function(i){return args[i].cc();})), args[0].symbol, args[0].ring);

    // Generalization of Euclid GCD Algorithm for polynomials in Z[X]
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#GCD_over_a_ring_and_over_its_field_of_fractions
    if (is_class(args[0].ring.NumberClass, Integer))
    {
        a = args[0];
        if (1 == c)
        {
            return a.monic();
        }
        else //if (2 <= c)
        {
            field = a.ring.associatedField(); // Q[X]
            p = PolynomialClass(a, a.symbol, field);
            q = PolynomialClass(2===c ? args[1] : polygcd(slice.call(args, 1)), a.symbol, field);
            return PolynomialClass(polygcd(p, q).primitive().mul(field.gcd(p.content(), q.content())), a.symbol, a.ring);
        }
    }

    i = 0;
    while (i<c && (a=args[i++]).equ(O)) ;
    if (a.lc().lt(O)) a = a.neg();
    while (i<c)
    {
        if (a.equ(I)) return PolynomialClass.One(a.symbol, a.ring);
        while (i<c && (b=args[i++]).equ(O)) ;
        if (b.lc().lt(O)) b = b.neg();
        if (b.equ(I)) return PolynomialClass.One(a.symbol, a.ring);
        else if (b.equ(a)) continue;
        else if (b.equ(O)) break;
        // swap them (a >= b)
        if (0 > PolynomialClass.Term.cmp(a.ltm(), b.ltm(), true)) { t=b; b=a; a=t; }
        while (!b.equ(O))
        {
            //a0 = a; b0 = b;
            r = a.mod(b); a = b; b = r;
            //if (a.equ(b0) && b.equ(a0)) break; // will not change anymore
        }
    }
    // simplify, positive and monic
    a = a.monic();
    return a;
}
function polyxgcd(/* args */)
{
    // Generalization of Extended GCD Algorithm for univariate polynomials
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#B%C3%A9zout's_identity_and_extended_GCD_algorithm
    // should be a generalisation of number xgcd, meaning for constant polynomials should coincide with xgcd of respective numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, i, Arithmetic = Abacus.Arithmetic, PolynomialClass = Polynomial, are_const = true,
        O = Arithmetic.O, I = Arithmetic.I, asign, bsign,
        a, b, a0, b0, a1, b1, a2, b2, lead,
        qr, gcd, g, f, p, q, field;

    if (0 === k) return;

    a = args[0];
    PolynomialClass = a[CLASS];

    for (i=0; i<k; i++)
    {
        if (!args[i].isConst())
        {
            are_const = false;
            break;
        }
    }
    // defer to xgcd of coefficients and transform back to polynomial
    if (are_const) return a.ring.xgcd(array(args.length, function(i){return args[i].cc();})).map(function(g){return PolynomialClass(g, a.symbol, a.ring);});


    // Generalization of Euclid extended GCD Algorithm for polynomials in Z[X]
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#GCD_over_a_ring_and_over_its_field_of_fractions
    if (is_class(a.ring.NumberClass, Integer))
    {
        field = a.ring.associatedField(); // Q[X]
        asign = field.One(); bsign = asign;
        if (1 == k)
        {
            // normalize it
            lead = a.lc();
            if (lead.divides(asign))
            {
                a = a.monic();
                if (!lead.equ(a.lc())) {asign = asign.mul(a.lc()).div(lead);}
            }
            else if (lead.lt(O))
            {
                a = a.neg(); asign = asign.neg();
            }
            return [a, PolynomialClass(asign, a.symbol, field)];
        }
        else //if (2 <= k)
        {
            gcd = 2===k ? [args[1], PolynomialClass.One(a.symbol, field)] : polyxgcd(slice.call(args, 1));
            b = gcd[0];
            p = PolynomialClass(a, a.symbol, field);
            q = PolynomialClass(b, a.symbol, field);
            g = polyxgcd(p, q);
            f = field.gcd(p.content(), q.content());
            // Bezout's Identity for Polynomials works only for polys over a field, not simply a ring, like Z
            // thus the coefficients are in general polys over Q ie Q[x]
            // https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity#For_polynomials
            g[0] = g[0].primitive().mul(f); g[1] = g[1].mul(f); g[2] = g[2].mul(f);
            return array(gcd.length+1, function(i){
                return 0===i ? PolynomialClass(g[0], a.symbol, a.ring) : (1===i ? g[1] : gcd[i-1].mul(g[2]));
            });
        }
    }

    asign = a.ring.One(); bsign = asign;
    if (1 === k)
    {
        // normalize it
        lead = a.lc();
        if (lead.divides(asign))
        {
            a = a.monic();
            if (!lead.equ(a.lc())) {asign = asign.mul(a.lc()).div(lead);}
        }
        else if (lead.lt(O))
        {
            a = a.neg(); asign = asign.neg();
        }
        return [a, PolynomialClass(asign, a.symbol, a.ring)];
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
        // note2: any zero arguments are skipped and do not break xGCD computation
        // note3: gcd(0,0,..,0) is conventionaly set to 0 with 1's as factors
        gcd = 2===k ? [args[1], PolynomialClass.One(a.symbol, a.ring)] : polyxgcd(slice.call(args, 1));
        b = gcd[0];

        // gcd with zero factor, take into account
        if (a.equ(O))
        {
            // normalize it
            lead = b.lc();
            if (lead.divides(asign) && lead.divides(bsign))
            {
                b = b.monic();
                if (!lead.equ(b.lc())) {asign = asign.mul(b.lc()).div(lead); bsign = bsign.mul(b.lc()).div(lead);}
            }
            else if (lead.lt(O))
            {
                b = b.neg(); asign = asign.neg(); bsign = bsign.neg();
            }
            return array(gcd.length+1,function(i){
                return 0===i ? b : (1===i ? PolynomialClass(asign, a.symbol, a.ring) : gcd[i-1].mul(bsign));
            });
        }
        else if (b.equ(O))
        {
            // normalize it
            lead = a.lc();
            if (lead.divides(asign) && lead.divides(bsign))
            {
                a = a.monic();
                if (!lead.equ(a.lc())) {asign = asign.mul(a.lc()).div(lead); bsign = bsign.mul(a.lc()).div(lead);}
            }
            else if (lead.lt(O))
            {
                a = a.neg(); asign = asign.neg(); bsign = bsign.neg();
            }
            return array(gcd.length+1,function(i){
                return 0===i ? a : (1===i ? PolynomialClass(asign, a.symbol, a.ring) : gcd[i-1].mul(bsign));
            });
        }

        a1 = PolynomialClass.One(a.symbol, a.ring);
        b1 = PolynomialClass.Zero(a.symbol, a.ring);
        a2 = Polynomial.Zero(a.symbol, a.ring);
        b2 = Polynomial.One(a.symbol, a.ring);

        for (;;)
        {
            //a0 = a; b0 = b;

            qr = a.divmod(b);
            a = qr[1];
            a1 = a1.sub(qr[0].mul(a2))
            b1 = b1.sub(qr[0].mul(b2));
            if (a.equ(O))
            {
                // normalize it
                lead = b.lc();
                if (lead.divides(asign) && lead.divides(bsign))
                {
                    b = b.monic();
                    if (!lead.equ(b.lc())) {asign = asign.mul(b.lc()).div(lead); bsign = bsign.mul(b.lc()).div(lead);}
                }
                else if (lead.lt(O))
                {
                    b = b.neg(); asign = asign.neg(); bsign = bsign.neg();
                }
                a2 = a2.mul(asign); b2 = b2.mul(bsign);
                return array(gcd.length+1,function(i){
                    return 0===i ? b : (1===i ? a2 : gcd[i-1].mul(b2));
                });
            }

            qr = b.divmod(a);
            b = qr[1];
            a2 = a2.sub(qr[0].mul(a1));
            b2 = b2.sub(qr[0].mul(b1));
            if (b.equ(O))
            {
                // normalize it
                lead = a.lc();
                if (lead.divides(asign) && lead.divides(bsign))
                {
                    a = a.monic();
                    if (!lead.equ(a.lc())) {asign = asign.mul(a.lc()).div(lead); bsign = bsign.mul(a.lc()).div(lead);}
                }
                else if (lead.lt(O))
                {
                    a = a.neg(); asign = asign.neg(); bsign = bsign.neg();
                }
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : gcd[i-1].mul(b1));
                });
            }

            /*if (a.equ(a0) && b.equ(b0))
            {
                // will not change anymore
                // normalize it
                lead = a.lc();
                if (lead.divides(asign) && lead.divides(bsign))
                {
                    a = a.monic();
                    if (!lead.equ(a.lc())) {asign = asign.mul(a.lc()).div(lead); bsign = bsign.mul(a.lc()).div(lead);}
                }
                else if (lead.lt(O))
                {
                    a = a.neg(); asign = asign.neg(); bsign = bsign.neg();
                }
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : gcd[i-1].mul(b1));
                });
            }*/
        }
    }
}
function polylcm2(a, b)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, g = polygcd(a, b);
    return g.equ(O) ? g : a.div(g).mul(b);
}
function polylcm(/* args */)
{
    // least common multiple
    // https://en.wikipedia.org/wiki/Least_common_multiple
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        i, l = args.length, LCM, O = Abacus.Arithmetic.O, PolynomialClass = Polynomial;
    if (1 >= l) return 1===l ? args[0] : PolynomialClass.Zero();
    PolynomialClass = args[0][CLASS];
    if (args[0].equ(O) || args[1].equ(O)) return PolynomialClass.Zero(args[0].symbol, args[0].ring);
    LCM = polylcm2(args[0], args[1]);
    for (i=2; i<l; i++)
    {
        if (args[i].equ(O)) return PolynomialClass.Zero(args[0].symbol, args[0].ring);
        LCM = polylcm2(LCM, args[i]);
    }
    return LCM;
}
function rfgcd(/* args */)
{
    // gcd of Rational Functions
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        denom;
    denom = operate(function(p, r){return r.den.mul(p);}, Abacus.Arithmetic.I, args);
    return RationalFunc(polygcd(array(args.length, function(i){return args[i].num.mul(denom.div(args[i].den));})), denom);
}
function rfxgcd(/* args */)
{
    // xgcd of Rational Functions
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        denom;
    if (!args.length) return;
    denom = operate(function(p, r){return r.den.mul(p);}, Abacus.Arithmetic.I, args);
    return polyxgcd(array(args.length, function(i){return args[i].num.mul(denom.div(args[i].den));})).map(function(g, i){return 0===i ? RationalFunc(g, denom) : RationalFunc(g);});
}
function rflcm(/* args */)
{
    // lcm of Rational Functions
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        denom;
    denom = operate(function(p, r){return r.den.mul(p);}, Abacus.Arithmetic.I, args);
    return RationalFunc(polylcm(array(args.length, function(i){return args[i].num.mul(denom.div(args[i].den));})), denom);
}
function divisors(n, as_generator)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        list = null, D2 = null, D1 = null, L1 = 0, L2 = 0, node, sqrn, i, n_i, next, factors, INT = null;

    if (is_instance(n, Integer)) { INT = n[CLASS]; n = n.num; }

    n = Arithmetic.abs(n);
    if (true===as_generator)
    {
        if (Arithmetic.gte(n, 10000))
        {
            // for very large numbers,
            // compute divisors through prime factorisation
            // using a tensor combinatorial iterator/generator
            factors = factorize(n);
            return Tensor(factors.map(function(factor){
                return Arithmetic.val(factor[1])+1;
            })).mapTo(function(selection){
                var d = selection.reduce(function(divisor, e, i){
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
            return Iterator(function(k, dir, state, first){
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
                while (Arithmetic.lte(i,sqrn))
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
                    node = new Node(i, D1, null); L1++;
                    if (D1) D1.r = node;
                    D1 = node;
                }
                else
                {
                    // two distinct divisors, add to small list (after current) and add to large list (before current)
                    node = new Node(i, D1, null); L1++;
                    if (D1) D1.r = node;
                    D1 = node;
                    node = new Node(n_i, null, D2); L2++;
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
        return array(L1+L2, function(){
            var curr = list, divisor = curr.v; // get current list item
            list = curr.r; // shift list to next item in order from left to right
            curr.dispose(); // dispose previous list item
            if (list) list.l = null;
            return INT ? new INT(divisor) : divisor;
        });
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
    for (i=0; i<m; i++)
        if (Arithmetic.lt(I, p[i][1]))
            return O; // is not square-free
    return m & 1 ? I : Arithmetic.J;
}
function dotp(a, b, Arithmetic)
{
    Arithmetic = Arithmetic || Abacus.DefaultArithmetic;
    var c = Arithmetic.O, n = stdMath.min(a.length, b.length), i;
    for (i=0; i<n; i++)
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
        for (i=0; i<n; i++)
        {
            vi = v[i]; u[i] = ui = vi.slice();
            kl = ui.length;
            for (j=0; j<i; j++)
            {
                uj = u[j]; pij = dotp(/*0===j?*/vi/*:u[j-1]*//*modified g-s*/, uj, Arithmetic);
                for (k=0; k<kl; k++) ui[k] = pjj[j].mul(ui[k]).sub(pij.mul(uj[k]));
            }
            g = igcd(ui);
            if (g.gt(Arithmetic.I))
                for (k=0; k<kl; k++) ui[k] = ui[k].div(g);
            pjj[i] = dotp(ui, ui, Arithmetic);
        }
    }
    else
    {
        igcd = gcd;
        for (i=0; i<n; i++)
        {
            vi = v[i]; u[i] = ui = vi.slice();
            kl = ui.length;
            for (j=0; j<i; j++)
            {
                uj = u[j]; pij = dotp(/*0===j?*/vi/*:u[j-1]*//*modified g-s*/, uj, Arithmetic);
                for (k=0; k<kl; k++) ui[k] = Arithmetic.sub(Arithmetic.mul(pjj[j], ui[k]), Arithmetic.mul(pij, uj[k]));
            }
            g = igcd(ui);
            if (Arithmetic.gt(g, Arithmetic.I))
                for (k=0; k<kl; k++) ui[k] = Arithmetic.div(ui[k], g);
            pjj[i] = dotp(ui, ui, Arithmetic);
        }
    }
    return u;
}
function indexOf(item, set)
{
    var i, l = set.length, eq;
    if (!l) return -1;
    eq = is_instance(item, INumber) ? function(it, si){return it.equ(si);} : function(it, si){return it===si;};
    for (i=0; i<l; i++)
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

    Basis = Basis.map(function(b){return b.monic();});
    if (1 < Basis.length)
    {
        PolynomialClass = Basis[0][CLASS];

        // Build a Groebner basis using Buchberger's algorithm.
        pairs = Combination(Basis.length, 2).mapTo(function(i){return [Basis[i[0]], Basis[i[1]]];});
        while (true)
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
            pairs = 1 === extraBasis.length ? Tensor(Basis.length, extraBasis.length).mapTo(function(i){return [Basis[i[0]], extraBasis[i[1]]];}) : CombinatorialIterator([
                Tensor(Basis.length, extraBasis.length).mapTo(function(i){return [Basis[i[0]], extraBasis[i[1]]];}),
                Combination(extraBasis.length, 2).mapTo(function(i){return [extraBasis[i[0]], extraBasis[i[1]]];})
            ]);
            Basis = Basis.concat(extraBasis);
        }

        // Minimize it.
        lts = Basis.map(function(g){return g.ltm(true);});
        while (lts.length)
        {
            found = false;
            for (i=0,n=lts.length; i<n; i++)
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
        for (i=0,n=Basis.length; i<n; i++)
        {
            g = Basis[i];
            others = Basis.slice(0,i).concat(Basis.slice(i+1));
            if (others.length) Basis[i] = g.multimod(others);
        }

        // Sort it.
        Basis = Basis.sort(function(a, b){
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
    if (Arithmetic.gt(O, a[1])) { a[0] = Arithmetic.neg(a[0]); a[1] = Arithmetic.neg(a[1]); }
    x0 = [a[1], Arithmetic.neg(a[0])];

    return [
    // general solution = any particular solution of non-homogeneous + general solution of homogeneous
    Expr(xp[0], MulTerm(SymbolTerm(param), x0[0])),
    Expr(xp[1], MulTerm(SymbolTerm(param), x0[1]))
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
    a = a.filter(function(ai, i){
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
        solutions = Arithmetic.equ(O, b) ? array(ok, function(i){
            var param = symbol+'_'+(++index);
            free_vars.push(param);
            return Expr(MulTerm(SymbolTerm(param)));
        }) /* infinite */ : null /* none */;
    }

    else if (1 === k)
    {
        // equation of 1 variable has infinite (if other zero variables) or only 1 (if only 1 variable) or 0 solutions
        index = 0;
        solutions = Arithmetic.equ(O, Arithmetic.mod(b, a[0])) ? array(ok, function(i){
            var param;
            if ((1 < ok) && i!==pos[0])
            {
                param = symbol+'_'+(++index);
                free_vars.push(param);
            }
            return i===pos[0] ? Expr(Arithmetic.div(b, a[0])) : Expr(MulTerm(SymbolTerm(param)));
        }) /* one/infinite */: null /* none */
    }

    else if (2 === k)
    {
        // equation with only 2 (non-zero) variables
        sol2 = solvedioph2(a, b, symbol+'_1');
        p = 0; index = 0;
        if (sol2) free_vars.push(symbol+'_1');
        solutions = null == sol2 ? null : array(ok, function(i){
            var param;
            if (p < pos.length && i === pos[p])
            {
                p++;
                return sol2[p-1];
            }
            else
            {
                param = symbol+'_'+(pos.length+(index++));
                free_vars.push(param);
                return Expr(MulTerm(SymbolTerm(param)));
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
        for (i=k-3; i>0; i--)
        {
            d = gcd(ab[0], a[i]);
            ab[0] = Arithmetic.div(ab[0], d);
            a[i] = Arithmetic.div(a[i], d);
            ab.unshift(d);
        }
        ab.push(a[k-1]);

        solutions = [];
        parameters = array(k, function(i){ return symbol+'_'+(i+1); });
        b = Expr(b);
        for (i=0,l=ab.length; i<l; i++)
        {
            tot_x = []; tot_y = [];
            symbols = b.symbols();
            for (j=0,m=symbols.length; j<m; j++)
            {
                n = b.terms[symbols[j]].c().real().num; // expressions/terms use complex numbers by default
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
                    sol2[0] = Expr(MulTerm(SymbolTerm(p), sol2[0].c()), sol2[0].terms[pnew]);
                    sol2[1] = Expr(MulTerm(SymbolTerm(p), sol2[1].c()), sol2[1].terms[pnew]);
                }
                if (-1 === free_vars.indexOf(pnew)) free_vars.push(pnew);

                tot_x.push(sol2[0]); tot_y.push(sol2[1]);
            }
            solutions.push(Expr(tot_x));
            b = Expr(tot_y);
        }
        solutions.push(b);

        p = 0; index = 0;
        solutions = array(ok, function(i){
            var param;
            if (p < pos.length && i === pos[p])
            {
                p++;
                return solutions[p-1];
            }
            else
            {
                param = symbol+'_'+(pos.length+(index++));
                free_vars.push(param);
                return Expr(MulTerm(SymbolTerm(param)));
            }
        });
    }

    solutions = null==solutions ? null : (false===with_param ? solutions.map(function(x){
        // return particular solution (as number), not general (as expression)
        return x.c().real().num; // expressions/terms use complex numbers by default
    }) : solutions);
    free_vars.symbol = symbol;
    return null==solutions ? null : (true===with_free_vars ? [solutions, free_vars] : solutions);
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
    if (m > b.length) b = b.concat(array(m-b.length, function(i){return O;}));
    // A*X = B <=> iref(A.t|I) = R|T <=> iif R.t*P = B has int solutions P => X = T.t*P
    tmp = a.t()/*.concat(Matrix.I(ring, k))*/.ref(true/*, [k, m]*/);
    ref = tmp[0]; aug = tmp[3]; pivots = tmp[1]; rank = pivots.length;
    Tt = aug/*ref.slice(0,m,-1,-1)*/.t(); Rt = ref/*ref.slice(0,0,k-1,m-1)*/.t();
    p = new Array(k); free_vars = new Array(k-rank);

    // R.t*P can be easily solved by substitution
    for (i=0; i<k; i++)
    {
        if (i >= rank)
        {
            free_vars[i-rank] = symbol+'_'+(i-rank+1);
            p[i] = Expr(MulTerm(SymbolTerm(free_vars[i-rank]), I)); // free variable
        }
        else
        {
            for (t=O,j=0; j<i; j++) t = t.add(Rt.val[i][j].mul(p[j].c().real().num)); // expressions/terms use complex numbers by default
            p[i] = b[i].sub(t);
            if (Rt.val[i][i].equ(O))
            {
                if (p[i].equ(O)) p[i] = Expr(MulTerm(SymbolTerm(symbol+'_'+(i+1)), I)); // free variable
                else return null; // no integer solution
            }
            else if (Rt.val[i][i].divides(p[i]))
            {
                p[i] = Expr(p[i].div(Rt.val[i][i]));
            }
            else
            {
                // no integer solution
                return null;
            }
        }
    }
    // X = T.t*P
    solutions = array(k, function(i){
        return Expr(array(k, function(j){
            return p[j].mul(Tt.val[i][j]);
        }));
    });

    // if over-determined system (m > k)
    // check if additional rows are satisfied by solution as well
    for (i=k; i<m; i++)
        if (!Expr(solutions.map(function(xj){return xj.mul(a.val[i][j]);})).equ(b[i]))
            return null; // no solution

    solutions = null==solutions ? null : (false===with_param ? solutions.map(function(x){
        // return particular solution (as number), not general (as expression)
        return x.c().real().num; // expressions/terms use complex numbers by default
    }) : solutions);
    free_vars.symbol = symbol;
    return null==solutions ? null : (true===with_free_vars ? [solutions, free_vars] : solutions);
}
function solvecongr(a, b, m, with_param, with_free_vars)
{
    // solve linear congruence using the associated linear diophantine equation
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, solution, free_vars;
    if (!a.length) return null;
    with_free_vars = (true===with_free_vars);
    solution = solvedioph(a.concat(m), b, with_param, with_free_vars);
    if (solution && with_free_vars)
    {
        free_vars = solution[1];
        // skip last variable
        //free_vars.pop();
        solution = solution[0];
    }
    // skip last variable
    solution = null==solution ? null : array(solution.length-1, function(i){
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
            if (x.c().real().lt(O)) // expressions/terms use complex numbers by default
                x = x.add(m);
        }
        return x;
    });

    return null==solution ? null : (with_free_vars ? [solution, free_vars] : solution);
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
        m = array(a.nr, function(i){return m;});
    }
    if (is_array(m) || is_args(m)) m = Matrix(ring, m);
    if (is_array(b) || is_args(b)) b = Matrix(ring, b);
    // convert to equivalent system of congruences but with single modulus = LCM(m[1..n])
    // http://www.math.harvard.edu/~knill/preprints/linear.pdf
    mc = m.col(0); M = ring.lcm(mc);
    a = a.concat(m);
    with_free_vars = (true===with_free_vars);
    solution = solvediophs(a, b, with_param, true);
    if (null != solution)
    {
        free_vars = solution[1];
        // skip last variable
        //free_vars.pop();
        solution = solution[0];
    }
    // skip last variable
    solution = null==solution ? null : array(solution.length-1, function(i){
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
            // expressions/terms use complex numbers by default
            for (t in x.terms)
            {
                if (!HAS.call(x.terms, t) || ('1' === t)) continue;
                if (Arithmetic.equ(Arithmetic.O, Arithmetic.mod(M.num, x.terms[t].c().real().num)))
                {
                    add_M = false;
                    break;
                }
            }
            if (add_M)
            {
                param = free_vars.symbol+'_'+(free_vars.length+1);
                free_vars.push(param);
                x = x.add(MulTerm(SymbolTerm(param), M))
            }
            if (x.c().real().lt(O))
                x = x.add(M);
        }
        return x;
    });

    return null==solution ? null : (with_free_vars ? [solution, free_vars] : solution);
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
    if (true===x) return bp.col(0); // least squares solution
    else if (!a.mul(bp).equ(b)) return null; // no solutions exist
    if (false===x)
    {
        // particular solution
        return bp.col(0);
    }
    else
    {
        // general solution(s)
        ns = Matrix.I(a.ring, bp.nr).sub(apinv.mul(a));
        if (is_string(x)) x = array(ns.nc, function(i){return x+'_'+(i+1);});
        else if (is_array(x) && ns.nc>x.length) x = x.concat(array(ns.nc-x.length, function(i){return x[x.length-1].split('_')[0]+'_'+(x.length+i+1);}));
        return array(bp.nr, function(i){
            return Expr(array(ns.nc, function(j){
                return MulTerm(SymbolTerm(x[j]), ns.val[i][j]);
            })).add(bp.val[i][0]);
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
    if (!a.nr || !a.nc || a.ring !== Ring.Q()) return null;
    b = Matrix(a.ring, b).col(0);
    k = a.nc; m = a.nr;

    if (!x) x = 'x';
    if (is_string(x)) x = array(k, function(i){return x+'_'+(i+1);});
    else if (is_array(x) && k>x.length) x = x.concat(array(k-x.length, function(i){return x[x.length-1].split('_')[0]+'_'+(x.length+i+1);}));

    rel0 = array(m, function(j){
        return RelOp.LTE(Expr(a.row(j).map(function(v, i){return MulTerm(SymbolTerm(x[i]), v);})), Expr(b[j]));
    });

    sol = [];
    rel = rel0.slice();
    for (i=k-1; i>=0; i--)
    {
        p = []; n = [], z = [];
        rel.forEach(function(s){
            var f = s.lhs.term(x[i]).c().sub(s.rhs.term(x[i]).c()),
                e = s.rhs.sub(s.rhs.term(x[i])).sub(s.lhs.sub(s.lhs.term(x[i])));
            if (f.gt(0)) p.push(e.div(f));
            else if (f.lt(0)) n.push(e.div(f));
            else z.push(e);
        });
        if (!p.length || !n.length)
        {
            l = z.length;
            rel = new Array(l);
            for (j=0; j<l; j++)
            {
                if (z[j].isConst() && z[j].lt(0)) return null; // no solution
                rel[j] = RelOp.LTE(Expr(), z[j]);
            }
            if (p.length || n.length)
            {
                sol.unshift(p.length ? [RelOp.LTE(Expr(SymbolTerm(x[i])), Func.MIN(p))] : (n.length ? [RelOp.LTE(Func.MAX(n), Expr(SymbolTerm(x[i])))] : []));
            }
        }
        else
        {
            l = p.length*n.length+z.length;
            rel = new Array(l);
            for (j=0; j<l; j++)
            {
                if (j < z.length)
                {
                    if (z[j].isConst() && z[j].lt(0)) return null; // no solution
                    rel[j] = RelOp.LTE(Expr(), z[j]);
                }
                /*else if (!p.length)
                {
                    rel[j] = RelOp.LTE(n[j-z.length], Expr(SymbolTerm(x[i])));
                }
                else if (!n.length)
                {
                    rel[j] = RelOp.LTE(Expr(SymbolTerm(x[i])), p[j-z.length]);
                }*/
                else
                {
                    pi = stdMath.floor((j-z.length)/n.length);
                    ni = (j-z.length) % n.length;
                    if (p[pi].isConst() && n[ni].isConst() && p[pi].lt(n[ni])) return null; // no solution
                    rel[j] = RelOp.LTE(n[ni], p[pi]);
                }
            }
            sol.unshift([
                RelOp.LTE(Func.MAX(n), Expr(SymbolTerm(x[i]))),
                RelOp.LTE(Expr(SymbolTerm(x[i])), Func.MIN(p))
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
    pos = a.filter(function(ai){return 1 === sign(ai);}).length;
    neg = a.filter(function(ai){return -1 === sign(ai);}).length;
    //z = k-pos-neg;

    if ((1===k) || (0===pos) || (0===neg))
        // trivial solution: sum of (same sign) integer squares to be zero, all terms have to be zero
        return array(k, function(){return Expr(); /* zero */});

    s = array(k, function(i){return isqrt(Arithmetic.abs(a[i]));});

    if (k !== a.filter(function(ai,i){return Arithmetic.equ(Arithmetic.abs(ai), Arithmetic.mul(s[i], s[i]));}).length)
        // no general solution in integers, coefficients are not perfect squares, return trivial solution
        return array(k, function(){return Expr(); /* zero */});

    param = array(k-1, function(i){return symbol+'_'+(i+1);});

    if (2 === k)
        // different sign, parametrised solution:
        // a1^2 x1^2 = a2^2 x2^2 ==> x1 = a2*i_1, x2 = a1*i_1
        return [
            Expr(MulTerm(SymbolTerm(param[0]), s[1])),
            Expr(MulTerm(SymbolTerm(param[0]), s[0]))
        ];

    // k >= 3
    if (0 > sign(a[0])+sign(a[1])+sign(a[2]))
        a = a.map(function(ai){return Arithmetic.neg(ai); });

    index = 0;
    for (i=0; i<k; i++)
        if (-1 === sign(a[i]))
            index = i; // find last negative coefficient, to be solved with respect to that

    ith = Expr(array(param.length, function(i){return MulTerm(param[i]+'^2');}));
    L = [
        Expr([ith, MulTerm(param[k-2]+'^2', Arithmetic.mul(J, two))])
    ].concat(array(k-2, function(i){
        return Expr(MulTerm(param[i]+'*'+param[k-2], two));
    }));
    solutions = L.slice(0, index).concat(ith).concat(L.slice(index));

    ilcm = I;
    for (i=0; i<k; i++)
    {
        if (i === index || (index > 0 && i === 0) || (index === 0 && i === 1))
            ilcm = lcm(ilcm, s[i]);
        else
            ilcm = lcm(ilcm, Arithmetic.equ(O, Arithmetic.mod(s[i], two)) ? Arithmetic.div(s[i], two) : s[i]);
    }
    for (i=0; i<k; i++)
    {
        sol = solutions[i];
        solutions[i] = solutions[i].mul(Arithmetic.div(ilcm, s[i]));
        // has a remainder, since it is always a multiple of 2, add 1 only
        if (!Arithmetic.equ(O, Arithmetic.mod(ilcm, s[i])))
            solutions[i] = solutions[i].add(sol.div(two));
    }
    return solutions;
}
function subset_lex_rank(n, x, y)
{
    var Arithmetic = Abacus.Arithmetic, add = Arithmetic.add,
        O = Arithmetic.O, I = Arithmetic.I,
        k, j, index = O, key;
    key = String(n)+','+String(x)+','+String(null == y ? null : x-y);
    if (null == subset_lex_rank.mem[key])
    {
        if (null == y)
        {
            for (k = I,j = 0; j < x; j++) k = add(k, pow2(n-j-1));
            index = add(index, k);
            subset_lex_rank.mem[key] = index;
        }
        else
        {
            if (x === y+1)
            {
                index = add(index, I);
                subset_lex_rank.mem[key] = index;
            }
            else if (x > y+1)
            {
                for (k = I,j = y+1; j < x; j++) k = add(k, pow2(n-j-1));
                index = add(index, k);
                subset_lex_rank.mem[key] = index;
            }
        }
    }
    else
    {
        index = subset_lex_rank.mem[key];
    }
    return index;
}
subset_lex_rank.mem = Obj();
function subset_bin_rank(n, x, y)
{
    var Arithmetic = Abacus.Arithmetic;
    return n > x && 0 <= x ? Arithmetic.shl(Arithmetic.I, x) : Arithmetic.O;
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
        factors = primes.slice(e, g).concat(primes.slice(s, d).filter(function(p){return Arithmetic.equ(I, Arithmetic.mod(Arithmetic.div(m, p), two));}));
        for (i=1; i<s; i++)
        {
            prime = primes[i]; // prime in primes[1:s]
            p = I; q = m;
            while (true)
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
    bits = Arithmetic.sub(n, Arithmetic.digits(n, 2).split('').reduce(function(s, d){return Arithmetic.add(s, '1'===d?I:O);}, O));
    sieve = PrimeSieve();
    primes = sieve.get(function(p){return Arithmetic.lte(p, n);});
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
        key = '!'+String(n);
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
        key = 'I'+String(n);
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
            res = operate(function(N, mk){return add(N, mk);}, O, m);
            if (Arithmetic.equ(res, O)) return n;
            else if (Arithmetic.gt(res, n)) return O;
            key = String(n)+'@'+mergesort(m.map(String),1,true).join(',')+'@';
            if (null == factorial.mem3[key])
            {
                i = sub(res, I); res = I;
                while (Arithmetic.gte(i, O))
                {
                    res = mul(res, sub(n, i));
                    i = sub(i, I);
                }
                res = operate(function(N, mk){return div(N, factorial(mk));}, res, m);
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
            key = String(n)+'@'+mergesort(m.map(String),1,true).join(',');
            if (null == factorial.mem3[key])
            {
                res = operate(function(N, mk){return div(N, factorial(mk));}, factorial(n), m);
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
            key = String(n)+'@'+String(m);
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
            key = String(n)+'@'+String(m);
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
                    res = stdMath.round(operate(function(Cnm,i){
                        // this is faster and will not overflow unnecesarily for default arithmetic
                        return Cnm*(1+n/i);
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
function derange_k_of_n(n, k)
{
    // https://math.stackexchange.com/questions/4192567/count-permutations-where-some-items-should-be-deranged-while-rest-can-be-placed
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
        NUM = Arithmetic.num, add = Arithmetic.add,
        sub = Arithmetic.sub, mul = Arithmetic.mul,
        key, res, i, f, nk, MAXMEM = Abacus.Options.MAXMEM;

    if (is_instance(n, Integer)) return new n[CLASS](derange_k_of_n(n.num, k));

    n = NUM(n);
    k = is_instance(k, Integer) ? k.num : NUM(k);
    if (Arithmetic.lt(n, O) || Arithmetic.lt(k, O) || Arithmetic.gt(k, n)) return O;
    if (Arithmetic.equ(k, O)) return factorial(n);
    if (Arithmetic.equ(k, n)) return factorial(n, false);
    key = String(n)+','+String(k);
    if (null == derange_k_of_n.mem[key])
    {
        res = O;
        nk = sub(n, k);
        if (Arithmetic.lt(nk, k))
        {
            // \sum\limits_{i=0}^{n-k} {{n-k} \choose i} \ !(k+i)
            for (i=O; Arithmetic.lte(i, nk); i=add(i, I))
            {
                res = add(res, mul(factorial(nk, i), factorial(add(k, i), false)));
            }
        }
        else
        {
            // \sum\limits_{i=0}^k\binom{k}{i}(-1)^i(n-i)!
            for (f=I,i=O; Arithmetic.lte(i, k); i=add(i, I))
            {
                res = add(res, mul(f, mul(factorial(k, i), factorial(sub(n, i)))));
                f = Arithmetic.neg(f);
            }
        }

        // memoize only up to MAXMEM results
        if (Arithmetic.lt(n, MAXMEM))
            derange_k_of_n.mem[key] = res;
    }
    else
    {
        res = derange_k_of_n.mem[key];
    }
    return res;
}
derange_k_of_n.mem = Obj();
function derange_rank(n, y, i, k, unvisited/*indexOf*/)
{
    var Arithmetic = Abacus.Arithmetic, count = Arithmetic.O, x;
    /*for (x=0; x<y; x++)
    {
        if ((i === x) || (0 <= indexOf[x] && indexOf[x] < i)) continue;
        count = Arithmetic.add(count, derange_k_of_n(n-i-1, k+(y>i && x<i)));
    }*/
    for (x=unvisited.first(); x && (x.index<y); x=x.next)
    {
        if (i === x.index) continue;
        count = Arithmetic.add(count, derange_k_of_n(n-i-1, k+(y>i && x.index<i)));
    }
    return count;
}
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
        key = String(n)+','+String(k);
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
        key = String(n)+','+String(k);
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
        key = String(n)+','+String(k)+'-';
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
function p_nkab(n, k, a, b)
{
    // recursively compute the partition count using the recursive relation:
    // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
    // http://www.programminglogic.com/integer-partition-algorithm/
    // compute number of integer partitions of n
    // into exactly k parts having summands between a and b (inclusive)
    // k*a <= n <= k*b
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        p = O, key, j0, j1;

    if (
        Arithmetic.lt(n, O)
        || Arithmetic.lte(k, O)
        || Arithmetic.lte(a, O)
        || Arithmetic.gt(a, b)
        || Arithmetic.gt(mul(k, a), n)
        || Arithmetic.lt(mul(k, b), n)
    ) return p;

    if (Arithmetic.gt(a, I)) {n = sub(n, mul(k, sub(a, I))); b = add(sub(b, a), I); a = I;}

    //if ((Arithmetic.equ(b, n) && Arithmetic.equ(k, I)) || (Arithmetic.equ(k, n) && Arithmetic.equ(b, I))) return I;
    if (Arithmetic.equ(k, I)) return Arithmetic.lte(a, n) && Arithmetic.lte(n, b) ? I : p;
    if (Arithmetic.equ(n, k)) return Arithmetic.lte(a, I) && Arithmetic.gte(b, I) ? I : p;
    if (Arithmetic.equ(a, b)) return Arithmetic.equ(mul(k, a), n) ? I : p;
    if (Arithmetic.equ(add(a, I), b)) return Arithmetic.lte(sub(n, mul(k, a)), k) ? I : p;

    key = String(n)+','+String(k)+','+String(a)+','+String(b);
    if (null == p_nkab.mem[key])
    {
        // compute it directly
        j0 = Arithmetic.max(I, Arithmetic.divceil(n, k));
        k = sub(k, I);
        j1 = Arithmetic.min(b, sub(n, k));
        while (Arithmetic.lte(j0, j1))
        {
            p = add(p, p_nkab(sub(n, j0), k, I, j0));
            j0 = add(j0, I);
        }
        p_nkab.mem[key] = p;
    }
    return p_nkab.mem[key];
}
p_nkab.mem = Obj();
function part_rank(n, limit, min, max, k)
{
    if (is_instance(n, Integer)) return new n[CLASS](part_rank(n.num, limit, min, max, k));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, p = O, key,
        add = Arithmetic.add, sub = Arithmetic.sub, div = Arithmetic.div, mod = Arithmetic.mod;

    if (is_instance(limit, Integer)) limit = limit.num;
    if (is_instance(min, Integer)) min = min.num;
    //if (is_instance(max, Integer)) max = max.num;
    key = String(n)+','+String(limit)+','+String(min)/*+','+String(max)*/+','+String(k);
    if (null == part_rank.mem[key])
    {
        n = N(n);
        limit = sub(N(limit), I);
        //max = null == max ? n : N(max);
        min = null == min ? I : N(min);

        if (null == k)
        {
            k = I;
            while (Arithmetic.lte(k, n))
            {
                p = add(p, p_nkab(n, k, min, limit));
                k = add(k, I);
            }
        }
        else
        {
            p = p_nkab(n, N(k), min, limit);
        }
        part_rank.mem[key] = p;
    }
    return part_rank.mem[key];
}
part_rank.mem = Obj();
function partitions(n, K /*exactly K parts or null*/, M /*max part is M or null*/, W /*min part is W or null*/)
{
    if (is_instance(n, Integer)) return new n[CLASS](partitions(n.num, K, M, W));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul, mod = Arithmetic.mod,
        k0, k1, p = O, k, w, m, key;

    if (is_instance(K, Integer)) K = K.num;
    if (is_instance(M, Integer)) M = M.num;
    if (is_instance(W, Integer)) W = W.num;
    K = null == K ? null : Arithmetic.abs(N(K));
    M = null == M ? null : Arithmetic.abs(N(M));
    W = null == W ? null : Arithmetic.abs(N(W));
    n = N(n);
    k0 = null!=K ? K : I;
    k1 = null!=K ? K : n;
    w = null!=W ? W : I;
    m = null!=M ? M : n;

    if (Arithmetic.equ(n, O))
        return (null == K || Arithmetic.gt(K, O)) && (null == M || Arithmetic.equ(M, O)) && (null == W || Arithmetic.equ(W, O)) ? I : O;
    if (
        Arithmetic.lt(n, O)
        || (null!=K && null!=M && null!=W && (Arithmetic.gte(O, K) || Arithmetic.gte(O, W) || Arithmetic.gte(O, M) || Arithmetic.gt(W, M) || Arithmetic.gt(add(mul(K, W), M), add(n, W)) || Arithmetic.lt(add(mul(K, M), W), add(n, M))))
        || (null!=M && null!=W && (Arithmetic.gte(O, W) || Arithmetic.gte(O, M) || Arithmetic.gt(W, M) || Arithmetic.gt(M, n) || Arithmetic.gt(W, n) || (Arithmetic.equ(M, W) && !Arithmetic.equ(O, mod(n, M))) || (!Arithmetic.equ(M, W) && (Arithmetic.gt(add(M, W), n) || (Arithmetic.lt(add(M, W), n) && Arithmetic.lt(sub(n, add(M, W)), W))))))
        || (null!=K && null!=W && (Arithmetic.gte(O, K) || Arithmetic.gte(O, W) || Arithmetic.gt(mul(K, W), n)))
        || (null!=K && null!=M && (Arithmetic.gte(O, K) || Arithmetic.gte(O, M) || Arithmetic.gt(add(K, M), add(n, I)) || Arithmetic.lt(mul(K, M), n)))
        || (null!=M && (Arithmetic.gte(O, M) || Arithmetic.gt(M, n)))
        || (null!=W && (Arithmetic.gte(O, W) || Arithmetic.gt(W, n) || (Arithmetic.lt(W, n) && Arithmetic.gt(add(W, W), n))))
        || (null!=K && (Arithmetic.gte(O, K) || Arithmetic.gt(K, n)))
    ) return p;

    if (null != M && null == K && null == W) {m = n; k0 = M; k1 = M; K = M; M = null;} // count the conjugates, same

    key = String(n)+'|'+String(K)+'|'+String(M)+'|'+String(W);
    if (null == partitions.mem[key])
    {
        if (null != M && null != W)
        {
            n = Arithmetic.equ(M, W) ? sub(n, M) : sub(n, add(M, W));
            if (Arithmetic.equ(O, n) && (null == K || Arithmetic.equ(k0, Arithmetic.equ(M, W) ? I : two))) return I;
            if (null != K)
            {
                k1 = sub(k1, two);
                k0 = sub(k0, two);
            }
        }
        else if (null != W)
        {
            n = sub(n, W);
            if (Arithmetic.equ(O, n) && (null == K || Arithmetic.equ(k0, I))) return I;
            if (null != K)
            {
                k1 = sub(k1, I);
                k0 = sub(k0, I);
            }
        }
        else if (null != M)
        {
            n = sub(n, M);
            if (Arithmetic.equ(O, n) && (null == K || Arithmetic.equ(k0, I))) return I;
            if (null != K)
            {
                k1 = sub(k1, I);
                k0 = sub(k0, I);
            }
        }
        k = k0;
        while (Arithmetic.lte(k, k1))
        {
            p = add(p, p_nkab(n, k, w, m));
            k = add(k, I);
        }
        partitions.mem[key] = p;
    }
    return partitions.mem[key];
}
partitions.mem = Obj();
function c_nkab(n, k, a, b)
{
    // recursively compute the composition count using the recursive relation:
    // CLOSED FORM FORMULA FOR THE NUMBER OF RESTRICTED COMPOSITIONS (http://www.fmf.uni-lj.si/~jaklicg/papers/compositions_revision.pdf)
    // compute number of integer compositions of n
    // into exactly k parts having summands between a and b (inclusive)
    var Arithmetic = Abacus.Arithmetic,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        O = Arithmetic.O, I = Arithmetic.I, c = O, m, m1, key;
    if (
        Arithmetic.lt(n, O)
        || Arithmetic.lte(k, O)
        || Arithmetic.lte(a, O)
        || Arithmetic.gt(a, b)
        || Arithmetic.gt(mul(k, a), n)
        || Arithmetic.lt(mul(k, b), n)
    ) return c;

    if (Arithmetic.gt(a, I)) {n = sub(n, mul(k, sub(a, I))); b = add(sub(b, a), I); a = I;}

    if (Arithmetic.equ(k, I)) return Arithmetic.lte(a, n) && Arithmetic.gte(b, n) ? I : c;
    if (Arithmetic.equ(n, k)) return Arithmetic.lte(a, I) && Arithmetic.gte(b, I) ? I : c;
    if (Arithmetic.equ(a, b)) return Arithmetic.equ(mul(k, a), n) ? I : c;
    if (Arithmetic.equ(n, b)) return factorial(add(sub(n, mul(k, a)), sub(k, I)), sub(k, I));
    if (Arithmetic.equ(add(a, I), b)) return factorial(k, sub(n, mul(k, a)));

    key = String(n)+','+String(k)+','+String(a)+','+String(b);
    if (null == c_nkab.mem[key])
    {
        // compute it directly
        m1 = sub(n, a);
        m = Arithmetic.max(I, sub(n, b));
        k = sub(k, I);
        while (Arithmetic.lte(m, m1))
        {
            c = add(c, c_nkab(m, k, a, b));
            m = add(m, I);
        }
        c_nkab.mem[key] = c;
    }
    return c_nkab.mem[key];
}
c_nkab.mem = Obj();
function comp_rank(n, limit, min, max, k, nmin, nmax)
{
    if (is_instance(n, Integer)) return new n[CLASS](comp_rank(n.num, limit, min, max, k, nmin, nmax));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II, c = O, key,
        W, M, i, j, nn, mm, nm, m, w, l, r, k0, kk,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        div = Arithmetic.div, divceil = Arithmetic.divceil, mod = Arithmetic.mod;

    if (is_instance(limit, Integer)) limit = limit.num;
    if (is_instance(min, Integer)) min = min.num;
    if (is_instance(max, Integer)) max = max.num;
    key = String(n)+','+String(limit)+','+String(min)+','+String(max)+','+String(k)+','+String(0<nmin)+','+String(0<nmax);
    if (null == comp_rank.mem[key])
    {
        n = N(n);
        limit = N(limit);
        M = null == max ? n : N(max);
        W = null == min ? I : N(min);

        if (null == min && null == max)
        {
            Arithmetic.gt(n, I) ? pow2(sub(n, I)) : I
            if (null == k)
            {
                mm = W;
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    c = add(c, Arithmetic.gte(nn, I) ? pow2(sub(nn, I)) : O);
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I);
                while (Arithmetic.lt(mm, limit))
                {
                    c = add(c, c_nkab(sub(n, mm), k, W, M));
                    mm = add(mm, I);
                }
            }
        }
        else if (
            (0 < nmin && 0 < nmax)
            || (0 < nmin && null == max)
            || (0 < nmax && null == min)
        )
        {
            if (null == k)
            {
                mm = W;
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm); k = I;
                    while (Arithmetic.lte(k, nn))
                    {
                        c = add(c, c_nkab(nn, k, W, M));
                        k = add(k, I);
                    }
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I);
                while (Arithmetic.lt(mm, limit))
                {
                    c = add(c, c_nkab(sub(n, mm), k, W, M));
                    mm = add(mm, I);
                }
            }
        }
        else if (null != max && (0 < nmin || null == min))
        {
            if (null == k)
            {
                mm = W; m = sub(M, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(M, nn))
                    {
                        c = add(c, I);
                    }
                    else
                    {

                        if (Arithmetic.equ(O, mod(nn, M))) c = add(c, I);
                        j = I; nm = M;
                        while (Arithmetic.lte(nm, nn))
                        {
                            i = I; k = sub(nn, nm);
                            while (Arithmetic.lte(i, k))
                            {
                                kk = c_nkab(k, i, W, m);
                                if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(i, j), j)));
                                i = add(i, I);
                            }
                            nm = add(nm, M); j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I); m = sub(M, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(mul(k, M), nn))
                    {
                        c = add(c, I);
                    }
                    else
                    {
                        j = I; nm = M;
                        while (Arithmetic.lte(nm, nn) && Arithmetic.lte(j, k))
                        {
                            kk = c_nkab(sub(nn, nm), sub(k, j), W, m);
                            if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(k, j)));
                            nm = add(nm, M); j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
        }
        else if (null != min && (0 < nmax || null == max))
        {
            if (null == k)
            {
                mm = W; w = add(W, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(W, nn))
                    {
                        c = add(c, I);
                    }
                    else
                    {
                        if (Arithmetic.equ(O, mod(nn, W))) c = add(c, I);
                        if (Arithmetic.equ(W, mm))
                        {
                            j = O;
                            nm = O;
                        }
                        else
                        {
                            j = I;
                            nm = W;
                        }
                        while (Arithmetic.lte(nm, nn))
                        {
                            i = I; l = sub(nn, nm); k = div(l, W);
                            while (Arithmetic.lte(i, k))
                            {
                                kk = c_nkab(l, i, w, M);
                                if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(i, j), j)));
                                i = add(i, I);
                            }
                            nm = add(nm, W); j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I); w = add(W, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(mul(k, W), nn))
                    {
                        c = add(c, I);
                    }
                    else
                    {
                        if (Arithmetic.equ(W, mm))
                        {
                            j = O;
                            nm = O;
                        }
                        else
                        {
                            j = I;
                            nm = W;
                        }
                        while (Arithmetic.lte(nm, nn) && Arithmetic.lte(j, k))
                        {
                            kk = c_nkab(sub(nn, nm), sub(k, j), w, M);
                            if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(k, j)));
                            nm = add(nm, W); j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
        }
        else
        {
            if (null == k)
            {
                mm = W; l = add(W, I); r = sub(M, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(M, W))
                    {
                        c = add(c, Arithmetic.equ(O, mod(nn, M)) ? I : O);
                    }
                    else
                    {
                        m = Arithmetic.max(I, div(nn, M));
                        w = Arithmetic.max(I, div(nn, W));
                        j = I;
                        while (Arithmetic.lte(j, m))
                        {
                            i = Arithmetic.equ(W, mm) ? O : I;
                            while (Arithmetic.lte(i, w))
                            {
                                nm = sub(nn, add(mul(j, M), mul(i, W)));
                                if (Arithmetic.equ(O, nm))
                                {
                                    c = add(c, factorial(add(j, i), [j, i]));
                                }
                                else if (Arithmetic.gt(nm, O))
                                {
                                    k0 = I; k = div(nm, W);
                                    while (Arithmetic.lte(k0, k))
                                    {
                                        kk = c_nkab(nm, k0, l, r);
                                        if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(k0, add(j, i)), [[j, i]])));
                                        k0 = add(k0, I);
                                    }
                                }
                                else
                                {
                                    break;
                                }
                                i = add(i, I);
                            }
                            j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I);
                l = add(W, I); r = sub(M, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(M, W))
                    {
                        c = add(c, Arithmetic.equ(mul(k, M), nn) ? I : O);
                    }
                    else
                    {
                        m = Arithmetic.max(I, div(nn, M));
                        w = Arithmetic.max(I, div(nn, W));
                        j = I;
                        while (Arithmetic.lte(j, m))
                        {
                            i = Arithmetic.equ(W, mm) ? O : I;
                            while (Arithmetic.lte(i, w))
                            {
                                k0 = sub(k, add(j, i));
                                nm = sub(nn, add(mul(j, M), mul(i, W)));
                                if (Arithmetic.equ(O, nm) && Arithmetic.equ(O, k0))
                                {
                                    c = add(c, factorial(k, [j, i]));
                                }
                                else if (Arithmetic.gt(k0, O) && Arithmetic.gt(nm, O))
                                {
                                    kk = c_nkab(nm, k0, l, r);
                                    if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(k, [[j, i]])));
                                }
                                else
                                {
                                    break;
                                }
                                i = add(i, I);
                            }
                            j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
        }
        comp_rank.mem[key] = c;
    }
    return comp_rank.mem[key];
}
comp_rank.mem = Obj();
function compositions(n, K /*exactly K parts or null*/, M /*max part is M or null*/, W /*min part is W or null*/)
{
    if (is_instance(n, Integer)) return new n[CLASS](compositions(n.num, K, M, W));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        add = Arithmetic.add, sub = Arithmetic.sub,
        mul = Arithmetic.mul, div = Arithmetic.div, mod = Arithmetic.mod,
        c = O, j, i, k, l, r, m, w, kk, k0, nm, mm, p, prod, key;

    if (is_instance(K, Integer)) K = K.num;
    if (is_instance(M, Integer)) M = M.num;
    if (is_instance(W, Integer)) W = W.num;
    K = null == K ? null : Arithmetic.abs(N(K));
    M = null == M ? null : Arithmetic.abs(N(M));
    W = null == W ? null : Arithmetic.abs(N(W));
    n = N(n);

    if (Arithmetic.equ(n, O))
        return (null == K || Arithmetic.gt(K, O)) && (null == M || Arithmetic.equ(M, O)) && (null == W || Arithmetic.equ(W, O)) ? I : O;
    if (
        Arithmetic.lt(n, O)
        || (null!=K && null!=M && null!=W && (Arithmetic.gte(O, K) || Arithmetic.gte(O, W) || Arithmetic.gte(O, M) || Arithmetic.gt(W, M) || Arithmetic.gt(add(mul(K, W), M), add(n, W)) || Arithmetic.lt(add(mul(K, M), W), add(n, M))))
        || (null!=M && null!=W && (Arithmetic.gte(O, W) || Arithmetic.gte(O, M) || Arithmetic.gt(W, M) || Arithmetic.gt(M, n) || Arithmetic.gt(W, n) || (Arithmetic.equ(M, W) && !Arithmetic.equ(O, mod(n, M))) || (!Arithmetic.equ(M, W) && (Arithmetic.gt(add(M, W), n) || (Arithmetic.lt(add(M, W), n) && Arithmetic.lt(sub(n, add(M, W)), W))))))
        || (null!=K && null!=W && (Arithmetic.gte(O, K) || Arithmetic.gte(O, W) || Arithmetic.gt(mul(K, W), n)))
        || (null!=K && null!=M && (Arithmetic.gte(O, K) || Arithmetic.gte(O, M) || Arithmetic.gt(add(K, M), add(n, I)) || Arithmetic.lt(mul(K, M), n)))
        || (null!=M && (Arithmetic.gte(O, M) || Arithmetic.gt(M, n)))
        || (null!=W && (Arithmetic.gte(O, W) || Arithmetic.gt(W, n) || (Arithmetic.lt(W, n) && Arithmetic.gt(add(W, W), n))))
        || (null!=K && (Arithmetic.gte(O, K) || Arithmetic.gt(K, n)))
    ) return c;

    key = String(n)+'|'+String(K)+'|'+String(M)+'|'+String(W);
    if (null == compositions.mem[key])
    {
        if (null != K && null != M && null != W)
        {
            if (Arithmetic.equ(M, W))
            {
                c = Arithmetic.equ(mul(K, M), n) ? I : O;
            }
            else
            {
                m = Arithmetic.max(I, div(n, M));
                w = Arithmetic.max(I, div(n, W));
                l = add(W, I); r = sub(M, I);
                j = I;
                while (Arithmetic.lte(j, m))
                {
                    i = I;
                    while (Arithmetic.lte(i, w))
                    {
                        k = sub(K, add(j, i));
                        nm = sub(n, add(mul(j, M), mul(i, W)));
                        if (Arithmetic.equ(O, nm) && Arithmetic.equ(O, k))
                        {
                            c = add(c, factorial(K, [j, i]));
                        }
                        else if (Arithmetic.gt(k, O) && Arithmetic.gt(nm, O))
                        {
                            kk = c_nkab(nm, k, l, r);
                            if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(K, [[i, j]])));
                        }
                        else
                        {
                            break;
                        }
                        i = add(i, I);
                    }
                    j = add(j, I);
                }
            }
        }
        else if (null != W && null != M)
        {
            if (Arithmetic.equ(M, W))
            {
                c = Arithmetic.equ(O, mod(n, M)) ? I : O;
            }
            else
            {
                m = Arithmetic.max(I, div(n, M));
                w = Arithmetic.max(I, div(n, W));
                l = add(W, I); r = sub(M, I);
                j = I;
                while (Arithmetic.lte(j, m))
                {
                    i = I;
                    while (Arithmetic.lte(i, w))
                    {
                        nm = sub(n, add(mul(j, M), mul(i, W)));
                        if (Arithmetic.equ(O, nm))
                        {
                            c = add(c, factorial(add(j, i), [j, i]));
                        }
                        else if (Arithmetic.gt(nm, O))
                        {
                            k = I; K = div(nm, W);
                            while (Arithmetic.lte(k, K))
                            {
                                kk = c_nkab(nm, k, l, r);
                                if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(k, add(j, i)), [[j, i]])));
                                k = add(k, I);
                            }
                        }
                        else
                        {
                            break;
                        }
                        i = add(i, I);
                    }
                    j = add(j, I);
                }
            }
        }
        else if (null != K && null != W)
        {
            if (Arithmetic.equ(mul(K, W), n))
            {
                c = I;
            }
            else
            {
                j = I; nm = W; w = add(W, I);
                while (Arithmetic.lte(nm, n) && Arithmetic.lte(j, K))
                {
                    kk = c_nkab(sub(n, nm), sub(K, j), w, n);
                    if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(K, j)));
                    nm = add(nm, W); j = add(j, I);
                }
            }
        }
        else if (null != K && null != M)
        {
            if (Arithmetic.equ(mul(K, M), n))
            {
                c = I;
            }
            else
            {
                j = I; nm = M; m = sub(M, I);
                while (Arithmetic.lte(nm, n) && Arithmetic.lte(j, K))
                {
                    kk = c_nkab(sub(n, nm), sub(K, j), I, m);
                    if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(K, j)));
                    nm = add(nm, M); j = add(j, I);
                }
            }
        }
        else if (null != K)
        {
            c = c_nkab(n, K, I, n);
        }
        else if (null != W)
        {
            if (Arithmetic.equ(W, n))
            {
                c = I;
            }
            else
            {
                if (Arithmetic.equ(O, mod(n, W))) c = I;
                j = I; nm = W; w = add(W, I);
                while (Arithmetic.lte(nm, n))
                {
                    k = I; l = sub(n, nm); K = div(l, W);
                    while (Arithmetic.lte(k, K))
                    {
                        kk = c_nkab(l, k, w, n);
                        if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(k, j), j)));
                        k = add(k, I);
                    }
                    nm = add(nm, W); j = add(j, I);
                }
            }
        }
        else if (null != M)
        {
            if (Arithmetic.equ(M, n))
            {
                c = I;
            }
            else
            {

                if (Arithmetic.equ(O, mod(n, M))) c = I;
                j = I; nm = M; m = sub(M, I);
                while (Arithmetic.lte(nm, n))
                {
                    k = I; K = sub(n, nm);
                    while (Arithmetic.lte(k, K))
                    {
                        kk = c_nkab(K, k, I, m);
                        if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(k, j), j)));
                        k = add(k, I);
                    }
                    nm = add(nm, M); j = add(j, I);
                }
            }
        }
        else
        {
            c = Arithmetic.gt(n, I) ? pow2(sub(n, I)) : I;
        }
        compositions.mem[key] = c;
    }
    return compositions.mem[key];
}
compositions.mem = Obj();
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
        key = String(n)+','+String(k);
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
// combinatorial utilities, available as static methods of respective objects
function kronecker(/* var args here */)
{
    var args = arguments, nv = args.length, k, a, r, l, i, j,
        vv, tensor, tl, kl, product;

    if (!nv) return [];

    if (true === args[0])
    {
        // flat tensor product
        for (kl=args[1].length,k=2; k<nv; k++) kl *= args[ k ].length;
        product = new Array(kl);
        for (k=0; k<kl; k++)
        {
            tensor = 0;
            for (j=1,r=k,a=1; a<nv; a++)
            {
                l = args[ a ].length;
                i = r % l;
                r = ~~(r / l);
                vv = args[ a ][ i ];
                tensor += j*vv;
                j *= l;
            }
            product[ k ] = tensor;
        }
    }
    else
    {
        // component tensor product
        for (kl=args[0].length,k=1; k<nv; k++) kl *= args[ k ].length;
        product = new Array(kl);
        for (k=0; k<kl; k++)
        {
            tensor = new Array(nv); tl = 0;
            for (r=k,a=nv-1; a>=0; a--)
            {
                l = args[ a ].length;
                i = r % l;
                r = ~~(r / l);
                vv = args[ a ][ i ];
                if (is_array(vv) || is_args(vv))
                {
                    // kronecker can be re-used to create higher-order products
                    // i.e kronecker(alpha, beta, gamma) and kronecker(kronecker(alpha, beta), gamma)
                    // should produce exactly same results
                    for (j=vv.length-1; j>=0; j--) tensor[nv-(++tl)] = vv[ j ];
                }
                else
                {
                    tensor[nv-(++tl)] = vv;
                }
            }
            product[ k ] = tensor;
        }
    }
    return product;
}
function cartesian(/* var args here */)
{
    // direct sum product, since the final dimensions = sum of component dimensions it is like cartesian product
    // whereas tensor product has final dimensions = product of component dimensions
    var v = arguments, nv = v.length, n=0, k, j;
    for (j=0; j<nv; j++) n += v[j].length;
    k = 0; j = 0;
    return array(n, function(i){
        if (i >= k+v[j].length) k+=v[j++].length;
        return k+v[j][i-k];
    });
}
function conditional_combinatorial_tensor(v, value_conditions, extra_conditions)
{
    var k, kl, a, r, l, i, vv, nv = v.length, v0, v1,
        tensor, t0, t1, ok, nvalid, product, p, pv, pe, pea, pl, npv,
        seen = null, valid = null, invalid, expr, e, el;

    if (!nv) return [];

    if (is_callable(extra_conditions))
    {
        valid = extra_conditions;
        extra_conditions = true;
    }
    else
    {
        extra_conditions = false;
    }

    if (!(V_EQU===value_conditions || V_DIFF===value_conditions || V_INC===value_conditions || V_DEC===value_conditions || V_NONINC===value_conditions || V_NONDEC===value_conditions))
    {
        value_conditions = false;
    }

    pe = new Array(nv); pea = []; pl = 0; pv = [];
    for (kl=1,k=0; k<nv; k++)
    {
        if (is_callable(v[k][0]))
        {
            // fixed expression for position k, store it to be added after actual values are added
            if (!v[k][1].length)
            {
                // autonomous expression, which does not depend on any position
                pea.push([v[k][0],k]);
            }
            else
            {
                // depends on one or multiple other positions
                // expr v[k][0] for pos k, depends on value at positions v[k][1][]
                for (e=0,el=v[k][1].length; e<el; e++)
                {
                    if (null == pe[v[k][1][e]]) pe[v[k][1][e]] = [[v[k][0],k,v[k][1]]];
                    else pe[v[k][1][e]].push([v[k][0],k,v[k][1]]);
                }
            }
            // this makes the computation faster, since fixed/expression values
            // are not counted as extra and then checked if valid, but generated directly validly
        }
        else
        {
            // values for position k, count them
            pv.push(k);
            kl *= v[k].length;
            if (!kl || 0>=kl) return [];
        }
    }
    if (!pv.length) return [];

    product = new Array(kl); nvalid = 0;
    t1 = nv-1; npv = pv.length-1;
    // O(kl), count only necessary values, minus any outliers (as few as possible)
    for (k=0; k<kl; k++)
    {
        // O(nv)
        tensor = new Array(nv); invalid = false;
        // explicit tensor values, not expressions
        for (r=k,a=npv; a>=0; a--)
        {
            p = pv[a];
            l = v[p].length;
            i = r % l;
            r = ~~(r / l);
            tensor[p] = v[p][i];
        }
        // evaluate expressions which are autonomous, do not depend on any position
        for (a=0,pl=pea.length; a<pl; a++)
        {
            expr = pea[a];
            tensor[expr[1]] = expr[0]();
        }
        // evaluate expressions now after any explicit tensor values were calculated previously
        for (a=0; a<nv; a++)
        {
            // if expression and not already avaluated (eg by previous expression)
            if (null != pe[a])
            {
                // fill-up any pos values which are expressions based on this pos value
                expr = pe[a];
                for (e=0,el=expr.length; e<el; e++)
                {
                    p = expr[e][1];
                    if (null == tensor[p])
                    {
                        // not computed already
                        ok = true;
                        vv = expr[e][2].map(function(k){
                            if ((null == tensor[k]) || isNaN(tensor[k])) ok = false; // not computed already, abort
                            return tensor[k];
                        });
                        if (ok) tensor[p] = expr[e][0].apply(null, vv);
                    }
                }
            }
        }
        if (value_conditions || extra_conditions)
        {
            if ((null == tensor[t1]) || isNaN(tensor[t1]) || extra_conditions && !valid(tensor,t1,t1))
            {
                invalid = true;
            }
            else
            {
                v1 = tensor[t1];
                if (V_DIFF === value_conditions) { seen = {}; seen[v1] = 1; }
                for (t0=t1-1; t0>=0; t0--)
                {
                    v0 = tensor[t0];
                    if (
                        (null == v0) || isNaN(v0) ||
                        (V_EQU === value_conditions && v1 !== v0) ||
                        (V_DIFF === value_conditions && 1 === seen[v0]) ||
                        (V_INC === value_conditions && v0 >= v1) ||
                        (V_DEC === value_conditions && v0 <= v1) ||
                        (V_NONINC === value_conditions && v0 < v1) ||
                        (V_NONDEC === value_conditions && v0 > v1) ||
                        (extra_conditions && !valid(tensor,t0,t1))
                   )
                    {
                        invalid = true;
                        break;
                    }
                    if (V_DIFF === value_conditions) seen[v0] = 1;
                    v1 = v0;
                }
            }
        }
        if (invalid) continue;
        product[ nvalid++ ] = tensor;
    }
    // truncate if needed
    if (product.length > nvalid) product.length = nvalid;
    return product;
}
function gen_combinatorial_data(n, data, pos, value_conditions, options)
{
    options = options || {};
    pos = pos || array(data.length||0, 0, 1);
    // conditions: ALGEBRAIC(STRING EXPR) AND/OR BOOLEAN(POSITIVE / NEGATIVE) => [values] per position
    // NOTE: needs at least one non-autonomous expression or one range of values, else will return empty set
    var min = null==options.min ? 0 : options.min,
        max = null==options.max ? n-1 : options.max,
        nn = max-min+1, D = data, m, d, i, a, j, pi, l = D.length, none = false,
        pos_ref, is_valid, p1, p2, expr, algebraic = [], missing = [], ref = {},
        in_range = function in_range(x){ return min<=x && x<=max; }, additional_conditions;

    data = []; none = false;
    for (pi=0,i=0; i<l; i++,pi++)
    {
        d = D[i];
        if (is_string(d))
        {
            if (m=d.match(not_in_set_re))
            {
                if (0 < m[1].indexOf('..'))
                {
                    m = m[1].split('..').map(Number);
                    if (m[0]>m[1])
                        a = complement(n,array(m[0]-m[1]+1,m[1],1).filter(in_range)).reverse();
                    else
                        a = complement(n,array(m[1]-m[0]+1,m[0],1).filter(in_range));
                }
                else
                {
                    a = complement(n,m[1].split(',').map(Number).filter(in_range));
                }
                if (!a.length) { none = true; break; }
                data.push(a);
            }
            else if (m=d.match(in_set_re))
            {
                if (0 < m[1].indexOf('..'))
                {
                    m = m[1].split('..').map(Number);
                    a = (m[0]>m[1]?array(m[0]-m[1]+1,m[0],-1):array(m[1]-m[0]+1,m[0],1)).filter(in_range);
                }
                else
                {
                    a = m[1].split(',').map(Number).filter(in_range);
                }
                if (!a.length) { none = true; break; }
                data.push(a);
            }
            else
            {
                is_valid = true; pos_ref = []; expr = null;
                d = d.replace(pos_re, function(m, d){
                    var posref = parseInt(d, 10), varname = 'v'+String(posref);
                    if (isNaN(posref) || !in_range(posref)) is_valid = false;
                    if (is_valid && (-1 === pos_ref.indexOf(posref))) pos_ref.push(posref);
                    return varname;
                });
                if (!is_valid)
                {
                    if (pos) pos.splice(pi--, 1);
                    continue;
                }
                pos_ref.sort(sorter());
                try{
                    expr = new Function(pos_ref.map(function(p){return 'v'+String(p);}).join(','),'return Math.floor('+d+');');
                } catch(e){
                    expr = null;
                }
                if (!is_callable(expr))
                {
                    if (pos) pos.splice(pi--, 1);
                    continue;
                }
                for (j=0; j<pos_ref.length; j++)
                {
                    if (!ref[pos_ref[j]]) ref[pos_ref[j]] = [expr];
                    else ref[pos_ref[j]].push(expr);
                    if ((-1===pos.indexOf(pos_ref[j])) && (-1===missing.indexOf(pos_ref[j]))) missing.push(pos_ref[j]);
                }
                algebraic.push([expr,null,null,pos_ref,pos[pi]]);
                data.push(algebraic[algebraic.length-1]);
            }
        }
        else if (is_array(d))
        {
            a = false===d[0] ? complement(n,d.slice(1).filter(in_range)) : (true===d[0] ? d.slice(1).filter(in_range) : d.filter(in_range));
            if (!a.length) { none = true; break; }
            data.push(a);
        }
    }
    if (none) data = [];

    if (missing.length)
    {
        for (i=0,l=missing.length; i<l; i++)
        {
            // add any missing references
            pos.push(missing[i]);
            if (!none) data.push(array(nn,min,1));
        }
    }

    // sort positions ascending if needed and re-arrange data
    // two parameters change here, adjust [pos] array IN-PLACE, while simply return the new computed [data]
    i = is_sorted(pos);
    if (-1 === i)
    {
        reflection(pos, pos);
        if (!none) reflection(data, data);
    }
    else if (0 === i)
    {
        d = mergesort(pos, 1, false, true);
        permute(pos, d);
        if (!none) permute(data, d);
    }
    if (none) return [];
    if (algebraic.length)
    {
        for (i=0,l=algebraic.length; i<l; i++)
        {
            m = algebraic[i];
            // adjust relative positions in algebraic expressions used in data (same reference)
            m[1] = m[3].map(function(m3){return pos.indexOf(m3);});
            m[2] = pos.indexOf(m[4]);
            for (j=0; j<m[3].length; j++)
            {
                // by the way, filter out some invalid values here for all expr on the same pos ref
                // for expr that depend on single position only, else leave for actual combinatorial generation later on
                expr = ref[m[3][j]];
                if (!is_callable(data[m[1][j]][0]) /*expression does not reference another expression*/)
                {
                    a = data[m[1][j]].filter(function(x){
                        for (var ex,i=0,l=expr.length; i<l; i++)
                        {
                            // for expr that depend on single position only
                            if (1 !== expr[i].length /*num of func args*/) continue;
                            ex = expr[i](x);
                            if (isNaN(ex) || min>ex || ex>max) return false;
                        }
                        return true;
                    });
                    if (!a.length) { none = true; break; }
                    else data[m[1][j]] = a;
                }
            }
            if (none) break;
        }
    }
    if (none) return [];

    // check value conditions
    if ('=' === value_conditions) value_conditions = V_EQU;
    else if (('!=' === value_conditions) || ('<>' === value_conditions)) value_conditions = V_DIFF;
    else if ('<' === value_conditions) value_conditions = V_INC;
    else if (('<=' === value_conditions) || ('=<' === value_conditions)) value_conditions = V_NONDEC;
    else if ('>' === value_conditions) value_conditions = V_DEC;
    else if (('>=' === value_conditions) || ('=>' === value_conditions)) value_conditions = V_NONINC;
    else value_conditions = false;

    // check additional conditions
    additional_conditions = is_callable(options.extra_conditions) ? function(v,i0,i1){
        var v0 = v[i0];
        if (
            // check in range
            (min>v0 || v0>max) ||
            // when strictly increasing sequence then value at pos i cannot be less than i since it has to accomodate the rest values as well before it, complementary for strictly decreasing sequence (for strictly decreasing sequence we do not know the number of elements that come after unlike for strictly increasing sequence where we can know, but as a workaround we can add last possible position in conditions with all possible values simply as a hint/clue on what is last possible position)
            // (assume values in range 0..n-1 for positions 0..n-1 or reverse)
            (V_INC === value_conditions && pos[i0]>v0) ||
            (V_DEC === value_conditions && pos[pos.length-1]-pos[i0]>v0)
       ) return false
        return options.extra_conditions(v,i0,i1);
    } : function(v,i0,i1){
        var v0 = v[i0];
        if (
            // check in range
            (min>v0 || v0>max) ||
            // when strictly increasing sequence then value at pos i cannot be less than i since it has to accomodate the rest values as well before it, complementary for strictly decreasing sequence (for strictly decreasing sequence we do not know the number of elements that come after unlike for strictly increasing sequence where we can know, but as a workaround we can add last possible position in conditions with all possible values simply as a hint/clue on what is last possible position)
            // (assume values in range 0..n-1 for positions 0..n-1 or reverse)
            (V_INC === value_conditions && pos[i0]>v0) ||
            (V_DEC === value_conditions && pos[pos.length-1]-pos[i0]>v0)
       ) return false
        return true;
    };

    // compute valid combinatorial data satisfying conditions
    return true === options.lazy ? data : conditional_combinatorial_tensor(data, value_conditions, additional_conditions);
}
function summation(a, b, Arithmetic, do_subtraction)
{
    // O(max(n1,n2))
    var i, j, n1 = a.length, n2 = b.length, c;
    if (true===Arithmetic)
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i){
            return i >= n1 ? b[i].neg() : (i >= n2 ? a[i] : a[i].sub(b[i]));
        } : function(i){
            return i >= n1 ? b[i] : (i >= n2 ? a[i] : a[i].add(b[i]));
        });
    }
    else if (Arithmetic)
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i){
            return i >= n1 ? Arithmetic.neg(b[i]) : (i >= n2 ? a[i] : Arithmetic.sub(a[i], b[i]));
        } : function(i){
            return i >= n1 ? b[i] : (i >= n2 ? a[i] : Arithmetic.add(a[i], b[i]));
        });
    }
    else
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i){
            return i >= n1 ? -b[i] : (i >= n2 ? a[i] : a[i] - b[i]);
        } : function(i){
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
    if (true===Arithmetic)
    {
        c = array(n1+n2-1, function(){return 0;});
        for (i=0; i<n1; i++)
            for (j=0; j<n2; j++)
                c[i+j] = 0 === c[i+j] ? a[i].mul(b[j]) : c[i+j].add(a[i].mul(b[j]));
    }
    else if (Arithmetic)
    {
        c = array(n1+n2-1, function(){return Arithmetic.O;});
        for (i=0; i<n1; i++)
            for (j=0; j<n2; j++)
                c[i+j] = Arithmetic.add(c[i+j], Arithmetic.mul(a[i], b[j]));
    }
    else
    {
        c = array(n1+n2-1, function(){return 0;});
        for (i=0; i<n1; i++)
            for (j=0; j<n2; j++)
                c[i+j] += a[i] * b[j];
    }
    return c;
}
function addition_sparse(a, b, TermClass, do_subtraction, ring)
{
    // O(n1+n2) ~ O(max(n1,n2))
    // assume a, b are arrays of **non-zero only** coeffs of MulTerm class of coefficient and exponent already sorted in exponent decreasing order
    // merge terms by efficient merging and produce already sorted order c
    // eg http://www.cecm.sfu.ca/~mmonagan/teaching/TopicsinCA11/johnson.pdf
    // and https://www.researchgate.net/publication/333182217_Algorithms_and_Data_Structures_for_Sparse_Polynomial_Arithmetic
    // and https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1
    do_subtraction = (true===do_subtraction);
    TermClass = TermClass===MultiPolyTerm ? MultiPolyTerm : UniPolyTerm;
    ring = ring || Ring.Q();
    var i = 0, j = 0, k = 0, n1 = a.length, n2 = b.length, c = new Array(n1+n2), res, O = Abacus.Arithmetic.O;
    while (i<n1 && j<n2)
    {
        if (0<TermClass.cmp(a[i], b[j]))
        {
            res = a[i].cast(ring);
            if (!res.equ(O)) c[k++] = res; // check if zero
            i++;
        }
        else if (0<TermClass.cmp(b[j], a[i]))
        {
            res = (do_subtraction ? b[j].neg() : b[j]).cast(ring);
            if (!res.equ(O)) c[k++] = res; // check if zero
            j++;
        }
        else //equal
        {
            res = (do_subtraction ? a[i].sub(b[j]) : a[i].add(b[j])).cast(ring);
            if (!res.equ(O)) c[k++] = res; // check if cancelled
            i++; j++;
        }
    }
    while (i<n1)
    {
        res = a[i].cast(ring);
        if (!res.equ(O)) c[k++] = res; // check if zero
        i++;
    }
    while (j<n2)
    {
        res = (do_subtraction ? b[j].neg() : b[j]).cast(ring);
        if (!res.equ(O)) c[k++] = res; // check if zero
        j++;
    }
    if (c.length > k) c.length = k; // truncate if needed
    return c;
}
function multiplication_sparse(a, b, TermClass, ring)
{
    // O(log(n1)*n1*n2)
    // assume a, b are arrays of **non-zero only** coeffs of MulTerm class of coefficient and exponent already sorted in exponent decreasing order
    // merge terms by efficient merging and produce already sorted order c
    // eg http://www.cecm.sfu.ca/~mmonagan/teaching/TopicsinCA11/johnson.pdf
    // and https://www.researchgate.net/publication/333182217_Algorithms_and_Data_Structures_for_Sparse_Polynomial_Arithmetic
    // and https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1
    TermClass = TermClass===MultiPolyTerm ? MultiPolyTerm : UniPolyTerm;
    ring = ring || Ring.Q();
    var k, t, n1, n2, c, f, max, heap, O = Abacus.Arithmetic.O;
    if (a.length > b.length){ t=a; a=b; b=t;} // swap to achieve better performance
    n1 = a.length; n2 = b.length; c = new Array(n1*n2);
    if (0<n1 && 0<n2)
    {
        k = 0;
        c[0] = TermClass(0, a[0].mul(b[0]).e, ring);
        heap = Heap(array(n1, function(i){
            return [a[i].cast(ring).mul(b[0].cast(ring)), i];
        }), "max", function(a, b){
            return TermClass.cmp(a[0], b[0]);
        });
        f = array(n1, 0);
        while (max=heap.peek())
        {
            if (0!==TermClass.cmp(c[k], max[0]))
            {
                if (!c[k].equ(O)) c[++k] = TermClass(0, 0, ring);
                c[k].e = max[0].e;
            }
            c[k] = c[k].add(max[0]);
            f[max[1]]++;
            if (f[max[1]] < n2) heap.replace([a[max[1]].cast(ring).mul(b[f[max[1]]].cast(ring)), max[1]]);
            else heap.pop();
        }
        heap.dispose();
        if (c.length > k+1) c.length = k+1; // truncate if needed
    }
    return c;
}
function division_sparse(a, b, TermClass, q_and_r, ring)
{
    // sparse polynomial reduction/long division
    // https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1
    q_and_r = (true===q_and_r);
    TermClass = TermClass===MultiPolyTerm ? MultiPolyTerm : UniPolyTerm;
    ring = ring || Ring.Q();
    var na = a.length, nb = b.length, O = Abacus.Arithmetic.O,
        heap = Heap([], "max", function(a,b){return TermClass.cmp(a.term, b.term);}),
        q = [], r = [], k = 0, d, res, Q, b0;

    if (!b.length) return null;
    b0 = b[0].cast(ring);
    while ((d=heap.peek()) || k<na)
    {
        if ((null == d) || (k<na && 0>TermClass.cmp(d.term, a[k])))
        {
            res = a[k].cast(ring);
            k++;
        }
        else if (k<na && 0===TermClass.cmp(d.term, a[k]))
        {
            res = a[k].cast(ring).sub(d.term);
            if (nb>d.n)
                heap.replace({term:d.Q.mul(b[d.n].cast(ring)), n:d.n+1, Q:d.Q});
            else
                heap.pop();
            k++;

            //if (res.equ(O)) continue; // zero coefficient, skip
        }
        else
        {
            res = d.term.neg();
            if (nb>d.n)
                heap.replace({term:d.Q.mul(b[d.n].cast(ring)), n:d.n+1, Q:d.Q});
            else
                heap.pop();
        }
        if (res.equ(O)) continue; // zero coefficient, skip

        if (b0.divides(res))
        {
            Q = res.div(b0);
            q = addition_sparse(q, [Q], TermClass, false, ring);
            if (nb>1)
                heap.push({term:Q.mul(b[1].cast(ring)), n:2, Q:Q});
        }
        else if (q_and_r)
        {
            r = addition_sparse(r, [res], TermClass, false, ring);
        }
    }
    heap.dispose();

    return q_and_r ? [q, r] : q;
}
function complement(n, item, sort/*, dupl*/)
{
    if ((null == item) || (!item.length) || (1>=item.length))
        return 1===item.length ? array(n-1, function(i){return i<item[0] ? i : i+1;}) : array(n, 0, 1);
    if (true === sort)
    {
        var d = is_sorted(item);
        if (-1 === d) item = reflection(new Array(item.length), item);
        else if (0 === d) item = mergesort(item.slice(),1,true);
    }
    return difference(null, n, item/*, 1, null, null, null, null, dupl*/);
}
function subset2binary(item, n)
{
    if (0 >= n) return [];
    var binary = array(n, 0, 0), i, l = item.length;
    for (n=n-1,i=0; i<l; i++) binary[n-item[i]] = 1;
    return binary;
}
function binary2subset(item, n)
{
    n = stdMath.min(n||item.length, item.length);
    var subset = [], i;
    for (n=n-1,i=0; i<=n; i++) if (0 < item[i]) subset.push(n-i);
    return subset;
}
function composition2subset(item, n, dir)
{
    if (null == item) return null;
    n = n || item.length;
    return psum(new Array(n), item, 1, -1, -1===dir?n-1:0, -1===dir?0:n-1, 0, n-1);
}
function subset2composition(item, n, dir)
{
    if (null == item) return null;
    n = n || item.length;
    return fdiff(new Array(n), item, 1, 1, -1===dir?n-1:0, -1===dir?0:n-1, 0, n-1);
}
function conjugatepartition(is_composition, item, dir)
{
    if (null == item) return null;
    var conjugate = null, l = item.length, n;
    dir = -1 === dir ? -1 : 1;
    if (is_composition)
    {
        // On Conjugates for Set Partitions and Integer Compositions (arxiv.org/abs/math/0508052v3)
        n = operate(addn,0,item);
        if (1 >= n)
        {
            conjugate = item.slice();
        }
        else
        {
            // get the associated n-composition of the complement(conjugate) of the associated (n-1)-subset
            conjugate = subset2composition(complement(n-1, composition2subset(item, l-1, dir)));
            // add the remainder
            if (0 < (n=n-operate(addn,0,conjugate))) conjugate.push(n);
            // if reflected, get the reflected composition
            if (0>dir) reflection(conjugate,conjugate);
        }
    }
    else
    {
        // http://mathworld.wolfram.com/ConjugatePartition.html
        var i, ii, j, jj, p, a = 1, b = 0, d = 0, push = "push";
        if (0>dir) { a = -a; b = l-1-b; push = "unshift"; }
        if (is_array(item[b]))
        {
            // multiplicity(packed) representation
            p = item[b]; conjugate = [[p[1], p[0]]]; i = 0;
            for (j=1,jj=a+b; j<l; j++,jj+=a)
            {
                p = item[jj]; ii = 0>dir ? 0 : i;
                if (p[1] === conjugate[ii][0])
                {
                    // same part increase multiplicity
                    conjugate[ii][1] += p[0];
                }
                else
                {
                    // swap part with multiplicity
                    conjugate[push]([p[1], p[0]]); i++;
                }
            }
        }
        else
        {
            // standard(unpacked) representation
            n = item[b]; conjugate = array(n, 1, 0);
            if (0>dir) d = n-1-d;
            for (j=1,jj=a+b; j<l; j++,jj+=a)
            {
                i = 0; ii = d; p = item[jj];
                while ((i < n) && (p > 0)) { conjugate[ii]++; p--; i++; ii+=a; }
            }
        }
    }
    return conjugate;
}
function packpartition(partition, dir)
{
    if (null == partition) return null;
    var packed = [], i, j, l = partition.length,
        reflected = -1 === dir,
        a = 1, b = 0, push = "push",
        last, part;

    if (reflected)
    {
        a = -a;
        b = l-1-b;
        push = "unshift";
    }
    for (last=partition[b],part=[last, 1],i=1; i<l; i++)
    {
        j = a*i+b;
        if (last === partition[j])
        {
            part[1]++;
        }
        else
        {
            packed[push](part);
            last = partition[j];
            part = [last, 1];
        }
    }
    packed[push](part);
    return packed;
}
function unpackpartition(packed, dir)
{
    if (null == packed) return null;
    var partition = [], i, j, k, v, l = packed.length,
        cmp, reflected = -1 === dir,
        a = 1, b = 0, push = "push";
    if (reflected)
    {
        a = -a;
        b = l-1-b;
        push = "unshift";
    }
    for (i=0; i<l; i++)
    {
        cmp = packed[a*i+b];
        if (1 === cmp[1])
            partition[push](cmp[0]);
        else
            for (k=cmp[1],v=cmp[0],j=0; j<k; j++)
                partition[push](v);
    }
    return partition;
}
function singletons(item, n)
{
    var i, j, l, S = [];
    for (i=0,l=item.length; i<l; i++)
    {
        if (1 === item[i].length)
            S.push(item[i][0])
    }
    return S;
}
function adjInit(item, n)
{
    var i, j, l, I = [];
    for (i=0,l=item.length; i<l; i++)
    {
        if (1 === item[i].length)
        {
            I.push(item[i][0]);
        }
        else
        {
            for (j=0; j+1<item[i].length; j++)
            {
                if (item[i][j]+1 === item[i][j+1])
                    I.push(item[i][j]);
            }
            if ((item[i][j]+1) % n === item[i][0])
                    I.push(item[i][j]);
        }
    }
    return I;
}
function adjTerm(item, n)
{
    var i, j, l, T = [];
    for (i=0,l=item.length; i<l; i++)
    {
        if (1 === item[i].length)
        {
            T.push(item[i][0]);
        }
        else
        {
            for (j=0; j+1<item[i].length; j++)
            {
                if (item[i][j]+1 === item[i][j+1])
                    T.push(item[i][j+1]);
            }
            if ((item[i][j]+1) % n === item[i][0])
                    T.push(item[i][0]);
        }
    }
    return T;
}
/*function separateIS(item, S, I)
{
    return [item.reduce(function(p, set){
            set = set.reduce(function(set, si){
                if (0 > S.indexOf(si) && 0 > I.indexOf(si))
                    set.push(si);
                return set;
            }, []);
            if (set.length) return p.push(set);
            return p;
        }, []), S, I];
}
function separateST(item, S, T)
{
    return [item.reduce(function(p, set){
            set = set.reduce(function(set, si){
                if (0 > S.indexOf(si) && 0 > T.indexOf(si))
                    set.push(si);
                return set;
            }, []);
            if (set.length) return p.push(set);
            return p;
        }, []), S, I];
}
function combineIS(item, S, I)
{
    return [item.reduce(function(p, set){
            set = set.reduce(function(set, si){
                if (0 > S.indexOf(si) && 0 > I.indexOf(si))
                    set.push(si);
                return set;
            }, []);
            if (set.length) return p.push(set);
            return p;
        }, []), S, I];
}
function combineST(item, S, T)
{
    return [item.reduce(function(p, set){
            set = set.reduce(function(set, si){
                if (0 > S.indexOf(si) && 0 > T.indexOf(si))
                    set.push(si);
                return set;
            }, []);
            if (set.length) return p.push(set);
            return p;
        }, []), S, I];
}*/
function conjugatesetpartition(item, n)
{
    // adapted from https://arxiv.org/abs/math/0508052
    if (null == item) return null;
    var congugate = null;
    return conjugate;
}
function permutation2matrix(matrix, permutation, transposed)
{
    var i, j, n = permutation.length, n2 = n*n;
    matrix = matrix || new Array(n2);
    for (i=0,j=0; i<n2;)
    {
        matrix[i+j] = 0;
        if (++j >= n) { j=0; i+=n; }
    }
    if (true === transposed) for (i=0; i<n; i++) matrix[n*permutation[i]+i] = 1;
    else for (i=0,j=0; j<n; j++,i+=n) matrix[i+permutation[i]] = 1;
    return matrix;
}
function matrix2permutation(permutation, matrix, transposed)
{
    var i, j, n2 = matrix.length, n = stdMath.floor(stdMath.sqrt(n2));
    permutation = permutation || new Array(n);
    if (true === transposed)
    {
        for (i=0,j=0; i<n;)
        {
            if (matrix[n*i+j]) permutation[j] = i;
            if (++j >= n) { j=0; i++; }
        }
    }
    else
    {
        for (i=0,j=0; i<n;)
        {
            if (matrix[i+j]) permutation[i] = j;
            if (++j >= n) { j=0; i++; }
        }
    }
    return permutation;
}
function multiset(m, n, dir)
{
    var nm = m ? m.length : 0, dk = 1, k = 0,
        ki = 0, mk = ki < nm ? m[ki]||1 : 1;
    if (-1 === dir){ dk = -1; k = (nm||n)-1; }
    return operate(function(p,i){
        if (0 >= mk)
        {
            ki++; k+=dk;
            mk = ki<nm ? m[ki]||1 : 1;
        }
        mk--; p[i] = k; return p;
    }, new Array(n), null, 0, n-1);
}
function multiset2permutation(multiset)
{
    // O(nlgn) get associated permutation(unique elements) = invpermutation of indices that sorts the multiset
    // from multiset permutation(repeated elements)
    return permutation2inverse(null, mergesort(multiset,1,false,true/*return indices*/));
}
function permutation2multiset(permutation, multiset)
{
    // O(n) get associated multiset permutation(repeated elements) = choose elements by permutation
    // from permutation(unique elements=indices)
    return multiset && multiset.length ? operate(function(p,pi,i){
        p[i] = pi<multiset.length ? multiset[pi] : pi; return p;
    }, permutation, permutation) : permutation;
}
function permutation2inverse(ipermutation, permutation)
{
    return operate(function(ip,pi,i){
        ip[pi] = i; return ip;
    }, ipermutation||new Array(permutation.length), permutation);
}
function permutation2inversion(inversion, permutation, N)
{
    // O(n log n) inversion computation
    // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
    var n = permutation.length, k = stdMath.ceil(log2(N||n)),
        twok = 1 << k, Tl = (1<<(1+k))-1, T = array(Tl, 0, 0);

    return operate(function(inv,ctr,i){
        // Starting bottom-up at the leaf associated with pi
        for (var node=ctr+twok,j=0; j<k; j++)
        {
            // 1) if the current node is the right child of its parent then subtract from the counter the value stored at the left child of the parent
            if (node&1) ctr -= T[(node >>> 1) << 1];
            // 2) increase the value stored at the current node.
            T[node] += 1;
            // 3) move-up the tree
            node >>>= 1;
        }
        T[node] += 1; inv[i] = ctr;
        return inv;
    }, inversion||new Array(n), permutation);
}
function inversion2permutation(permutation, inversion, N)
{
    // O(n log n) inversion computation
    // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
    var n = inversion.length, k = stdMath.ceil(log2(N||n)),
        i, i2, j, twok = 1 << k, Tl = (1<<(1+k))-1, T = new Array(Tl);

    for (i=0; i<=k; i++)for (j=1,i2=1<<i; j<=i2; j++) T[i2-1+j] = 1 << (k-i);
    return operate(function(perm,digit,i){
        // Starting top-down the tree
        for (var node=1,j=0; j<k; j++)
        {
            T[node] -= 1;
            node <<= 1;
            // next node as the left or right child whether digit is less than the stored value at the left child
            if (digit >= T[node])
            {
                // If the next node is the right child, then the value of the left child is subtracted from digit
                digit -= T[node];
                node++;
            }
        }
        T[node] = 0; perm[i] = node - twok;
        return perm;
    }, permutation||new Array(n), inversion);
}
function permutation2count(count, permutation, dir)
{
    // O(n) count computation K(\sigma)_i = \#\{j > i : \sigma_j > i\}
    // K(\sigma)_i = n-1-i-K'(\sigma)_i-1_{\sigma_{i} > i}, K'(\sigma)_i = \#\{j < i : \sigma_j > i\} (complement)
    /*
    https://cs.stackexchange.com/questions/142180/faster-algorithm-for-a-specific-inversion

    $$
    |\{j>i : \sigma_j > i\}| = | \{ j> i+1 : \sigma_j > i+1 \} | + | \{ j > i : \sigma_j = i+1 \} |
    + 1_{\sigma_{i+1} > i+1}
    $$

    The cardinality of second set is $1$ if there is some value $j'$ of $j>i$ such that $\sigma_{j'}=i+1$ and $0$ otherwise (there can be at most one such value $j'$).
    Rewrite it as:
    $\sum_{h > i} 1_{\sigma_h = i+1} = 1_{\sigma_{i+1} = i+1} + \sum_{h > i+1} 1_{\sigma_h = i+1}
    = 1_{\sigma_{i+1} = i+1} + \sum_{h > i+1} 1_{\min\{h, \sigma_h\} = i+1}$

    Summing the above with the last term from the initial equation we have:
    $$
    1_{\sigma_{i+1} > i+1} + 1_{\sigma_{i+1} = i+1} + \sum_{h > i+1} 1_{\min\{h, \sigma_h\} = i+1}
    $$

    At most one of the two first two terms can be $1$, hence this simplifies to:
    $$
    1_{\sigma_{i+1} \ge i+1} + \sum_{h > i+1} 1_{\min\{h, \sigma_h\} = i+1}
    = \sum_{h > i} 1_{\min\{h, \sigma_h\} = i+1}
    $$

    Substituting
    $$
    K(\sigma)_i = K(\sigma)_{i+1} + \sum_{h > i} 1_{\min\{h, \sigma_h\} = i+1}$$

    Where the second term is exactly what we are writing in $A[i+1]$.
    */
    var n = permutation.length, A = array(n, 0, 0), i;
    for (i=0; i<n; i++) A[stdMath.min(i,permutation[i])]++;
    count = operate(function(count,i){
        count[i] = i+1 === n ? 0 : count[i+1] + A[i+1];
        return count;
    }, count||new Array(n), null, n-1, 0, -1);
    if (-1 === dir)
    {
        // compute complement count K'(\sigma)_i = \#\{j < i : \sigma_j > i\} = n-i-1-K(\sigma)_i-1_{\sigma_i>i}
        count = operate(function(count,i){
            count[i] = n-i-1-count[i]-(i<permutation[i]);
            return count;
        }, count, null, 0, n-1, 1);
    }
    return count;
}
function countswaps(n, x, y, unvisited)
{
    var Arithmetic = Abacus.Arithmetic, c = Arithmetic.O, j, k;
    if (y+1 === n) return Arithmetic.I;
    unvisited.rem(x);
    unvisited.rem(y);
    for (j=unvisited.last(); j && (j.index>y); j=j.prev)
    {
        unvisited.rem(j);
        for (k=j.prev; k && (k.index>=0); k=k.prev)
        {
            unvisited.rem(k);
            c = Arithmetic.add(c, Arithmetic.add(countswaps(n, k.index, j.index, unvisited), j.index+1<n ? Arithmetic.I : Arithmetic.O));
            unvisited.add(k);
        }
        unvisited.add(j);
    }
    unvisited.add(y);
    unvisited.add(x);
    return c;
}
function matchswaps(n, x, y, swaps, i, unvisited)
{
    var Arithmetic = Abacus.Arithmetic, c = Arithmetic.O, j, k, b, s0, s1;
    if (i >= swaps.length) return c;
    if (y+1 === n) return Arithmetic.I;
    s0 = swaps[i][0];
    s1 = swaps[i][1];
    unvisited.rem(x);
    unvisited.rem(y);
    for (j=unvisited.last(); j && (j.index>y); j=j.prev)
    {
        b = false;
        unvisited.rem(j);
        for (k=j.prev; k && (k.index>=0); k=k.prev)
        {
            unvisited.rem(k);
            if (k.index===s0 && j.index===s1)
            {
                c = Arithmetic.add(Arithmetic.add(c, matchswaps(n, k.index, j.index, swaps, i+1, unvisited)), Arithmetic.I);
                b = true;
            }
            else
            {
                c = Arithmetic.add(c, Arithmetic.add(countswaps(n, k.index, j.index, unvisited), j.index+1<n ? Arithmetic.I : Arithmetic.O));
            }
            unvisited.add(k);
            if (b) break;
        }
        unvisited.add(j);
        if (b) break;
    }
    unvisited.add(y);
    unvisited.add(x);
    return c;
}
function findswaps(n, x, y, index, unvisited)
{
    var Arithmetic = Abacus.Arithmetic, c = [], j, k, r, r2, b;
    if (Arithmetic.lte(index, Arithmetic.O)) return c;
    if (y+1 === n) return [[x, y]];
    unvisited.rem(x);
    unvisited.rem(y);
    r2 = r = Arithmetic.O;
    for (j=unvisited.last(); j && (j.index>y); j=j.prev)
    {
        b = false;
        unvisited.rem(j);
        for (k=j.prev; k && (k.index>=0); k=k.prev)
        {
            unvisited.rem(k);
            r2 = r;
            r = Arithmetic.add(r, Arithmetic.add(countswaps(n, k.index, j.index, unvisited), j.index+1<n ? Arithmetic.I : Arithmetic.O));
            unvisited.add(k);
            if (Arithmetic.gte(r, index))
            {
                if (j.index+1<n) c.push([k.index, j.index])
                c = c.concat(findswaps(n, k.index, j.index, Arithmetic.sub(index, Arithmetic.add(r2, j.index+1<n ? Arithmetic.I : Arithmetic.O)), unvisited));
                b = true;
                break;
            }
        }
        unvisited.add(j);
        if (b) break;
    }
    unvisited.add(y);
    unvisited.add(x);
    return c;
}
function countinvol(n, x, y, unvisited)
{
    var Arithmetic = Abacus.Arithmetic, c = Arithmetic.I, j, k;
    for (j=n-1; j>y; j--)
    {
        for (k=j-1; k>=0; k--)
        {
            c = Arithmetic.add(c, Arithmetic.add(countswaps(n, k, j, unvisited), j+1<n ? Arithmetic.I : Arithmetic.O));
        }
    }
    for (k=y-1; k>x; k--)
    {
        c = Arithmetic.add(c, Arithmetic.add(countswaps(n, k, y, unvisited), y+1<n ? Arithmetic.I : Arithmetic.O));
    }
    return c;
}
function cycle2swaps(cycle, swaps, slen)
{
    var c = cycle.length, noref = null == swaps, j;
    if (c > 1)
    {
        if (noref)
        {
            swaps = new Array(c-1);
            slen = 0;
        }
        for (j=c-1; j>=1; j--) swaps[slen++] = [cycle[0],cycle[j]];
    }
    else
    {
        if (noref) swaps = [];
    }
    return noref ? swaps : slen;
}
function permutation2cycles(permutation, strict)
{
    var n = permutation.length, i, cycles = new Array(n),
        current, cycle, min_cycle = true === strict ? 1 : 0,
        unvisited = ListSet(n), clen, cclen = 0;
    if (!n) return cycles;
    cycle = new Array(n); clen = 0;
    current = unvisited.first().index;
    unvisited.rem(current);
    cycle[clen++] = current;
    while (unvisited.first())
    {
        current = permutation[ current ];
        if (!unvisited.has(current))
        {
            if (clen > min_cycle)
            {
                cycle.length = clen; // truncate
                cycles[cclen++] = cycle;
            }
            cycle = new Array(n); clen = 0;
            current = unvisited.first().index;
        }
        cycle[clen++] = current;
        unvisited.rem(current);
    }
    if (clen > min_cycle)
    {
        cycle.length = clen; // truncate
        cycles[cclen++] = cycle;
    }
    if (cclen < cycles.length) cycles.length = cclen; // truncate
    return cycles;
}
function cycles2permutation(cycles, n)
{
    var permutation = array(n || (cycles.reduce(function(s, c){return stdMath.max(s, stdMath.max.apply(null, c)||0);}, 0)+1), 0, 1), i, j, k = cycles.length, ki, cycle;
    for (i=k-1; i>=0; i--)
    {
        cycle = cycles[i]; ki = cycle.length;
        if (1 < ki)
        {
            for (j=0; j+1<ki; j++) permutation[cycle[j]] = cycle[j+1];
            permutation[cycle[ki-1]] = cycle[0];
        }
    }
    return permutation;
}
function permutation2swaps(permutation)
{
    var n = permutation.length, i, l, j, k,
        swaps = new Array(n), slen = 0,
        cycles = permutation2cycles(permutation, true);
    for (i=0,l=cycles.length; i<l; i++) slen = cycle2swaps(cycles[i], swaps, slen);
    if (slen < swaps.length) swaps.length = slen; // truncate
    return swaps;
}
function swaps2permutation(swaps, n)
{
    n = n || (swaps.reduce(function(s, c){return stdMath.max(s, stdMath.max.apply(null, c)||0);}, 0)+1);
    var i, l = swaps.length, permutation = new Array(n), s, t;
    for (i=0; i<n; i++) permutation[i] = i;
    for (i=0; i<l; i++)
    {
        // swap
        swap = s[i];
        t = permutation[s[0]];
        permutation[s[0]] = permutation[s[1]];
        permutation[s[1]] = t;
    }
    return permutation;
}
function permute(a, p, copy)
{
    var n = a.length, m = p.length;
    if (true === copy)
    {
        // O(n) time, O(n) space
        return operate((
            n < m
            ? function(ap, i){ ap[i] = p[i]<n ? a[p[i]] : a[i]; return ap; }
            : (n > m
            ? function(ap, i){ ap[i] = i<m ? a[p[i]] : a[i]; return ap; }
            : function(ap, i){ ap[i] = a[p[i]]; return ap; }
       )), new Array(n), null, 0, n-1, 1);
    }
    else
    {
        // O(n) time, O(n) space
        for (var aa=a.slice(),i=0; i<n; i++) a[i] = aa[p[i]];
        return a;
    }
}
function permutationproduct(permutations)
{
    return operate(function(prod, perm){
        return permute(prod, perm, true);
    }, permutations.length?permutations[0].slice():[], permutations, 1, permutations.length-1, 1);
}
function permutationdirectsum(permutations)
{
    var nperms = permutations.length, n=0, k, p, pn;
    for (p=0; p<nperms; p++) n += permutations[p].length;
    k = 0; p = 0; pn = nperms ? permutations[p].length : 0;
    return array(n, function(i){
        if (i >= k+pn) { k += pn; pn = permutations[++p].length; }
        return k + permutations[p][i-k];
    });
}
function is_permutation(perm, n)
{
    n = n || perm.length;
    if (n !== perm.length) return false;
    var cnt = array(n, 0, 0), i, pi;
    // O(n)
    for (i=0; i<n; i++)
    {
        pi = perm[i];
        if ((0 > pi) || (pi >= n) || (0 < cnt[pi])) return false;
        cnt[pi]++;
    }
    for (i=0; i<n; i++) if (1 !== cnt[i]) return false;
    return true;
}
function is_identity(perm)
{
    // O(n)
    for (var n=perm.length,i=0; i<n; i++) if (perm[i] !== i) return false;
    return true;
}
function is_involution(perm)
{
    // O(n)
    for (var n=perm.length,i=0,pi=perm[i]; i<n; i++,pi=perm[i])
        if ((0 > pi) || (n <= pi) || (perm[pi] !== i)) return false;
    return true;
}
function is_kthroot(perm, k)
{
    k = k || 1; if (1 > k) return false;
    var i, pi, m, n = perm.length;
    // O(kn) worst case
    for (i=0; i<n; i++)
    {
        pi = perm[i]; m = 1;
        while (m<=k && i!==pi){ m++; pi=perm[pi]; }
        // either the kth composition is identity or mth composition is identity where m is a factor of k
        if ((i!==pi) || ((m!==k) && (m>=k || (0 < (k%m))))) return false
    }
    return true;
}
function is_derangement(perm, kfixed, strict)
{
    // O(n)
    kfixed = kfixed|0;
    for (var nfixed=0,n=perm.length,i=0; i<n; i++)
    {
        if (perm[i] === i) if ((++nfixed) > kfixed) return false;
    }
    return true === strict ? nfixed === kfixed : true;
}
function is_cyclic/*_shift*/(perm)
{
    // O(n)
    for (var n=perm.length,i=1,i0=perm[0]; i<n; i++)
        if (perm[i] !== ((i0+i)%n)) return false;
    return true;
}
function is_connected(perm)
{
    // from: http://maths-people.anu.edu.au/~brent/pd/Arndt-thesis.pdf
    // O(n)
    for (var n=perm.length-1,m=-1,i=0,pi=perm[i]; i<n; i++,pi=perm[i])
    {
        // for all proper prefixes, do:
        if (pi > m) m = pi; // update max
        if (m <= i) return false; // prefix mapped to itself, not connected (is decomposable)
    }
    return true;
}
function is_kcycle(perm, kcycles, compare, fixed)
{
    // O(n)
    if (!perm.length || 0>=kcycles) return false;
    fixed = false !== fixed;
    var n = perm.length, i, pi, ncycles, unvisited, done;
    ncycles = 0; done = false; unvisited = ListSet(n);
    i = unvisited.first().index;
    while (!done)
    {
        unvisited.rem(i);
        pi = perm[i];
        if (i===pi || !unvisited.has(pi))
        {
            // close cycle
            if (fixed || i!==pi) ncycles++;
            unvisited.rem(pi);
            // start next cycle
            if (unvisited.first())
                i = unvisited.first().index;
            else
                done = true;
        }
        else
        {
            // follow cycle
            i = pi;
        }
    }
    return "<="===compare||"=<"===compare ? ncycles<=kcycles : (">="===compare||"=>"===compare ? ncycles>=kcycles : ncycles===kcycles);
}
function is_magic(square)
{
    if (!square) return false;
    var n = square.length, n2 = n*n, i, j, k,
        summa_row = 0, summa_col = 0, summa_d1 = 0, summa_d2 = 0,
        summa = (n*n2+n)>>>1, seen = new Array(n2);
    for (i=0; i<n; i++)
    {
        if (n !== square[i].length) return false;
        k = square[i][0];
        if (!seen[k-1]) seen[k-1] = [i, 0];
        if (k < 1 || k > n2 || i !== seen[k-1][0] || 0 !== seen[k-1][1]) return false;
        summa_row = k;
        k = square[0][i];
        if (!seen[k-1]) seen[k-1] = [0, i];
        if (k < 1 || k > n2 || 0 !== seen[k-1][0] || i !== seen[k-1][1]) return false;
        summa_col = k;
        summa_d1 += square[i][i];
        summa_d2 += square[i][n-1-i];
        for (j=1; j<n; j++)
        {
            k = square[i][j];
            if (!seen[k-1]) seen[k-1] = [i, j];
            if (k < 1 || k > n2 || i !== seen[k-1][0] || j !== seen[k-1][1]) return false;
            summa_row += k;
            k = square[j][i];
            if (!seen[k-1]) seen[k-1] = [j, i];
            if (k < 1 || k > n2 || j !== seen[k-1][0] || i !== seen[k-1][1]) return false;
            summa_col += k;
        }
        if ((summa_row !== summa) || (summa_col !== summa)) return false;
    }
    if ((summa_d1 !== summa) || (summa_d2 !== summa)) return false;
    return true;
}
function is_latin(square)
{
    if (!square) return false;
    var n = square.length, i, j, k, m, seen = new Array(n);
    for (i=0; i<n; i++)
    {
        if (n !== square[i].length) return false;
        // rows
        for (k=0; k<n; k++)
        {
            // initialize
            seen[k] = 0;
        }
        for (j=0; j<n; j++)
        {
            m = square[i][j];
            k = square[0].indexOf(m);
            if (0 > k || 0 < seen[k]) return false;
            seen[k] = 1;
        }
        // columns
        for (k=0; k<n; k++)
        {
            // initialize
            seen[k] = 0;
        }
        for (j=0; j<n; j++)
        {
            m = square[j][i];
            k = square[0].indexOf(m);
            if (0 > k || 0 < seen[k]) return false;
            seen[k] = 1;
        }
    }
    return true;
}
function find(a, b, nested)
{
    if (nested)
    {
        if (!a || !a.length) return -1;
        var index, found, i, j, k, n = a.length, m = b.length;
        for (i=0; i<n; i++)
        {
            k = a[i];
            found = true;
            for (j=0; j<m; j++)
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
    for (i=0,l=a.length; i<l; i++)
    {
        k = KEY(a[i]);
        if (HAS.call(hash, k)) dupl.push(i);
        else hash[k] = i;
    }
    while (dupl.length) a.splice(dupl.pop(), 1);
    return a;
}
function rndInt(m, M)
{
    return stdMath.round((M-m)*Abacus.Math.rnd() + m);
}
