'use client';

import { useState, useEffect } from 'react';
import { FLOAT_FORMATS, parseFloatToBits, buildFloatFromBits, getFormatInfo, type FloatFormat } from '@/lib/float-utils';

export default function FloatToyPage() {
  const [format, setFormat] = useState<keyof typeof FLOAT_FORMATS>('fp32');
  const [value, setValue] = useState(1.5);
  const [bits, setBits] = useState('');
  const [sign, setSign] = useState('');
  const [exponent, setExponent] = useState('');
  const [mantissa, setMantissa] = useState('');
  const [parsed, setParsed] = useState<any>(null);

  const currentFormat = FLOAT_FORMATS[format];

  // 更新位表示
  useEffect(() => {
    const result = parseFloatToBits(value, currentFormat);
    setSign(result.sign);
    setExponent(result.exponent);
    setMantissa(result.mantissa);
    setBits(result.bits);
    setParsed(result);
  }, [value, currentFormat]);

  // 处理数值输入
  const handleValueChange = (newValue: string) => {
    const num = parseFloat(newValue);
    if (!isNaN(num) && isFinite(num)) {
      setValue(num);
    } else if (newValue === 'inf' || newValue === '+inf' || newValue === '-inf') {
      setValue(newValue === '-inf' ? -Infinity : Infinity);
    } else if (newValue === 'nan') {
      setValue(NaN);
    }
  };

  // 切换单个位
  const toggleBit = (type: 'sign' | 'exponent' | 'mantissa', index: number) => {
    let bitsStr = type === 'sign' ? sign : type === 'exponent' ? exponent : mantissa;
    const newBits = bitsStr.substring(0, index) + (bitsStr[index] === '0' ? '1' : '0') + bitsStr.substring(index + 1);

    if (type === 'sign') setSign(newBits);
    else if (type === 'exponent') setExponent(newBits);
    else setMantissa(newBits);

    const newSign = type === 'sign' ? newBits : sign;
    const newExp = type === 'exponent' ? newBits : exponent;
    const newMantissa = type === 'mantissa' ? newBits : mantissa;
    
    const newValue = buildFloatFromBits(newSign, newExp, newMantissa, currentFormat);
    setValue(newValue);
  };

  // 格式化数值显示
  const formatValue = (val: number): string => {
    if (isNaN(val)) return 'NaN';
    if (!isFinite(val)) return val > 0 ? '+∞' : '-∞';
    const absVal = Math.abs(val);
    if (absVal < 0.0001 || absVal >= 1000000) {
      return val.toExponential(4);
    }
    return val.toPrecision(8);
  };

  // 获取数值的十六进制表示
  const getHexRepresentation = (): string => {
    const decimalValue = parseInt(bits, 2);
    if (currentFormat.bits === 32) {
      return '0x' + decimalValue.toString(16).padStart(8, '0').toUpperCase();
    } else if (currentFormat.bits === 64) {
      const highBits = parseInt(bits.substring(0, 32), 2);
      const lowBits = parseInt(bits.substring(32), 2);
      return '0x' + highBits.toString(16).padStart(8, '0').toUpperCase() + 
             lowBits.toString(16).padStart(8, '0').toUpperCase();
    } else {
      const hexDigits = Math.ceil(currentFormat.bits / 4);
      return '0x' + decimalValue.toString(16).padStart(hexDigits, '0').toUpperCase();
    }
  };

  const formatInfo = getFormatInfo(currentFormat);

  // 获取指定位置的 bit 序号
  const getBitIndex = (type: 'sign' | 'exponent' | 'mantissa', index: number): number => {
    const totalBits = currentFormat.bits;
    if (type === 'sign') {
      return totalBits - 1;
    } else if (type === 'exponent') {
      return totalBits - 2 - index;
    } else {
      return totalBits - 2 - currentFormat.exponentBits - index;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-8">
      <div className="max-w-[85vw] mx-auto min-h-[90vh] flex flex-col">
        {/* 标题栏 - 增加间距美化 */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              浮点数可视化工具
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">IEEE 754 + 扩展格式</p>
          </div>
          <div className="text-xs md:text-sm text-slate-500 hidden sm:block font-medium">
            {currentFormat.name}
          </div>
        </div>

        {/* 控制区域 - 增加间距美化 */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700 shrink-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* 格式选择器 */}
            <div className="lg:col-span-7">
              <label className="text-xs md:text-sm font-medium text-slate-400 mb-1 block">格式</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(FLOAT_FORMATS) as [keyof typeof FLOAT_FORMATS, FloatFormat][]).map(([key, fmt]) => (
                  <button
                    key={key}
                    onClick={() => setFormat(key)}
                    className={`px-2 py-1 rounded text-xs md:text-sm font-medium transition-all flex-shrink-0 ${
                      format === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {fmt.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 数值和十六进制 */}
            <div className="lg:col-span-5">
              <label className="text-xs md:text-sm font-medium text-slate-400 mb-1 block">数值 / 十六进制</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formatValue(value)}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs md:text-sm font-mono focus:outline-none focus:border-blue-500"
                  placeholder="输入数值"
                />
                <div className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs md:text-sm font-mono text-center flex items-center justify-center">
                  {getHexRepresentation()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区域 - 分两列，对称布局 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0 flex-1 items-start">
          {/* 左侧：位可视化 */}
          <div className="xl:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 overflow-hidden flex flex-col">
            {/* 位显示区域 - 优化比特位显示 */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4 overflow-x-auto shrink-0">
              <div className="flex items-center gap-1 min-w-max">
                {/* 符号位区域 */}
                <div className="flex flex-col items-center gap-0.5 px-2">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-red-500"></div>
                    <span className="text-[10px] text-slate-400 font-medium">符号</span>
                  </div>
                  <div className="flex gap-0.5">
                    {sign.split('').map((bit, i) => (
                      <button
                        key={i}
                        onClick={() => toggleBit('sign', i)}
                        className={`w-5 h-8 flex flex-col items-center justify-center rounded transition-all ${
                          bit === '0'
                            ? 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                            : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                        }`}
                      >
                        <span className="text-[11px] font-mono font-bold leading-none">{bit}</span>
                        <span className="text-[9px] text-slate-400 font-mono leading-none">
                          {getBitIndex('sign', i)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="w-px h-8 bg-slate-700"></div>

                {/* 指数位区域 */}
                <div className="flex flex-col items-center gap-0.5 px-2">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] text-slate-400 font-medium">指数</span>
                    <span className="text-[8px] text-slate-600">偏置:{currentFormat.exponentBias}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {exponent.split('').map((bit, i) => (
                      <button
                        key={i}
                        onClick={() => toggleBit('exponent', i)}
                        className={`w-5 h-8 flex flex-col items-center justify-center rounded transition-all ${
                          bit === '0'
                            ? 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30'
                        }`}
                      >
                        <span className="text-[11px] font-mono font-bold leading-none">{bit}</span>
                        <span className="text-[9px] text-slate-400 font-mono leading-none">
                          {getBitIndex('exponent', i)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="w-px h-8 bg-slate-700"></div>

                {/* 尾数位区域 */}
                <div className="flex flex-col items-center gap-0.5 px-2 flex-1 min-w-0">
                  <div className="flex items-center gap-0.5 w-full">
                    <div className="w-1 h-1 rounded-full bg-green-500"></div>
                    <span className="text-[10px] text-slate-400 font-medium">尾数</span>
                  </div>
                  <div className="flex gap-0.5 flex-wrap justify-start">
                    {mantissa.split('').map((bit, i) => (
                      <button
                        key={i}
                        onClick={() => toggleBit('mantissa', i)}
                        className={`w-5 h-8 flex flex-col items-center justify-center rounded transition-all ${
                          bit === '0'
                            ? 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                            : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                        }`}
                      >
                        <span className="text-[11px] font-mono font-bold leading-none">{bit}</span>
                        <span className="text-[9px] text-slate-400 font-mono leading-none">
                          {getBitIndex('mantissa', i)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 数学公式 - 更紧凑 */}
            {parsed && parsed.isNormalized && (
              <>
                <div className="bg-slate-900/50 rounded-lg p-2 mb-3 shrink-0">
                  <div className="text-[10px] text-slate-400 mb-1 font-medium">数学表示</div>
                  <div className="text-xs md:text-sm font-mono text-center whitespace-nowrap">
                    <span className="text-red-400 font-bold">{sign === '0' ? '+' : '-'}</span>
                    <span className="mx-1 text-slate-300">1.</span>
                    <span className="text-green-400">{mantissa}</span>
                    <span className="mx-1 text-slate-400">×</span>
                    <span className="text-blue-400">2^</span>
                    <span className="text-blue-300 text-[10px] md:text-xs">
                      {sign === '0' ? '' : '-'}{parsed.exponentValue - currentFormat.exponentBias}
                    </span>
                  </div>
                </div>

                {/* 换算过程 - 更紧凑 */}
                <div className="bg-slate-900/50 rounded-lg p-2 text-xs md:text-sm font-mono space-y-2 overflow-auto flex-1">
                  <div className="text-slate-400 mb-1 font-medium shrink-0">换算过程</div>

                  {/* 符号位 */}
                  <div className="flex justify-between items-center shrink-0">
                    <span className="text-red-400">符号 s</span>
                    <span className="text-slate-300">
                      <span className="text-red-400 font-bold">{sign}</span>
                      <span className="text-slate-500 text-[10px]">[2]</span>
                      = {sign === '0' ? '+1' : '-1'}
                    </span>
                  </div>

                  {/* 指数位 */}
                  <div className="flex justify-between items-center shrink-0">
                    <span className="text-blue-400">指数 e</span>
                    <span className="text-slate-300">
                      <span className="text-blue-400 font-bold">{exponent}</span>
                      <span className="text-slate-500 text-[10px]">[2]</span>
                      = {parsed.exponentValue}
                      <span className="text-slate-500 text-[10px]">[10]</span>
                      - {currentFormat.exponentBias}
                      = <span className="text-blue-300 font-bold">{parsed.exponentValue - currentFormat.exponentBias}</span>
                    </span>
                  </div>

                  {/* 尾数位 */}
                  <div className="flex justify-between items-start shrink-0">
                    <span className="text-green-400">尾数 f</span>
                    <span className="text-slate-300 text-right">
                      <div className="mb-0.5">
                        <span className="text-green-400 font-bold">0.{mantissa}</span>
                        <span className="text-slate-500 text-[10px]">[2]</span>
                      </div>
                      <div className="text-slate-500 text-[10px] md:text-xs">
                        = {mantissa.split('').map((bit, i) => {
                          if (bit === '0') return null;
                          const place = -(i + 1);
                          const value = Math.pow(2, place);
                          return `+ 2^${place}`;
                        }).filter(Boolean).join(' ') || '0'}
                      </div>
                      <div className="text-green-300 font-bold text-[10px] md:text-xs">
                        = {(parsed.mantissaValue / Math.pow(2, currentFormat.mantissaBits)).toFixed(6)}
                      </div>
                    </span>
                  </div>

                  {/* 最终结果 */}
                  <div className="pt-2 border-t border-slate-700 shrink-0">
                    <div className="text-slate-400 text-center mb-1 text-[10px] md:text-xs">结果 = (-1)^s × (1 + f) × 2^(e-bias)</div>
                    <div className="text-center text-xs md:text-sm">
                      <span className="text-red-400">{sign === '0' ? '+' : '-'}</span>
                      <span>1.{mantissa}</span>
                      <span className="text-slate-500 text-[10px]">[2]</span>
                      <span> × 2^</span>
                      <span className="text-blue-300 text-[10px] md:text-xs">{parsed.exponentValue - currentFormat.exponentBias}</span>
                      <span> = </span>
                      <span className="text-white font-bold">{formatValue(value)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 特殊值提示 - 更紧凑 */}
            {parsed && !parsed.isNormalized && (
              <div className="bg-slate-900/50 rounded-lg p-2 text-xs md:text-sm">
                <div className="text-slate-400 mb-1 font-medium">特殊值</div>
                <div className="text-center text-xs md:text-sm">
                  {parsed.isZero && <span className="text-slate-300">零 (Zero)</span>}
                  {parsed.isInfinity && <span className="text-orange-400">无穷大 (Infinity)</span>}
                  {parsed.isNaN && <span className="text-red-400">非数字 (NaN)</span>}
                  {parsed.isDenormalized && <span className="text-yellow-400">非规格化数 (Denormalized)</span>}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：格式信息和快捷操作 */}
          <div className="xl:col-span-1 space-y-4 flex flex-col min-h-0">
            {/* 格式信息 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shrink-0">
              <h3 className="text-xs md:text-sm font-semibold text-slate-300 mb-2">格式信息</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 rounded-lg p-2">
                  <div className="text-[10px] text-slate-500 mb-0.5">最小正数</div>
                  <div className="font-mono text-[10px] md:text-xs text-green-400">
                    {formatInfo.minPositive.toExponential(1)}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-2">
                  <div className="text-[10px] text-slate-500 mb-0.5">最大正数</div>
                  <div className="font-mono text-[10px] md:text-xs text-blue-400">
                    {formatInfo.maxPositive.toExponential(1)}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-2">
                  <div className="text-[10px] text-slate-500 mb-0.5">机器精度</div>
                  <div className="font-mono text-[10px] md:text-xs text-purple-400">
                    {formatInfo.epsilon.toExponential(1)}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-2">
                  <div className="text-[10px] text-slate-500 mb-0.5">指数范围</div>
                  <div className="font-mono text-[10px] md:text-xs text-yellow-400">
                    [{formatInfo.minNormalExp}, {formatInfo.maxNormalExp}]
                  </div>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shrink-0">
              <h3 className="text-xs md:text-sm font-semibold text-slate-300 mb-2">快速操作</h3>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: '0', value: 0 },
                  { label: '1', value: 1 },
                  { label: '-1', value: -1 },
                  { label: 'π', value: Math.PI },
                  { label: 'e', value: Math.E },
                  { label: '√2', value: Math.sqrt(2) },
                  { label: '0.1', value: 0.1 },
                  { label: '+∞', value: Infinity },
                  { label: '-∞', value: -Infinity },
                  { label: 'NaN', value: NaN },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => setValue(btn.value)}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded font-mono text-[10px] md:text-xs transition-all"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 状态信息 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shrink-0">
              <h3 className="text-xs md:text-sm font-semibold text-slate-300 mb-2">状态</h3>
              <div className="space-y-1 text-[10px] md:text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">符号:</span>
                  <span className={sign === '0' ? 'text-blue-400' : 'text-red-400'}>
                    {sign === '0' ? '正' : '负'}
                  </span>
                </div>
                {parsed && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">类型:</span>
                      <span className={
                        parsed.isInfinity ? 'text-orange-400' :
                        parsed.isNaN ? 'text-red-400' :
                        parsed.isZero ? 'text-slate-400' :
                        parsed.isDenormalized ? 'text-yellow-400' :
                        'text-green-400'
                      }>
                        {parsed.isInfinity ? '无穷大' :
                         parsed.isNaN ? 'NaN' :
                         parsed.isZero ? '零' :
                         parsed.isDenormalized ? '非规格化' :
                         '规格化'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">指数值:</span>
                      <span className="text-blue-400">{parsed.exponentValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">尾数值:</span>
                      <span className="text-green-400">{parsed.mantissaValue}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 底部提示 */}
            <div className="text-center text-slate-600 text-[10px] md:text-xs mt-auto shrink-0">
              <p>支持 Half/FP32/FP64/BFloat16 以及扩展的 FP8 (E4M3/E5M2) 和 FP4 (E2M1) 格式</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
