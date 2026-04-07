import ccxt
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

def gerar_geometria_macro():
    print("📡 Sniper a calcular Macro-Tendência (Lógica de Extremos)...")
    exchange = ccxt.binanceusdm()
    
    # 1. Aumentamos o histórico para 500 velas para ver o passado distante
    velas = exchange.fetch_ohlcv('VIRTUALUSDT', timeframe='4h', limit=500)
    df = pd.DataFrame(velas, columns=['ts', 'open', 'high', 'low', 'close', 'volume'])
    
    # 2. Identificar Pivôs com "Ordem" elevada (ignora o ruído)
    # Quanto maior este número, mais "limpa" fica a linha
    ordem_pivo = 35 
    
    df['is_fundo'] = False
    df['is_topo'] = False

    for i in range(ordem_pivo, len(df) - ordem_pivo):
        janela = df.iloc[i - ordem_pivo : i + ordem_pivo + 1]
        # É o ponto mais baixo/alto num raio de 35 velas?
        if df['low'].iloc[i] == janela['low'].min():
            df.at[i, 'is_fundo'] = True
        if df['high'].iloc[i] == janela['high'].max():
            df.at[i, 'is_topo'] = True

    # Filtrar apenas os pontos encontrados
    fundos_relevantes = df[df['is_fundo'] == True]
    topos_relevantes = df[df['is_topo'] == True]
    
    # 3. Lógica de Ligação de Pontos (y = mx + b)
    def calcular_reta_macro(pivos, preco_tipo, alvo_x):
        if len(pivos) < 2: return None, None
        # Ligamos o PRIMEIRO grande ponto ao ÚLTIMO grande ponto
        indices = [pivos.index[0], pivos.index[-1]]
        valores = [pivos[preco_tipo].iloc[0], pivos[preco_tipo].iloc[-1]]
        coef = np.polyfit(indices, valores, 1)
        return coef[0] * alvo_x + coef[1], coef

    vela_atual = len(df) - 1
    lta_hoje, coef_lta = calcular_reta_macro(fundos_relevantes, 'low', vela_atual)
    ltb_hoje, coef_ltb = calcular_reta_macro(topos_relevantes, 'high', vela_atual)

    # --- VISUALIZAÇÃO ---
    plt.figure(figsize=(15,7))
    plt.style.use('dark_background')
    plt.plot(df.index, df['close'], color='white', alpha=0.3, label='Preço 4H')
    
    x_total = np.array([0, vela_atual])
    
    if lta_hoje:
        plt.plot(x_total, coef_lta[0]*x_total + coef_lta[1], color='#00ff00', linewidth=2, label='LTA (Suporte Diagonal)')
        plt.scatter(fundos_relevantes.index, fundos_relevantes['low'], color='#00ff00', s=50)
        
    if ltb_hoje:
        plt.plot(x_total, coef_ltb[0]*x_total + coef_ltb[1], color='#ff4444', linewidth=2, label='LTB (Resistência Diagonal)')
        plt.scatter(topos_relevantes.index, topos_relevantes['high'], color='#ff4444', s=50)

    plt.title("Sniper V4 - Alinhamento com Desenho Manual (Macro)")
    plt.legend()
    plt.show()

if __name__ == "__main__":
    gerar_geometria_macro()