import { FLOAT_FORMATS, parseFloatToBits, buildFloatFromBits } from '../float-utils';

// 简单测试函数
function testFormat(formatKey: keyof typeof FLOAT_FORMATS) {
  const format = FLOAT_FORMATS[formatKey];
  console.log(`\nTesting ${format.name} (${format.bits} bits)`);
  
  const testCases = [
    0,
    1,
    -1,
    0.5,
    -0.5,
    1.5,
    Math.PI,
    Infinity,
    -Infinity,
    NaN,
  ];

  for (const value of testCases) {
    const result = parseFloatToBits(value, format);
    const reconstructed = buildFloatFromBits(result.sign, result.exponent, result.mantissa, format);
    
    // 对于特殊值，需要特殊检查
    if (isNaN(value)) {
      if (!isNaN(reconstructed)) {
        console.error(`  ❌ NaN test failed: ${value} -> ${reconstructed}`);
      } else {
        console.log(`  ✓ NaN: OK`);
      }
    } else if (!isFinite(value)) {
      if (reconstructed !== value) {
        console.error(`  ❌ Infinity test failed: ${value} -> ${reconstructed}`);
      } else {
        console.log(`  ✓ ${value}: OK`);
      }
    } else {
      // 对于普通数值，检查重建的值是否接近原值
      const diff = Math.abs(value - reconstructed);
      if (diff > Math.abs(value) * 0.01) { // 允许1%的误差（由于精度损失）
        console.error(`  ❌ ${value} -> ${reconstructed} (diff: ${diff})`);
      } else {
        console.log(`  ✓ ${value} -> ${reconstructed.toFixed(6)} (diff: ${diff.toExponential(2)})`);
      }
    }
  }
}

// 运行所有测试
console.log('='.repeat(60));
console.log('Float Format Validation Tests');
console.log('='.repeat(60));

testFormat('fp32');
testFormat('fp64');
testFormat('fp16');
testFormat('fp8_e4m3');
testFormat('fp8_e5m2');
testFormat('fp4_e2m1');

console.log('\n' + '='.repeat(60));
console.log('All tests completed!');
console.log('='.repeat(60));
