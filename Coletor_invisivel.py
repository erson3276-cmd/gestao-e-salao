import time
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

print("🤖 PILOTO FANTASMA (OPERA GX) LIGADO")

# 1. URL DA PÁGINA DO PAINEL
URL_PAINEL = "https://www.encryptos.app/dashboard-beta"

# 2. XPATH DO BOTÃO
XPATH_BOTAO = "/html/body/div/div/div[2]/div/div/div/div/div/div/div/div[1]/nav/div[2]/div[1]/button[1]"

# ─── Script JS injetado UMA VEZ antes de cada clique ────────────────────────
# Substitui navigator.clipboard.writeText por uma versão que guarda o texto
# numa variável interna do browser (window.__json_capturado) sem escrever
# no clipboard real do Windows. O utilizador pode copiar/colar à vontade.
JS_INTERCEPTAR_CLIPBOARD = """
    window.__json_capturado = null;

    // Intercepta a API moderna (clipboard.writeText)
    const _writeText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = async function(texto) {
        window.__json_capturado = texto;
        // NÃO chama _writeText → não toca no clipboard real
    };

    // Intercepta o método legado (execCommand copy) como fallback
    const _execCommand = document.execCommand.bind(document);
    document.execCommand = function(cmd, ...args) {
        if (cmd === 'copy') {
            const sel = window.getSelection();
            if (sel && sel.toString()) {
                window.__json_capturado = sel.toString();
            }
            return true; // finge sucesso sem copiar nada
        }
        return _execCommand(cmd, ...args);
    };
"""

# ─── Script JS para ler o valor capturado ────────────────────────────────────
JS_LER_CAPTURA = "return window.__json_capturado;"


def escrita_atomica(filepath, data):
    tmp_path = filepath + '.tmp'
    try:
        with open(tmp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        os.replace(tmp_path, filepath)
    except Exception as e:
        print(f"Erro ao guardar: {e}")


perfil_dir = os.path.join(os.getcwd(), "OperaProfile")

options = Options()
options.binary_location = r"C:\Users\Gabriel Barros\AppData\Local\Programs\Opera GX\opera.exe"
options.add_argument(f"user-data-dir={perfil_dir}")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

try:
    print("A aquecer o motor do Opera GX (Versão 144)...")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager(driver_version="144.0.7559.173").install()),
        options=options
    )

    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    print("A contornar o bloqueio do GX Corner...")
    driver.switch_to.new_window('tab')

    print("A aceder à Encryptos...")
    driver.get(URL_PAINEL)

    print("\n⚠️  ATENÇÃO: A aba da Encryptos abriu!")
    print("👉 1. FAÇA O SEU LOGIN MANUALMENTE na aba da Encryptos.")
    print("👉 2. Deixe o painel carregar na tela.")
    print("⏳ O robô aguarda 60 segundos antes do primeiro clique...\n")
    print("✅ Pode usar o Ctrl+C / Ctrl+V normalmente — o seu clipboard está livre!\n")

    time.sleep(60)

    while True:
        try:
            print(f"\n[{time.strftime('%H:%M:%S')}] A interceptar clipboard da página...")

            # 1. Injeta o interceptor ANTES de clicar (substitui clipboard da página)
            driver.execute_script(JS_INTERCEPTAR_CLIPBOARD)

            # 2. Clica no botão "Copiar JSON"
            botao = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.XPATH, XPATH_BOTAO))
            )
            botao.click()
            print("🖱️  Botão clicado! A aguardar captura...")

            time.sleep(2)

            # 3. Lê o JSON capturado da variável interna do browser
            dados_capturados = driver.execute_script(JS_LER_CAPTURA)

            if dados_capturados and "data" in dados_capturados:
                try:
                    dados_json = json.loads(dados_capturados)
                    dados_formatados = dados_json if "data" in dados_json else {"data": dados_json}
                    escrita_atomica('painel_dados.json', dados_formatados)
                    print("✅ SUCESSO! JSON capturado e guardado sem tocar no seu clipboard.")
                except json.JSONDecodeError:
                    print("⚠️  Texto capturado não é JSON válido. Tentando novamente...")
            else:
                print("⚠️  Nada capturado ainda. Tentando novamente no próximo ciclo.")

        except Exception as e:
            print(f"❌ Erro no ciclo: {e}")

        print("💤 A aguardar 1 minuto para o próximo ciclo...")
        time.sleep(60)

except Exception as e:
    print(f"❌ Erro fatal no arranque: {e}")