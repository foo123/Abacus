// https://en.wikipedia.org/wiki/Outer_product
// https://en.wikipedia.org/wiki/Kronecker_product
// https://en.wikipedia.org/wiki/Tensor_product
// also a combinatorial iterator for partial (explicit and/or as conditional expressions) combinatorial data
Tensor = Abacus.Tensor = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Tensor(/*dims here ..*/) {
        var self = this, sub = null, n = slice.call(arguments), $;
        $ = n.length && !is_instance(n[n.length-1], CombinatorialIterator) && !is_array(n[n.length-1]) && (n[n.length-1] !== +n[n.length-1]) ? n.pop() || {} : {};
        if (n.length && is_array(n[0])) n = n[0];
        if (!n || !n.length) n = [];
        if (!is_instance(self, Tensor)) return new Tensor(n, $);

        $.type = String($.type || "tensor").toLowerCase();
        $.order = $.order || LEX;
        $.rand = $.rand || {};

        if ("partial" === $.type)
        {
            n = is_array(n) && n.length ? n[0] : n;
            var nsub = -1, data = $.data || [], pos = $.position || null;

            if (is_instance(n, CombinatorialIterator))
            {
                sub = n;
                n = sub.base();
                // partial n, needs plus the position data of this instance
                nsub = n;
            }
            else
            {
                sub = $.sub;
            }
            n = (+(n || 0)) || 0;

            if (is_obj(data))
            {
                //eg. {0:"{0..4}",1:"[0]+1",..}
                pos = [];
                data = KEYS(data).map(function(p) {
                    p = +p;
                    pos.push(p);
                    return data[p];
                });
            }
            if (is_args(data)) data = slice.call(data);
            if (is_args(pos)) pos = slice.call(pos);
            if (data.length && (is_string(data[0]) || (data[0].length && (true === data[0][0] || false === data[0][0]))))
            {
                // conditions: ALGEBRAIC(STRING EXPR) AND/OR BOOLEAN(POSITIVE / NEGATIVE) => [values] per position
                if (nsub === n) {n += data.length; nsub = -1;}
                data = Tensor.generate(n, data, pos, $.ordering || null);
            }
            if (nsub === n) {n += (data.length ? data[0].length : 0) || 0; nsub = -1;}

            $.data = data; $.position = pos || array((data.length ? data[0].length : 0)|| 0, 0, 1);
            $.dimension = $.position.length; $.base = n;
            $.rand['partial'] = 1;
        }
        else
        {
            if ("tuple" === $.type)
            {
                n[0] = n[0] || 1; n[1] = n[1] || 1;
                if (is_instance(n[0], CombinatorialIterator))
                {
                    sub = n[0];
                    n[0] = sub.dimension();
                }
                else if (is_instance(n[1], CombinatorialIterator))
                {
                    sub = n[1];
                    n[1] = sub.base();
                }
                else
                {
                    sub = $.sub;
                }
                $.base = n[1];
                $.dimension = stdMath.max(0, n[0]);
                if ('gray' === $.output) $.output = function(item, n) {return Tensor.toGray(item, n[1]);};
            }
            else
            {
                var m_M = operate(function(m_M, k) {
                    if (k < m_M[0]) m_M[0] = k;
                    if (k > m_M[1]) m_M[1] = k;
                    return m_M;
                }, [Infinity,0], n);
                $.base = n;
                $.minbase = m_M[0]; $.maxbase = m_M[1];
                $.dimension = n.length;
                if ('gray' === $.output)
                {
                    $.output = function(item, n) {return Tensor.toGray(item, n);};
                }
                else if ('inversion' === $.output)
                {
                    $.output = function(item, n) {return Tensor.inversion(item);};
                }
                else if (is_array($.output))
                {
                    var BASE = $.output;
                    $.output = function(item, n) {return Tensor.component(item, BASE);};
                }
            }
        }
        CombinatorialIterator.call(self, "Tensor", n, $, sub ? {method:"partial" === $.type ? ($.submethod || 'complete') : $.submethod, iter:sub, pos:"partial"===$.type ? ($.subpos || $.position) : $.subpos, cascade:$.subcascade} : null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
        ,count: function(n, $) {
            var O = Abacus.Arithmetic.O, type = $ && $.type ? $.type : "tensor";
            return "partial" === type ? ($.data && $.data.length ? Abacus.Arithmetic.num($.data.length) : O) : ("tuple" === type ? (!n || (0 >= n[0]) ? O : exp(n[1], n[0])) : (!n || !n.length ? O : product(n)));
        }
        ,initial: function(n, $, dir) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "tensor",
                order = $ && $.order ? $.order : LEX;

            dir = -1 === dir ? -1 : 1;

            if ((!(COLEX & order) && (REVERSED & order)) || ((COLEX & order) && !(REVERSED & order)))
                dir = -dir;

            if ("partial" === type)
            {
                // O(1)
                item = $.data && $.data.length ? (0 > dir ? $.data[$.data.length-1] : $.data[0]) : null;
            }
            else
            {
                // O(n)
                item = "tuple" === type ? (
                    !n[0] ? [] : (0 > dir ? array(n[0], n[1]-1, 0) : array(n[0], 0, 0))
                ) : (
                    !n.length ? [] : (0 > dir ? array(n.length, function(i) {return n[i]-1;}): array(n.length, 0, 0))
                );
                item = klass.DUAL(item, n, $);
            }

            return item;
        }
        ,valid: function(item, n, $) {
            var klass = this, type = $ && $.type ? $.type : "tensor", nd, i;

            if (!item) return false;
            if ("partial" === type)
            {
                return 0 <= find($.data, item, true);
            }
            else
            {
                item = klass.DUAL(item.slice(), n, $);
                if ("tuple" === type)
                {
                    nd = n[0];
                    if (!nd || (nd !== item.length)) return false;
                    for (n=n[1],i=0; i<nd; ++i)
                    {
                        if ((0 > item[i]) || (item[i] >= n)) return false;
                    }
                }
                else
                {
                    nd = n.length;
                    if (!nd || (nd !== item.length)) return false;
                    for (i=0; i<nd; ++i)
                    {
                        if ((0 > item[i]) || (item[i] >= n[i])) return false;
                    }
                }
            }
            return true;
        }
        ,succ: function(item, index, n, $, dir, TI) {
            if (!n || (null == item)) return null;
            var type = $ && $.type ? $.type : "tensor",
                order = $ && (null != $.order) ? $.order : LEX,
                Arithmetic = Abacus.Arithmetic, ind;
            dir = -1 === dir ? -1 : 1;
            if ("partial" === type)
            {
                if (!$.data || !$.data.length) return null;
                if (REVERSED & order)
                {
                    dir = -dir;
                    if (null != index) index = Arithmetic.sub(Arithmetic.num($.data.length-1), index);
                }
                if (null == index) index = find($.data, item, true);
                ind = Arithmetic.val(index);
                return 0 > dir ? (0 <= ind-1 ? $.data[ind-1] : null) : (0 <= ind && ind+1 < $.data.length ? $.data[ind+1] : null);
            }
            return !n[0] || (0 >= n[0]) ? null : next_tensor(item, n, dir, type, order, TI);
        }
        ,rand: function(n, $) {
            var rndInt = Abacus.Math.rndInt,
                klass = this, item,
                type = $ && $.type ? $.type : "tensor";

            if ("partial" === type)
            {
                item = $.data && $.data.length ? $.data[rndInt(0, $.data.length-1)] : null;
            }
            else
            {
                item = "tuple" === type ? (
                    // p ~ 1 / n^k, O(n)
                    !n[0] ? [] : array(n[0], function(i) {return rndInt(0, n[1]-1);})
                ) : (
                    // p ~ 1 / n1*n2*..nk, O(n)
                    !n.length ? [] : array(n.length, function(i) {return rndInt(0, n[i]-1);})
                );
                item = klass.DUAL(item, n, $);
            }

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function(item, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                order = $ && (null != $.order) ? $.order : LEX,
                type = $ && $.type ? $.type : "tensor",
                add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
                index = Arithmetic.O, J = Arithmetic.J, nd, i;

            if (!item) return J;
            if ("partial" === type)
            {
                index = Arithmetic.num(find($.data, item, true));
            }
            else
            {
                // O(n)
                item = klass.DUAL(item, n, $);

                if ("tuple" === type)
                {
                    nd = n[0];
                    if (!nd || (nd !== item.length)) return J;
                    for (n=n[1],i=0; i<nd; ++i)
                    {
                        if ((0 > item[i]) || (item[i] >= n)) return J;
                        index = add(mul(index, n), item[i]);
                    }
                }
                else
                {
                    nd = n.length;
                    if (!nd || (nd !== item.length)) return J;
                    for (i=0; i<nd; ++i)
                    {
                        if ((0 > item[i]) || (item[i] >= n[i])) return J;
                        index = add(mul(index, n[i]), item[i]);
                    }
                }
            }

            if ((!(COLEX & order) && (REVERSED & order)) || ((COLEX & order) && !(REVERSED & order)))
                index = sub($ && (null != $.last) ? $.last : sub(klass.count(n, $), Arithmetic.I), index);

            return index;
        }
        ,unrank: function(index, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                order = $ && (null != $.order) ? $.order : LEX,
                type = $ && $.type ? $.type : "tensor",
                sub = Arithmetic.sub, mod = Arithmetic.mod,
                div = Arithmetic.div, val = Arithmetic.val,
                r, b, i, t, item, nd;

            index = null == index ? null : Arithmetic.num(index);
            if ((null == index) || !Arithmetic.inside(index, Arithmetic.J, $ && (null != $.count) ? $.count : klass.count(n, $)))
                return null;

            if ((!(COLEX & order) && (REVERSED & order)) || ((COLEX & order) && !(REVERSED & order)))
                index = sub($ && (null != $.last) ? $.last : sub(klass.count(n, $), Arithmetic.I), index);

            if ("partial" === type)
            {
                if (!$.data || !$.data.length) return null;
                index = val(index);
                item = 0 <= index && index < $.data.length ? $.data[index] : null;
            }
            else
            {
                // O(n)
                if ("tuple" === type)
                {
                    nd = n[0];
                    if (!nd) return [];
                    item = new Array(nd); b = n[1];
                    for (r=index,i=nd-1; i>=0; --i)
                    {
                        t = mod(r, b); r = div(r, b);
                        item[i] = val(t);
                    }
                }
                else
                {
                    nd = n.length;
                    if (!nd) return [];
                    item = new Array(nd);
                    for (r=index,i=nd-1; i>=0; --i)
                    {
                        b = n[i]; t = mod(r, b); r = div(r, b);
                        item[i] = val(t);
                    }
                }

                item = klass.DUAL(item, n, $);
            }

            return item;
        }
        ,toGray: function(item, n) {
            return gray(new Array(item.length), item, n);
        }
        ,fromGray: function(item, n) {
            return igray(new Array(item.length), item, n);
        }
        ,inversion: function(inv) {
            // assume inv is tensor component of dimensions: (1,2,..,n-1,n) in this order
            var i, n = inv.length, perm = n ? [0] : [];
            for (i=1; i<n; ++i) perm.splice(i-inv[i], 0, i);
            return perm;
        }
        ,product: kronecker
        ,directsum: cartesian
        ,component: function(comp, base) {
            return null == comp ? null : (null == base ? comp : array(comp.length, function(i) {
                return (i < base.length) && (0 <= comp[i]) && (comp[i] < base[i].length) ? base[i][comp[i]] : comp[i];
            }));
        },
        affine: function(/* args */) {
            // do an affine transformation on each item dimension
            // an affine transform T(x) = T0*x + T1
            var affine = 1 === arguments.length && is_array(arguments[0]) ? arguments[0] : arguments;
            return affine ? function(item) {
                return array(item.length, function(i) {
                    if ((i >= affine.length) || (null == affine[i])) return item[i];
                    var T = affine[i];
                    return is_number(T) ? (item[i]+T) : (T[0]*item[i]+(T[1] || 0));
                });
            } : ID;
        }
        ,conditional: null
        ,generate: null
    }
});
function next_tensor(item, N, dir, type, order, TI)
{
    //maybe "use asm"
    var n = N, k, i, j, i0, i1, DI, a, b, MIN, MAX;
    if ("tuple" === type) {k = n[0]; n = n[1];}
    else {k = n.length;}
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = k-1;
    DI = 1; i0 = MAX; i1 = MIN;
    a = 1; b = 0;
    if (COLEX & order)
    {
        //CP-symmetric of LEX
        DI = -DI; i0 = MAX-i0; i1 = MAX-i1;
        a = -a; b = MAX-b;
    }
    if (REFLECTED & order)
    {
        //P-symmetric of LEX
        DI = -DI; i0 = MAX-i0; i1 = MAX-i1;
        a = -a; b = MAX-b;
    }
    if (REVERSED & order)
    {
        //T-symmetric of LEX
        dir = -dir;
    }

    // constant average delay (CAT)
    if (0 > dir)
    {
        if ("tuple" === type)
        {
            i = i0;
            while ((MIN <= i) && (MAX >= i) && (0 === item[i])) i -= DI;
            if ((MIN <= i) && (MAX >= i))
                for (n=n-1,item[i]=item[i]-1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = n;
            //else last item
            else item = null;
        }
        else
        {
            i = i0;
            while ((MIN <= i) && (MAX >= i) && (0 === item[i])) i -= DI;
            if ((MIN <= i) && (MAX >= i))
                for (item[i]=item[i]-1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = n[a*j+b]-1;
            //else last item
            else item = null;
        }
    }
    else
    {
        if ("tuple" === type)
        {
            i = i0;
            while ((MIN <= i) && (MAX >= i) && (item[i]+1 === n)) i -= DI;
            if ((MIN <= i) && (MAX >= i))
                for (item[i]=item[i]+1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = 0;
            //else last item
            else item = null;
        }
        else
        {
            i = i0;
            while ((MIN <= i) && (MAX >= i) && (item[i]+1 === n[a*i+b])) i -= DI;
            if ((MIN <= i) && (MAX >= i))
                for (item[i]=item[i]+1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = 0;
            //else last item
            else item = null;
        }
    }
    return item;
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

    if (!(V_EQU === value_conditions || V_DIFF === value_conditions || V_INC === value_conditions || V_DEC === value_conditions || V_NONINC === value_conditions || V_NONDEC === value_conditions))
    {
        value_conditions = false;
    }

    pe = new Array(nv); pea = []; pl = 0; pv = [];
    for (kl=1,k=0; k<nv; ++k)
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
                for (e=0,el=v[k][1].length; e<el; ++e)
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
    for (k=0; k<kl; ++k)
    {
        // O(nv)
        tensor = new Array(nv); invalid = false;
        // explicit tensor values, not expressions
        for (r=k,a=npv; a>=0; --a)
        {
            p = pv[a];
            l = v[p].length;
            i = r % l;
            r = ~~(r / l);
            tensor[p] = v[p][i];
        }
        // evaluate expressions which are autonomous, do not depend on any position
        for (a=0,pl=pea.length; a<pl; ++a)
        {
            expr = pea[a];
            tensor[expr[1]] = expr[0]();
        }
        // evaluate expressions now after any explicit tensor values were calculated previously
        for (a=0; a<nv; ++a)
        {
            // if expression and not already avaluated (eg by previous expression)
            if (null != pe[a])
            {
                // fill-up any pos values which are expressions based on this pos value
                expr = pe[a];
                for (e=0,el=expr.length; e<el; ++e)
                {
                    p = expr[e][1];
                    if (null == tensor[p])
                    {
                        // not computed already
                        ok = true;
                        vv = expr[e][2].map(function(k) {
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
                if (V_DIFF === value_conditions) {seen = {}; seen[v1] = 1;}
                for (t0=t1-1; t0>=0; --t0)
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
        product[nvalid++] = tensor;
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
    var min = null == options.min ? 0 : options.min,
        max = null == options.max ? n-1 : options.max,
        nn = max-min+1, D = data, m, d, i, a, j, pi, l = D.length, none = false,
        pos_ref, is_valid, p1, p2, expr, algebraic = [], missing = [], ref = {},
        in_range = function in_range(x) {return min <= x && x <= max;}, additional_conditions;

    data = []; none = false;
    for (pi=0,i=0; i<l; ++i,++pi)
    {
        d = D[i];
        if (is_string(d))
        {
            if (m=d.match(not_in_set_re))
            {
                if (0 < m[1].indexOf('..'))
                {
                    m = m[1].split('..').map(Number);
                    if (m[0] > m[1])
                        a = complement(n, array(m[0]-m[1]+1, m[1], 1).filter(in_range)).reverse();
                    else
                        a = complement(n, array(m[1]-m[0]+1, m[0], 1).filter(in_range));
                }
                else
                {
                    a = complement(n, m[1].split(',').map(Number).filter(in_range));
                }
                if (!a.length) {none = true; break;}
                data.push(a);
            }
            else if (m=d.match(in_set_re))
            {
                if (0 < m[1].indexOf('..'))
                {
                    m = m[1].split('..').map(Number);
                    a = (m[0] > m[1] ? array(m[0]-m[1]+1, m[0], -1) : array(m[1]-m[0]+1, m[0], 1)).filter(in_range);
                }
                else
                {
                    a = m[1].split(',').map(Number).filter(in_range);
                }
                if (!a.length) {none = true; break;}
                data.push(a);
            }
            else
            {
                is_valid = true; pos_ref = []; expr = null;
                d = d.replace(pos_re, function(m, d) {
                    var posref = parseInt(d, 10), varname = 'v' + String(posref);
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
                try {
                    expr = new Function(pos_ref.map(function(p) {return 'v' + String(p);}).join(','),'return Math.floor('+d+');');
                } catch(e) {
                    expr = null;
                }
                if (!is_callable(expr))
                {
                    if (pos) pos.splice(pi--, 1);
                    continue;
                }
                for (j=0; j<pos_ref.length; ++j)
                {
                    if (!ref[pos_ref[j]]) ref[pos_ref[j]] = [expr];
                    else ref[pos_ref[j]].push(expr);
                    if ((-1 === pos.indexOf(pos_ref[j])) && (-1 === missing.indexOf(pos_ref[j]))) missing.push(pos_ref[j]);
                }
                algebraic.push([expr,null,null,pos_ref,pos[pi]]);
                data.push(algebraic[algebraic.length-1]);
            }
        }
        else if (is_array(d))
        {
            a = false === d[0] ? complement(n, d.slice(1).filter(in_range)) : (true === d[0] ? d.slice(1).filter(in_range) : d.filter(in_range));
            if (!a.length) {none = true; break;}
            data.push(a);
        }
    }
    if (none) data = [];

    if (missing.length)
    {
        for (i=0,l=missing.length; i<l; ++i)
        {
            // add any missing references
            pos.push(missing[i]);
            if (!none) data.push(array(nn, min, 1));
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
        for (i=0,l=algebraic.length; i<l; ++i)
        {
            m = algebraic[i];
            // adjust relative positions in algebraic expressions used in data (same reference)
            m[1] = m[3].map(function(m3) {return pos.indexOf(m3);});
            m[2] = pos.indexOf(m[4]);
            for (j=0; j<m[3].length; ++j)
            {
                // by the way, filter out some invalid values here for all expr on the same pos ref
                // for expr that depend on single position only, else leave for actual combinatorial generation later on
                expr = ref[m[3][j]];
                if (!is_callable(data[m[1][j]][0]) /*expression does not reference another expression*/)
                {
                    a = data[m[1][j]].filter(function(x) {
                        for (var ex,i=0,l=expr.length; i<l; ++i)
                        {
                            // for expr that depend on single position only
                            if (1 !== expr[i].length /*num of func args*/) continue;
                            ex = expr[i](x);
                            if (isNaN(ex) || min > ex || ex > max) return false;
                        }
                        return true;
                    });
                    if (!a.length) {none = true; break;}
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
    additional_conditions = is_callable(options.extra_conditions) ? function(v, i0, i1) {
        var v0 = v[i0];
        if (
            // check in range
            (min > v0 || v0 > max) ||
            // when strictly increasing sequence then value at pos i cannot be less than i since it has to accomodate the rest values as well before it, complementary for strictly decreasing sequence (for strictly decreasing sequence we do not know the number of elements that come after unlike for strictly increasing sequence where we can know, but as a workaround we can add last possible position in conditions with all possible values simply as a hint/clue on what is last possible position)
            // (assume values in range 0..n-1 for positions 0..n-1 or reverse)
            (V_INC === value_conditions && pos[i0] > v0) ||
            (V_DEC === value_conditions && pos[pos.length-1]-pos[i0] > v0)
       ) return false
        return options.extra_conditions(v ,i0, i1);
    } : function(v, i0, i1) {
        var v0 = v[i0];
        if (
            // check in range
            (min > v0 || v0 > max) ||
            // when strictly increasing sequence then value at pos i cannot be less than i since it has to accomodate the rest values as well before it, complementary for strictly decreasing sequence (for strictly decreasing sequence we do not know the number of elements that come after unlike for strictly increasing sequence where we can know, but as a workaround we can add last possible position in conditions with all possible values simply as a hint/clue on what is last possible position)
            // (assume values in range 0..n-1 for positions 0..n-1 or reverse)
            (V_INC === value_conditions && pos[i0] > v0) ||
            (V_DEC === value_conditions && pos[pos.length-1]-pos[i0] > v0)
       ) return false
        return true;
    };

    // compute valid combinatorial data satisfying conditions
    return true === options.lazy ? data : conditional_combinatorial_tensor(data, value_conditions, additional_conditions);
}
Tensor.conditional = conditional_combinatorial_tensor;
Tensor.generate = gen_combinatorial_data;