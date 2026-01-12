// 浮点数格式定义
export interface FloatFormat {
  name: string;
  bits: number;
  signBits: number;
  exponentBits: number;
  mantissaBits: number;
  exponentBias: number;
}

export const FLOAT_FORMATS: Record<string, FloatFormat> = {
  'fp32': {
    name: 'FP32 (Single Precision)',
    bits: 32,
    signBits: 1,
    exponentBits: 8,
    mantissaBits: 23,
    exponentBias: 127,
  },
  'fp64': {
    name: 'FP64 (Double Precision)',
    bits: 64,
    signBits: 1,
    exponentBits: 11,
    mantissaBits: 52,
    exponentBias: 1023,
  },
  'fp16': {
    name: 'Half',
    bits: 16,
    signBits: 1,
    exponentBits: 5,
    mantissaBits: 10,
    exponentBias: 15,
  },
  'bf16': {
    name: 'BFloat16 (E8M7)',
    bits: 16,
    signBits: 1,
    exponentBits: 8,
    mantissaBits: 7,
    exponentBias: 127,
  },
  'fp8_e4m3': {
    name: 'FP8 Training (E4M3)',
    bits: 8,
    signBits: 1,
    exponentBits: 4,
    mantissaBits: 3,
    exponentBias: 7,
  },
  'fp8_e5m2': {
    name: 'FP8 Inference (E5M2)',
    bits: 8,
    signBits: 1,
    exponentBits: 5,
    mantissaBits: 2,
    exponentBias: 15,
  },
  'fp4_e2m1': {
    name: 'FP4 E2M1',
    bits: 4,
    signBits: 1,
    exponentBits: 2,
    mantissaBits: 1,
    exponentBias: 1,
  },
};

// 解析浮点数到位
export function parseFloatToBits(value: number, format: FloatFormat): {
  sign: string;
  exponent: string;
  mantissa: string;
  bits: string;
  exponentValue: number;
  mantissaValue: number;
  isNormalized: boolean;
  isDenormalized: boolean;
  isZero: boolean;
  isInfinity: boolean;
  isNaN: boolean;
} {
  let bits: string;
  let isZero = false;
  let isInfinity = false;
  let isNaN = false;
  let isNormalized = true;
  let isDenormalized = false;

  if (format.bits === 32) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, value);
    const uint32 = view.getUint32(0);
    bits = uint32.toString(2).padStart(32, '0');
  } else if (format.bits === 64) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, value);
    const uint64 = view.getBigUint64(0);
    bits = uint64.toString(2).padStart(64, '0');
  } else {
    // 对于非标准格式（FP8, FP4, FP16），需要特殊处理
    bits = simulateFloatToBits(value, format);
  }

  const sign = bits.substring(0, format.signBits);
  const exponent = bits.substring(format.signBits, format.signBits + format.exponentBits);
  const mantissa = bits.substring(format.signBits + format.exponentBits);

  const exponentInt = parseInt(exponent, 2);
  const mantissaInt = parseInt(mantissa, 2);

  // 检查特殊值
  const allOnesExponent = Math.pow(2, format.exponentBits) - 1;
  
  if (exponentInt === 0 && mantissaInt === 0) {
    isZero = true;
    isNormalized = false;
  } else if (exponentInt === 0) {
    isDenormalized = true;
    isNormalized = false;
  } else if (exponentInt === allOnesExponent) {
    // FP8 E4M3 和 FP4 E2M1 扩展模式：不支持 INF/NaN，所有位组合都是有效值
    if ((format.exponentBits === 4 && format.mantissaBits === 3) ||
        (format.exponentBits === 2 && format.mantissaBits === 1)) {
      // 扩展模式：视为规格化数，指数可以是最大值（FP8: 15, FP4: 3）
      // 不判断为 INF 或 NaN
      isNormalized = true;
    } else if (mantissaInt === 0) {
      // 标准格式：判断为 Infinity
      isInfinity = true;
      isNormalized = false;
    } else {
      // 标准格式：判断为 NaN
      isNaN = true;
      isNormalized = false;
    }
  }

  return {
    sign,
    exponent,
    mantissa,
    bits,
    exponentValue: exponentInt,
    mantissaValue: mantissaInt,
    isNormalized,
    isDenormalized,
    isZero,
    isInfinity,
    isNaN,
  };
}

// 模拟非标准浮点数到位的转换
function simulateFloatToBits(value: number, format: FloatFormat): string {
  const isNegative = value < 0 || (value === 0 && 1 / value < 0);
  const absValue = Math.abs(value);
  const signBit = isNegative ? '1' : '0';

  if (absValue === 0) {
    return signBit + '0'.repeat(format.exponentBits) + '0'.repeat(format.mantissaBits);
  }

  if (!isFinite(value)) {
    const allOnes = '1'.repeat(format.exponentBits);
    return signBit + allOnes + (isNaN(value) ? '1' : '0').repeat(format.mantissaBits);
  }

  // FP8 E4M3 和 FP4 E2M1 特殊处理：扩展指数范围，不支持 INF/NaN
  let maxExp: number;
  let minExp: number;

  if (format.exponentBits === 4 && format.mantissaBits === 3) {
    // FP8 E4M3: 扩展模式，指数范围 1-15（支持 [-480, 480]）
    maxExp = 15;
    minExp = 1 - format.exponentBias;
  } else if (format.exponentBits === 2 && format.mantissaBits === 1) {
    // FP4 E2M1: 不支持 INF/NaN，所有位组合都是有效值
    // 指数范围：00, 01, 10, 11 都是规格化数
    maxExp = Math.pow(2, format.exponentBits) - 1; // 11 = 3
    minExp = 1 - format.exponentBias;
  } else {
    // 其他格式：标准 IEEE 754
    maxExp = Math.pow(2, format.exponentBits) - 2;
    minExp = 1 - format.exponentBias;
  }

  // 计算指数
  let exponent = Math.floor(Math.log2(absValue));

  // 检查是否超出范围
  if (exponent > maxExp) {
    const allOnes = '1'.repeat(format.exponentBits);
    // FP8 E4M3 和 FP4 E2M1 扩展模式：不支持 INF/NaN，限制到最大值
    if ((format.exponentBits === 4 && format.mantissaBits === 3) ||
        (format.exponentBits === 2 && format.mantissaBits === 1)) {
      // 返回最大值的位表示：符号位 + 指数全1 + 尾数全1
      const allMantissa = '1'.repeat(format.mantissaBits);
      return signBit + allOnes + allMantissa;
    } else {
      return signBit + allOnes + '0'.repeat(format.mantissaBits); // Infinity
    }
  }

  // 检查是否为非规格化
  if (exponent < minExp) {
    // 非规格化数
    let shifted = absValue;
    const denormalMin = Math.pow(2, minExp - format.mantissaBits);
    if (shifted < denormalMin) {
      return signBit + '0'.repeat(format.exponentBits) + '0'.repeat(format.mantissaBits);
    }

    // 计算非规格化表示
    const denormalExp = minExp - format.mantissaBits;
    const mantissaInt = Math.round(absValue / Math.pow(2, denormalExp));
    const mantissaBitsStr = mantissaInt.toString(2).padStart(format.mantissaBits, '0');
    return signBit + '0'.repeat(format.exponentBits) + mantissaBitsStr.substring(mantissaBitsStr.length - format.mantissaBits);
  }

  // 规格化数
  const biasedExponent = exponent + format.exponentBias;
  let mantissa = absValue / Math.pow(2, exponent) - 1;

  // 转换为整数（使用 CUDA RN 舍入模式）
  const mantissaScale = Math.pow(2, format.mantissaBits);
  const mantissaFloat = mantissa * mantissaScale;

  // CUDA RN (Round to Nearest) 舍入模式
  let mantissaInt: number;
  if (mantissaFloat >= 0) {
    mantissaInt = Math.floor(mantissaFloat + 0.5);
  } else {
    mantissaInt = Math.floor(mantissaFloat + 0.5);
  }

  // 处理尾数溢出
  if (mantissaInt >= mantissaScale) {
    mantissaInt = 0;
    const newBiasedExponent = biasedExponent + 1;
    // FP8 E4M3 和 FP4 E2M1 扩展模式：支持更大的指数范围
    const newMaxExp = (format.exponentBits === 4 && format.mantissaBits === 3) ||
                     (format.exponentBits === 2 && format.mantissaBits === 1)
                     ? Math.pow(2, format.exponentBits) - 1
                     : Math.pow(2, format.exponentBits) - 2;

    if (newBiasedExponent >= newMaxExp) {
      // 指数溢出
      if ((format.exponentBits === 4 && format.mantissaBits === 3) ||
          (format.exponentBits === 2 && format.mantissaBits === 1)) {
        // FP8 E4M3 和 FP4 E2M1：限制到最大值，而不是返回 INF
        const allOnes = '1'.repeat(format.exponentBits);
        const allMantissa = '1'.repeat(format.mantissaBits);
        return signBit + allOnes + allMantissa;
      } else {
        // 标准格式：返回 INF
        const allOnes = '1'.repeat(format.exponentBits);
        return signBit + allOnes + '0'.repeat(format.mantissaBits);
      }
    }
  }

  const exponentBitsStr = Math.min(biasedExponent, Math.pow(2, format.exponentBits) - 1).toString(2).padStart(format.exponentBits, '0');
  const mantissaBitsStr = mantissaInt.toString(2).padStart(format.mantissaBits, '0');

  return signBit + exponentBitsStr + mantissaBitsStr;
}

// 从位构建浮点数值
export function buildFloatFromBits(sign: string, exponentBits: string, mantissaBits: string, format: FloatFormat): number {
  const signBit = parseInt(sign, 2);
  const exponentInt = parseInt(exponentBits, 2);
  const mantissaInt = parseInt(mantissaBits, 2);

  const allOnesExponent = Math.pow(2, format.exponentBits) - 1;

  // 特殊值处理
  if (exponentInt === 0) {
    if (mantissaInt === 0) {
      return signBit ? -0 : 0;
    }
    // 非规格化数
    const value = mantissaInt / Math.pow(2, format.mantissaBits + format.exponentBias - 1);
    return signBit ? -value : value;
  }

  // FP8 E4M3 和 FP4 E2M1 特殊处理：不支持 INF/NaN，所有位组合都是有效值
  if ((format.exponentBits === 4 && format.mantissaBits === 3) ||
      (format.exponentBits === 2 && format.mantissaBits === 1)) {
    // 扩展模式：即使指数全1，也视为规格化数
    // 不判断为 INF 或 NaN
  } else if (exponentInt === allOnesExponent) {
    if (mantissaInt === 0) {
      return signBit ? -Infinity : Infinity;
    }
    return NaN;
  }

  // 规格化数
  const exponent = exponentInt - format.exponentBias;
  const mantissa = mantissaInt / Math.pow(2, format.mantissaBits);
  const value = (1 + mantissa) * Math.pow(2, exponent);
  return signBit ? -value : value;
}

// 计算精度和范围
export function getFormatInfo(format: FloatFormat) {
  const minNormalExp = 1 - format.exponentBias;
  const maxNormalExp = Math.pow(2, format.exponentBits) - 2 - format.exponentBias;
  
  const minPositive = Math.pow(2, minNormalExp - format.mantissaBits);
  const maxPositive = (2 - Math.pow(2, -format.mantissaBits)) * Math.pow(2, maxNormalExp);
  const epsilon = Math.pow(2, -format.mantissaBits);

  return {
    minPositive,
    maxPositive,
    epsilon,
    minNormalExp,
    maxNormalExp,
  };
}
