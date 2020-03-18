function deconstruct(number){
    // number = sign * coefficient * ( 2 ** exponent) ;
    let sign = 1;
    let coefficient = number;
    let exponent = 0;

    // remove sign from coefficient
    if (coefficient < 0 ){
        sign = -1;
        coefficient = -coefficient;
    }

    if (Number.isFinite(number)&& number != 0) {
        // exponent of Number.MIN_VALUE minus the number of bits in the significand minus the bonus bit
        exponent = -1128;
        let reduction = coefficient;
        while(reduction !== 0){
            exponent += 1;
            reduction /= 2;
        }

        reduction = exponent;

        // if exponent is zero, the number can be viewed as an integer
        while(reduction > 0){
            coefficient /= 2;
            reduction -= 1;
        }

        // if its not zero, adjust the coefficient
        while(reduction < 0){
            coefficient *= 2;
            reduction += 1;
        }

        return {
            sign,
            coefficient,
            exponent,
            number
        }
    }
}


console.log(deconstruct(Number.MAX_SAFE_INTEGER));
console.log(deconstruct(1));
