import ccxt
import os
import sys
import time
import json
import requests
import threading
import pandas as pd
from dotenv import load_dotenv

# Carrega as variáveis do ficheiro .env
load_dotenv()

# =================================================================
# ⚙️ CONFIGURAÇÕES MESTRE (V14.1 - AGRESSIVO MULTI-TF + TELEGRAM)
# =================================================================
def obter_taticas():
    padrao = {"capital": 50.0, "alavancagem": 4, "max_pos": 10}
    if os.path.exists("config_trade.json"):
        try:
            with open("config_trade.json", "r", encoding='utf-8') as f:
                padrao.update(json.load(f))
        except: pass
    return float(padrao["capital"]), int(padrao["alavancagem"]), int(padrao["max_pos"])

# Proteção de Risco (Sem Parciais, Sem Trailing - Foco no Break-Even)
GAP_STOP_LIMIT       = 0.002
ALVO_BE_ROE          = 20.0
PROTECAO_TAXAS       = 1.005
MAX_STOP_PERMITIDO   = 0.15 # Stop máximo de 15% para evitar TFs muito esticados

# Credenciais lidas de forma segura do .env
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")
TELEGRAM_TOKEN      = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID    = os.getenv("TELEGRAM_CHAT_ID")
BINANCE_API_KEY     = os.getenv("BINANCE_API_KEY")
BINANCE_SECRET_KEY  = os.getenv("BINANCE_SECRET_KEY")

if not BINANCE_API_KEY or not BINANCE_SECRET_KEY:
    print("❌ ERRO FATAL: BINANCE_API_KEY ou BINANCE_SECRET_KEY não encontradas no .env!")
    sys.exit(1)

# Conexão à Binance
corretora = ccxt.binanceusdm({
    'apiKey': BINANCE_API_KEY, 
    'secret': BINANCE_SECRET_KEY,
    'enableRateLimit': True,
    'options': {'defaultType': 'future', 'adjustForTimeDifference': True}
})

try:
    corretora.load_markets()
    corretora.fetch_balance() 
except Exception as e:
    print(f"❌ ERRO FATAL DE AUTENTICAÇÃO: {e}")
    sys.exit(1)


# =================================================================
# 🛠️ UTILITÁRIOS & ALERTAS
# =================================================================
def obter_status():
    if not os.path.exists('config.json'): return "ON"
    try:
        with open('config.json', 'r') as f: return json.load(f).get("robot_status", "ON")
    except: return "ON"

def enviar_alerta(mensagem):
    # Envia para o Discord
    if DISCORD_WEBHOOK_URL:
        try: 
            requests.post(DISCORD_WEBHOOK_URL, json={"content": mensagem}, timeout=10)
        except: pass
    
    # Envia para o Telegram
    if TELEGRAM_TOKEN and TELEGRAM_CHAT_ID:
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
            payload = {"chat_id": TELEGRAM_CHAT_ID, "text": mensagem}
            requests.post(url, json=payload, timeout=10)
        except: pass

def registrar_diario(acao, simbolo, preco, roe="", motivo="", tf_usado=""):
    data_hora = time.strftime('%Y-%m-%d %H:%M:%S')
    linha = f"[{data_hora}] {acao.ljust(18)} | Moeda: {simbolo.ljust(12)} | Preço: ${preco:<11.5f} | ROE: {str(roe).ljust(8)} | TF: {tf_usado} | {motivo}\n"
    try:
        with open('diario_de_bordo.txt', 'a', encoding='utf-8') as f: f.write(linha)
    except: pass


# =================================================================
# 🛡️ MOTOR DE SAÍDA (APENAS BREAK-EVEN - MANUAL HOLDING)
# =================================================================
def motor_saida_estrategica():
    print(f"🛡️  Motor de Saída (Break-Even {ALVO_BE_ROE}%) ativo. Sem parciais. Gestão manual ativada.")
    moedas_protegidas_be = set()

    while True:
        try:
            if obter_status() == "OFF":
                time.sleep(5); continue

            _, alavancagem_dinamica, _ = obter_taticas()
            posicoes = corretora.fetch_positions()
            ativas = [p for p in posicoes if abs(float(p['info'].get('positionAmt', 0))) > 0]
            simbolos_ativos = [p['symbol'] for p in ativas]

            for m in list(moedas_protegidas_be):
                if m not in simbolos_ativos: moedas_protegidas_be.discard(m)

            for pos in ativas:
                simbolo = pos['symbol']
                preco_entrada = float(pos['entryPrice'])
                preco_atual = float(pos['info'].get('markPrice') or preco_entrada)
                pos_amt = abs(float(pos['info'].get('positionAmt', 0)))
                roe_atual = ((preco_atual - preco_entrada) / preco_entrada) * alavancagem_dinamica * 100

                if roe_atual >= ALVO_BE_ROE and simbolo not in moedas_protegidas_be:
                    preco_be_ativacao = preco_entrada * PROTECAO_TAXAS
                    preco_be_limite   = preco_be_ativacao * (1 - GAP_STOP_LIMIT)

                    corretora.cancel_all_orders(simbolo)
                    time.sleep(1)
                    corretora.create_order(simbolo, 'stop', 'sell', pos_amt, preco_be_limite, {'stopPrice': preco_be_ativacao, 'reduceOnly': True})
                    
                    moedas_protegidas_be.add(simbolo)
                    registrar_diario("🛡️ BREAK-EVEN", simbolo, preco_atual, roe=f"{roe_atual:.1f}%", motivo="Risco Zero. Holding manual.")
                    enviar_alerta(f"🛡️ **{simbolo} EM BREAK-EVEN!**\nROE: {roe_atual:.1f}%. Capital blindado. A gerir manualmente.")

            time.sleep(10)
        except Exception as e:
            time.sleep(10)


# =================================================================
# 🔫 MOTOR DE ENTRADA MULTI-TIMEFRAME
# =================================================================
def obter_posicoes_ativas():
    try: return [p['symbol'] for p in corretora.fetch_positions() if abs(float(p['info'].get('positionAmt', 0))) > 0]
    except: return []

def executar_entrada_mercado(simbolo, stop_price, tf_usado, motivo_cerebro=""):
    capital, alavancagem, _ = obter_taticas()
    try:
        try: corretora.set_margin_mode('ISOLATED', simbolo)
        except: pass
        corretora.set_leverage(alavancagem, simbolo)

        ticker = corretora.fetch_ticker(simbolo)
        preco_exec = float(ticker['last'])

        quantidade = float(corretora.amount_to_precision(simbolo, (capital * alavancagem) / preco_exec))
        corretora.create_order(simbolo, 'market', 'buy', quantidade)

        # Stop Loss Estrutural calculado pelo pullback
        p_stop_ativ = float(corretora.price_to_precision(simbolo, stop_price))
        p_stop_lim = float(corretora.price_to_precision(simbolo, p_stop_ativ * (1 - GAP_STOP_LIMIT)))
        
        corretora.create_order(simbolo, 'stop', 'sell', quantidade, p_stop_lim, {'stopPrice': p_stop_ativ, 'reduceOnly': True})

        distancia_stop_pct = ((preco_exec - p_stop_ativ) / preco_exec) * 100
        n_ativas = len(obter_posicoes_ativas())
        
        registrar_diario("🟢 ENTRADA LONG", simbolo, preco_exec, roe="0.0%", motivo=motivo_cerebro, tf_usado=tf_usado)
        enviar_alerta(
            f"🚀 **SNIPER DISPAROU (TF: {tf_usado})!**\n"
            f"💰 Moeda: {simbolo}\n"
            f"🧠 Motivo: {motivo_cerebro}\n"
            f"💵 Entrada: ${preco_exec:.5f}\n"
            f"🛡️ Stop Estrutural: ${p_stop_ativ:.5f} ({distancia_stop_pct:.2f}% de distância)\n"
            f"📊 Posições ativas: {n_ativas}"
        )
        return True
    except Exception as e:
        print(f"❌ Erro na entrada {simbolo}: {e}"); return False


def verificar_respiro_pullback(df):
    """Padrão: Vermelha → Verde → Verde (todas velas FECHADAS)."""
    if len(df) < 5: return False
    c0 = df.iloc[-4] # vermelha
    c1 = df.iloc[-3] # 1ª verde
    c2 = df.iloc[-2] # 2ª verde (confirmadora)
    return (c0['close'] < c0['open']) and (c1['close'] > c1['open']) and (c2['close'] > c2['open']) and (c2['close'] > c1['high'])

def obter_micro_confirmacoes(symbol):
    try:
        if not os.path.exists('painel_dados.json'): return None
        with open('painel_dados.json', 'r', encoding='utf-8') as f: painel = json.load(f)
        if symbol not in painel.get('data', {}): return None
        
        info = painel['data'][symbol]
        hft_ok = int(info.get('trades_min_1m', 0) or 0) > 60
        rsi_ok = 50 <= float(info.get('rsi_15m', 0) or 0) <= 76
        alpha_ok = float(info.get('exp_btc_15m', 0) or 0) > 0.0

        if not (hft_ok and rsi_ok and alpha_ok):
            return None # Corta o mal pela raiz se os dados globais não validam

        tfs = ['15m', '30m', '1h', '4h']
        melhor_tf = None
        melhor_stop_price = None
        menor_risco_pct = 999.0

        # Caça o pullback em múltiplos timeframes buscando o menor stop técnico
        for tf in tfs:
            velas = corretora.fetch_ohlcv(symbol, timeframe=tf, limit=10)
            df = pd.DataFrame(velas, columns=['ts', 'open', 'high', 'low', 'close', 'vol'])
            
            if verificar_respiro_pullback(df):
                c0 = df.iloc[-4] # Vela vermelha
                c1 = df.iloc[-3] # 1ª Vela verde
                c2 = df.iloc[-2] # 2ª Vela verde (fechada, momento do setup)
                
                # O Stop loss fica ligeiramente abaixo do fundo estrutural do padrão de acumulação
                fundo_padrao = min(c0['low'], c1['low'])
                stop_tecnico = fundo_padrao * 0.998 # 0.2% de margem
                
                preco_atual_setup = c2['close']
                risco_pct = (preco_atual_setup - stop_tecnico) / preco_atual_setup
                
                # Validar se o stop não é insanamente longo
                if risco_pct < menor_risco_pct and risco_pct <= MAX_STOP_PERMITIDO:
                    menor_risco_pct = risco_pct
                    melhor_tf = tf
                    melhor_stop_price = stop_tecnico

        if melhor_tf:
            return {"tf": melhor_tf, "stop_price": melhor_stop_price}
        
        return None

    except Exception as e:
        return None


# =================================================================
# 🚀 CICLO PRINCIPAL
# =================================================================
def ciclo_sniper():
    print("=" * 60)
    print("🎯 TERMINAL QUANT V14.1 — MODO AGRESSIVO (MULTI-TF)")
    print("   Fixes: Prioridade FORTONAS · Stop Técnico Dinâmico")
    print("   Integrações: Discord + Telegram")
    print("   Gestão: Break-Even Auto · HOLDING MANUAL")
    print("=" * 60)

    threading.Thread(target=motor_saida_estrategica, daemon=True).start()

    alvos_disparados = {}
    COOLDOWN_S = 2700

    while True:
        try:
            if obter_status() == "OFF":
                time.sleep(5); continue

            if not os.path.exists('watchlist.json'):
                time.sleep(5); continue

            with open('watchlist.json', 'r', encoding='utf-8') as f:
                watchlist_raw = json.load(f)

            if not watchlist_raw:
                time.sleep(5); continue

            # ORDENAÇÃO EXTREMA: Fortonas sempre no topo do laço de execução
            watchlist = dict(sorted(watchlist_raw.items(), key=lambda item: 0 if "FORTONA PRIORIDADE" in str(item[1]) else 1))

            _, _, max_pos = obter_taticas()
            posicoes_ativas = obter_posicoes_ativas()

            if len(posicoes_ativas) >= max_pos:
                time.sleep(10); continue

            for moeda, motivo in watchlist.items():
                ultimo = alvos_disparados.get(moeda, 0)
                if time.time() - ultimo < COOLDOWN_S: continue
                if moeda in posicoes_ativas: continue

                setup = obter_micro_confirmacoes(moeda)
                if not setup:
                    continue

                tf = setup['tf']
                stop_p = setup['stop_price']
                is_fortona = "FORTONA" in motivo

                marca_fortona = "🔥" if is_fortona else "  "
                print(f"{marca_fortona} 👀 {moeda:<14} | Pullback confirmado no {tf:>3} | Stop estrutural validado")

                # Revalidação de segurança antes do gatilho
                posicoes_ativas = obter_posicoes_ativas()
                if len(posicoes_ativas) >= max_pos or moeda in posicoes_ativas: break

                if executar_entrada_mercado(moeda, stop_p, tf, motivo):
                    alvos_disparados[moeda] = time.time()
                    posicoes_ativas = obter_posicoes_ativas()

                time.sleep(1.5)

            time.sleep(5)
        except Exception as e:
            print(f"❌ Ciclo principal: {e}"); time.sleep(10)

if __name__ == "__main__":
    ciclo_sniper()