// combinatorial objects iterator ordering patterns
// https://oeis.org/wiki/Orderings
function ORDER(o)
{
    if (!arguments.length || (null == o)) return LEX; // default
    var order = 0;
    if (is_string(o))
    {
        o = o.toUpperCase().split(',').map(trim);
        for (var i=0,l=o.length; i<l; ++i) order |= o[i].length && HAS.call(ORDER, o[i]) ? ORDER[o[i]] : 0;
        //order = ORDERINGS & order;
        if ((0 < order) && !((LEXICAL | RANDOM) & order)) order |= LEX;
        if (0 >= order) order = LEX;
    }
    else
    {
        order = ORDERINGS & o ? (ORDERINGS & o) : LEX;
    }
    // only one main ordering
    if ((RANDOM & order) && (LEXICAL & order)) order &= ~LEXICAL;
    if ((MINIMAL & order) && ((COLEX|LEX) & order)) order &= ~(COLEX|LEX);
    if ((COLEX & order) && (LEX & order)) order &= ~LEX;
    // random has no reverse
    if (RANDOM & order) order &= ~REVERSED;
    return order;
}
ORDER.LEX = ORDER.LEXICOGRAPHIC = LEX;
ORDER.COLEX = ORDER.COLEXICOGRAPHIC = COLEX;
ORDER.MINIMAL = ORDER.GRAY = MINIMAL;
ORDER.RANDOM = RANDOM;
ORDER.REV = ORDER.ANTI = ORDER.REVERSE = ORDER.REVERSED = REVERSED;
ORDER.REF = ORDER.REFLECT = ORDER.REFLECTED = REFLECTED;
ORDER.REVLEX = ORDER.ANTILEX = ORDER.REVERSELEXICOGRAPHIC = ORDER.ANTILEXICOGRAPHIC = LEX | REVERSED;
ORDER.REFLEX = ORDER.REFLECTEDLEXICOGRAPHIC = LEX | REFLECTED;
ORDER.REVCOLEX = ORDER.ANTICOLEX = ORDER.REVERSECOLEXICOGRAPHIC = ORDER.ANTICOLEXICOGRAPHIC = COLEX | REVERSED;
ORDER.REFCOLEX = ORDER.REFLECTEDCOLEXICOGRAPHIC = COLEX | REFLECTED;
Abacus.ORDER = ORDER;
