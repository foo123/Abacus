// Abacus.Filter, Filter class used to define and combine filters to filter combinatorial object by them
Filter = Abacus.Filter = Class({

    constructor: function Filter(filter) {
        var self = this;
        if (!is_instance(self, Filter)) return new Filter(filter);
        self.filter = filter || null;
    }

    ,__static__: {
        UNIQUE: function() {
            return Filter(function(item){
                var i, n = item.length, seen = {};
                for (i=0; i<n; i++)
                {
                    if (1===seen[item[i]]) return false;
                    seen[item[i]] = 1;
                }
                return true;
            });
        }
        ,SORTED: function(dir, strict) {
            if (2 > arguments.length || null == strict) strict = true;
            if (is_string(dir))
            {
                if ("<" === dir)
                {
                    dir = 1;
                    strict = true;
                }
                else if (">" === dir)
                {
                    dir = -1;
                    strict = true;
                }
                else if ("<=" === dir || "=<" === dir)
                {
                    dir = 1;
                    strict = false;
                }
                else if (">=" === dir || "=>" === dir)
                {
                    dir = -1;
                    strict = false;
                }
            }
            dir = +dir;
            dir = -1 === dir ? -1 : 1;
            return Filter(-1 === dir ? function(item){
                for (var item0=item[0],i=1,n=item.length; i<n; i++)
                {
                    if ((strict && item0<=item[i]) || (!strict && item0<item[i])) return false;
                    item0 = item[i];
                }
                return true;
            } : function(item){
                for (var item0=item[0],i=1,n=item.length; i<n; i++)
                {
                    if ((strict && item0>=item[i]) || (!strict && item0>item[i])) return false;
                    item0 = item[i];
                }
                return true;
            });
        }
        ,LEN: function(val, comp) {
            comp = comp || "==";
            val = +val;
            if (">=" === comp)
            {
                return Filter(function(item){ return item.length >= val; });
            }
            else if (">" === comp)
            {
                return Filter(function(item){ return item.length > val; });
            }
            else if ("<" === comp)
            {
                return Filter(function(item){ return item.length < val; });
            }
            else if ("<=" === comp)
            {
                return Filter(function(item){ return item.length <= val; });
            }
            else if ("!=" === comp)
            {
                return Filter(function(item){ return item.length !== val; });
            }
            else //if ("==" === comp)
            {
                return Filter(function(item){ return item.length === val; });
            }
        }
        ,VAL: function(pos, val, comp) {
            comp = comp || "==";
            //val = +val;
            pos = +pos;
            if (">=" === comp || "=>" === comp)
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]>=val; });
            }
            else if (">" === comp)
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]>val; });
            }
            else if ("<" === comp)
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]<val; });
            }
            else if ("<=" === comp || "=<" === comp)
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]<=val; });
            }
            else if ("!=" === comp)
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]!==val; });
            }
            else //if ("==" === comp)
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]===val; });
            }
        }
        ,MAX: function(val, comp) {
            comp = comp || "==";
            val = +val;
            if (">=" === comp || "=>" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] > M) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) >= val; });
            }
            else if (">" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] > M) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) > val; });
            }
            else if ("<" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] > M) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) < val; });
            }
            else if ("<=" === comp || "=<" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] > M) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) <= val; });
            }
            else if ("!=" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] > M) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) !== val; });
            }
            else //if ("==" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] > M) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) === val; });
            }
        }
        ,MIN: function(val, comp) {
            comp = comp || "==";
            val = +val;
            if (">=" === comp || "=>" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] < M) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) >= val; });
            }
            else if (">" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] < M) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) > val; });
            }
            else if ("<" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] < M) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) < val; });
            }
            else if ("<=" === comp || "=<" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] < M) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) <= val; });
            }
            else if ("!=" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] < M) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) !== val; });
            }
            else //if ("==" === comp)
            {
                return Filter(function(item){ return operate(function(M,i){
                    if (item[i] < M) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) === val; });
            }
        }
        ,BETWEEN: function(m, M, inclusive) {
            m = +m; M = +M;
            if (m > M){ var t=m; m=M; M=t; }
            if (3 > arguments.length || null == inclusive) inclusive = true;
            return Filter(inclusive ? function(item){
                for (var i=0,n=item.length; i<n; i++)
                {
                    if (item[i]<m || item[i]>M) return false;
                }
                return true;
            } : function(item){
                for (var i=0,n=item.length; i<n; i++)
                {
                    if (item[i]<=m || item[i]>=M) return false;
                }
                return true;
            });
        }
        ,DIFF: function(iter) {
            return Filter(is_instance(iter, CombinatorialIterator) ? function(item){
                return !iter.has(item);
            } : function(item){
                return true;
            });
        }
        ,MOD: function(iter, item0) {
            var index0 = null == item0 || !is_instance(iter, CombinatorialIterator) ? Abacus.Arithmetic.O : iter.index(item0);
            return Filter(is_instance(iter, CombinatorialIterator) ? function(item){
                return Abacus.Arithmetic.equ(index0, iter.index(item));
            } : function(item){
                return true;
            });
        }
    }

    ,filter: null

    ,dispose: function() {
        var self = this;
        self.filter = null;
        return self;
    }

    ,apply: function(item, inst) {
        var filter = this.filter;
        return filter && is_callable(filter) ? Boolean(filter.call(inst||null, item)) : true;
    }

    ,NOT: function() {
        var self = this;
        return Filter(function(item){ return !self.apply(item, this); });
    }

    ,OR: function(otherFilter) {
        var self = this;
        if (is_callable(otherFilter) || is_instance(otherFilter, Filter))
        {
            if (!is_instance(otherFilter, Filter)) otherFilter = Filter(otherFilter);
            return Filter(function(item){ return self.apply(item, this) || otherFilter.apply(item, this); });
        }
        return self;
    }

    ,XOR: function(otherFilter) {
        var self = this;
        if (is_callable(otherFilter) || is_instance(otherFilter, Filter))
        {
            if (!is_instance(otherFilter, Filter)) otherFilter = Filter(otherFilter);
            return Filter(function(item){
                var r1 = self.apply(item, this), r2 = otherFilter.apply(item, this);
                return (r1 && !r2) || ((!r1) && r2);
            });
        }
        return self;
    }

    ,AND: function(otherFilter) {
        var self = this;
        if (is_callable(otherFilter) || is_instance(otherFilter, Filter))
        {
            if (!is_instance(otherFilter, Filter)) otherFilter = Filter(otherFilter);
            return Filter(function(item){ return self.apply(item, this) && otherFilter.apply(item, this); });
        }
        return self;
    }
});
