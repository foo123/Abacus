// Abacus.CombinatorialIterator, Combinatorial Base Class extends and implements Iterator Interface
// NOTE: by substituting usual Arithmetic ops with big-integer ops,
// big-integers can be handled transparently throughout all the combinatorial algorithms
CombinatorialIterator = Abacus.CombinatorialIterator = Class(Iterator, {

    constructor: function CombinatorialIterator(name, n, $, sub) {
        var self = this, klass, Arithmetic = Abacus.Arithmetic;
        if (!is_instance(self, CombinatorialIterator)) return new CombinatorialIterator(name, n, $, sub);
        klass = self[CLASS];
        if ((is_array(name) || is_args(name)) && (is_instance(name[0], CombinatorialIterator) || is_instance(name[name.length-1], CombinatorialIterator)))
        {
            // combinatorial sequence iterator instance
            $ = n || {};
            $.seq = is_args(name) ? slice.call(name) : name; name = null;
            self.n = n = $.seq.length;
            $.type = "sequence";
            $.rand = $.rand || {};
            $.rand["sequence"] = 1;
            var minbase=Infinity, maxbase=-Infinity, mindim=Infinity, maxdim=-Infinity;
            operate(function(_,iter){
                var bmin = iter.base(true, "min"), bmax = iter.base(true, "max"),
                    dmin = iter.dimension(true, "min"), dmax = iter.dimension(true, "max");
                if (bmax > maxbase) maxbase = bax;
                if (bmin < minbase) minbase = bmin;
                if (dmax > maxdim) maxdim = dmax;
                if (dmin < mindim) mindim = dmin;
            }, null, $.seq);
            $.base = $.maxbase = maxbase; $.minbase = minbase;
            $.dimension = $.maxdimension = maxdim; $.mindimension = mindim;
        }
        else
        {
            // base combinatorial class
            self.n = n || 0;
            $ = $ || {};
        }

        name = name || "CombinatorialIterator";
        $.type = String($.type || "default").toLowerCase();
        $.order = $.order || LEX; // default order is lexicographic ("lex")
        $.rand = $.rand || {};
        $.sub = null;
        $.instance = self;

        Iterator.call(self, name, $);

        self.init().order($.order);
        if (sub && is_instance(sub.iter, CombinatorialIterator))
        {
            sub.method = sub.method || 'project';
            if (is_callable(sub.method))
            {
                self.fuse(sub.method, sub.iter, /*sub.pos,*/ sub.cascade);
            }
            else if (is_string(sub.method) && -1 !== ['multiply','add','concat','connect','join','combine','complete','interleave','juxtapose','intersperse','project'].indexOf(sub.method))
            {
                var submethod = 'project'===sub.method ? 'projectOn' : (sub.method+'With');
                self[submethod](sub.iter, sub.pos, sub.cascade);
            }
        }
        if ($.filter) self.filterBy($.filter);
    }

    ,__static__: {
        // some C-P-T dualities, symmetries & processes at play here :))
         C: function(item, N, n, dir){
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            var reflected = -1===dir, LEN;
            if (n+1===item.length)
            {
                // fixed-length item, with effective length as extra last pos
                LEN = is_array(item[n]) ? item[n][0] : item[n];
                complementation(item, item, N, reflected ? n-(LEN||1) : 0, reflected ? n-1 : LEN-1);
            }
            else
            {
                complementation(item, item, N);
            }
            return item;
        }
        ,D: function(item, N, n, dir) {
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            // (variation based on complement)
            var itemlen, reflected = -1===dir, INFO, LEN;
            if (n+1===item.length)
            {
                // fixed-length item, with effective length as extra last pos
                INFO = item[n]; LEN = is_array(INFO) ? INFO[0] : INFO;
                item = reflected ? item.slice(n-LEN,n) : item.slice(0,LEN);
                item = complement(N, item, true);
                itemlen = item.length;
                if (itemlen<n) item[reflected?"unshift":"push"].apply(item, new Array(n-itemlen));
                if (is_array(INFO)) INFO[0] = itemlen;
                else INFO = itemlen;
                item.push(INFO);
            }
            else
            {
                item = complement(N, item);
            }
            return item;
         }
        ,P: function(item, n, dir) {
            // P process / symmetry, ie Reflection/Parity, PP = I
            var LEN;
            if (n+1===item.length)
            {
                // fixed-length item, with effective length as extra last pos
                LEN = is_array(item[n]) ? item[n][0] : item[n];
                if (-1===dir)
                    item = shift(item, reflection(item, item, n, n-(LEN||1), n-1), -n+LEN, n-(LEN||1), n-1);
                else
                    item = shift(item, reflection(item, item, n, 0, LEN-1), n-LEN, 0, LEN-1);
            }
            else
            {
                reflection(item, item);
            }
            return item;
         }
        ,T: function(item, n, dir){
            // T process / symmetry, ie Reversion/Time, TT = I
            return reversion(item, n);
        }
        ,DUAL: function dual(item, n, $, dir) {
            if (null == item) return null;
            if ($ && "sequence"===$.type) return item;
            // some C-P-T dualities, symmetries & processes at play here
            var klass = this, order = $ && null!=$.order ? $.order : LEX,
                BASE = $ && (null!=$.base) ? $.base : n,
                DIM = $ && (null!=$.dimension) ? $.dimension : n;
            dir = -1===dir ? -1 : 1;
            if (COLEX & order) item = REFLECTED & order ? klass.C(item,BASE,DIM,$,dir) : klass.P(klass.C(item,BASE,DIM,$,dir),DIM,dir);
            //else if (RANDOM & order) item = REFLECTED & order ? klass.P(item,DIM,dir) : item;
            //else if (MINIMAL & order) item = REFLECTED & order ? klass.P(item,DIM,dir) : item;
            else/*if (LEX & order)*/item = REFLECTED & order ? klass.P(item,DIM,dir) : item;
            return item;
        }
        ,count: function(n, $) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
            return $ && ("sequence"===$.type) && $.seq && $.seq.length ? operate(function(count,iter){return Arithmetic.add(count,iter.total());}, O, $.seq) : O;
        }
        ,initial: function(n, $, dir, as_next) {
            if ($ && ("sequence"===$.type) && $.seq && $.seq.length)
            {
                if (true === as_next) return this.succ(0, 0, n, $, dir);
                dir = -1 === dir ? -1 : 1;
                return 0>dir || (REVERSED&($ && null!=$.order ? $.order : LEX)) ? $.seq[$.seq.length-1].item0(dir) : $.seq[0].item0(dir);
            }
            return null;
        }
        ,valid: function(item, n, $) {
            if ((null!=item) && $ && ("sequence"===$.type) && $.seq && $.seq.length)
            {
                for (var i=0; i<$.seq.length; i++)
                {
                    if ($.seq[i][CLASS].valid(item, $.seq[i].n, $.seq[i].$))
                        return true;
                }
                return false;
            }
            return false;
        }
        ,succ: function(item, index, n, $, dir, item_) {
            if ((null == n) || (null == item)) return null;
            var klass = this, Arithmetic = Abacus.Arithmetic, a, b, d, i, seq;
            dir = -1 === dir ? -1 : 1;
            if ($ && ("sequence"===$.type))
            {
                seq = $.seq;
                if (!seq || !seq.length) return null;
                if (REVERSED & ($ && null!=$.order ? $.order : LEX))
                {
                    a = -1;
                    b = seq.length-1;
                }
                else
                {
                    a = 1;
                    b = 0;
                }
                i = a*$.seq_curr+b; d = a*dir;
                while (0<=i && i<seq.length && !seq[i].hasNext(dir))
                {
                    $.seq_curr += dir;
                    i += d;
                }
                return 0<=i && i<seq.length ? seq[i].next(dir) : null;
            }
            return null == index ? null : klass.unrank(Arithmetic.add(index, 0>dir?Arithmetic.J:Arithmetic.I), n, $);
        }
        ,rand: function(n, $) {
            var item, klass = this, Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, N, index, seq, i, l, tot;

            if ($ && ("sequence"===$.type))
            {
                seq = $.seq;
                if (!seq || !seq.length) return null;
                // uniform random sampling, taking into account the count of each iterator
                N = null!=$.last ? $.last : Arithmetic.sub(klass.count(n, $), Arithmetic.I),
                index = Arithmetic.rnd(O, N); i = 0; l = seq.length;
                while (Arithmetic.gte(index, tot=seq[i].total()))
                {
                    index = Arithmetic.sub(index, tot);
                    i++; if (i >=l || Arithmetic.lt(index, O)) break;
                }
                return i<l && Arithmetic.gte(index, O) ? seq[i].random() : null;
                /*
                // NOTE: NOT uniformly distributed unless all iterators have same count,
                // needs to take into account counts per iterator to produce uniform random item
                return $.seq && $.seq.length ? $.seq[Abacus.Math.rndInt(0,$.seq.length-1)].random() : null;
                */
            }

            N = $ && null!=$.last ? $.last : Arithmetic.sub(klass.count(n, $), Arithmetic.I),
            index = Arithmetic.rnd(O, N);
            item = Arithmetic.equ(O, index) ? (
                klass.initial(n, $, 1)
            ) : (Arithmetic.equ(N, index) ? (
                klass.initial(n, $, -1)
            ) : (
                klass.unrank(index, n, $)
            ));

            return item;
        }
        ,rank: function(item, n, $) {
            if ($ && ("sequence"===$.type))
            {
                var klass = this, Arithmetic = Abacus.Arithmetic,
                    O = Arithmetic.O, J = Arithmetic.J,
                    seq = $.seq, i, l, m, index, seq_index, sub, found;

                if (null == item || !seq || !seq.length) return J;

                l = seq.length; i = 0; seq_index = O;
                m = item.length;
                found = false;
                for (i=0; i<l; i++)
                {
                    sub = seq[i];
                    if ((m === sub.dimension()) || (m>=sub.$.mindimension && m<=sub.$.maxdimension))
                    {
                        index = sub[CLASS].rank(item, sub.n, sub.$);
                        if (Arithmetic.gt(index,J))
                        {
                            found = true;
                            break;
                        }
                        seq_index = Arithmetic.add(seq_index, sub.total());
                    }
                }
                return found ? Arithmetic.add(index, seq_index) : J;
            }
            return NotImplemented();
        }
        ,unrank: function(index, n, $) {
            if ($ && ("sequence"===$.type))
            {
                var klass = this, Arithmetic = Abacus.Arithmetic,
                    O = Arithmetic.O, seq = $.seq, i, l;

                if (!seq || !seq.length) return null;
                index = null == index ? null : Arithmetic.num(index);
                if (null==index || !Arithmetic.inside(index, Arithmetic.J, null!=$.count ? $.count : klass.count(n, $))) return null;

                l = seq.length; i = 0;
                while (Arithmetic.gte(index, seq[i].total()))
                {
                    index = Arithmetic.sub(index, seq[i].total());
                    i++; if (i >=l || Arithmetic.lt(index, O)) break;
                }
                return i<l && Arithmetic.gte(index, O) ? seq[i][CLASS].unrank(index, seq[i].n, seq[i].$) : null;
            }
            return NotImplemented();
        }
        ,connect: function(method, item, subitem, DIM, BASE, POS) {
            //if (is_callable(method)) return method(item, subitem, DIM, BASE, POS);
            if ("multiply" === method)
            {
                // O(n1 * n2)
                return kronecker(true, item, subitem);
            }
            else if ("intersperse" === method)
            {
                // O(n1 + n2)
                var output = subitem.slice(), n = item.length, i;
                for (i=0; i<n; i++)
                {
                    // POS plays the role of output symbol(s) here, if exists
                    output.splice(output.length-item[i], 0, POS&&POS.length&&i<POS.length?POS[i]:item[i]);
                }
                return output;
            }
            /*else if ("conjoin" === method)
            {
                var o = is_array(subitem) && subitem._AGRREGATE_ ? [item].concat(subitem) : [item, subitem];
                o._AGRREGATE_ = true;
                return o;
            }*/
            else if ("juxtapose" === method)
            {
                // O(1)
                // try to produce flat output even if subitem is itself recursively juxtaposed
                // should work fine for supported comb. objects (with default output) as they always produce 1 flat array of numbers
                var o = is_array(subitem) && (true===subitem._AGRREGATE_) ? [item].concat(subitem) : [item, subitem];
                o._AGRREGATE_ = true;
                return o;
                //return subitem && is_array(subitem[0]) ? [item].concat(subitem) : [item, subitem];
            }
            else if (("add" === method) || ("connect" === method) || ("concat" === method))
            {
                // O(n1 + n2)
                var max = item.length ? item[0]+1 : 0;
                return array(item.length+subitem.length, "add" === method ? function(i){
                    // add
                    return i < item.length ? item[i] : item.length+subitem[i-item.length];
                } : ("connect" === method ? function(i){
                    // connect
                    if (i < item.length)
                    {
                        if (item[i]+1 > max) max = item[i]+1;
                        return item[i];
                    }
                    return max+subitem[i-item.length];
                } : function(i){
                    // concat
                    return i < item.length ? item[i] : subitem[i-item.length];
                }));
            }
            else if (("complete" === method) || ("interleave" === method) || ("join" === method) || ("combine" === method))
            {
                // O(n1 + n2)
                var n1 = item.length, n2 = subitem.length,
                    n3 = n1+n2, i2 = 0, i1 = 0, nk = 0,
                    item_i1 = i1<n1 ? item[i1] : -1,
                    pos_i1 = null!=POS ? (i1<POS.length ? POS[i1] : -1) : item_i1,
                    compl = "complete" === method ? complement(BASE, item, true) : null/*array(BASE, 0, 1)*/;
                if ("combine" === method)
                {
                    var items = array(n3, 0, 1), output = array(n3);
                    for (i1=0; i1<n1; i1++) output[item[i1]] = items[item[i1]];
                    for (i1=n1-1; i1>=0; i1--) items.splice(item[i1], 1);
                    i1=0; i2=0;
                    while (i2 < n2)
                    {
                        while ((i1 < n3) && (null != output[i1])) i1++;
                        if (i1 < n3) output[i1] = items[subitem[i2]];
                        i2++;
                    }
                    return output;
                }
                else
                {
                    return array(n3, "complete" === method ? function(ii){
                        // complete
                        var v;
                        if (pos_i1 === ii)
                        {
                            v = item_i1;
                            i1++;
                            item_i1 = i1<n1 ? item[i1] : -1;
                            pos_i1 = null!=POS ? (i1<POS.length ? POS[i1] : -1) : item_i1;
                        }
                        else
                        {
                            v = compl[subitem[i2++]];
                        }
                        return v;
                    } : ("interleave" === method ? function(ii){
                        // interleave
                        var v;
                        if (pos_i1 === ii)
                        {
                            v = item_i1;
                            i1++;
                            item_i1 = i1<n1 ? item[i1] : -1;
                            pos_i1 = null!=POS ? (i1<POS.length ? POS[i1] : -1) : item_i1;
                        }
                        else
                        {
                            v = subitem[i2++];
                        }
                        return v;
                    } : function(ii){
                        // join
                        var v;
                        if (item_i1 === ii)
                        {
                            v = item_i1; i1++;
                            item_i1 = i1<n1 ? item[i1] : -1;
                            nk++;
                        }
                        else
                        {
                            v = nk + subitem[i2++];
                        }
                        return v;
                    }));
                }
            }
            else/*if ("project" === method)*/
            {
                // O(n1)
                return array(item.length, function(i){
                    return 0<=item[i] && item[i]<subitem.length ? subitem[item[i]] : item[i];
                });
            }
        }
    }

    ,name: "CombinatorialIterator"
    ,n: 0
    ,item__: null
    ,_prev: null
    ,_next: null
    ,_traversed: null

    ,dispose: function(non_recursive) {
        var self = this;
        if ((!non_recursive) && self.$.sub)
        {
            self.$.sub.dispose();
            self.$.sub = null;
        }
        if ("sequence" === self.$.type && self.$.seq && self.$.seq.length)
        {
            operate(function(_,iter){iter.dispose();}, null, self.$.seq);
            self.$.seq = null;
        }

        self.n = null;
        self.item__ = null;
        self._prev = null;
        self._next = null;
        if (self._traversed)
        {
            self._traversed.dispose();
            self._traversed = null;
        }
        return Iterator[PROTO].dispose.call(self);
    }

    ,init: function() {
        var self = this, klass = self[CLASS], $ = self.$, n = self.n, Arithmetic = Abacus.Arithmetic;
        $.base = $.base || 0;
        $.minbase = null != $.minbase ? $.minbase : $.base;
        $.maxbase = null != $.maxbase ? $.maxbase : $.base;
        $.dimension = stdMath.max(0, $.dimension || 0);
        $.mindimension = stdMath.max(0, null != $.mindimension ? $.mindimension : $.dimension);
        $.maxdimension = stdMath.max(0, null != $.maxdimension ? $.maxdimension : $.dimension);
        $.count = null != $.count ? klass.count(n, $) : $.count;
        $.first = Arithmetic.O;
        $.last = Arithmetic.gt($.count, Arithmetic.O) ? Arithmetic.sub($.count, Arithmetic.I) : Arithmetic.J;
        return self;
    }

    ,fuse: function(method, combIter, pos, dir) {
        var self = this, $super = Iterator[PROTO].fuse, $ = self.$;
        if ((1 === arguments.length) && (false === method))
        {
            // un-fuse
            $.subpos = null;
            $.subbase = null;
            $.subminbase = null;
            $.submaxbase = null;
            $.subdimension = null;
            $.submindimension = null;
            $.submaxdimension = null;
            $.subposition = null;
            $super.call(self, false);
        }
        else if (is_instance(combIter, CombinatorialIterator) && is_callable(method))
        {
            if (-1 === pos || 1 === pos){ dir = pos; pos = null; }
            $.subpos = pos || self.position();
            $.subminbase = stdMath.min($.minbase, combIter.base(false, "min"));
            $.subbase = $.submaxbase = stdMath.max($.maxbase, combIter.base(false, "max"));
            $super.call(self, method, combIter, dir);
        }
        return self;
    }

    ,multiplyWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator))
        {
            $.subdimension = $.dimension*combIter.dimension();
            $.submindimension = $.mindimension*combIter.dimension(false, "min");
            $.submaxdimension = $.maxdimension*combIter.dimension(false, "max");
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("multiply", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,addWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()))
        {
            $.subdimension = $.dimension+combIter.dimension();
            $.submindimension = $.mindimension+combIter.dimension(false, "min");
            $.submaxdimension = $.maxdimension+combIter.dimension(false, "max");
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("add", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,connectWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()))
        {
            $.subdimension = $.dimension+combIter.dimension();
            $.submindimension = $.mindimension+combIter.dimension(false, "min");
            $.submaxdimension = $.maxdimension+combIter.dimension(false, "max");
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("connect", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,concatWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()))
        {
            $.subdimension = $.dimension+combIter.dimension();
            $.submindimension = $.mindimension+combIter.dimension(false, "min");
            $.submaxdimension = $.maxdimension+combIter.dimension(false, "max");
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("concat", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,juxtaposeWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator))
        {
            $.subdimension = 1 + (combIter.$.subdimension || 1);
            $.submindimension = 1 + (combIter.$.submindimension || 1);
            $.submaxdimension = 1 + (combIter.$.submaxdimension || 1);
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("juxtapose", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,completeWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()))
        {
            $.subdimension = $.dimension+combIter.dimension();
            $.submindimension = $.mindimension+combIter.dimension(false, "min");
            $.submaxdimension = $.maxdimension+combIter.dimension(false, "max");
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("complete", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,interleaveWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()))
        {
            $.subdimension = $.dimension+combIter.dimension();
            $.submindimension = $.mindimension+combIter.dimension(false, "min");
            $.submaxdimension = $.maxdimension+combIter.dimension(false, "max");
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("interleave", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,joinWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()))
        {
            $.subdimension = $.dimension+combIter.dimension();
            $.submindimension = $.mindimension+combIter.dimension(false, "min");
            $.submaxdimension = $.maxdimension+combIter.dimension(false, "max");
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("join", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,combineWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()))
        {
            $.subdimension = $.dimension+combIter.dimension();
            $.submindimension = $.mindimension+combIter.dimension(false, "min");
            $.submaxdimension = $.maxdimension+combIter.dimension(false, "max");
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("combine", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,intersperseWith: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        // used especially for Tensors, to generate recursively
        if (is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()))
        {
            if (-1 === pos || 1 === pos){ dir = pos; pos = null; }
            pos = pos || (1===self.dimension() ? [self.base()-1] : array(self.dimension(), 0, 1));
            $.subdimension = $.dimension+combIter.dimension();
            $.submindimension = $.mindimension+combIter.dimension(false, "min");
            $.submaxdimension = $.maxdimension+combIter.dimension(false, "max");
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("intersperse", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,projectOn: function(combIter, pos, dir) {
        var self = this, $ = self.$;
        if (is_instance(combIter, CombinatorialIterator))
        {
            $.subdimension = $.dimension;
            $.submindimension = $.mindimension;
            $.submaxdimension = $.maxdimension;
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("project", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,base: function(non_recursive, type) {
        var $ = this.$;
        if ("min" === type) return ($.sub && !non_recursive ? ($.subminbase || $.minbase) : $.minbase) || 0;
        if ("max" === type) return ($.sub && !non_recursive ? ($.submaxbase || $.maxbase) : $.maxbase) || 0;
        return ($.sub && !non_recursive ? ($.subbase || $.base) : $.base) || 0;
    }

    ,dimension: function(non_recursive, type) {
        var $ = this.$;
        if ("min" === type) return ($.sub && !non_recursive ? ($.submindimension || $.mindimension) : $.mindimension) || 0;
        if ("max" === type) return ($.sub && !non_recursive ? ($.submaxdimension || $.maxdimension) : $.maxdimension) || 0;
        return ($.sub && !non_recursive ? ($.subdimension || $.dimension) : $.dimension) || 0;
    }

    ,position: function(non_recursive) {
        var $ = this.$;
        return ($.sub && !non_recursive ? ($.subposition || $.position) : $.position) || null;
    }

    ,total: function(non_recursive) {
        var $ = this.$, O = Abacus.Arithmetic.O;
        return ($.sub && !non_recursive ? $.subcount : $.count) || O;
    }

    ,output: function(item) {
        var self = this, n = self.n, $ = self.$, output = $.output || null, type = $.type || null;
        return null == item ? null : (null == output ? ("sequence"===type ? item : item.slice()) : (is_callable(output) ? output(item,n) : (is_array(output) ? operate(function(a,ii,i){
            a[i] = 0<=ii && ii<output.length ? output[ii] : ii; return a;
        },new Array(item.length),item) : (is_string(output) ? operate(function(s,ii,i){
            s += 0<=ii && ii<output.length ? output.charAt(ii) : String(ii); return s;
        },"",item) : ("sequence"===type ? item : item.slice())))));
    }

    ,fusion: function(item, subitem) {
        var self = this, $ = self.$, t;
        if (!$.sub) return item;
        if (-1 === $.subcascade){ t = item; item = subitem; subitem = t; }
        if (null == item || null == subitem) return item || subitem || null;
        return $.submethod.call(self, item, subitem, self.dimension(), self.base(), $.subpos);
    }

    ,_reset: function(dir) {
        var self = this, klass = self[CLASS], $ = self.$, n = self.n,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            order = $.order, r, tot, tot_1;

        self.__index = self._index = O;
        self._item = self.__item = self.item__ = null;
        self._prev = false; self._next = false;
        tot = $.count; tot_1 = $.last;

        if ("sequence" === $.type)
            $.seq_curr = $.seq && $.seq.length ? (0>dir ? $.seq.length-1 : 0) : -1;

        if (RANDOM & order)
        {
            // a uniform random traversal over all traversals of the combinatorial space
            if (("gen" === Abacus.Options.RANDOM) || (1 === $.rand[$.type]) || Arithmetic.gt(tot, Abacus.Options.MAXMEM) || (Arithmetic.isDefault() && 0 > tot/*has overflowed*/))
            {
                // no random unranking supported/enabled
                // and/or too big to keep in memory
                // NOTE: given unbiased random generation and large combinatorial sample space (both given)
                // the probability of having duplicates is close to ZERO (and exactly ZERO on average)
                // so it indeed produces uniform random traversals (on average)
                self.__item = klass.rand(n, $);
                self.__index = O;
            }
            else
            {
                // random unranking supported
                // and can keep it in memory => uniform random traversals in all cases
                // lazy init
                if (self._traversed) self._traversed.dispose();
                self._traversed = null;
                r = self.random("index", true);
                try {
                    self.__item = klass.unrank(r, n, $);
                } catch (e) {
                    r = null;
                    self.__item = klass.rand(n, $);
                }
                if (null != r)
                {
                    self._traversed = new Abacus.BitArray(Arithmetic.val(tot));
                    self._traversed.set(+r);
                }
                else
                {
                    r = O;
                }
                if (null != self.__item) self.__index = r;
            }
            self._index = O;
            // any extra info for fast computation of item succ
            self._update();
        }
        else
        {
            // get a lexicographic or minimal ordering (eg LEX, COLEX, REVLEX, REVCOLEX, GRAY, etc..)
            self.__item = klass.initial(n, $, dir, true);
            if (null != self.__item)
            {
                self.__index = 0 > dir ? tot_1 : O;
                // any extra info for fast computation of item succ
                self._update();
            }
            self._index = self.__index;
        }

        self._item = self.output(self.__item);
        self._prev = (RANDOM & order) || (0 < dir) ? false : null != self.__item;
        self._next = (0 > dir) && !(RANDOM & order) ? false : null != self.__item;

        return self;
    }

    ,_update: function() {
        var self = this;
        // compute and store any extra item information
        // needed between successive runs to run faster, eg cat or loopless, instead of linear
        self.item__ = null;
        return self;
    }

    ,order: function(order, dir) {
        if (!arguments.length) return this.$.order;

        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, suborder, r, n, $,
            rewind = true === order, i, l;

        n = self.n; $ = self.$;

        if (self._traversed)
        {
            self._traversed.dispose();
            self._traversed = null;
        }

        if (rewind)
        {
            order = $.order;
        }
        else if (is_string(order))
        {
            if (-1 < (r=order.indexOf('|')))
            {
                suborder = order.substr(r+1);
                order = ORDER(order.substr(0, r));
            }
            else
            {
                suborder = order = ORDER(order);
            }
        }
        else
        {
            suborder = order = ORDER(order);
        }
        //dir = REVERSED & order ? -1 : 1; // T
        dir = -1 === dir ? -1 : 1; // T
        $.order = order;

        if ("sequence" === $.type && $.seq && $.seq.length)
        {
            for (i=0,l=$.seq.length; i<l; i++)
                if (rewind) $.seq[i].rewind(dir); else $.seq[i].order(order,dir);
        }
        self._reset(dir);

        if ($.sub)
        {
            if (is_instance($.sub, CombinatorialProxy)) $.sub.seed(self._item);
            if (rewind) $.sub.rewind(dir);
            else $.sub.order(suborder,dir);
            self.__subindex = $.sub.index();
            self.__subitem = $.sub.next(dir);
            self._subindex = null;
            self._subitem = null;

            self._prev = self._prev && (null != self.__subitem);
            self._next = self._next && (null != self.__subitem);
            self._subindex = is_instance($.sub, CombinatorialProxy) ? self._index : Arithmetic.add(Arithmetic.mul(self.__subindex||O,$.count), self._index);
            self._subitem = self.fusion(self._item, self.__subitem);
        }
        else
        {
            self.__subindex = null;
            self.__subitem = null;
            self._subindex = null;
            self._subitem = null;
        }
        return self;
    }

    ,has: function(item) {
        var self = this, klass = self[CLASS];
        return is_array(item) ? Abacus.Arithmetic.gt(self.total(true), Abacus.Arithmetic.O) && klass.valid(item, self.n, self.$) : false;
    }

    ,index: function(index, non_recursive) {
        non_recursive = !!non_recursive;
        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            n = self.n, $ = self.$, tot = $.sub && !non_recursive ? $.subcount : $.count,
            curindex = $.sub && !non_recursive ? self._subindex : self._index,
            order = $.order, tot_1/*, dir = REVERSED & order ? -1 : 1*/; // T

        if (!arguments.length)
        {
            index = self.$.sub /*&& !non_recursive*/ ? self._subindex : self._index;
            return /*Arithmetic.sub(*/index/*, self.hasNext()?1:0)*/;
        }

        if (is_array(index))
        {
            try {
                index = klass.rank(index, self.n, self.$);
            } catch (e) {
                index = J;
            }
            return index;
        }
        else
        {
            index = Arithmetic.wrapR(Arithmetic.num(index), tot);

            if (!Arithmetic.equ(index, curindex) && Arithmetic.inside(index, J, tot))
            {
                tot = $.count; tot_1 = $.last;
                if ($.sub && !non_recursive)
                {
                    $.sub.index(Arithmetic.div(index, tot));
                    self.__subindex = $.sub.index();
                    self.__subitem = $.sub.item();
                    index = Arithmetic.mod(index, tot);
                }

                if (!(RANDOM & order))
                {
                    self.__index = index;
                    self._index = index;
                    self.__item = Arithmetic.equ(O, index)
                    ? klass.initial(n, $, 1)
                    : (Arithmetic.equ(tot_1, index)
                    ? klass.initial(n, $, -1)
                    : klass.unrank(index, n, $));
                    // any extra info for fast computation of item succ
                    self._update();
                    self._item = self.output(self.__item);
                    self._prev = null != self.__item;
                    self._next = null != self.__item;
                }

                if ($.sub)
                {
                    if (is_instance($.sub, CombinatorialProxy))
                    {
                        $.sub.seed(self._item).order(order);
                        self.__subindex = $.sub.index();
                        self.__subitem = $.sub.next();
                    }
                    self._prev = self._prev && (null != self.__subitem);
                    self._next = self._next && (null != self.__subitem);
                    self._subindex = is_instance($.sub, CombinatorialProxy) ? self._index : Arithmetic.add(Arithmetic.mul(self.__subindex||O,tot), self._index);
                    self._subitem = self.fusion(self._item, self.__subitem);
                }
            }
            return self;
        }
    }

    ,item0: function(dir, raw) {
        var self = this, item;
        item = self[CLASS].initial(self.n, self.$, -1===dir?-1:1);
        return true === raw ? item : self.output(item);
    }

    ,item: function(index, order) {
        if (!arguments.length) return this.$.sub ? this._subitem : this._item;

        var self = this, klass = self[CLASS], n = self.n, $ = self.$,
            tot = $.sub ? $.subcount : $.count, tot_1,
            curindex = $.sub ? self._subindex : self._index, indx, indx2,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            dir, o, item, subitem, r, suborder = null;

        if (is_string(order))
        {
            if (-1 < (r=order.indexOf('|')))
            {
                suborder = order.substr(r+1);
                order = ORDER(order.substr(0, r));
            }
            else
            {
                suborder = order = ORDER(order);
            }
        }
        else if (null != order)
        {
            suborder = order = ORDER(order);
        }
        else
        {
            order = $.order;
            suborder = null;
        }
        if (!$.sub) suborder = null;

        if (is_array(index))
        {
            // set item, instead of index, eg resume from existing item
            tot = $.count;
            tot_1 = $.last;
            o = $.order; $.order = order;

            self.__item = index.slice();
            try {
                self.__index = klass.rank(self.__item, n, $);
            } catch (e) {
                self.__index = O;
            }
            // any extra info for fast computation of item succ
            self._update();
            self._item = self.output(self.__item);

            if (RANDOM & order)
            {
                self._index = self.__index;
            }
            else//if (!(RANDOM & order))
            {
                self._index = self.__index;
            }
            self._prev = null != self.__item;
            self._next = null != self.__item;
            //$.order = o;
            if ($.sub && is_instance($.sub, CombinatorialProxy))
            {
                $.sub.seed(self._item).order(order);
                self.__subindex = $.sub.index();
                self.__subitem = $.sub.next();
            }
            return self;
        }

        index = Arithmetic.wrapR(Arithmetic.num(index), tot);

        if ((order === $.order) && (null === suborder) && Arithmetic.equ(index, curindex))
            return $.sub ? self._subitem : self._item;

        if (Arithmetic.inside(index, J, tot))
        {
            subitem = null;
            if ($.sub)
            {
                indx2 = Arithmetic.div(index, tot);
                index = Arithmetic.mod(index, tot);
            }
            tot = $.count; tot_1 = $.last;
            if (RANDOM & order)
            {
                indx = null;//self.random("index");
                o = $.order; $.order = order;
                item =  self.output(
                    /*klass.unrank(indx, n, $)*/
                    klass.rand(n, $)
               );
                $.order = o;
                if ($.sub)
                {
                    if (is_instance($.sub, CombinatorialProxy)) subitem = $.sub.seed(item);
                    subitem = $.sub.item(indx2, suborder);
                    item = self.fusion(item, subitem);
                }
                return item;
            }
            else
            {
                indx = index;
                o = $.order; $.order = order;
                item = self.output(Arithmetic.equ(O, index)
                ? klass.initial(n, $, 1)
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial(n, $, -1)
                : klass.unrank(indx, n, $)));
                $.order = o;
                if ($.sub)
                {
                    if (is_instance($.sub, CombinatorialProxy)) $.sub.seed(item);
                    subitem = $.sub.item(indx2, suborder);
                    item = self.fusion(item, subitem);
                }
                return item;
            }
        }
        return null;
    }

    ,random: function(type, m, M, non_recursive) {
        var self = this, klass = self[CLASS], $ = self.$, item, output, o = $.order;
        non_recursive = !!non_recursive;
        if ("index" === type)
        {
            var Arithmetic = Abacus.Arithmetic,
                N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
                tot, tot_1;

            if (m === !!m)
            {
                non_recursive = m;
                m = null;
                M = null;
            }
            if ($.sub && !non_recursive)
            {
                tot = $.subcount;
                tot_1 = Arithmetic.sub(tot, I);
            }
            else
            {
                tot = $.count;
                tot_1 = $.last;
            }

            if ((null == m) && (null == M) )
            {
                m = O;
                M = tot_1;
            }
            else if (null == M)
            {
                m = N(m || 0);
                M = tot_1;
            }
            else
            {
                m = N(m);
                M = N(M);
            }
            return Arithmetic.rnd(m, M);
        }
        do {
            $.order |= RANDOM;
            item = klass.rand(self.n, $);
            $.order = o;
            item = self.output(item);
            output = $.sub && !non_recursive ? self.fusion(item, is_instance($.sub, CombinatorialProxy) ? $.sub.seed(item).random() : $.sub.random()) : item;
        } while ($.filter && (null!=output) && !$.filter.apply(output, self)); // if custom filter reject if invalid, try next
        return output;
    }

    ,rewind: function(dir) {
        var self = this;
        return self.order(true, -1 === dir ? -1 : 1);
    }

    ,hasNext: function(dir) {
        var self = this;
        return -1 === dir ? (RANDOM & self.$.order ? false : self._prev) : self._next;
    }

    ,next: function(dir) {
        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, dI,
            traversed, r, n = self.n, $ = self.$,
            order = $.order, tot = $.count, tot_1, rs,
            current, has_curr, has_next, has_subnext;

        dir = -1 === dir ? -1 : 1;
        // random order has no prev
        if ((0 > dir) && (RANDOM & order)) return null;

        dI = 0 > dir ? J : I;

        do {
            current = $.sub ? self._subitem : self._item;
            has_curr = null != current;
            has_subnext = false;

            if ($.sub && is_instance($.sub, CombinatorialProxy))
            {
                self.__subindex = $.sub.index();
                self.__subitem = $.sub.next(dir);
                has_subnext = null != self.__subitem;
                has_next = has_subnext;
            }

            if (!has_subnext)
            {
                if (RANDOM & order)
                {
                    tot_1 = $.last;
                    if (Arithmetic.lt(self._index, tot_1))
                    {
                        traversed = self._traversed;
                        if (!traversed)
                        {
                            // random generation
                            self.__item = klass.rand(n, $);
                            self.__index = null;
                        }
                        else
                        {
                            // random unranking
                            // get next un-traversed index, reject if needed
                            r = self.random("index", true);
                            rs = Abacus.Math.rnd() > 0.5 ? J : I;
                            while (traversed.isset(+r)) r = Arithmetic.wrap(Arithmetic.add(r, rs), O, tot_1);
                            traversed.set(+r);
                            self.__item = klass.unrank(r, n, $);
                            if (null != self.__item) self.__index = r;
                        }
                    }
                    else
                    {
                        self._item = self.__item = null;
                        if (self._traversed)
                        {
                            self._traversed.dispose();
                            self._traversed = null;
                        }
                    }
                }
                else
                {
                    // compute next/prev, using successor methods / loopless algorithms,
                    // WITHOUT using big integer arithmetic
                    self.__item = klass.succ(self.__item, self.__index, n, $, dir, self.item__);
                    if (null != self.__item) self.__index = Arithmetic.add(self.__index, dI);
                }
                has_next = null != self.__item;
            }

            if (!has_next)
            {
                if ($.sub && !is_instance($.sub, CombinatorialProxy) && $.sub.hasNext(dir))
                {
                    self.__subindex = $.sub.index();
                    self.__subitem = $.sub.next(dir);
                    if (null == self.__subitem)
                    {
                        // maybe subIter has filtering applied, so check actual .next() returns non-null
                        self.__subindex = null;
                        self.__subitem = null;
                        if (0 > dir)
                        {
                            self._prev = has_next;
                            self._next = has_curr;
                        }
                        else
                        {
                            self._prev = has_curr;
                            self._next = has_next;
                        }
                    }
                    else
                    {
                        if ("sequence" === $.type && $.seq && $.seq.length)
                            for (i=0,l=$.seq.length; i<l; i++) $.seq[i].rewind(dir);
                        self._reset(dir);
                        has_next = null != self.__item;
                    }
                }
                else
                {
                    self.__subindex = null;
                    self.__subitem = null;
                    if (0 > dir)
                    {
                        self._prev = has_next;
                        self._next = has_curr;
                    }
                    else
                    {
                        self._prev = has_curr;
                        self._next = has_next;
                    }
                }
            }
            else
            {
                if (!has_subnext)
                {
                    self._index = Arithmetic.add(self._index, dI);
                    if (null === self.__index) self.__index = self._index;
                }
                if (0 > dir)
                {
                    self._prev = has_next;
                    self._next = has_curr;
                }
                else
                {
                    self._prev = has_curr;
                    self._next = has_next;
                }
            }

            if (!has_subnext) self._item = self.output(self.__item);

            if ($.sub)
            {
                if (!has_subnext && is_instance($.sub, CombinatorialProxy))
                {
                    $.sub.seed(self._item, dir);
                    self.__subindex = $.sub.index();
                    self.__subitem = $.sub.next(dir);
                }
                has_next = has_next && (null != self.__subitem);
                self._subindex = has_next ? (is_instance($.sub, CombinatorialProxy) ? self._index : Arithmetic.add(Arithmetic.mul(self.__subindex||O,tot), self._index)) : null;
                self._subitem = has_next ? self.fusion(self._item, self.__subitem) : null;
                if (0 > dir) self._prev = has_next;
                else self._next = has_next;
            }
        } while ($.filter && (null!=current) && !$.filter.apply(current, self)); // if custom filter, reject if invalid, try next
        return current;
    }

    ,range: function(start, end) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
            tmp, $ = self.$, tot = $.sub ? $.subcount : $.count,
            tot_1 = $.sub ? Arithmetic.sub(tot,I) : $.last,
            range, count, next, i, k, iter_state, dir = 1,
            argslen = arguments.length, not_randomised = !(RANDOM & $.order);
        if (argslen < 1)
        {
            start = O;
            end = tot_1;
        }
        else if (argslen < 2)
        {
            start = N(start);
            end = tot_1;
        }
        else
        {
            start = N(start);
            end = N(end);
        }
        start = Arithmetic.wrapR(start, tot);
        end = Arithmetic.wrapR(end, tot);
        if (Arithmetic.gt(start, end))
        {
            tmp = start;
            start = end;
            end = tmp;
            dir = -1;
        }
        start = Arithmetic.clamp(start, O, tot_1);
        if (not_randomised) end = Arithmetic.clamp(end, O, tot_1);
        if (Arithmetic.lte(start, end))
        {
            // store current iterator state
            iter_state = [
                 self.$.order
                ,self.__index
                ,self._index
                ,self.__item&&self.__item.slice()
                ,self._item
                ,self.__subindex
                ,self._subindex
                ,self.__subitem
                ,self._subitem
                ,self._prev
                ,self._next
            ];

            if (not_randomised) self.index(start);
            count = Arithmetic.val(Arithmetic.sub(end, start));
            /*operate(function(range,ri,i){
                range[i] = self.next(); return range;
            }, new Array(count+1), null, 0>dir?count:0, 0>dir?0:count, 0>dir?-1:1);*/
            range = new Array(count+1);
            k = 0;
            // take into account possible filtering applied
            while (k<=count)
            {
                next = self.next();
                if (null == next) break;
                range[k++] = next;
            }
            // truncate if needed
            if (range.length > k) range.length = k;
            // reverse if needed
            if (0 > dir && 1 < range.length) reflection(range, range);

            // restore previous iterator state
            self.$.order = iter_state[0];
            self.__index = iter_state[1];
            self._index = iter_state[2];
            self.__item = iter_state[3];
            self._item = iter_state[4];
            self.__subindex = iter_state[5];
            self._subindex = iter_state[6];
            self.__subitem = iter_state[7];
            self._subitem = iter_state[8];
            self._prev = iter_state[9];
            self._next = iter_state[10];
            self._update();
        }
        else
        {
            range = [];
        }
        return range;
    }
    ,storeState: function(raw) {
        var self = this, state;
        state = [
             self.$.order
            ,null == self.__index ? null : self.__index.toString()
            ,null == self._index ? null : self._index.toString()
            ,self.__item
            ,self._item
            ,null == self.__subindex ? null : self.__subindex.toString()
            ,null == self._subindex ? null : self._subindex.toString()
            ,self.__subitem
            ,self._subitem
            ,self._prev
            ,self._next
            ,self.$.sub ? self.$.sub.storeState(true) : null
        ];
        return raw ? state : JSON.stringify(state);
    }
    ,resumeState: function(state) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null != state)
        {
            state = is_string(state) ? JSON.parse(state) : state;
            self.$.order = state[0];
            self.__index = null == state[1] ? null : Arithmetic.num(state[1]);
            self._index = null == state[2] ? null : Arithmetic.num(state[2]);
            self.__item = state[3];
            self._item = state[4];
            self.__subindex = null == state[5] ? null : Arithmetic.num(state[5]);
            self._subindex = null == state[6] ? null : Arithmetic.num(state[6]);
            self.__subitem = state[7];
            self._subitem = state[8];
            self._prev = state[9];
            self._next = state[10];
            if (self.$.sub && state[11]) self.$.sub.resumeState(state[11]);
        }
        return self;
    }
});
