import { FLOAT_FORMATS, parseFloatToBits, getFormatInfo } from '../float-utils';

// BFloat16 与 FP16 对比分析
console.log('='.repeat(70));
console.log('BFloat16 (E8M7) vs FP16 (E5M10) 对比分析');
console.log('='.repeat(70));

const fp16 = FLOAT_FORMATS.fp16;
const bf16 = FLOAT_FORMATS.bf16;

console.log('\n【格式参数对比】');
console.log(`FP16:  ${fp16.signBits}符号 + ${fp16.exponentBits}指数 + ${fp16.mantissaBits}尾数 = ${fp16.bits}位 (偏置: ${fp16.exponentBias})`);
console.log(`BF16:  ${bf16.signBits}符号 + ${bf16.exponentBits}指数 + ${bf16.mantissaBits}尾数 = ${bf16.bits}位 (偏置: ${bf16.exponentBias})`);

const fp16Info = getFormatInfo(fp16);
const bf16Info = getFormatInfo(bf16);

console.log('\n【数值范围对比】');
console.log(`FP16  最小正数: ${fp16Info.minPositive.toExponential(4)}`);
console.log(`BF16  最小正数: ${bf16Info.minPositive.toExponential(4)}`);
console.log(`FP16  最大正数: ${fp16Info.maxPositive.toExponential(4)}`);
console.log(`BF16  最大正数: ${bf16Info.maxPositive.toExponential(4)}`);

console.log('\n【精度对比】');
console.log(`FP16  机器精度: ${fp16Info.epsilon.toExponential(4)}`);
console.log(`BF16  机器精度: ${bf16Info.epsilon.toExponential(4)}`);

console.log('\n【优势对比】');
console.log('FP16 优势: 尾数位数更多，精度更高');
console.log('BF16 优势: 指数范围更大，与 FP32 转换无需重新归一化');

console.log('\n【实际测试 - π 的表示】');
const pi = Math.PI;
const fp16Result = parseFloatToBits(pi, fp16);
const bf16Result = parseFloatToBits(pi, bf16);

console.log(`FP16:  位表示 = ${fp16Result.bits} | 精度误差 = ${Math.abs(pi - Math.pow(2, fp16Result.exponentValue - fp16.exponentBias) * (1 + fp16Result.mantissaValue / Math.pow(2, fp16.mantissaBits))).toExponential(4)}`);
console.log(`BF16:  位表示 = ${bf16Result.bits} | 精度误差 = ${Math.abs(pi - Math.pow(2, bf16Result.exponentValue - bf16.exponentBias) * (1 + bf16Result.mantissaValue / Math.pow(2, bf16.mantissaBits))).toExponential(4)}`);

console.log('\n【应用场景】');
console.log('FP16:  适合对精度要求较高的场景，如图像处理、传统深度学习训练');
console.log('BF16:  适合大模型训练（如 Transformer），与 FP32 转换效率高，溢出风险小');

console.log('\n' + '='.repeat(70));
