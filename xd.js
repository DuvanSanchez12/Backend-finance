const symbols = [
  "BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT","XRPUSDT",
  "ADAUSDT","LINKUSDT","DOGEUSDT","AVAXUSDT","DOTUSDT",
  "MATICUSDT","NEARUSDT","LTCUSDT","UNIUSDT","SHIBUSDT",
  "BCHUSDT","TIAUSDT","APTUSDT","INJUSDT","OPUSDT",
  "ARBUSDT","RNDRUSDT","XLMUSDT","ATOMUSDT","ICPUSDT",
  "FILUSDT","HBARUSDT","ETCUSDT","STXUSDT","SUIUSDT",
  "GRTUSDT","AAVEUSDT","IMXUSDT","SEIUSDT","ORDIUSDT",
  "VETUSDT","MNTUSDT","MKRUSDT","EGLDUSDT","ALGOUSDT"
];

async function fetchOpens() {
  const results = {};
  for (let sym of symbols) {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=1d&startTime=1707206400000&endTime=1707292799999`);
    const data = await res.json();
    results[sym] = data;
  }
  return results;
}

fetchOpens().then(console.log);