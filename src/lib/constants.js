export const C = {
  bg:'#080B10', surface:'#0F1318', surface2:'#161B22', border:'#1C2230', borderHi:'#2A3347',
  gold:'#C9A84C', goldDim:'#7A6230', goldBg:'#1A160A',
  green:'#3DB87A', greenDim:'#1E5C3C', greenBg:'#0A1610',
  red:'#D44E4E', redDim:'#7A2828', redBg:'#160A0A',
  blue:'#4C8FD4', blueDim:'#2A4A70', blueBg:'#0A1020',
  purple:'#9A72D8', purpleDim:'#4A2E7A', purpleBg:'#0E0A18',
  amber:'#D4884C', amberDim:'#7A4020', amberBg:'#160E08',
  muted:'#4A5468', text:'#C8D0DC', textBr:'#EEF2F8', textDim:'#7A8499',
};

export const SESSIONS = ['London Only', 'London + NY Overlap'];
export const HTF_BIAS = ['Bullish', 'Bearish', 'Neutral'];
export const DXY_BIAS = ['Rising', 'Falling', 'Ranging'];
export const ASIA_SWEEP = ['Asia High Swept', 'Asia Low Swept'];
export const DIRECTION = ['Long', 'Short'];
export const MOMENTUM = ['Weak', 'Medium', 'Strong'];
export const DISPLACEMENT = ['Weak', 'Medium', 'Strong'];
export const GRADES = ['A', 'B', 'C'];
export const RESULTS = ['Win', 'Loss', 'Breakeven', 'Partial'];
export const LOSS_REASONS = [
  'False MSS','Counter-HTF','Liquidity Already Taken','No displacement',
  'News interference','Weak MSS','Wrong session','DXY conflict','Other'
];
export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

export const BOOL_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

export const GRADE_COLORS = { A: '#3DB87A', B: '#C9A84C', C: '#D44E4E' };
export const RESULT_COLORS = {
  Win: '#3DB87A', Loss: '#D44E4E', Breakeven: '#C9A84C', Partial: '#4C8FD4'
};

export const DEFAULT_HYPOTHESES = [
  { idea: 'No-wick (strong body) candle in displacement improves R:R', count: 0 },
  { idea: 'FVG present in displacement zone improves win rate', count: 0 },
  { idea: 'BOS after MSS confirms entry and improves win rate', count: 0 },
  { idea: 'London session captures NY session bodies — predicts direction', count: 0 },
  { idea: 'Grade A setups significantly outperform Grade B and C', count: 0 },
  { idea: 'Liquidity void above entry accelerates move (higher actual R)', count: 0 },
  { idea: 'Inverse FVG as entry confirmation improves hit rate', count: 0 },
  { idea: 'Strong momentum quality strongly correlates with Win', count: 0 },
  { idea: 'Strong displacement is the single best predictor of outcome', count: 0 },
];

export const DEFAULT_PRESETS = [
  { name: 'FVG Present Trades', icon: '📐', filters: { fvgPresent: 'true' } },
  { name: 'Grade A + Strong Momentum', icon: '⭐', filters: { sweepGrade: 'A', momentumQuality: 'Strong' } },
  { name: 'No-Wick + BOS After MSS', icon: '🎯', filters: { noWickCandle: 'true', bosAfterMss: 'true' } },
  { name: 'Losses With False MSS', icon: '❌', filters: { result: 'Loss', falseMss: 'true' } },
  { name: 'London Only Clean Setups', icon: '🇬🇧', filters: { session: 'London Only', mssOccurred: 'true' } },
  { name: 'Counter-HTF Losses', icon: '⚠️', filters: { result: 'Loss', mssAgainstHtf: 'true' } },
];

export const EMPTY_FILTERS = {
  session: '', htfBias: '', dxyBias: '', majorNews: '', asiaSweepType: '',
  mssOccurred: '', tradeDirection: '', bosAfterMss: '', fvgPresent: '',
  noWickCandle: '', liquidityVoid: '', inverseFvg: '', momentumQuality: '',
  displacementStrength: '', sweepGrade: '', result: '', falseMss: '',
  liquidityAlreadyTaken: '', mssAgainstHtf: '', tradeTaken: '',
};

export const EMPTY_TRADE = {
  date: new Date().toISOString().split('T')[0],
  session: '', htfBias: '', dxyBias: '', majorNews: false,
  asiaSweepType: '', mssOccurred: true, tradeDirection: '',
  bosAfterMss: false, fvgPresent: false, noWickCandle: false,
  liquidityVoid: false, inverseFvg: false, momentumQuality: '',
  displacementStrength: '', sweepGrade: '', entryPrice: '', stopLossPrice: '',
  takeProfitPrice: '', slPips: '', tpPips: '', result: '', pipsResult: '',
  falseMss: false, liquidityAlreadyTaken: false, mssAgainstHtf: false,
  tradeTaken: '', primaryLossReason: '', notes: '',
};
