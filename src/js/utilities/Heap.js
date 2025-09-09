// min/max Heap / priority queue class, adapted from python's heapq.py
Heap = Abacus.Heap = Class({
    constructor: function Heap(h, type, cmp) {
        var self = this;
        if (!is_instance(self, Heap)) return new Heap(h, type, cmp);
        type = String(type||"min").toLowerCase().slice(0, 3);
        self.type = "max" === type ? "max" : "min";
        if (!is_callable(cmp)) cmp = Heap.CMP;
        self.cmp = cmp;
        h = h || [];
        self._h = Heap.heapify(h, self.type, self.cmp);
    }

    ,__static__: {
         CMP: function(a, b) {
             return a < b ? -1 : (a > b ? 1 : 0);
         }

        ,heapify: function(x, type, cmp) {
            // Transform list into a heap/maxheap, in-place, in O(len(x)) time.
            var n = x.length, i;
            // Transform bottom-up.  The largest index there's any point to looking at
            // is the largest with a child index in-range, so must have 2*i + 1 < n,
            // or i < (n-1)/2.  If n is even = 2*j, this is (2*j-1)/2 = j-1/2 so
            // j-1 is the largest, which is n//2 - 1.  If n is odd = 2*j+1, this is
            // (2*j+1-1)/2 = j so j-1 is the largest, and that's again n//2-1.
            cmp = cmp || Heap.CMP;
            if ("max" === type)
            {
                for (i=(n>>>1)-1; i>=0; --i)
                    Heap._siftup_max(x, i, cmp);
            }
            else
            {
                for (i=(n>>>1)-1; i>=0; --i)
                    Heap._siftup(x, i, cmp);
            }
            return x;
        }

        ,_siftdown: function(heap, startpos, pos, cmp) {
            var newitem = heap[pos], parentpos, parent;
            // Follow the path to the root, moving parents down until finding a place
            // newitem fits.
            while (pos > startpos)
            {
                parentpos = (pos - 1) >>> 1;
                parent = heap[parentpos];
                if (0 > cmp(newitem, parent))
                {
                    heap[pos] = parent;
                    pos = parentpos;
                    continue;
                }
                break;
            }
            heap[pos] = newitem;
        }
        ,_siftup: function(heap, pos, cmp) {
            var endpos = heap.length, startpos = pos, newitem = heap[pos], childpos, rightpos;
            // Bubble up the smaller child until hitting a leaf.
            childpos = 2*pos + 1;    // leftmost child position
            while (childpos < endpos)
            {
                // Set childpos to index of smaller child.
                rightpos = childpos + 1;
                if (rightpos < endpos && 0 <= cmp(heap[childpos], heap[rightpos]))
                    childpos = rightpos;
                // Move the smaller child up.
                heap[pos] = heap[childpos];
                pos = childpos;
                childpos = 2*pos + 1;
            }
            // The leaf at pos is empty now.  Put newitem there, and bubble it up
            // to its final resting place (by sifting its parents down).
            heap[pos] = newitem;
            Heap._siftdown(heap, startpos, pos, cmp);
        }
        ,_siftdown_max: function(heap, startpos, pos, cmp) {
            // Maxheap variant of _siftdown
            var newitem = heap[pos], parentpos, parent;
            // Follow the path to the root, moving parents down until finding a place
            // newitem fits.
            while (pos > startpos)
            {
                parentpos = (pos - 1) >>> 1;
                parent = heap[parentpos];
                if (0 > cmp(parent, newitem))
                {
                    heap[pos] = parent;
                    pos = parentpos;
                    continue;
                }
                break;
            }
            heap[pos] = newitem;
        }
        ,_siftup_max: function(heap, pos, cmp) {
            // Maxheap variant of _siftup
            var endpos = heap.length, startpos = pos, newitem = heap[pos], childpos, rightpos;
            // Bubble up the larger child until hitting a leaf.
            childpos = 2*pos + 1;    // leftmost child position
            while (childpos < endpos)
            {
                // Set childpos to index of larger child.
                rightpos = childpos + 1;
                if (rightpos < endpos && 0 <= cmp(heap[rightpos], heap[childpos]))
                    childpos = rightpos;
                // Move the larger child up.
                heap[pos] = heap[childpos];
                pos = childpos;
                childpos = 2*pos + 1;
            }
            // The leaf at pos is empty now.  Put newitem there, and bubble it up
            // to its final resting place (by sifting its parents down).
            heap[pos] = newitem;
            Heap._siftdown_max(heap, startpos, pos, cmp);
        }
    }

    ,_h: null
    ,type: "min"
    ,cmp: null

    ,dispose: function() {
        var self = this;
        self._h = null;
        self.cmp = null;
        return self;
    }
    ,peek: function() {
        var heap = this._h;
        return heap.length ? heap[0] : null;
    }
    ,push: function(item) {
        // Push item onto heap, maintaining the heap invariant.
        var self = this;
        self._h.push(item);
        if ("max" === self.type)
            Heap._siftdown_max(self._h, 0, self._h.length-1, self.cmp);
        else
            Heap._siftdown(self._h, 0, self._h.length-1, self.cmp);
        return self;
    }
    ,pop: function() {
        // Pop the smallest item off the heap, maintaining the heap invariant.
        var self = this, lastelt, returnitem;
        lastelt = self._h.pop();
        if (self._h.length)
        {
            returnitem = self._h[0];
            self._h[0] = lastelt;
            // Maxheap version of a heappop.
            if ("max" === self.type)
                Heap._siftup_max(self._h, 0, self.cmp);
            else
                Heap._siftup(self._h, 0, self.cmp);
            return returnitem;
        }
        return lastelt;
    }
    ,replace: function(item) {
        var self = this, returnitem;
        /* Pop and return the current smallest value, and add the new item.

        This is more efficient than heappop() followed by heappush(), and can be
        more appropriate when using a fixed-size heap.  Note that the value
        returned may be larger than item!  That constrains reasonable uses of
        this routine unless written as part of a conditional replacement:

            if item > heap[0]:
                item = heapreplace(heap, item)
        */
        returnitem = self.peek();
        self._h[0] = item;
        // Maxheap version of a heappop followed by a heappush.
        if ("max" === self.type)
            Heap._siftup_max(self._h, 0, self.cmp);
        else
            Heap._siftup(self._h, 0, self.cmp);
        return returnitem;
    }
});
