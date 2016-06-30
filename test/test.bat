rem @echo off

call node permutations.js > permutations.txt
call node permutations-bigint.js > permutations-bigint.txt
call node combinations.js > combinations.txt
call node combinations_repeats.js > combinations_repeats.txt
rem call node subsets.js > subsets.txt
rem call node partitions.js > partitions.txt
call node tensors.js > tensors.txt
call node tuples.js > tuples.txt

