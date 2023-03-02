const a = function (x) {
    console.log(`Entering a(${ x }) at line 1`);
    return x + 1;
};
const b = function (x) {
    console.log(`Entering b(${ x }) at line 4`);
    return x + 2;
};
console.log(a(1));
console.log(b(1));