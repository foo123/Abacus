rem @echo off

call node tensors.js > tensors.txt
call node tuples.js > tuples.txt
call node permutations.js > permutations.txt
call node permutations-bigint.js > permutations-bigint.txt
call node cyclic_permutations.js > cyclic_permutations.txt
call node combinations.js > combinations.txt
call node combinations_repeats.js > combinations_repeats.txt
call node all_combinations.js > all_combinations.txt
call node subsets.js > subsets.txt
call node partitions.js > partitions.txt
rem call node restricted_partitions.js > restricted_partitions.txt
rem call node set_partitions.js > set_partitions.txt

