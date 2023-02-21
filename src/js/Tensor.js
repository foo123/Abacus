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
            n = is_array(n)&&n.length ? n[0] : n;
            var nsub = -1, data = $.data||[], pos = $.position||null;

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
            n = (+(n||0))||0;

            if (is_obj(data))
            {
                //eg. {0:"{0..4}",1:"[0]+1",..}
                pos = [];
                data = KEYS(data).map(function(p){
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
                if (nsub === n) { n += data.length; nsub = -1; }
                data = Tensor.generate(n, data, pos, $.ordering||null);
            }
            if (nsub === n) { n += (data.length?data[0].length:0)||0; nsub = -1; }

            $.data = data; $.position = pos || array((data.length?data[0].length:0)||0, 0, 1);
            $.dimension = $.position.length; $.base = n;
            $.rand["partial"] = 1;
        }
        else
        {
            if ("tuple" === $.type)
            {
                n[0] = n[0]||1; n[1] = n[1]||1;
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
                if ("gray" === $.output) $.output = function(item, n){ return Tensor.toGray(item,n[1]); };
            }
            else
            {
                var m_M = operate(function(m_M, k){
                    if (k < m_M[0]) m_M[0] = k;
                    if (k > m_M[1]) m_M[1] = k;
                    return m_M;
                }, [Infinity,0], n);
                $.base = n;
                $.minbase = m_M[0]; $.maxbase = m_M[1];
                $.dimension = n.length;
                if ("gray" === $.output)
                {
                    $.output = function(item, n){ return Tensor.toGray(item,n); };
                }
                else if ("inversion" === $.output)
                {
                    $.output = function(item, n){ return Tensor.inversion(item); };
                }
                else if (is_array($.output))
                {
                    var BASE = $.output;
                    $.output = function(item, n){ return Tensor.component(item,BASE); };
                }
            }
        }
        CombinatorialIterator.call(self, "Tensor", n, $, sub?{method:"partial"===$.type?($.submethod||"complete"):$.submethod,iter:sub,pos:"partial"===$.type?($.subpos||$.position):$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
        ,count: function(n, $) {
            var O = Abacus.Arithmetic.O, type = $ && $.type ? $.type : "tensor";
            return "partial"===type ? ($.data&&$.data.length ? Abacus.Arithmetic.num($.data.length) : O) : ("tuple"===type ? (!n || (0 >= n[0]) ? O : exp(n[1], n[0])) : (!n || !n.length ? O : product(n)));
        }
        ,initial: function(n, $, dir) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "tensor",
                order = $ && $.order ? $.order : LEX;

            dir = -1 === dir ? -1 : 1;

            if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                dir = -dir;

            if ("partial" === type)
            {
                // O(1)
                item = $.data&&$.data.length ? (0 > dir ? $.data[$.data.length-1] : $.data[0]) : null;
            }
            else
            {
                // O(n)
                item = "tuple" === type ? (
                    !n[0] ? [] : (0 > dir ? array(n[0], n[1]-1, 0) : array(n[0], 0, 0))
                ) : (
                    !n.length ? [] : (0 > dir ? array(n.length, function(i){return n[i]-1;}): array(n.length, 0, 0))
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
                    if (!nd || nd !== item.length) return false;
                    for (n=n[1],i=0; i<nd; i++)
                    {
                        if (0 > item[i] || item[i] >= n) return false;
                    }
                }
                else
                {
                    nd = n.length;
                    if (!nd || nd !== item.length) return false;
                    for (i=0; i<nd; i++)
                    {
                        if (0 > item[i] || item[i] >= n[i]) return false;
                    }
                }
            }
            return true;
        }
        ,succ: function(item, index, n, $, dir, TI) {
            if (!n || (null == item)) return null;
            var type = $ && $.type ? $.type : "tensor",
                order = $ && null!=$.order ? $.order : LEX,
                Arithmetic = Abacus.Arithmetic, ind;
            dir = -1 === dir ? -1 : 1;
            if ("partial" === type)
            {
                if (!$.data || !$.data.length) return null;
                if (REVERSED & order)
                {
                    dir = -dir;
                    if (null != index) index = Arithmetic.sub(Arithmetic.num($.data.length-1),index);
                }
                if (null == index) index = find($.data, item, true);
                ind = Arithmetic.val(index);
                return 0>dir ? (0<=ind-1 ? $.data[ind-1] : null) : (0<=ind && ind+1<$.data.length ? $.data[ind+1] : null);
            }
            return !n[0] || (0 >= n[0]) ? null : next_tensor(item, n, dir, type, order, TI);
        }
        ,rand: function(n, $) {
            var rndInt = Abacus.Math.rndInt,
                klass = this, item,
                type = $ && $.type ? $.type : "tensor";

            if ("partial" === type)
            {
                item = $.data&&$.data.length ? $.data[rndInt(0,$.data.length-1)] : null;
            }
            else
            {
                item = "tuple" === type ? (
                    // p ~ 1 / n^k, O(n)
                    !n[0] ? [] : array(n[0], function(i){return rndInt(0, n[1]-1);})
                ) : (
                    // p ~ 1 / n1*n2*..nk, O(n)
                    !n.length ? [] : array(n.length, function(i){return rndInt(0, n[i]-1);})
                );
                item = klass.DUAL(item, n, $);
            }

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function(item, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                order = $ && null!=$.order?$.order:LEX,
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
                    if (!nd || nd !== item.length) return J;
                    for (n=n[1],i=0; i<nd; i++)
                    {
                        if (0 > item[i] || item[i] >= n) return J;
                        index = add(mul(index, n), item[i]);
                    }
                }
                else
                {
                    nd = n.length;
                    if (!nd || nd !== item.length) return J;
                    for (i=0; i<nd; i++)
                    {
                        if (0 > item[i] || item[i] >= n[i]) return J;
                        index = add(mul(index, n[i]), item[i]);
                    }
                }
            }

            if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);

            return index;
        }
        ,unrank: function(index, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                order = $ && null!=$.order?$.order:LEX,
                type = $ && $.type ? $.type : "tensor",
                sub = Arithmetic.sub, mod = Arithmetic.mod,
                div = Arithmetic.div, val = Arithmetic.val,
                r, b, i, t, item, nd;

            index = null == index ? null : Arithmetic.num(index);
            if (null==index || !Arithmetic.inside(index, Arithmetic.J, $ && null!=$.count ? $.count : klass.count(n, $)))
                return null;

            if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);

            if ("partial" === type)
            {
                if (!$.data || !$.data.length) return null;
                index = val(index);
                item = 0<=index && index<$.data.length ? $.data[index] : null;
            }
            else
            {
                // O(n)
                if ("tuple" === type)
                {
                    nd = n[0];
                    if (!nd) return [];
                    item = new Array(nd); b = n[1];
                    for (r=index,i=nd-1; i>=0; i--)
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
                    for (r=index,i=nd-1; i>=0; i--)
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
            for (i=1; i<n; i++) perm.splice(i-inv[i], 0, i);
            return perm;
        }
        ,product: kronecker
        ,directsum: cartesian
        ,component: function(comp, base) {
            return null == comp ? null : (null == base ? comp : array(comp.length, function(i){
                return i<base.length && 0<=comp[i] && comp[i]<base[i].length ? base[i][comp[i]] : comp[i];
            }));
        },
        affine: function(/* args */) {
            // do an affine transformation on each item dimension
            // an affine transform T(x) = T0*x + T1
            var affine = 1===arguments.length && is_array(arguments[0]) ? arguments[0] : arguments;
            return affine ? function(item) {
                return array(item.length, function(i){
                    if (i >= affine.length || null == affine[i]) return item[i];
                    var T = affine[i];
                    return is_number(T) ? item[i]+T : T[0]*item[i]+(T[1]||0);
                });
            } : ID;
        }
        ,conditional: conditional_combinatorial_tensor
        ,generate: gen_combinatorial_data
    }
});
function next_tensor(item, N, dir, type, order, TI)
{
    //maybe "use asm"
    var n = N, k, i, j, i0, i1, DI, a, b, MIN, MAX;
    if ("tuple" === type) { k=n[0]; n=n[1]; }
    else { k=n.length; }
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
            while (MIN<=i && MAX>=i && item[i]===0) i-=DI;
            if (MIN<=i && MAX>=i)
                for (n=n-1,item[i]=item[i]-1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = n;
            //else last item
            else item = null;
        }
        else
        {
            i = i0;
            while (MIN<=i && MAX>=i && item[i]===0) i-=DI;
            if (MIN<=i && MAX>=i)
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
            while (MIN<=i && MAX>=i && item[i]+1===n) i-=DI;
            if (MIN<=i && MAX>=i)
                for (item[i]=item[i]+1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = 0;
            //else last item
            else item = null;
        }
        else
        {
            i = i0;
            while (MIN<=i && MAX>=i && item[i]+1===n[a*i+b]) i-=DI;
            if (MIN<=i && MAX>=i)
                for (item[i]=item[i]+1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = 0;
            //else last item
            else item = null;
        }
    }
    return item;
}
