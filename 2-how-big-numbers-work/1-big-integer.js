/**
 * Implementing Big integers using 24 bit numbers
 *
 * e.g.
 * ["+", 1, 0, 0] is equal to 1
 * ["+", 8650752, 7098594, 31974] is 900000000000000000000 because
 * 900000000000000000000 = 8650752 + ((7098594 + (31974 * 16777216)) * 16777216)
 */
const radix = 16777216;
const radix_squared = radix ** 2;
const log2_radix = 24;
const plus = '+';
const minus = '-';
const sign = 0;
const least = 1;

function last(array) {
    return array[array.length - 1];
}

function next_to_last(array) {
    return array[array.length - 2];
}

const zero = Object.freeze([plus]);
const wun = Object.freeze([plus, 1]);
const two = Object.freeze([plus, 2]);
const ten = Object.freeze([plus, 10]);
const negative_wun = Object.freeze([minus, 1]);

function is_big_integer(big) {
    return Array.isArray(big) && (big[sign] === plus || big[sign] === minus);
}

function is_negative(big) {
    return Array.isArray(big) && (big[sign] === minus);
}

function is_positive(big) {
    return Array.isArray(big) && (big[sign] === plus);
}

function is_zero(big) {
    return Array.isArray(big) && big.length < 2;
}


/**
 * remove last words from array if they are zero.
 * substitute one of the constants if there is a match otherwise freeze the array
 */
function mint(proto_big_integer) {
    // Remove leading zero megadigits
    while (last(proto_big_integer) === 0) {
        proto_big_integer.length -= 1;
    }
    //substitute a popular constant if possible
    if (proto_big_integer.length <= 1) {
        return zero;
    }
    if (proto_big_integer[sign] === plus) {
        if (proto_big_integer.length === 2) {
            if (proto_big_integer[least] === 1) {
                return wun;
            }
            if (proto_big_integer[least] === 2) {
                return two;
            }
            if (proto_big_integer[least] === 10) {
                return 10;
            }
        }
    } else if (proto_big_integer.length === 2) {
        if (proto_big_integer[least] === 1) {
            return negative_wun;
        }
    }
    return Object.freeze(proto_big_integer);
}

/**
 * Practical Functions
 */

/**
 * Negation
 */
function neg(big) {
    if (is_zero(big)) {
        return zero;
    }
    let negation = big.slice();
    negation[sign] = (
        is_negative(big)
            ? plus
            : minus
    );
    return mint(negation)
}

/**
 * Absolute
 */
function abs(big) {
    return (
        is_zero(big)
            ? zero
            : (
                is_negative(big)
                    ? neg(big)
                    : big
            )
    )
}

/**
 * sign of num
 */
function signum(big) {
    return (
        is_zero(big)
            ? zero
            : (
                is_negative(big)
                    ? negative_wun
                    : wun
            )
    )
}

/**
 * eq to check if two numbers are equal
 */

function eq(comprehend, comparator) {
    return comprehend === comparator || (
        comprehend.length === comparator.length
        && comprehend.every(function (element, element_nr) {
            return element === comparator[element_nr]
        })
    );
}

/**
 * abs_lt: determine if absolute value is less than
 */
function abs_lt(comprehend, comparator) {
    return (
        comprehend.length === comparator.length
            ? comprehend.reduce(
                function (reduction, element, element_nr) {
                    if (element_nr !== sign) {
                        const other = comparator[element_nr];
                        if (element !== other) {
                            return element < other;
                        }
                    }
                    return reduction;
                },
                false
            )
            : comprehend.length < comparator.length
    );
}

/**
 * check if signed value of one is less than the other
 */
function lt(comprehend, comparator) {
    return (
        comprehend[sign] !== comparator[sign]
            ? is_negative(comprehend)
            : (
                is_negative(comparator)
                    ? abs(comparator, comprehend)
                    : abs_lt(comprehend, comparator)
            )
    );
}

/**
 * some other functions
 */
function ge(a, b) {
    return !lt(a, b);
}

function gt(a, b) {
    return lt(b, a);
}
function le(a, b) {
    return !lt(b, a)
}


/**
 * Bitwise functions
 * Assuming that signs are irrelevant
 * process the shorted array
 */

/**
 * and
 */
function and(a, b) {
    // make a the shorter array
    if (a.length > b.length) {
        [a, b] = [b, a];
    }
    return mint(a.map(function (element, element_nr) {
        return (
            element_nr === sign
                ? plus
                : element & b[element_nr]
        );
    }))
}

/**
 * or
 */
function or(a, b) {
    // make a the longer array
    if (a.length < b.length) {
        [a, b] = [b, a];
    }
    return mint(a.map(function (element, element_nr) {
        return (
            element_nr === sign
                ? plus
                : element | (b[element_nr] || 0)
        );
    }))
}

/**
 * xor
 */
function xor(a, b) {
    // make a the longer array
    if (a.length < b.length) {
        [a, b] = [b, a];
    }
    return mint(a.map(function (element, element_nr) {
        return (
            element_nr === sign
                ? plus
                : element ^ (b[element_nr] || 0)
        );
    }))
}


/**
 * Some functions require small integer. This function will take care of that
 */
function int(big) {
    let result;
    if (typeof big === 'number') {
        if (Number.isSafeInteger(big)) {
            return big;
        }
    } else if (is_big_integer(big)) {
        if (big.length < 2) {
            return zero;
        }
        if (big.length === 2) {
            return (
                is_negative(big)
                    ? -big[least]
                    : big[least]
            );
        }
        if (big.length === 3) {
            result = big[least + 1] * radix + big[least];
            return (
                is_negative(big)
                    ? -result
                    : result
            );
        }
        if (big.length === 4) {
            result = (
                big[least + 2] * radix_squared
                + big[least + 1] * radix
                + big[least]
            );
            if (Number.isSafeInteger(result)) {
                return (
                    is_negative(big)
                        ? -result
                        : result
                );
            }
        }
    }
}


/**
 * Shift down (similar to right shift)
 */
function shift_down(big, places) {
    if (is_zero(big)) {
        return zero;
    }
    places = int(places);
    if (Number.isSafeInteger(places)) {
        if (places === 0) {
            return abs(big);
        }
        if (places < 0) {
            return shift_up(big, -places);
        }
        let skip = Math.floor(places / log2_radix);
        places -= skip * log2_radix;

        if (skip + 1 >= big.length) {
            return zero;
        }
        big = (
            skip > 0
                ? mint(zero.concat(big.slice(skip + 1)))
                : big
        );
        if (places === 0) {
            return big;
        }
        return mint(big.map(function (element, element_nr) {
            if (element_nr === sign) {
                return plus;
            }
            return ((radix - 1) & (
                (element >> places)
                | ((big[element_nr + 1] || 0) << (log2_radix - places))
            ));
        }));
    }
}


function shift_up(big, places) {
    if (is_zero(big)) {
        return zero;
    }
    places = int(places);
    if (Number.isSafeInteger(places)) {
        if (places === 0) {
            return abs(big);
        }
        if (places < 0) {
            return shift_down(big, -places);
        }
        let blanks = Math.floor(places / log2_radix);
        let result = new Array(blanks + 1).fill(0);
        result[sign] = plus;
        places -= blanks * log2_radix;

        if (places === 0) {
            return mint(result.concat(big.slice(least)));
        }
        let carry = big.reduce(function (accumulator, element, element_nr) {
            if (element_nr === sign) {
                return 0;
            }
            result.push(((element << places) | accumulator) & (radix - 1));
            return element >> (log2_radix - places);
        }, 0);
        if (carry > 0) {
            result.push(carry);
        }
        return mint(result);
    }
}
