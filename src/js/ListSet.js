// ListSet, a fixed-size array which is also a doubly-lnked list and allows for O(1) retrieval, removal, re-addition and traverse asc/desc only valid items.
ListSet = Abacus.ListSet = function ListSet(a) {
    var self = this, i, n, _first, _last;
    if (!is_instance(self, ListSet)) return new ListSet(a);
    a = is_array(a) ? a.slice() : new Array(+a);
    n = a.length;
    for (i=0; i<n; i++)
    {
        a[i] = {value:a[i], index:i, incl:true, prev:null, next:null};
        if (0 < i)
        {
            a[i-1].next = a[i];
            a[i].prev = a[i-1];
        }
    }
    _first = a[0]; _last = a[n-1];

    self.first = function() {
        return _first;
    };
    self.last = function() {
        return _last;
    };
    self.rem = function(x) {
        // remove x from listset
        var item = null;
        if (x === +x)
        {
            if (0>x || x>=n) return self;
            item = a[x];
        }
        else if (x && (null != x.index))
        {
            if (0>x.index || x.index>=n) return self;
            item = x;
        }
        else
        {
            return self;
        }
        if (item.incl)
        {
            if (_first === item) _first = item.next;
            if (_last === item) _last = item.prev;
            if (item.prev) item.prev.next = item.next;
            if (item.next) item.next.prev = item.prev;
            item.incl = false;
        }
        return self;
    };
    self.add = function(x) {
        // add x back to listset
        var item = null;
        if (x === +x)
        {
            if (0>x || x>=n) return self;
            item = a[x];
        }
        else if (x && (null != x.index))
        {
            if (0>x.index || x.index>=n) return self;
            item = x;
        }
        else
        {
            return self;
        }
        if (!item.incl)
        {
            if (_first === item.next) _first = item;
            if (_last === item.prev) _last = item;
            if (item.prev) item.prev.next = item;
            if (item.next) item.next.prev = item;
            item.incl = true;
        }
        return self;
    };
    self.has = function(x) {
        // check if x is included
        var item = null;
        if (x === +x)
        {
            if (0>x || x>=n) return false;
            item = a[x];
        }
        else if (x && (null != x.index))
        {
            if (0>x.index || x.index>=n) return false;
            item = x;
        }
        else
        {
            return false;
        }
        return item.incl;
    };
    self.item = function(x) {
        // return x
        var item = null;
        if (x === +x)
        {
            if (0>x || x>=n) return false;
            item = a[x];
        }
        else if (x && (null != x.index))
        {
            if (0>x.index || x.index>=n) return false;
            item = x;
        }
        else
        {
            return null;
        }
        return item;
    };
    self.dispose = function() {
        a = null;
        _first = null;
        _last = null;
        return self;
    };
};
