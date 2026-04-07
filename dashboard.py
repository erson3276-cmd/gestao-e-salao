import streamlit as st
import ccxt
import pandas as pd
import json
import os
import time
import requests
import plotly.graph_objects as go
from dotenv import load_dotenv
from streamlit_autorefresh import st_autorefresh

load_dotenv()

st.set_page_config(
    page_title="Terminal Quant | Sniper Pro",
    page_icon="📡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ================================================================
# ESTILO TERMINAL PRO — V9.0
# ================================================================
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;500;600;700&display=swap');

html, body, [class*="css"] {
    font-family: 'Syne', sans-serif !important;
    background-color: #0C0D11 !important;
    color: #E0E4F0 !important;
}
.block-container { padding: 1.4rem 1.8rem 2rem 1.8rem !important; max-width: 100% !important; }

/* SIDEBAR */
[data-testid="stSidebar"] { background: #10111A !important; border-right: 1px solid #1E2030 !important; }
[data-testid="stSidebar"] > div { padding: 1rem 0.9rem; }

/* TABS */
.stTabs [data-baseweb="tab-list"] {
    gap: 2px; background: transparent;
    border-bottom: 1px solid #1E2030; padding-bottom: 0;
}
.stTabs [data-baseweb="tab"] {
    background: transparent !important; border: none !important;
    border-bottom: 2px solid transparent !important;
    color: #4A5070 !important; font-size: 12px !important;
    font-weight: 600 !important; padding: 8px 14px !important;
    border-radius: 0 !important; font-family: 'Syne', sans-serif !important;
    letter-spacing: 0.3px;
}
.stTabs [aria-selected="true"] { color: #00E5B0 !important; border-bottom-color: #00E5B0 !important; }

/* METRICS */
[data-testid="stMetric"] {
    background: #10111A !important; border: 1px solid #1E2030 !important;
    border-radius: 12px !important; padding: 14px 16px !important;
}
[data-testid="stMetricLabel"] > div { color: #4A5070 !important; font-size: 10px !important; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600 !important; }
[data-testid="stMetricValue"] > div { color: #E0E4F0 !important; font-family: 'JetBrains Mono', monospace !important; font-size: 20px !important; font-weight: 700 !important; }
[data-testid="stMetricDelta"] > div { font-family: 'JetBrains Mono', monospace !important; font-size: 11px !important; }

/* BOTÕES */
.stButton > button {
    width: 100%; border-radius: 8px !important; font-weight: 600 !important;
    font-family: 'Syne', sans-serif !important; font-size: 13px !important;
}

/* INPUTS */
.stNumberInput > div > div, .stSelectbox > div > div, .stSlider {
    background: #16182A !important; border-radius: 8px !important;
}

/* DATAFRAME */
.stDataFrame { border: 1px solid #1E2030 !important; border-radius: 12px !important; overflow: hidden; }

/* EXPANDER */
.streamlit-expanderHeader {
    background: #10111A !important; border: 1px solid #1E2030 !important;
    border-radius: 8px !important; color: #E0E4F0 !important;
    font-family: 'JetBrains Mono', monospace !important; font-size: 12px !important;
}
.streamlit-expanderContent { background: #0E0F18 !important; border: 1px solid #1E2030 !important; border-top: none !important; }

/* COMPONENTES CUSTOM */
.section-header {
    font-size: 10px; color: #00E5B0; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.8px;
    border-bottom: 1px solid #1E2030; padding-bottom: 6px; margin-bottom: 12px;
}
.kpi-card { background: #10111A; border: 1px solid #1E2030; border-radius: 12px; padding: 14px 16px; margin-bottom: 4px; }
.kpi-card.g { border-top: 2px solid #00E5B0; }
.kpi-card.b { border-top: 2px solid #0080FF; }
.kpi-card.a { border-top: 2px solid #F0A000; }
.kpi-card.p { border-top: 2px solid #9B6EF8; }
.kpi-label { font-size: 10px; color: #4A5070; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600; margin-bottom: 5px; }
.kpi-value { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; line-height: 1.1; }
.kpi-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; margin-top: 3px; color: #8892B0; }
.c-green { color: #00E5B0 !important; }
.c-red { color: #FF4444 !important; }
.c-amber { color: #F0A000 !important; }
.c-blue { color: #0080FF !important; }
.c-purple { color: #9B6EF8 !important; }
.c-muted { color: #8892B0 !important; }
.ts { font-size: 10px; color: #4A5070; font-family: 'JetBrains Mono', monospace; }

/* STATUS */
.status-on { color: #00E5B0; font-weight: 700; font-size: 12px; display: flex; align-items: center; gap: 7px; letter-spacing: 0.5px; }
.status-off { color: #FF4444; font-weight: 700; font-size: 12px; display: flex; align-items: center; gap: 7px; letter-spacing: 0.5px; }
.pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; display: inline-block; animation: pulse-anim 2s infinite; }
@keyframes pulse-anim { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.75)} }

/* SCORE CARDS */
.score-card {
    background: #10111A; border: 1px solid #1E2030; border-radius: 10px;
    padding: 12px 14px; margin-bottom: 6px; transition: border-color .2s;
}
.score-card:hover { border-color: #2E3050; }
.score-card.tier-1 { border-left: 3px solid #00E5B0; }
.score-card.tier-2 { border-left: 3px solid #F0A000; }
.score-card.tier-3 { border-left: 3px solid #0080FF; }
.score-bar-bg { background: #1E2030; border-radius: 3px; height: 4px; margin-top: 5px; overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 3px; }

/* BADGES */
.badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: .4px; font-family: 'Syne', sans-serif; }
.bg { background: rgba(0,229,176,0.1); color: #00E5B0; border: 1px solid rgba(0,229,176,0.2); }
.br { background: rgba(255,68,68,0.1); color: #FF4444; border: 1px solid rgba(255,68,68,0.2); }
.bb { background: rgba(0,128,255,0.1); color: #0080FF; border: 1px solid rgba(0,128,255,0.2); }
.ba { background: rgba(240,160,0,0.1); color: #F0A000; border: 1px solid rgba(240,160,0,0.2); }
.bp { background: rgba(155,110,248,0.1); color: #9B6EF8; border: 1px solid rgba(155,110,248,0.2); }

/* RSI BARS */
.rsi-row { display: flex; align-items: center; gap: 7px; margin-bottom: 5px; }
.rsi-lbl { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4A5070; width: 26px; flex-shrink: 0; }
.rsi-track { flex: 1; height: 3px; background: #1E2030; border-radius: 2px; overflow: hidden; }
.rsi-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; width: 32px; text-align: right; flex-shrink: 0; }

/* SNIPER / MOLA CARDS */
.sniper-card {
    background: linear-gradient(90deg, #0A1A12 0%, #10111A 100%);
    border: 1px solid rgba(0,229,176,0.12); border-left: 3px solid #00E5B0;
    padding: 9px 13px; border-radius: 7px; margin-bottom: 5px;
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: #A5D6A7; font-weight: 600; letter-spacing: .4px;
}
.sniper-card.vip {
    border-left-color: #9B6EF8;
    background: linear-gradient(90deg, #130A22 0%, #10111A 100%);
    color: #CE9FFC;
}
.mola-card {
    background: #14101A; border-left: 3px solid #FF4B4B; color: #FFC0C0;
    padding: 8px 13px; border-radius: 6px; margin-bottom: 5px;
    font-size: 12px; font-family: 'JetBrains Mono', monospace;
}
.titulo-setor {
    font-size: 10px; color: #00FFCC; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; border-bottom: 1px solid #1E2030;
    padding-bottom: 3px; margin: 10px 0 5px;
}
.sep { border: none; border-top: 1px solid #1E2030; margin: 14px 0; }
</style>
""", unsafe_allow_html=True)

# ================================================================
# AUTO-REFRESH
# ================================================================
st_autorefresh(interval=60000, limit=None, key="tq_refresh")

# ================================================================
# CORRETORA
# ================================================================
@st.cache_resource
def iniciar_corretora():
    return ccxt.binanceusdm({
        'apiKey': os.getenv("BINANCE_API_KEY"),
        'secret': os.getenv("BINANCE_SECRET_KEY"),
        'enableRateLimit': True,
        'options': {'defaultType': 'future', 'adjustForTimeDifference': True}
    })

corretora = iniciar_corretora()

# ================================================================
# HELPERS
# ================================================================
def escrita_atomica(filepath, data):
    tmp = filepath + '.tmp'
    for _ in range(10):
        try:
            with open(tmp, 'w', encoding='utf-8') as f: json.dump(data, f, indent=4)
            os.replace(tmp, filepath); return True
        except: time.sleep(0.2)
    return False

def get_robot_status():
    if not os.path.exists('config.json'): return "ON"
    try:
        with open('config.json', 'r', encoding='utf-8') as f: return json.load(f).get("robot_status", "ON")
    except: return "ON"

def set_robot_status(s): escrita_atomica('config.json', {"robot_status": s})

def limpar_radar_seguro():
    if os.path.exists('painel_dados.json'): escrita_atomica('painel_dados.json', {"data": {}})
    if os.path.exists('watchlist.json'): escrita_atomica('watchlist.json', {})

def fmt_mcap(v):
    if v >= 1_000_000_000: return f"${v/1e9:.2f}B"
    if v >= 1_000_000: return f"${v/1e6:.1f}M"
    return f"${v/1e3:.0f}K"

def fmt_rsi_bar(label, val):
    if val is None:
        return f"<div class='rsi-row'><span class='rsi-lbl'>{label}</span><div class='rsi-track'></div><span class='rsi-num' style='color:#4A5070;'>N/D</span></div>"
    pct = min(float(val), 100)
    if val > 70: col = "#FF4444"
    elif val > 55: col = "#F0A000"
    else: col = "#00E5B0"
    return (f"<div class='rsi-row'>"
            f"<span class='rsi-lbl'>{label}</span>"
            f"<div class='rsi-track'><div style='width:{pct:.0f}%;height:100%;background:{col};border-radius:2px;'></div></div>"
            f"<span class='rsi-num' style='color:{col};'>{val:.1f}</span>"
            f"</div>")

# ================================================================
# CMC — TTL CORRIGIDO (30 min)
# ================================================================
MAPA_SETORES = {
    'ai-big-data': '🤖 AI / Big Data', 'artificial-intelligence': '🤖 AI / Big Data',
    'memes': '🐸 Memecoins', 'defi': '🏦 DeFi', 'gaming': '🎮 Gaming', 'play-to-earn': '🎮 Gaming',
    'metaverse': '🌌 Metaverso', 'real-world-assets': '🏢 RWA', 'rwa': '🏢 RWA',
    'layer-1': '⛓️ Layer 1', 'layer-2': '🔗 Layer 2', 'smart-contracts': '📜 Smart Contracts',
    'depin': '📡 DePIN', 'oracles': '🔮 Oracles', 'dex': '🔄 DEX',
    'liquid-staking': '💧 Liquid Staking', 'payments': '💸 Pagamentos',
    'nft': '🎨 NFTs', 'storage': '💾 Storage', 'web3': '🌐 Web3',
    'binance-launchpool': '🚀 Launchpool', 'solana-ecosystem': '☀️ Solana Eco',
    'zero-knowledge-proofs': '🔐 ZK Tech', 'modular-blockchain': '🧩 Modular',
    'cross-chain': '🌉 Cross-Chain', 'infrastructure': '🔧 Infra',
}

@st.cache_data(ttl=1800)
def obter_macro_cmc():
    api_key = os.getenv("CMC_API_KEY")
    if not api_key: return 50, "Sem Chave", 50.0, "-"
    headers = {'Accepts': 'application/json', 'X-CMC_PRO_API_KEY': api_key}
    fng_v, fng_s = 50, "N/D"
    try:
        r = requests.get("https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest", headers=headers, timeout=10)
        if r.status_code == 200:
            d = r.json()['data']
            fng_v = int(d['value'])
            mapa = {"Extreme Fear": "Medo Extremo 🥶", "Fear": "Medo 😨", "Neutral": "Neutro 😐",
                    "Greed": "Ganância 🤑", "Extreme Greed": "Ganância Extrema 🚀"}
            fng_s = mapa.get(d['value_classification'], d['value_classification'])
    except: pass
    btc_dom, alt_s = 50.0, "-"
    try:
        r = requests.get("https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest", headers=headers, timeout=10)
        if r.status_code == 200:
            btc_dom = float(r.json()['data']['btc_dominance'])
            alt_s = "BTC Season 🟠" if btc_dom > 52 else ("Altcoin Season 🟣" if btc_dom < 45 else "Transição 🟡")
    except: pass
    return fng_v, fng_s, btc_dom, alt_s

@st.cache_data(ttl=1800)
def obter_listings_cmc():
    api_key = os.getenv("CMC_API_KEY")
    if not api_key: return {}
    headers = {'Accepts': 'application/json', 'X-CMC_PRO_API_KEY': api_key}
    try:
        url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"
        params = {'start': '1', 'limit': '1000', 'convert': 'USD'}
        r = requests.get(url, headers=headers, params=params, timeout=15)
        if r.status_code == 200:
            mapa = {}
            for coin in r.json().get('data', []):
                sym = coin['symbol'] + "USDT"
                tags = coin.get('tags', [])
                setor = "Outros"
                for tag in tags:
                    if tag.lower() in MAPA_SETORES:
                        setor = MAPA_SETORES[tag.lower()]; break
                if setor == "Outros" and tags:
                    setor = tags[0].replace('-', ' ').title()
                q = coin.get('quote', {}).get('USD', {})
                mapa[sym] = {
                    "rank": coin.get('cmc_rank', 9999),
                    "name": coin.get('name', ''),
                    "symbol": coin.get('symbol', ''),
                    "setor": setor,
                    "tags": tags[:5],
                    "change_1h":  float(q.get('percent_change_1h') or 0),
                    "change_24h": float(q.get('percent_change_24h') or 0),
                    "change_7d":  float(q.get('percent_change_7d') or 0),
                    "change_30d": float(q.get('percent_change_30d') or 0),
                    "change_60d": float(q.get('percent_change_60d') or 0),
                    "change_90d": float(q.get('percent_change_90d') or 0),
                    "market_cap": float(q.get('market_cap') or 0),
                    "volume_24h": float(q.get('volume_24h') or 0),
                    "price":      float(q.get('price') or 0),
                    "circulating_supply": float(coin.get('circulating_supply') or 0),
                    "max_supply":  float(coin.get('max_supply') or 0) if coin.get('max_supply') else None,
                    "total_supply": float(coin.get('total_supply') or 0),
                }
            return mapa
    except: pass
    return {}

@st.cache_data(ttl=900)
def obter_trending_cmc():
    api_key = os.getenv("CMC_API_KEY")
    if not api_key: return set()
    headers = {'Accepts': 'application/json', 'X-CMC_PRO_API_KEY': api_key}
    try:
        r = requests.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/trending/latest", headers=headers, timeout=10)
        if r.status_code == 200:
            return set(c['symbol'] + "USDT" for c in r.json().get('data', []))
    except: pass
    return set()

# ================================================================
# BINANCE APIs
# ================================================================
@st.cache_data(ttl=30)
def calcular_rsi_ao_vivo(simbolo, timeframe):
    try:
        velas = corretora.fetch_ohlcv(simbolo, timeframe=timeframe, limit=150)
        df = pd.DataFrame(velas, columns=['ts', 'o', 'h', 'l', 'c', 'v'])
        delta = df['c'].diff()
        gain = delta.where(delta > 0, 0).ewm(alpha=1/14, adjust=False).mean()
        loss = (-delta.where(delta < 0, 0)).ewm(alpha=1/14, adjust=False).mean()
        rs = gain / loss
        return round(float((100 - (100 / (1 + rs))).iloc[-1]), 1)
    except: return None

def obter_dados_conta():
    try:
        saldo = corretora.fetch_balance()
        posicoes = corretora.fetch_positions()
        ativas, lucro_aberto = [], 0.0
        for p in posicoes:
            info = p.get('info', {})
            if float(info.get('positionAmt', 0)) == 0: continue
            pnl = float(info.get('unRealizedProfit', 0))
            lucro_aberto += pnl
            preco_atual = float(info.get('markPrice', 0))
            roe = float(p.get('percentage', 0))
            simbolo_b = info.get('symbol')
            stop = 0.0
            try:
                for o in corretora.fapiPrivateGetOpenOrders({'symbol': simbolo_b}):
                    if str(o.get('side')).upper() == 'SELL':
                        g = float(o.get('stopPrice', 0))
                        if g > 0: stop = g; break
            except: pass
            status = "💰 Voo Livre" if roe >= 50 else ("🛡️ Break-Even" if roe >= 20 else "🔴 Risco Ativo")
            ativas.append({
                "Moeda": p['symbol'].split(':')[0],
                "Status": status,
                "Entrada": round(float(info.get('entryPrice', 0)), 5),
                "Preço Atual": round(preco_atual, 5),
                "Stop Loss": f"${stop:.5f}" if stop > 0 else "⚠️ SEM STOP",
                "ROE (%)": round(roe, 2),
                "PnL ($)": round(pnl, 2),
            })
        return float(saldo['USDT']['total']), float(saldo['USDT']['free']), lucro_aberto, ativas
    except: return 0.0, 0.0, 0.0, []

def obter_historico_pnl():
    try:
        agora = corretora.milliseconds()
        ms_30d = 30 * 24 * 60 * 60 * 1000
        trades = corretora.fapiPrivateGetIncome({
            'incomeType': 'REALIZED_PNL', 'limit': 1000, 'startTime': agora - ms_30d
        })
        df = pd.DataFrame(trades)
        if df.empty: return pd.DataFrame(), 0.0, 0.0, 0.0
        df['income'] = df['income'].astype(float)
        df['time'] = pd.to_datetime(df['time'].astype(float), unit='ms')
        df = df.sort_values('time').reset_index(drop=True)
        df['equity'] = df['income'].cumsum()
        pnl_24h = df[df['time'] >= pd.Timestamp.now() - pd.Timedelta(hours=24)]['income'].sum()
        pnl_total = df['income'].sum()
        n = len(df[df['income'] != 0])
        wr = (len(df[df['income'] > 0]) / n * 100) if n > 0 else 0.0
        return df, pnl_total, pnl_24h, wr
    except: return pd.DataFrame(), 0.0, 0.0, 0.0

# ================================================================
# 🚀 MOTOR DE SCORING — CAÇADOR DE 1000%
# ================================================================
SETORES_QUENTES = {
    '🤖 AI / Big Data', '🏢 RWA', '📡 DePIN', '🔮 Oracles',
    '🔐 ZK Tech', '🧩 Modular', '🌉 Cross-Chain', '🏦 DeFi'
}

def calcular_score_explosivo(sym, cmc, painel=None, trending=None):
    """
    Score 0-100 baseado em 7 dimensões institucionais.
    Objetivo: encontrar moedas com potencial de 500-1000% de valorização.
    """
    score = 0
    motivos = []
    alertas = []

    mcap     = cmc.get('market_cap', 0)
    vol_24h  = cmc.get('volume_24h', 0)
    c_24h    = cmc.get('change_24h', 0)
    c_7d     = cmc.get('change_7d', 0)
    c_30d    = cmc.get('change_30d', 0)
    c_60d    = cmc.get('change_60d', 0)
    c_90d    = cmc.get('change_90d', 0)
    setor    = cmc.get('setor', '')
    max_sup  = cmc.get('max_supply')
    circ_sup = cmc.get('circulating_supply', 0)

    # ── DIM 1: Market Cap (room to grow) — 25 pts ──────────────────
    if 0 < mcap < 30_000_000:
        score += 25; motivos.append("🔥 Micro Cap (<$30M)")
    elif mcap < 100_000_000:
        score += 21; motivos.append("💎 Small Cap (<$100M)")
    elif mcap < 300_000_000:
        score += 14; motivos.append("Mid Cap (<$300M)")
    elif mcap < 700_000_000:
        score += 5
    elif mcap > 0:
        alertas.append("LARGE CAP")

    # ── DIM 2: Volume/MCap ratio (acumulação) — 20 pts ─────────────
    if mcap > 0:
        vr = vol_24h / mcap
        if vr > 0.80:   score += 20; motivos.append("🌊 Volume Extremo (>80% MCap)")
        elif vr > 0.40: score += 16; motivos.append("📈 Volume Explosivo (>40% MCap)")
        elif vr > 0.15: score += 10; motivos.append("Volume Alto (>15% MCap)")
        elif vr > 0.05: score += 5
        else:           score -= 5; alertas.append("VOLUME SECO")

    # ── DIM 3: Supressão 3 meses (dormindo = mola) — 20 pts ────────
    totalmente = c_30d < 15 and c_60d < 20 and c_90d < 25
    parcial    = c_30d < 35 and c_60d < 50
    if totalmente and c_24h > 3:
        score += 20; motivos.append("💤 Gigante Dormindo — ACORDOU HOJE!"); alertas.append("IGNIÇÃO")
    elif totalmente:
        score += 16; motivos.append("💤 Suprimido há 3+ meses")
    elif parcial:
        score += 8
    if c_30d > 100:
        score -= 12; alertas.append("JÁ PUMPED")

    # ── DIM 4: Momentum ignição 24h — 15 pts ───────────────────────
    if 5 <= c_24h <= 25:
        score += 15; motivos.append(f"🚀 Ignição 24h: +{c_24h:.1f}%")
    elif 2 <= c_24h < 5:
        score += 8; motivos.append(f"📡 Movimento inicial: +{c_24h:.1f}%")
    elif 25 < c_24h <= 60:
        score += 4
    elif c_24h < -5:
        score -= 5

    # ── DIM 5: Setor narrativo quente — 10 pts ──────────────────────
    if setor in SETORES_QUENTES:
        score += 10; motivos.append(f"🏆 Setor Quente: {setor}")

    # ── DIM 6: Sinais Encryptos (OI, funding, compressão) — 10 pts ──
    if painel:
        oi_trend = painel.get('oi_trend_5m', '-')
        fr       = float(painel.get('fr', 0) or 0)
        rl_4h    = painel.get('range_level_4h', 0) or 0
        rl_1h    = painel.get('range_level_1h', 0) or 0
        lsr      = painel.get('lsr_trend_5m', '-')
        if oi_trend == 'Up':    score += 4; motivos.append("📊 OI Subindo")
        if fr < 0.003:          score += 3; motivos.append("💚 Funding Baixo")
        if rl_4h >= 4:          score += 2; motivos.append(f"🗜️ Compressão 4H Nv{rl_4h}")
        elif rl_1h >= 4:        score += 1
        if lsr == 'Up':         score += 1; motivos.append("📐 LSR Subindo")

    # ── DIM 7: Supply (% em circulação) — 5 pts ────────────────────
    if max_sup and max_sup > 0 and circ_sup > 0:
        pct = circ_sup / max_sup * 100
        if pct < 25:   score += 5; motivos.append(f"🏦 Só {pct:.0f}% em circulação")
        elif pct < 50: score += 2

    # ── BÓNUS: Trending CMC ─────────────────────────────────────────
    if trending and sym in trending:
        score += 5; motivos.append("🔥 Trending CMC")

    return min(max(score, 0), 100), motivos, alertas

# ================================================================
# FUNÇÕES INTEGRAÇÃO CÉREBRO V10
# ================================================================
def exportar_cacador(top):
    cacador_export = [
        {
            "sym":        r["sym"],
            "score":      r["score"],
            "setor":      r["cmc"].get("setor", ""),
            "rank":       r["cmc"].get("rank", 9999),
            "change_24h": r["cmc"].get("change_24h", 0),
            "change_30d": r["cmc"].get("change_30d", 0),
            "market_cap": r["cmc"].get("market_cap", 0),
            "motivos":    r["motivos"],
            "alertas":    r["alertas"],
        }
        for r in top
    ]
    escrita_atomica('cacador_1000.json', cacador_export)

def exportar_smart_money(lista_sm, dados_painel):
    sm_export = []
    for row in lista_sm:
        m     = row.get("Moeda", "")
        p_raw = dados_painel.get(m, {})
        sm_export.append({
            "moeda":    m,
            "oi_5m":   row.get("OI 5m ($)", 0),
            "oi_trend": "Up" if "Up" in str(row.get("OI Trend", "")) else "Down",
            "lsr_5m":  row.get("LSR 5m", 0),
            "lsr_trend": "Up" if "Up" in str(row.get("LSR Trend", "")) else "Down",
            "fr_raw":  float(p_raw.get("fr", 0) or 0),
            "rsi_15m": row.get("RSI 15m", 0),
            "rsi_1d":  float(p_raw.get("rsi_1d", 0) or 0),
            "trades_1d": row.get("Trades/Dia", 0),
            "comp_4h": row.get("Compressão 4H", 0),
            "rl_1d":   int(p_raw.get("range_level_1d", 0) or 0),
            "exp_btc_4h": float(p_raw.get("exp_btc_4h", 0) or 0),
            "setor":   row.get("Setor", ""),
            "rank":    row.get("Rank CMC", 9999),
        })
    escrita_atomica('smart_money.json', sm_export)

def render_tab_cerebro(dados_painel, dados_cmc):
    st.markdown("<div class='section-header'>🧠 Radar Cérebro V10 — Score Multi-Timeframe</div>",
                unsafe_allow_html=True)

    cerebro_scores = {}
    if os.path.exists('cerebro_scores.json'):
        try:
            with open('cerebro_scores.json', 'r', encoding='utf-8') as f:
                cerebro_scores = json.load(f)
        except: pass

    watchlist = {}
    if os.path.exists('watchlist.json'):
        try:
            with open('watchlist.json', 'r', encoding='utf-8') as f:
                watchlist = json.load(f)
        except: pass

    if not cerebro_scores:
        st.info("⏳ Cérebro ainda não calculou scores. Aguardando painel_dados.json...")
        return

    # ── Métricas rápidas ──────────────────────────────────────────
    total      = len(cerebro_scores)
    na_mira    = len(watchlist)
    explosivos = sum(1 for v in cerebro_scores.values() if v.get('score', 0) >= 75)
    fortes     = sum(1 for v in cerebro_scores.values() if 60 <= v.get('score', 0) < 75)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Analisadas pelo Cérebro", total)
    c2.metric("🎯 Na Watchlist",         na_mira)
    c3.metric("🟢 Score >= 75",          explosivos)
    c4.metric("🟡 Score 60-74",          fortes)

    st.markdown("<div style='height:10px'></div>", unsafe_allow_html=True)

    # ── Tabela detalhada ──────────────────────────────────────────
    st.markdown("##### Top 30 — Ranking de Score Multi-Timeframe")

    linhas = []
    for moeda, dados in cerebro_scores.items():
        score = dados.get('score', 0)
        fonte = dados.get('fonte', 'HFT')
        info  = dados_painel.get(moeda, {})
        cmc   = dados_cmc.get(moeda, {})
        na_w  = "✅" if moeda in watchlist else "—"

        def g(c, d=0):
            v = info.get(c, d); return v if v is not None else d

        linhas.append({
            "Score":      score,
            "Moeda":      moeda,
            "Fonte":      fonte,
            "Watchlist":  na_w,
            "Rank CMC":   cmc.get('rank', 9999),
            "RL 1D":      g('range_level_1d'),
            "RL 4H":      g('range_level_4h'),
            "RSI 15m":    round(g('rsi_15m'), 1),
            "RSI 1D":     round(g('rsi_1d'), 1),
            "Alpha 4H":   round(g('exp_btc_4h'), 1),
            "Alpha 15m":  round(g('exp_btc_15m'), 1),
            "OI Trend":   "🟢" if g('oi_trend_5m', '-') == 'Up' else "🔴",
            "FR":         f"{g('fr')*100:.4f}%",
            "Trades/min": g('trades_min_1m'),
        })

    if not linhas:
        st.info("Nenhuma moeda com score calculado ainda.")
        return

    df_radar = (pd.DataFrame(linhas)
                .sort_values("Score", ascending=False)
                .head(30))

    # Colorir score
    def colorir_score(val):
        if val >= 75:   return 'color: #00E5B0; font-weight:bold'
        if val >= 60:   return 'color: #F0A000; font-weight:bold'
        if val >= 45:   return 'color: #0080FF'
        return 'color: #4A5070'

    st.dataframe(
        df_radar.style.map(colorir_score, subset=["Score"]),
        hide_index=True,
        use_container_width=True,
        column_config={
            "Score":      st.column_config.NumberColumn("Score", format="%d"),
            "Moeda":      st.column_config.TextColumn("Moeda",     width="small"),
            "Fonte":      st.column_config.TextColumn("Fonte",     width="medium"),
            "Watchlist":  st.column_config.TextColumn("🎯",        width="small"),
            "Rank CMC":   st.column_config.NumberColumn("Rank",    format="%d"),
            "RL 1D":      st.column_config.NumberColumn("RL 1D",   format="%d"),
            "RL 4H":      st.column_config.NumberColumn("RL 4H",   format="%d"),
            "RSI 15m":    st.column_config.NumberColumn("RSI 15m", format="%.1f"),
            "RSI 1D":     st.column_config.NumberColumn("RSI 1D",  format="%.1f"),
            "Alpha 4H":   st.column_config.NumberColumn("α BTC 4H", format="%.1f"),
            "Alpha 15m":  st.column_config.NumberColumn("α BTC 15m", format="%.1f"),
            "OI Trend":   st.column_config.TextColumn("OI",        width="small"),
            "FR":         st.column_config.TextColumn("FR"),
            "Trades/min": st.column_config.NumberColumn("Trades/min"),
        }
    )

    # ── Detalhe por moeda na mira ─────────────────────────────────
    if watchlist:
        st.markdown("---")
        st.markdown("##### 🎯 Detalhes das moedas na Watchlist")
        for moeda, motivo in list(watchlist.items())[:8]:
            info  = dados_painel.get(moeda, {})
            score = cerebro_scores.get(moeda, {}).get('score', '?')
            fonte = cerebro_scores.get(moeda, {}).get('fonte', '?')

            def g(c, d=0):
                v = info.get(c, d); return v if v is not None else d

            with st.expander(f"🎯 {moeda} [{fonte}] — Score {score} | {motivo[:60]}",
                             expanded=False):
                ec1, ec2, ec3, ec4 = st.columns(4)
                ec1.metric("RSI 15m",    round(g('rsi_15m'), 1))
                ec2.metric("RSI 1D",     round(g('rsi_1d'), 1))
                ec3.metric("RL 1D",      g('range_level_1d'))
                ec4.metric("RL 4H",      g('range_level_4h'))

                eb1, eb2, eb3, eb4 = st.columns(4)
                eb1.metric("α BTC 4H",  round(g('exp_btc_4h'), 2))
                eb2.metric("α BTC 15m", round(g('exp_btc_15m'), 2))
                eb3.metric("OI 5m",     f"${g('oi_5m')/1e6:.1f}M")
                eb4.metric("FR",        f"{g('fr')*100:.4f}%")

                st.markdown(
                    f"<div style='font-size:11px;color:#8892B0;font-family:JetBrains Mono;'>"
                    f"LSR: {g('lsr_5m'):.2f} | Trades/min 1m: {g('trades_min_1m')} | "
                    f"Trades/min 4h: {g('trades_min_4h')} | Pump 1D: {g('price_change_1d'):.2f}%"
                    f"</div>", unsafe_allow_html=True
                )


# ================================================================
# SIDEBAR
# ================================================================
with st.sidebar:
    st.markdown("""
    <div style='display:flex;align-items:center;gap:9px;padding:2px 4px 14px;border-bottom:1px solid #1E2030;margin-bottom:10px;'>
        <div style='width:28px;height:28px;background:linear-gradient(135deg,#00E5B0,#0080FF);border-radius:7px;
                    display:flex;align-items:center;justify-content:center;font-family:"JetBrains Mono",monospace;
                    font-size:11px;font-weight:700;color:#0C0D11;flex-shrink:0;'>TQ</div>
        <span style='font-family:"JetBrains Mono",monospace;font-size:12px;font-weight:700;color:#E0E4F0;letter-spacing:1.5px;'>TERMINAL</span>
        <span style='font-family:"JetBrains Mono",monospace;font-size:9px;color:#00E5B0;background:rgba(0,229,176,0.1);
                     padding:2px 6px;border-radius:20px;margin-left:auto;'>V9.0</span>
    </div>
    """, unsafe_allow_html=True)

    status_atual = get_robot_status()
    if status_atual == "ON":
        st.markdown("<div class='status-on'><span class='pulse-dot'></span> CAÇANDO ALVOS</div>", unsafe_allow_html=True)
    else:
        st.markdown("<div class='status-off'><span class='pulse-dot'></span> ROBÔ PAUSADO</div>", unsafe_allow_html=True)

    st.markdown("<div style='height:10px'></div>", unsafe_allow_html=True)
    st.markdown("<div class='section-header'>⚙️ Táticas</div>", unsafe_allow_html=True)

    cfg = {"capital": 50.0, "alavancagem": 4, "max_pos": 10}
    if os.path.exists("config_trade.json"):
        try:
            with open("config_trade.json") as f: cfg.update(json.load(f))
        except: pass

    cap_i  = st.number_input("Capital por Trade ($)", min_value=1.0, value=float(cfg["capital"]), step=1.0)
    alav_i = st.number_input("Alavancagem (x)", min_value=1, max_value=125, value=int(cfg["alavancagem"]), step=1)
    pos_i  = st.number_input("Máx. Posições", min_value=1, value=int(cfg["max_pos"]), step=1)

    if st.button("💾 Guardar Ajustes", type="primary"):
        escrita_atomica("config_trade.json", {"capital": cap_i, "alavancagem": alav_i, "max_pos": pos_i})
        st.success("✓ Tática atualizada!"); time.sleep(0.5); st.rerun()

    st.markdown("<div style='height:6px'></div>", unsafe_allow_html=True)
    sc1, sc2 = st.columns(2)
    with sc1:
        if status_atual == "ON":
            if st.button("⏸ Pausar"): set_robot_status("OFF"); st.rerun()
        else:
            if st.button("▶ Ligar", type="primary"): set_robot_status("ON"); st.rerun()
    with sc2:
        if st.button("🗑 Limpar"):
            set_robot_status("OFF"); limpar_radar_seguro()
            st.success("Limpo!"); time.sleep(0.3); st.rerun()

    if st.button("🔄 Atualizar Ecrã"): st.rerun()

    st.markdown("<div style='height:10px'></div>", unsafe_allow_html=True)
    st.markdown(f"<div class='ts'>Refresh: 60s · {time.strftime('%H:%M:%S')}</div>", unsafe_allow_html=True)

# ================================================================
# CARREGAR DADOS
# ================================================================
fng_valor, fng_status, btc_dom, alt_status = obter_macro_cmc()
dados_cmc    = obter_listings_cmc()
trending_cmc = obter_trending_cmc()
total, livre, lucro_aberto, ativas = obter_dados_conta()
df_equity, pnl_total, pnl_24h, win_rate = obter_historico_pnl()

dados_painel = {}
if os.path.exists('painel_dados.json'):
    try:
        with open('painel_dados.json', 'r', encoding='utf-8') as f:
            dados_painel = json.load(f).get('data', {})
    except: pass

# ================================================================
# HEADER + MÉTRICAS GLOBAIS
# ================================================================
hc1, hc2 = st.columns([2, 8])
with hc1:
    st.markdown(f"""
    <div style='padding-top:4px;'>
        <div style='font-size:19px;font-weight:700;color:#E0E4F0;letter-spacing:-0.4px;'>📡 Terminal Sniper</div>
        <div style='font-family:"JetBrains Mono",monospace;font-size:10px;color:#4A5070;margin-top:2px;'>
            {time.strftime('%d/%m/%Y · %H:%M:%S')} · AUTO-REFRESH 60s
        </div>
    </div>""", unsafe_allow_html=True)

with hc2:
    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("Banca Total",  f"${total:,.2f}")
    m2.metric("Margem Livre", f"${livre:,.2f}")
    m3.metric("PnL Aberto",   f"${lucro_aberto:,.2f}", delta=round(lucro_aberto, 2))
    m4.metric("Lucro 24h",    f"${pnl_24h:,.2f}",      delta=round(pnl_24h, 2))
    m5.metric("Win Rate",     f"{win_rate:.1f}%")

st.markdown("<div style='height:10px'></div>", unsafe_allow_html=True)

# BARRA MACRO (4 KPI cards)
mc1, mc2, mc3, mc4 = st.columns([1, 1, 2.2, 2.2])

# Fear & Greed
fng_col = "#FF4444" if fng_valor < 30 else ("#F0A000" if fng_valor < 55 else ("#00E5B0" if fng_valor < 75 else "#9B6EF8"))
with mc1:
    st.markdown(f"""
    <div class='kpi-card a'>
        <div class='kpi-label'>Fear & Greed</div>
        <div class='kpi-value' style='color:{fng_col};'>{fng_valor}</div>
        <div class='kpi-sub'>{fng_status}</div>
    </div>""", unsafe_allow_html=True)

# BTC Dominância
dom_col = "#F0A000" if btc_dom > 52 else ("#9B6EF8" if btc_dom < 45 else "#0080FF")
with mc2:
    st.markdown(f"""
    <div class='kpi-card b'>
        <div class='kpi-label'>Dom. BTC</div>
        <div class='kpi-value' style='color:{dom_col};'>{btc_dom:.1f}%</div>
        <div class='kpi-sub'>{alt_status}</div>
    </div>""", unsafe_allow_html=True)

# BTC RSI
rsi5  = calcular_rsi_ao_vivo('BTCUSDT', '5m')
rsi15 = calcular_rsi_ao_vivo('BTCUSDT', '15m')
rsi30 = calcular_rsi_ao_vivo('BTCUSDT', '30m')
with mc3:
    st.markdown(f"""
    <div class='kpi-card g'>
        <div class='kpi-label'>BTC RSI ao vivo</div>
        {fmt_rsi_bar('5m', rsi5)}{fmt_rsi_bar('15m', rsi15)}{fmt_rsi_bar('30m', rsi30)}
    </div>""", unsafe_allow_html=True)

# BTCDOM RSI
d5  = calcular_rsi_ao_vivo('BTCDOMUSDT', '5m')
d15 = calcular_rsi_ao_vivo('BTCDOMUSDT', '15m')
d30 = calcular_rsi_ao_vivo('BTCDOMUSDT', '30m')
with mc4:
    st.markdown(f"""
    <div class='kpi-card p'>
        <div class='kpi-label'>BTCDOM RSI</div>
        {fmt_rsi_bar('5m', d5)}{fmt_rsi_bar('15m', d15)}{fmt_rsi_bar('30m', d30)}
    </div>""", unsafe_allow_html=True)

st.markdown("<div style='border-top:1px solid #1E2030;margin:14px 0 12px;'></div>", unsafe_allow_html=True)

# ================================================================
# TABS
# ================================================================
tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs([
    "🔥 Fortonas",
    "⚔️ Operações Ativas",
    "🔫 Sniper & Radar",
    "📊 Smart Money",
    "📈 Performance",
    "🏆 Gigantes Adormecidos",
    "🧠 Radar Cérebro",
])

# ================================================================
# TAB 1 — 🔥 FORTONAS — FLUXO REAL (trades_min_1m)
# ================================================================
with tab1:
    ft1, ft2 = st.columns([1, 3.5])

    with ft1:
        st.markdown("<div class='section-header'>⚡ Filtros de Fluxo</div>", unsafe_allow_html=True)

        trades_min_filtro = st.slider("Trades/min 1m mínimo", 0, 2000, 50, 25)

        col_oi, col_lsr = st.columns(2)
        with col_oi:  filtro_oi_up  = st.checkbox("OI Subindo")
        with col_lsr: filtro_lsr_up = st.checkbox("LSR Subindo")

        filtro_rsi_max = st.slider("RSI 15m máximo (evitar sobrecomprado)", 50, 100, 100, 5)

        filtro_fr_neg  = st.checkbox("Funding Negativo (shorts pagando)")
        filtro_sem_btc = st.checkbox("Excluir BTCUSDT / ETHUSDT")

        top_n = st.selectbox("Exibir Top", [20, 40, 60, 100], index=1)

        st.markdown("""
        <div style='margin-top:14px;background:#10111A;border:1px solid #1E2030;border-radius:9px;padding:12px;'>
            <div class='kpi-label' style='margin-bottom:8px;'>📖 Doutrina Fortonas</div>
            <div style='font-size:10px;color:#4A5070;font-family:"JetBrains Mono",monospace;line-height:1.9;'>
                Moedas com maior número<br>
                de trades por minuto (1m)<br>
                = fluxo real de dinheiro<br>
                entrando <b style='color:#00E5B0;'>AGORA</b>.<br><br>
                <span style='color:#00E5B0;'>■</span> Elite  ≥ 500 trades/min<br>
                <span style='color:#F0A000;'>■</span> Quente 200–499<br>
                <span style='color:#0080FF;'>■</span> Ativo  50–199<br>
                <span style='color:#4A5070;'>■</span> Frio   &lt; 50
            </div>
        </div>""", unsafe_allow_html=True)

    with ft2:
        st.markdown("<div class='section-header'>🔥 Fortonas — Ranking por Fluxo 1m</div>", unsafe_allow_html=True)

        if not dados_painel:
            st.warning("⏳ Aguardando painel_dados.json...")
        else:
            EXCLUIR = {'BTCUSDT', 'ETHUSDT', 'USDCUSDT', 'BUSDUSDT', 'USDTUSDT', 'BTCDOMUSDT'}
            fortonas = []

            for sym, p in dados_painel.items():
                if filtro_sem_btc and sym in EXCLUIR: continue
                if sym in EXCLUIR and sym in ('USDCUSDT', 'BUSDUSDT', 'USDTUSDT', 'BTCDOMUSDT'): continue

                tm1m = int(p.get('trades_min_1m') or 0)
                if tm1m < trades_min_filtro: continue

                oi_trend  = p.get('oi_trend_5m', '-')
                lsr_trend = p.get('lsr_trend_5m', '-')
                rsi_15m   = float(p.get('rsi_15m') or 0)
                fr        = float(p.get('fr') or 0)

                if filtro_oi_up  and oi_trend  != 'Up':   continue
                if filtro_lsr_up and lsr_trend != 'Up':   continue
                if rsi_15m > filtro_rsi_max:               continue
                if filtro_fr_neg and fr >= 0:              continue

                cmc_d = dados_cmc.get(sym, {})

                # Classificação de intensidade
                if   tm1m >= 500: nivel = "ELITE";   nivel_col = "#00E5B0"; nivel_cls = "tier-1"
                elif tm1m >= 200: nivel = "QUENTE";  nivel_col = "#F0A000"; nivel_cls = "tier-2"
                else:             nivel = "ATIVO";   nivel_col = "#0080FF"; nivel_cls = "tier-3"

                fortonas.append({
                    "sym":       sym,
                    "tm_1m":     tm1m,
                    "tm_5m":     int(p.get('trades_min_5m')  or 0),
                    "tm_15m":    int(p.get('trades_min_15m') or 0),
                    "tm_1h":     int(p.get('trades_min_1h')  or 0),
                    "tm_1d":     int(p.get('trades_min_1d')  or 0),
                    "rsi_15m":   round(rsi_15m, 1),
                    "rsi_1h":    round(float(p.get('rsi_1h') or 0), 1),
                    "rsi_1d":    round(float(p.get('rsi_1d') or 0), 1),
                    "oi_5m":     float(p.get('oi_5m') or 0),
                    "oi_trend":  oi_trend,
                    "lsr_5m":    float(p.get('lsr_5m') or 0),
                    "lsr_trend": lsr_trend,
                    "fr":        fr,
                    "rl_4h":     int(p.get('range_level_4h') or 0),
                    "rl_1h":     int(p.get('range_level_1h') or 0),
                    "exp_btc_1h":float(p.get('exp_btc_1h')   or 0),
                    "exp_btc_15m":float(p.get('exp_btc_15m') or 0),
                    "price_1d":  float(p.get('price_change_1d') or 0),
                    "nivel":     nivel,
                    "nivel_col": nivel_col,
                    "nivel_cls": nivel_cls,
                    "rank_cmc":  cmc_d.get('rank', 9999),
                    "setor":     cmc_d.get('setor', '—'),
                    "mcap":      cmc_d.get('market_cap', 0),
                    "change_24h":cmc_d.get('change_24h', 0),
                })

            fortonas.sort(key=lambda x: x['tm_1m'], reverse=True)
            fortonas = fortonas[:top_n]

            # --- INTEGRAÇÃO CÉREBRO V10 (exporta no formato compatível) ---
            cacador_export = [{
                "sym":        f["sym"],
                "score":      min(100, f["tm_1m"] // 10),
                "setor":      f["setor"],
                "rank":       f["rank_cmc"],
                "change_24h": f["change_24h"],
                "change_30d": 0,
                "market_cap": f["mcap"],
                "motivos":    [f"⚡ {f['tm_1m']} trades/min 1m", f"Nível: {f['nivel']}"],
                "alertas":    [],
            } for f in fortonas]
            escrita_atomica('cacador_1000.json', cacador_export)
            # --------------------------------------------------------------

            cnt_elite  = sum(1 for f in fortonas if f['nivel'] == 'ELITE')
            cnt_quente = sum(1 for f in fortonas if f['nivel'] == 'QUENTE')
            cnt_ativo  = sum(1 for f in fortonas if f['nivel'] == 'ATIVO')
            max_trades = fortonas[0]['tm_1m'] if fortonas else 0

            sc_col1, sc_col2, sc_col3, sc_col4 = st.columns(4)
            sc_col1.metric("Moedas no Painel",  f"{len(dados_painel):,}")
            sc_col2.metric("🟢 Elite (≥500)",   cnt_elite)
            sc_col3.metric("🟡 Quentes (≥200)", cnt_quente)
            sc_col4.metric("🏆 Líder Fluxo",    f"{max_trades} t/min")

            st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

            # ── Tabela compacta de ranking ─────────────────────────────
            linhas_df = []
            for i, f in enumerate(fortonas):
                oi_ico  = "🟢" if f['oi_trend']  == 'Up' else ("🔴" if f['oi_trend']  == 'Down' else "—")
                lsr_ico = "🟢" if f['lsr_trend'] == 'Up' else ("🔴" if f['lsr_trend'] == 'Down' else "—")
                linhas_df.append({
                    "Pos":        i + 1,
                    "Moeda":      f['sym'],
                    "Nível":      f['nivel'],
                    "T/min 1m":   f['tm_1m'],
                    "T/min 5m":   f['tm_5m'],
                    "T/min 15m":  f['tm_15m'],
                    "T/min 1h":   f['tm_1h'],
                    "RSI 15m":    f['rsi_15m'],
                    "RSI 1h":     f['rsi_1h'],
                    "OI":         oi_ico,
                    "LSR":        lsr_ico,
                    "RL 4H":      f['rl_4h'],
                    "FR %":       round(f['fr'] * 100, 4),
                    "α BTC 1h":   round(f['exp_btc_1h'], 1),
                    "1d %":       round(f['price_1d'], 2),
                    "Setor":      f['setor'],
                })

            df_fort = pd.DataFrame(linhas_df)

            def colorir_nivel(val):
                if val == 'ELITE':  return 'color:#00E5B0;font-weight:bold'
                if val == 'QUENTE': return 'color:#F0A000;font-weight:bold'
                if val == 'ATIVO':  return 'color:#0080FF'
                return ''

            def colorir_numerico(val):
                if isinstance(val, (int, float)):
                    if val > 0: return 'color:#00E5B0'
                    if val < 0: return 'color:#FF4444'
                return ''

            st.dataframe(
                df_fort.style
                    .map(colorir_nivel,    subset=["Nível"])
                    .map(colorir_numerico, subset=["1d %", "α BTC 1h", "FR %"]),
                hide_index=True,
                use_container_width=True,
                column_config={
                    "Pos":       st.column_config.NumberColumn("#",         format="%d",   width="small"),
                    "Moeda":     st.column_config.TextColumn("Moeda",                      width="small"),
                    "Nível":     st.column_config.TextColumn("Nível",                      width="small"),
                    "T/min 1m":  st.column_config.NumberColumn("T/min 1m", format="%d"),
                    "T/min 5m":  st.column_config.NumberColumn("T/min 5m", format="%d"),
                    "T/min 15m": st.column_config.NumberColumn("T/min 15m",format="%d"),
                    "T/min 1h":  st.column_config.NumberColumn("T/min 1h", format="%d"),
                    "RSI 15m":   st.column_config.NumberColumn("RSI 15m",  format="%.1f"),
                    "RSI 1h":    st.column_config.NumberColumn("RSI 1h",   format="%.1f"),
                    "OI":        st.column_config.TextColumn("OI",                         width="small"),
                    "LSR":       st.column_config.TextColumn("LSR",                        width="small"),
                    "RL 4H":     st.column_config.NumberColumn("RL 4H",    format="%d",   width="small"),
                    "FR %":      st.column_config.NumberColumn("FR %",     format="%.4f"),
                    "α BTC 1h":  st.column_config.NumberColumn("α BTC 1h",format="%.1f"),
                    "1d %":      st.column_config.NumberColumn("1d %",     format="%.2f%%"),
                    "Setor":     st.column_config.TextColumn("Setor",                      width="medium"),
                }
            )

            st.markdown("<div style='height:10px'></div>", unsafe_allow_html=True)

            # ── Cards de detalhe (top 10 expandíveis) ─────────────────
            st.markdown("<div class='section-header'>🏆 Top 10 — Detalhe de Fluxo</div>", unsafe_allow_html=True)
            for f in fortonas[:10]:
                sym  = f['sym']
                tm1m = f['tm_1m']
                pct_bar = min(tm1m / max(max_trades, 1) * 100, 100)

                oi_ico  = "🟢 Up"   if f['oi_trend']  == 'Up'   else ("🔴 Down" if f['oi_trend']  == 'Down' else "— N/D")
                lsr_ico = "🟢 Up"   if f['lsr_trend'] == 'Up'   else ("🔴 Down" if f['lsr_trend'] == 'Down' else "— N/D")
                fr_col  = "#00E5B0" if f['fr'] < 0 else ("#FF4444" if f['fr'] > 0.0005 else "#8892B0")
                p1d_col = "#00E5B0" if f['price_1d'] >= 0 else "#FF4444"
                alph_col= "#00E5B0" if f['exp_btc_1h'] >= 0 else "#FF4444"

                with st.expander(
                    f"{'🏅' if f['nivel']=='ELITE' else ('🔥' if f['nivel']=='QUENTE' else '⚡')}  "
                    f"{sym}  │  {tm1m} trades/min  │  {f['nivel']}  │  RSI 15m: {f['rsi_15m']}",
                    expanded=False
                ):
                    d1, d2, d3, d4, d5 = st.columns(5)
                    d1.metric("T/min 1m",  f"{f['tm_1m']}")
                    d2.metric("T/min 5m",  f"{f['tm_5m']}")
                    d3.metric("T/min 15m", f"{f['tm_15m']}")
                    d4.metric("T/min 1h",  f"{f['tm_1h']}")
                    d5.metric("T/min 1d",  f"{f['tm_1d']}")

                    st.markdown(f"""
                    <div style='background:#0E0F18;border:1px solid #1E2030;border-radius:9px;padding:13px;margin-top:6px;'>
                        <div style='display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;'>
                            <span class='badge' style='background:rgba(0,229,176,0.1);color:{f["nivel_col"]};border:1px solid {f["nivel_col"]}33;'>
                                {f['nivel']}
                            </span>
                            <span style='font-family:"JetBrains Mono",monospace;font-size:11px;color:#4A5070;'>Rank CMC: #{f['rank_cmc']}</span>
                            <span style='font-family:"JetBrains Mono",monospace;font-size:11px;color:#8892B0;'>{f['setor']}</span>
                        </div>
                        <div style='display:flex;gap:22px;font-family:"JetBrains Mono",monospace;font-size:12px;margin-bottom:10px;flex-wrap:wrap;'>
                            <span>OI Trend: <b>{oi_ico}</b></span>
                            <span>LSR Trend: <b>{lsr_ico}</b></span>
                            <span>LSR 5m: <b style='color:#E0E4F0;'>{f['lsr_5m']:.3f}</b></span>
                            <span>OI 5m: <b style='color:#0080FF;'>{fmt_mcap(f['oi_5m'])}</b></span>
                        </div>
                        <div style='display:flex;gap:22px;font-family:"JetBrains Mono",monospace;font-size:12px;margin-bottom:12px;flex-wrap:wrap;'>
                            <span>FR: <b style='color:{fr_col};'>{f['fr']*100:.4f}%</b></span>
                            <span>RL 4H: <b style='color:#E0E4F0;'>{f['rl_4h']}</b></span>
                            <span>RL 1H: <b style='color:#E0E4F0;'>{f['rl_1h']}</b></span>
                            <span>α BTC 1h: <b style='color:{alph_col};'>{f['exp_btc_1h']:+.1f}</b></span>
                            <span>α BTC 15m: <b style='color:{"#00E5B0" if f["exp_btc_15m"]>=0 else "#FF4444"};'>{f['exp_btc_15m']:+.1f}</b></span>
                            <span>1d: <b style='color:{p1d_col};'>{f['price_1d']:+.2f}%</b></span>
                        </div>
                        <div class='kpi-label' style='margin-bottom:4px;'>Intensidade de Fluxo 1m</div>
                        <div class='score-bar-bg'>
                            <div class='score-bar-fill' style='width:{pct_bar:.0f}%;background:{f["nivel_col"]};'></div>
                        </div>
                    </div>""", unsafe_allow_html=True)

                    r2a, r2b, r2c = st.columns(3)
                    r2a.metric("RSI 15m", f['rsi_15m'])
                    r2b.metric("RSI 1h",  f['rsi_1h'])
                    r2c.metric("RSI 1d",  f['rsi_1d'])

# ================================================================
# TAB 2 — ⚔️ OPERAÇÕES ATIVAS
# ================================================================
with tab2:
    st.markdown(f"<div class='section-header'>⚔️ Operações Ativas ({len(ativas)})</div>", unsafe_allow_html=True)

    if ativas:
        df_pos = pd.DataFrame(ativas)
        df_pos['Setor']    = df_pos['Moeda'].apply(lambda m: dados_cmc.get(m, {}).get('setor', '-'))
        df_pos['Rank CMC'] = df_pos['Moeda'].apply(lambda m: dados_cmc.get(m, {}).get('rank', '-'))
        df_pos['MCap']     = df_pos['Moeda'].apply(lambda m: fmt_mcap(dados_cmc.get(m, {}).get('market_cap', 0)))
        df_pos['30d %']    = df_pos['Moeda'].apply(lambda m: round(dados_cmc.get(m, {}).get('change_30d', 0.0), 1))

        st.dataframe(
            df_pos.style.map(
                lambda x: 'color: #00E5B0; font-weight: bold' if isinstance(x, (int, float)) and x > 0 else
                          'color: #FF4444; font-weight: bold' if isinstance(x, (int, float)) and x < 0 else '',
                subset=['PnL ($)', 'ROE (%)', '30d %']
            ),
            hide_index=True,
            use_container_width=True,
            column_config={
                "Moeda":      st.column_config.TextColumn("Moeda", width="small"),
                "Status":     st.column_config.TextColumn("Status", width="medium"),
                "Entrada":    st.column_config.NumberColumn("Entrada", format="$%.5f"),
                "Preço Atual":st.column_config.NumberColumn("Preço Atual", format="$%.5f"),
                "Stop Loss":  st.column_config.TextColumn("Stop Loss", width="medium"),
                "ROE (%)":    st.column_config.NumberColumn("ROE %", format="%.2f%%"),
                "PnL ($)":    st.column_config.NumberColumn("PnL $", format="$%.2f"),
                "Setor":      st.column_config.TextColumn("Setor", width="medium"),
                "Rank CMC":   st.column_config.NumberColumn("Rank CMC", format="%d"),
                "MCap":       st.column_config.TextColumn("MCap"),
                "30d %":      st.column_config.NumberColumn("30d %", format="%.1f%%"),
            }
        )
        st.info("💡 Contexto CMC atualizado automaticamente. Rank CMC e MCap ajudam a avaliar o potencial restante de cada posição aberta.")
    else:
        st.info("🎯 Nenhuma posição aberta. O Sniper está em modo de espreita.")

# ================================================================
# TAB 3 — 🔫 SNIPER & RADAR
# ================================================================
with tab3:
    sc1, sc2 = st.columns([1, 2.5])

    with sc1:
        st.markdown("<div class='section-header'>🔫 Na Mira do Sniper</div>", unsafe_allow_html=True)
        st.markdown("<div class='ts' style='margin-bottom:9px;'>Aguardando Pullback Confirmado</div>", unsafe_allow_html=True)

        if os.path.exists('watchlist.json'):
            try:
                with open('watchlist.json', 'r', encoding='utf-8') as f:
                    alvos = json.load(f)
                if alvos:
                    for moeda, motivo in alvos.items():
                        is_vip = "VIP" in str(motivo)
                        cls = "sniper-card vip" if is_vip else "sniper-card"
                        sc_data = dados_cmc.get(moeda, {})
                        setor_tag = sc_data.get('setor', '')
                        rank_tag  = f"Rank #{sc_data.get('rank', '?')}"
                        st.markdown(
                            f"<div class='{cls}'>🎯 {moeda}"
                            f"<span style='font-size:9px;color:#555;float:right;'>{rank_tag} · {setor_tag}</span></div>",
                            unsafe_allow_html=True
                        )
                else:
                    st.markdown("<div class='ts'>Nenhum alvo na mira.</div>", unsafe_allow_html=True)
            except:
                st.markdown("<div class='ts'>A ler radar...</div>", unsafe_allow_html=True)

    with sc2:
        st.markdown("<div class='section-header'>💣 Radar Institucional — Molas & Compressão</div>", unsafe_allow_html=True)
        if dados_painel:
            rc4, rc1 = st.columns(2)
            def exibir_molas(col, titulo, nivel_key, nivel_min=4):
                with col:
                    st.markdown(f"###### {titulo}")
                    molas = {m: i.get(nivel_key) for m, i in dados_painel.items() if (i.get(nivel_key) or 0) >= nivel_min}
                    if molas:
                        grupos = {}
                        for m, nv in molas.items():
                            setor = dados_cmc.get(m, {}).get('setor', 'Outros')
                            grupos.setdefault(setor, []).append((m, nv))
                        for setor in sorted(grupos):
                            st.markdown(f"<div class='titulo-setor'>📂 {setor}</div>", unsafe_allow_html=True)
                            for m, nv in sorted(grupos[setor], key=lambda x: x[1], reverse=True):
                                rank = dados_cmc.get(m, {}).get('rank', '?')
                                st.markdown(f"<div class='mola-card'>🔥 {m} <span style='font-size:9px;color:#666;float:right;'>Rank #{rank} · Nv {nv}</span></div>", unsafe_allow_html=True)
                    else:
                        st.markdown("<div class='ts'>Nenhuma mola detetada.</div>", unsafe_allow_html=True)
            exibir_molas(rc4, "🗜️ Compressão 4H", 'range_level_4h')
            exibir_molas(rc1, "🗜️ Compressão 1H", 'range_level_1h')
        else:
            st.info("Aguardando que o Piloto Fantasma recolha dados...")

# ================================================================
# TAB 4 — 📊 SMART MONEY
# ================================================================
with tab4:
    st.markdown("<div class='section-header'>📊 Fluxo Smart Money — Radar Institucional</div>", unsafe_allow_html=True)

    if dados_painel:
        lista_sm = []
        for m, info in dados_painel.items():
            if m == 'BTCUSDT': continue
            oi_t  = info.get('oi_trend_5m', '-')
            lsr_t = info.get('lsr_trend_5m', '-')
            fr    = float(info.get('fr', 0) or 0)
            lista_sm.append({
                "Moeda":        m,
                "Setor":        dados_cmc.get(m, {}).get('setor', '-'),
                "Rank CMC":     dados_cmc.get(m, {}).get('rank', 9999),
                "Trades/Dia":   info.get('trades_1d', 0),
                "OI 5m ($)":    info.get('oi_5m', 0.0),
                "OI Trend":     "🟢 Up" if oi_t == 'Up' else ("🔴 Down" if oi_t == 'Down' else "─"),
                "LSR 5m":       round(float(info.get('lsr_5m', 0) or 0), 3),
                "LSR Trend":    "🟢 Up" if lsr_t == 'Up' else ("🔴 Down" if lsr_t == 'Down' else "─"),
                "Funding Rate": f"{fr*100:.4f}%",
                "RSI 15m":      round(float(info.get('rsi_15m', 0) or 0), 1),
                "Compressão 4H": info.get('range_level_4h', 0) or 0,
            })
        if lista_sm:
            df_sm = (pd.DataFrame(lista_sm)
                     .sort_values(by=["Trades/Dia", "OI 5m ($)"], ascending=[False, False]))
            
            # --- INTEGRAÇÃO CÉREBRO V10 ---
            exportar_smart_money(lista_sm, dados_painel)
            # ------------------------------

            st.dataframe(df_sm, hide_index=True, use_container_width=True,
                column_config={
                    "Moeda":         st.column_config.TextColumn("Moeda",   width="small"),
                    "Setor":         st.column_config.TextColumn("Setor",   width="medium"),
                    "Rank CMC":      st.column_config.NumberColumn("Rank",  format="%d"),
                    "Trades/Dia":    st.column_config.NumberColumn("Trades/Dia"),
                    "OI 5m ($)":     st.column_config.NumberColumn("OI 5m ($)", format="$%.0f"),
                    "OI Trend":      st.column_config.TextColumn("OI Trend"),
                    "LSR 5m":        st.column_config.NumberColumn("LSR 5m",    format="%.3f"),
                    "LSR Trend":     st.column_config.TextColumn("LSR Trend"),
                    "Funding Rate":  st.column_config.TextColumn("Funding"),
                    "RSI 15m":       st.column_config.NumberColumn("RSI 15m", format="%.1f"),
                    "Compressão 4H": st.column_config.NumberColumn("Comp 4H", format="%d"),
                })
    else:
        st.info("Aguardando dados do Piloto Fantasma...")

# ================================================================
# TAB 5 — 📈 PERFORMANCE & EQUITY
# ================================================================
with tab5:
    st.markdown("<div class='section-header'>📈 Performance & Curva de Equity</div>", unsafe_allow_html=True)

    pk1, pk2, pk3, pk4 = st.columns(4)
    pk1.metric("PnL Total 30d", f"${pnl_total:,.2f}", delta=round(pnl_total, 2))
    pk2.metric("Lucro Hoje",    f"${pnl_24h:,.2f}",   delta=round(pnl_24h, 2))
    pk3.metric("Win Rate",      f"{win_rate:.1f}%")

    # Drawdown
    if not df_equity.empty and 'equity' in df_equity.columns and len(df_equity) > 1:
        roll_max = df_equity['equity'].cummax()
        dd = ((df_equity['equity'] - roll_max) / roll_max.abs().replace(0, 1)) * 100
        max_dd = dd.min()
        pk4.metric("Max Drawdown", f"{max_dd:.1f}%", delta=round(max_dd, 2), delta_color="inverse")

    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

    if not df_equity.empty and 'equity' in df_equity.columns:

        # ── Curva de Equity ────────────────────────────────────────
        fig_eq = go.Figure()
        fig_eq.add_trace(go.Scatter(
            x=df_equity['time'], y=df_equity['equity'],
            mode='lines', name='Equity',
            line=dict(color='#00E5B0', width=2),
            fill='tozeroy', fillcolor='rgba(0,229,176,0.06)',
            hovertemplate='%{x|%d/%m %H:%M}<br>PnL: $%{y:.2f}<extra></extra>'
        ))
        fig_eq.update_layout(
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(14,15,24,1)',
            height=240, margin=dict(l=0, r=0, t=8, b=0),
            xaxis=dict(showgrid=False, color='#4A5070', tickfont=dict(size=10, color='#4A5070'), showline=False, zeroline=False),
            yaxis=dict(showgrid=True, gridcolor='#1E2030', color='#4A5070', tickfont=dict(size=10, color='#4A5070'), tickprefix='$', zeroline=True, zerolinecolor='#2E3050'),
            showlegend=False, hovermode='x unified',
        )
        st.markdown("##### Curva de Equity — últimos 30 dias")
        st.plotly_chart(fig_eq, use_container_width=True)

        # ── PnL Diário ─────────────────────────────────────────────
        df_d = df_equity.copy()
        df_d['date'] = df_d['time'].dt.date
        df_d_grp = df_d.groupby('date')['income'].sum().reset_index()

        colors_bars = ['#00E5B0' if v >= 0 else '#FF4444' for v in df_d_grp['income']]
        fig_bar = go.Figure()
        fig_bar.add_trace(go.Bar(
            x=df_d_grp['date'], y=df_d_grp['income'],
            marker_color=colors_bars, name='PnL Diário',
            hovertemplate='%{x}<br>PnL: $%{y:.2f}<extra></extra>'
        ))
        fig_bar.update_layout(
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(14,15,24,1)',
            height=180, margin=dict(l=0, r=0, t=8, b=0),
            xaxis=dict(showgrid=False, color='#4A5070', tickfont=dict(size=10, color='#4A5070')),
            yaxis=dict(showgrid=True, gridcolor='#1E2030', color='#4A5070', tickfont=dict(size=10, color='#4A5070'), tickprefix='$', zeroline=True, zerolinecolor='#2E3050'),
            showlegend=False,
        )
        st.markdown("##### PnL Diário")
        st.plotly_chart(fig_bar, use_container_width=True)

        # ── PnL por Símbolo ─────────────────────────────────────────
        if 'symbol' in df_equity.columns:
            df_sym = df_equity.groupby('symbol')['income'].sum().sort_values(ascending=False).head(15).reset_index()
            colors_sym = ['#00E5B0' if v >= 0 else '#FF4444' for v in df_sym['income']]
            fig_sym = go.Figure()
            fig_sym.add_trace(go.Bar(
                x=df_sym['symbol'], y=df_sym['income'],
                marker_color=colors_sym,
                hovertemplate='%{x}<br>PnL: $%{y:.2f}<extra></extra>'
            ))
            fig_sym.update_layout(
                paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(14,15,24,1)',
                height=200, margin=dict(l=0, r=0, t=8, b=0),
                xaxis=dict(showgrid=False, color='#4A5070', tickfont=dict(size=10, color='#4A5070')),
                yaxis=dict(showgrid=True, gridcolor='#1E2030', color='#4A5070', tickfont=dict(size=10, color='#4A5070'), tickprefix='$'),
                showlegend=False,
            )
            st.markdown("##### PnL por Símbolo (Top 15)")
            st.plotly_chart(fig_sym, use_container_width=True)
    else:
        st.info("Sem dados de histórico disponíveis. Verifique a sua BINANCE_API_KEY no ficheiro .env")

# ================================================================
# TAB 6 — 🏆 GIGANTES ADORMECIDOS
# ================================================================
with tab6:
    if dados_cmc and dados_painel:
        top_30d, top_vip = [], []

        for moeda, info in dados_cmc.items():
            if moeda not in dados_painel or moeda == 'BTCUSDT': continue
            c24  = info.get('change_24h', 0.0)
            c30  = info.get('change_30d', 0.0)
            c60  = info.get('change_60d', 0.0)
            c90  = info.get('change_90d', 0.0)
            setor = info.get('setor', 'Outros')
            top_30d.append((moeda, c30, setor))
            if c30 <= 30.0 and c60 <= 30.0 and c90 <= 30.0:
                top_vip.append((moeda, c24, setor))

        top_30d = sorted(top_30d, key=lambda x: x[1], reverse=True)[:6]
        top_vip = sorted(top_vip, key=lambda x: x[1], reverse=True)[:6]

        escrita_atomica('vip_24h.json', [m[0] for m in top_vip])

        st.markdown("##### 🏆 Top Performers — Consolidação 30 Dias")
        for i, col in enumerate(st.columns(6)):
            if i < len(top_30d):
                m, mc, ms = top_30d[i]
                col.metric(m, f"{mc:+.2f}%", ms, delta_color="off")

        st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
        st.markdown("##### 👀 Ignição de 1º Ciclo — Gigantes Adormecidos")
        st.markdown("<span style='color:#4A5070;font-size:0.85rem;'>Moedas sem ciclos nos últimos 3 meses que acordaram hoje.</span>", unsafe_allow_html=True)
        st.markdown("<div style='height:6px'></div>", unsafe_allow_html=True)

        for i, col in enumerate(st.columns(6)):
            if i < len(top_vip):
                m, mc, ms = top_vip[i]
                col.metric(m, f"🔥 {ms}", f"{mc:+.2f}%", delta_color="normal")
    else:
        st.info("A calcular histórico de supressão... Aguardando dados CMC + Painel.")

# ================================================================
# TAB 7 — 🧠 RADAR CÉREBRO V10
# ================================================================
with tab7:
    render_tab_cerebro(dados_painel, dados_cmc)

# ================================================================
# RODAPÉ
# ================================================================
st.markdown("<div style='border-top:1px solid #1E2030;margin-top:20px;padding-top:10px;'></div>", unsafe_allow_html=True)
st.caption(
    f"Terminal Quant V9.0 · Sniper Pro · "
    f"CMC ({len(dados_cmc):,} moedas) + Binance Futures · "
    f"Última atualização: {time.strftime('%H:%M:%S')} · Refresh automático cada 60s"
)