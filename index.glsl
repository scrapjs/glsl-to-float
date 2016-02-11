highp float shift_right (highp float v, highp float amt) {
    v = floor(v) + 0.5;
    return floor(v / exp2(amt));
}
highp float shift_left (highp float v, highp float amt) {
    return floor(v * exp2(amt) + 0.5);
}
highp float mask_last (highp float v, highp float bits) {
    return mod(v, shift_left(1.0, bits));
}
highp float extract_bits (highp float num, highp float from, highp float to) {
    from = floor(from + 0.5); to = floor(to + 0.5);
    return mask_last(shift_right(num, from), to - from);
}
lowp vec4 encode_float (highp float val) {
    if (val == 0.0) return vec4(0, 0, 0, 0);
    highp float sign = val > 0.0 ? 0.0 : 1.0;
    val = abs(val);
    highp float exponent = floor(log2(val));
    highp float biased_exponent = exponent + 127.0;
    highp float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;
    highp float t = biased_exponent / 2.0;
    highp float last_bit_of_biased_exponent = fract(t) * 2.0;
    highp float remaining_bits_of_biased_exponent = floor(t);
    highp float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;
    highp float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;
    highp float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;
    highp float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;
    return vec4(byte4, byte3, byte2, byte1);
}

#pragma glslify: export(encode_float)