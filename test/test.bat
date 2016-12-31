rem @echo off

call node permutations.js > permutations.txt
call node cyclic_permutations.js > cyclic_permutations.txt
call node permutations-bigint.js > permutations-bigint.txt
call node combinations.js > combinations.txt
call node combinations_repeats.js > combinations_repeats.txt
call node subsets.js > subsets.txt
call node partitions.js > partitions.txt
call node set_partitions.js > set_partitions.txt
call node restricted_partitions.js > restricted_partitions.txt
call node tensors.js > tensors.txt
call node tuples.js > tuples.txt

