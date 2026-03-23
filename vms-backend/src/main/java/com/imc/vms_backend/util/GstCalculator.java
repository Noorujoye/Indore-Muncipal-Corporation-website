package com.imc.vms_backend.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class GstCalculator {

    
    private static final BigDecimal CGST_RATE = new BigDecimal("0.09");
    
    
    private static final BigDecimal SGST_RATE = new BigDecimal("0.09");

    public static BigDecimal cgst(BigDecimal base) {
        if (base == null) return BigDecimal.ZERO;
        return base.multiply(CGST_RATE).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal sgst(BigDecimal base) {
        if (base == null) return BigDecimal.ZERO;
        return base.multiply(SGST_RATE).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal total(BigDecimal base) {
        if (base == null) return BigDecimal.ZERO;
        return base.add(cgst(base)).add(sgst(base));
    }
}
