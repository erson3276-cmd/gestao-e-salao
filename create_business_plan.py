from fpdf import FPDF
import os

class BusinessPlanPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=25)
    
    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 10, 'Moça ChiQ - Plano de Negocios 2026', 0, 0, 'L')
            self.cell(0, 10, f'Pagina {self.page_no()}', 0, 0, 'R')
            self.ln(5)
            self.set_draw_color(94, 65, 255)
            self.set_line_width(0.5)
            self.line(10, 15, 200, 15)
            self.ln(5)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, 'Confidencial - Moça ChiQ Tecnologia', 0, 0, 'C')
    
    def title_page(self):
        self.add_page()
        self.ln(50)
        self.set_font('Helvetica', 'B', 36)
        self.set_text_color(94, 65, 255)
        self.cell(0, 20, 'Moca ChiQ', 0, 1, 'C')
        self.ln(5)
        self.set_font('Helvetica', '', 20)
        self.set_text_color(80, 80, 80)
        self.cell(0, 15, 'Plano de Negocios Completo', 0, 1, 'C')
        self.ln(10)
        self.set_draw_color(94, 65, 255)
        self.set_line_width(1)
        self.line(60, self.get_y(), 150, self.get_y())
        self.ln(15)
        self.set_font('Helvetica', '', 14)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, 'Sistema de Gestao para Saloes de Beleza', 0, 1, 'C')
        self.cell(0, 10, 'Agendamento Online + WhatsApp + Financeiro', 0, 1, 'C')
        self.ln(20)
        self.set_font('Helvetica', 'I', 12)
        self.cell(0, 10, 'Versao 1.0 - Abril 2026', 0, 1, 'C')
        self.ln(30)
        self.set_font('Helvetica', '', 11)
        self.set_text_color(130, 130, 130)
        self.cell(0, 8, 'Documento Confidencial', 0, 1, 'C')
        self.cell(0, 8, 'Este documento contem informacoes proprietarias', 0, 1, 'C')
    
    def chapter_title(self, num, title):
        self.ln(5)
        self.set_font('Helvetica', 'B', 18)
        self.set_text_color(94, 65, 255)
        self.cell(0, 12, f'{num}. {title}', 0, 1, 'L')
        self.set_draw_color(94, 65, 255)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)
    
    def section_title(self, title):
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(50, 50, 50)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(2)
    
    def section_subtitle(self, title):
        self.set_font('Helvetica', 'BI', 11)
        self.set_text_color(80, 80, 80)
        self.cell(0, 8, title, 0, 1, 'L')
        self.ln(1)
    
    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 6, text)
        self.ln(2)
    
    def bullet_point(self, text, indent=15):
        x = self.get_x()
        self.set_font('Helvetica', '', 10)
        self.set_text_color(40, 40, 40)
        self.set_x(x + indent)
        self.cell(5, 6, chr(8226), 0, 0)
        self.multi_cell(0, 6, f' {text}')
        self.ln(1)
    
    def bold_bullet(self, bold_text, normal_text, indent=15):
        x = self.get_x()
        self.set_x(x + indent)
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(40, 40, 40)
        self.cell(5, 6, chr(8226), 0, 0)
        self.write(6, f' {bold_text}: ')
        self.set_font('Helvetica', '', 10)
        self.multi_cell(0, 6, normal_text)
        self.ln(1)
    
    def table_row(self, cells, widths, bold=False, bg_color=None):
        if bg_color:
            self.set_fill_color(*bg_color)
        for i, (cell, width) in enumerate(zip(cells, widths)):
            if bold:
                self.set_font('Helvetica', 'B', 9)
            else:
                self.set_font('Helvetica', '', 9)
            self.cell(width, 8, cell, 1, 0, 'C', bg_color is not None)
        self.ln()
    
    def info_box(self, title, text, color=(94, 65, 255)):
        self.ln(2)
        self.set_fill_color(*[c // 4 for c in color])
        self.set_draw_color(*color)
        self.set_line_width(0.3)
        x = self.get_x()
        y = self.get_y()
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*color)
        self.cell(0, 8, f'  {title}', 0, 1)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 5, text)
        self.ln(3)


pdf = BusinessPlanPDF()
pdf.set_margins(15, 15, 15)

# ==================== TITLE PAGE ====================
pdf.title_page()

# ==================== TABLE OF CONTENTS ====================
pdf.add_page()
pdf.set_font('Helvetica', 'B', 20)
pdf.set_text_color(94, 65, 255)
pdf.cell(0, 15, 'Indice', 0, 1, 'L')
pdf.ln(5)

toc_items = [
    ('1.', 'Visao Geral do Produto'),
    ('2.', 'Arquitetura Tecnica do Sistema'),
    ('3.', 'Como Funciona o Banco de Dados'),
    ('4.', 'Como o Cliente Conecta o WhatsApp'),
    ('5.', 'Como Roda no Celular e Computador'),
    ('6.', 'Plano de Implementacao Tecnica'),
    ('7.', 'Modelo de Monetizacao e Precos'),
    ('8.', 'Estrategia de Vendas e Marketing'),
    ('9.', 'Aspectos Legais e Regulamentacao'),
    ('10.', 'Custos Operacionais'),
    ('11.', 'Projecao de Receita'),
    ('12.', 'Cronograma de Executacao'),
    ('13.', 'Checklist de Lancamento'),
]

for num, title in toc_items:
    pdf.set_font('Helvetica', '', 12)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(12, 10, num, 0, 0)
    pdf.cell(0, 10, title, 0, 1)

# ==================== 1. VISAO GERAL ====================
pdf.add_page()
pdf.chapter_title('1', 'VISAO GERAL DO PRODUTO')

pdf.section_title('O que e o Moça ChiQ?')
pdf.body_text('O Moça ChiQ e um sistema completo de gestao para saloes de beleza que funciona via navegador web e aplicativo mobile. Ele resolve os principais problemas de donos de salao: organizacao de agenda, controle financeiro, comunicacao com clientes via WhatsApp e gestao de comissoes.')

pdf.section_title('Problemas que Resolve')
pdf.bold_bullet('Agenda desorganizada', 'Donos de salao perdem horarios, tem conflitos de agendamento e nao conseguem visualizar a semana de forma clara.')
pdf.bold_bullet('Falta de confirmacao', 'Clientes faltam sem avisar porque nao recebem lembretes. O salao perde dinheiro com horarios vagos.')
pdf.bold_bullet('Financeiro manual', 'Controle de vendas, despesas e comissoes feito em caderno ou planilha, sujeito a erros.')
pdf.bold_bullet('Comunicacao falha', 'Sem WhatsApp integrado, o salao nao consegue enviar confirmacoes, lembretes ou responder clientes rapidamente.')
pdf.bold_bullet('Sem relatorios', 'Dono nao sabe quanto fatura, quais servicos sao mais lucrativos ou como esta o crescimento.')

pdf.section_title('Funcionalidades Principais')
pdf.bullet_point('Agenda visual com grade semanal e bloqueio de horarios')
pdf.bullet_point('Link de agendamento online para clientes')
pdf.bullet_point('WhatsApp integrado com mensagens automaticas')
pdf.bullet_point('Confirmacao automatica ao agendar')
pdf.bullet_point('Lembrete automatico no dia do agendamento')
pdf.bullet_point('Gestao de clientes com historico')
pdf.bullet_point('Controle de vendas e gorjetas')
pdf.bullet_point('Controle de despesas (fixas e recorrentes)')
pdf.bullet_point('Calculo automatico de comissoes')
pdf.bullet_point('Relatorios financeiros detalhados')
pdf.bullet_point('Chat/Conversas com clientes via WhatsApp')
pdf.bullet_point('Perfil do salao personalizavel')

pdf.section_title('Publico-Alvo')
pdf.body_text('Donos de saloes de beleza, barbearias, studios de estetica e profissionais autonomos de beleza no Brasil. O foco inicial sao saloes pequenos e medios (1-5 profissionais) que ainda nao usam sistema digital.')

pdf.info_box('DIFERENCIAL COMPETITIVO', 'A maioria dos sistemas de salao nao tem WhatsApp integrado. O Moça ChiQ envia confirmacoes e lembretes automaticamente, reduzindo faltas em ate 60%.')

# ==================== 2. ARQUITETURA TECNICA ====================
pdf.add_page()
pdf.chapter_title('2', 'ARQUITETURA TECNICA DO SISTEMA')

pdf.section_title('Visao Geral da Arquitetura')
pdf.body_text('O sistema e composto por 4 camadas principais que trabalham juntas para oferecer uma experiencia completa ao dono do salao e aos clientes finais.')

pdf.section_title('Camada 1: Frontend (Interface do Usuario)')
pdf.body_text('O frontend e a parte que o usuario ve e interage. E construido com Next.js (React) e pode ser acessado de qualquer dispositivo com navegador.')
pdf.bullet_point('Tecnologia: Next.js 16 + React 19 + TailwindCSS')
pdf.bullet_point('Hospedagem: Vercel (global, CDN automatico)')
pdf.bullet_point('Acesso: Qualquer navegador (Chrome, Safari, Firefox)')
pdf.bullet_point('Responsivo: Funciona em celular, tablet e desktop')
pdf.bullet_point('PWA: Pode ser "instalado" no celular como app nativo')

pdf.section_title('Camada 2: Backend (API e Logica)')
pdf.body_text('O backend processa todas as requisicoes, valida dados, envia mensagens WhatsApp e gerencia a logica de negocio.')
pdf.bullet_point('Tecnologia: Next.js API Routes (Serverless)')
pdf.bullet_point('Hospedagem: Vercel (mesmo servidor do frontend)')
pdf.bullet_point('Funcoes: CRUD de dados, envio de WhatsApp, agendamentos')
pdf.bullet_point('APIs: RESTful com JSON')

pdf.section_title('Camada 3: Banco de Dados')
pdf.body_text('Todos os dados sao armazenados no Supabase, um banco PostgreSQL gerenciado na nuvem.')
pdf.bullet_point('Tecnologia: PostgreSQL (via Supabase)')
pdf.bullet_point('Hospedagem: Cloud Supabase (AWS)')
pdf.bullet_point('Backup: Automatico diario')
pdf.bullet_point('Seguranca: RLS (Row Level Security) + SSL')

pdf.section_title('Camada 4: WhatsApp Gateway')
pdf.body_text('O WhatsApp e conectado via Baileys (biblioteca open-source) rodando em um servidor dedicado.')
pdf.bullet_point('Tecnologia: Baileys (@whiskeysockets/baileys)')
pdf.bullet_point('Servidor: Oracle Cloud Free Tier (Ubuntu)')
pdf.bullet_point('Conexao: WebSocket com WhatsApp Web')
pdf.bullet_point('Poller: Servico que envia mensagens pendentes do Supabase')

pdf.section_title('Diagrama de Fluxo')
pdf.body_text('1. Cliente acessa link de agendamento -> Vercel (frontend)')
pdf.body_text('2. Cliente agenda horario -> API Route -> Supabase (salva agendamento)')
pdf.body_text('3. API salva mensagem de confirmacao no Supabase')
pdf.body_text('4. Poller no Oracle Cloud detecta mensagem pendente')
pdf.body_text('5. Poller envia via Baileys (WhatsApp conectado)')
pdf.body_text('6. Dono do salao ve tudo no painel admin')

pdf.info_box('IMPORTANTE', 'Cada salao tera seu proprio numero de WhatsApp conectado. O servidor Oracle Cloud suporta multiplas conexoes simultaneas de WhatsApp (um por salao).')

# ==================== 3. BANCO DE DADOS ====================
pdf.add_page()
pdf.chapter_title('3', 'COMO FUNCIONA O BANCO DE DADOS')

pdf.section_title('Estrutura Multi-Tenant')
pdf.body_text('O banco de dados e compartilhado entre todos os saloes, mas cada salao so ve seus proprios dados. Isso e feito atraves de um campo "salon_id" em cada tabela e politicas de seguranca (RLS - Row Level Security).')

pdf.section_title('Tabelas Principais')

pdf.section_subtitle('1. salons (Cadastros dos Saloes)')
pdf.body_text('Armazena os dados de cada salao cliente:')
pdf.bullet_point('id (UUID) - Identificador unico')
pdf.bullet_point('name - Nome do salao')
pdf.bullet_point('owner_name - Nome do proprietario')
pdf.bullet_point('owner_email - Email do proprietario')
pdf.bullet_point('owner_phone - Telefone do proprietario')
pdf.bullet_point('whatsapp_number - Numero do WhatsApp do salao')
pdf.bullet_point('address - Endereco completo')
pdf.bullet_point('plan - Plano assinado (basico, profissional, premium)')
pdf.bullet_point('status - Ativo/inativo')
pdf.bullet_point('created_at - Data de cadastro')

pdf.section_subtitle('2. appointments (Agendamentos)')
pdf.body_text('Cada agendamento de cada salao:')
pdf.bullet_point('id (UUID) - Identificador unico')
pdf.bullet_point('salon_id - Vinculo ao salao')
pdf.bullet_point('customer_id - Vinculo ao cliente')
pdf.bullet_point('service_id - Vinculo ao servico')
pdf.bullet_point('start_time - Data/hora de inicio')
pdf.bullet_point('end_time - Data/hora de termino')
pdf.bullet_point('status - agendado/confirmado/finalizado/cancelado/falta')
pdf.bullet_point('notes - Observacoes')

pdf.section_subtitle('3. customers (Clientes do Salao)')
pdf.body_text('Cadastro de clientes de cada salao:')
pdf.bullet_point('id (UUID) - Identificador unico')
pdf.bullet_point('salon_id - Vinculo ao salao')
pdf.bullet_point('name - Nome do cliente')
pdf.bullet_point('whatsapp - Numero do WhatsApp')
pdf.bullet_point('email - Email (opcional)')
pdf.bullet_point('notes - Observacoes')
pdf.bullet_point('active - Ativo/bloqueado')

pdf.section_subtitle('4. services (Servicos Oferecidos)')
pdf.bullet_point('id, salon_id, name, price, duration_minutes, category, active')

pdf.section_subtitle('5. vendas (Vendas e Pagamentos)')
pdf.bullet_point('id, salon_id, customer_id, service_id, amount, tip_amount, total_amount, payment_method, date')

pdf.section_subtitle('6. despesas (Despesas do Salao)')
pdf.bullet_point('id, salon_id, category, description, amount, due_date, paid_date, status, is_recurring')

pdf.section_subtitle('7. whatsapp_messages (Fila de Mensagens)')
pdf.body_text('Mensagens que serao enviadas via WhatsApp:')
pdf.bullet_point('id, salon_id, phone, message, status (pending/sent/failed), error, created_at, sent_at')

pdf.section_subtitle('8. whatsapp_status (Status da conexao)')
pdf.bullet_point('id, salon_id, connected, state, has_session, updated_at')

pdf.section_subtitle('9. blocked_slots (Horarios Bloqueados)')
pdf.bullet_point('id, salon_id, date, start_time, end_time')

pdf.section_subtitle('10. working_hours (Horario de Funcionamento)')
pdf.bullet_point('id, salon_id, day_of_week, start_time, end_time, is_active')

pdf.info_box('SEGURANCA', 'Cada salao so acessa seus proprios dados atraves de politicas RLS (Row Level Security) do Supabase. O sistema filtra automaticamente por salon_id em todas as consultas.')

# ==================== 4. WHATSAPP ====================
pdf.add_page()
pdf.chapter_title('4', 'COMO O CLIENTE CONECTA O WHATSAPP')

pdf.section_title('Fluxo de Conexao do WhatsApp')
pdf.body_text('Cada salao conecta seu proprio numero de WhatsApp ao sistema. O processo e simples e leva menos de 2 minutos.')

pdf.section_subtitle('Passo a Passo para o Dono do Salao:')
pdf.body_text('1. O dono do salao faz login no painel admin')
pdf.body_text('2. Vai em "Conversas" ou "Gestao do Salao"')
pdf.body_text('3. Clica no botao "Conectar WhatsApp"')
pdf.body_text('4. Um QR Code e gerado na tela')
pdf.body_text('5. O dono abre o WhatsApp no celular dele')
pdf.body_text('6. Vai em Configuracoes > Aparelhos Conectados')
pdf.body_text('7. Escaneia o QR Code com a camera do celular')
pdf.body_text('8. Pronto! WhatsApp conectado!')

pdf.section_title('Como Funciona Tecnicamente')
pdf.body_text('Apos escanear o QR Code, o Baileys estabelece uma conexao WebSocket com o WhatsApp Web. Essa conexao permanece ativa 24/7 no servidor Oracle Cloud.')

pdf.section_subtitle('Componentes:')
pdf.bullet_point('Baileys Server: Roda no Oracle Cloud, mantem a conexao com o WhatsApp')
pdf.bullet_point('Poller: Servico que verifica o Supabase a cada 5 segundos por mensagens pendentes')
pdf.bullet_point('Fila de Mensagens: Tabela whatsapp_messages no Supabase')
pdf.bullet_point('Status: Tabela whatsapp_status mostra se esta conectado')

pdf.section_subtitle('Fluxo de Envio de Mensagem:')
pdf.body_text('1. Sistema salva mensagem na tabela whatsapp_messages com status "pending"')
pdf.body_text('2. Poller detecta a mensagem pendente (a cada 5 segundos)')
pdf.body_text('3. Poller envia via Baileys para o numero do cliente')
pdf.body_text('4. Se sucesso: atualiza status para "sent"')
pdf.body_text('5. Se erro: atualiza status para "failed" com mensagem de erro')

pdf.section_subtitle('Tipos de Mensagens Automaticas:')
pdf.bold_bullet('Confirmacao de agendamento', 'Enviada imediatamente quando o cliente agenda pelo link. Inclui nome, servico, data e horario.')
pdf.bold_bullet('Lembrete do dia', 'Enviado as 8h da manha para todos os agendamentos do dia. Cron job automatico no Vercel.')
pdf.bold_bullet('Mensagens manuais', 'Dono do salao pode enviar mensagens pelo painel "Conversas".')

pdf.section_title('Escalabilidade do WhatsApp')
pdf.body_text('O servidor Oracle Cloud (gratuito) suporta ate 10-20 conexoes de WhatsApp simultaneas. Quando precisar de mais:')
pdf.bullet_point('Upgrade Oracle Cloud: ~R$ 50/mes para mais recursos')
pdf.bullet_point('Servidor adicional: ~R$ 30/mes (Hetzner/DigitalOcean)')
pdf.bullet_point('Cada servidor extra suporta +10-20 saloes')

pdf.info_box('CUSTO WHATSAPP', 'O WhatsApp e GRATUITO. Nao usamos a API oficial do Meta (que cobra por mensagem). Usamos Baileys, que e open-source e gratuito. O unico custo e o servidor Oracle Cloud (free tier).')

pdf.section_title('E se o WhatsApp desconectar?')
pdf.body_text('Se o WhatsApp desconectar (ex: celular sem internet por muito tempo), o dono do salao ve o status "Desconectado" no painel e pode reconectar escaneando um novo QR Code. As mensagens pendentes ficam salvas no Supabase e serao enviadas automaticamente apos reconectar.')

# ==================== 5. CELULAR/COMPUTADOR ====================
pdf.add_page()
pdf.chapter_title('5', 'COMO RODA NO CELULAR E COMPUTADOR')

pdf.section_title('Para o Dono do Salao')

pdf.section_subtitle('No Computador (Desktop):')
pdf.body_text('O dono do salao acessa o painel admin pelo navegador:')
pdf.bullet_point('URL: https://moca-chip-app.vercel.app/admin')
pdf.bullet_point('Funciona em: Chrome, Firefox, Edge, Safari')
pdf.bullet_point('Tela cheia com todas as funcionalidades visiveis')
pdf.bullet_point('Ideal para gestao completa, relatorios e configuracao')
pdf.bullet_point('Pode "instalar" como PWA (Progressive Web App)')

pdf.section_subtitle('No Celular (Mobile):')
pdf.body_text('O dono pode acessar pelo navegador do celular:')
pdf.bullet_point('Mesma URL, interface adaptada para tela pequena')
pdf.bullet_point('Menu lateral vira menu hamburger')
pdf.bullet_point('Tabelas viram listas verticais')
pdf.bullet_point('Formularios otimizados para toque')
pdf.bullet_point('Pode adicionar a tela inicial como "app"')

pdf.section_subtitle('Como "Instalar" no Celular (PWA):')
pdf.body_text('1. Abrir o site no Chrome (Android) ou Safari (iPhone)')
pdf.body_text('2. Clicar em "Adicionar a Tela Inicial" ou "Instalar App"')
pdf.body_text('3. O icone aparece na tela inicial como um app normal')
pdf.body_text('4. Abre em tela cheia, sem barra de endereco')
pdf.body_text('5. Funciona como app nativo, sem precisar da Play Store')

pdf.section_title('Para o Cliente Final (Quem Agenda)')

pdf.section_subtitle('No Celular do Cliente:')
pdf.body_text('O cliente acessa o link de agendamento pelo navegador:')
pdf.bullet_point('URL: https://moca-chip-app.vercel.app')
pdf.bullet_point('Interface simples: escolhe servico, data e horario')
pdf.bullet_point('Nao precisa criar conta ou login')
pdf.bullet_point('Recebe confirmacao automatica via WhatsApp')
pdf.bullet_point('Recebe lembrete no dia do agendamento')

pdf.section_title('Vantagens do Modelo Web/PWA')
pdf.bullet_point('Sem instalacao obrigatoria - funciona no navegador')
pdf.bullet_point('Sem atualizacao manual - sempre a versao mais recente')
pdf.bullet_point('Funciona em qualquer dispositivo - Android, iPhone, Windows, Mac')
pdf.bullet_point('Sem custo de publicacao nas lojas - economia de US$ 125/ano')
pdf.bullet_point('Atualizacao instantanea - alteracoes disponiveis imediatamente')
pdf.bullet_point('Offline parcial - dados em cache funcionam sem internet')

pdf.section_title('Futuro: App Nativo')
pdf.body_text('Quando o produto tiver 50+ clientes pagantes, podemos criar apps nativos:')
pdf.bullet_point('Android: Google Play Store (US$ 25 unico)')
pdf.bullet_point('iOS: Apple App Store (US$ 99/ano)')
pdf.bullet_point('Tecnologia: Expo (React Native) - reutiliza 80% do codigo')
pdf.bullet_point('Vantagens: Notificacoes push nativas, acesso a camera, offline completo')

pdf.info_box('RECOMENDACAO', 'Comece com PWA (web app). E mais barato, mais rapido e atende 95% das necessidades. Migre para app nativo quando tiver receita comprovada.')

# ==================== 6. PLANO DE IMPLEMENTACAO ====================
pdf.add_page()
pdf.chapter_title('6', 'PLANO DE IMPLEMENTACAO TECNICA')

pdf.section_title('Passo 1: Preparar Infraestrutura Multi-Tenant')
pdf.body_text('Antes de vender, o sistema precisa suportar multiplos saloes:')
pdf.bullet_point('Criar tabela "salons" no Supabase')
pdf.bullet_point('Adicionar campo "salon_id" em todas as tabelas existentes')
pdf.bullet_point('Configurar politicas RLS para isolamento de dados')
pdf.bullet_point('Criar sistema de cadastro/login para donos de salao')
pdf.bullet_point('Criar subdominio por salao: salao.mocachiq.com.br')

pdf.section_title('Passo 2: Sistema de Cadastro e Login')
pdf.body_text('Cada dono de salao precisa de uma conta:')
pdf.bullet_point('Pagina de cadastro: nome, email, telefone, nome do salao')
pdf.bullet_point('Pagina de login: email + senha')
pdf.bullet_point('Recuperacao de senha por email')
pdf.bullet_point('Dashboard personalizado com dados do salao')

pdf.section_title('Passo 3: Onboarding do Cliente')
pdf.body_text('Quando um novo salao se cadastra, o sistema deve:')
pdf.bullet_point('Criar registro na tabela "salons"')
pdf.bullet_point('Configurar horarios padrao de funcionamento')
pdf.bullet_point('Criar servicos padrao (Corte, Manicure, etc.)')
pdf.bullet_point('Gerar link de agendamento unico')
pdf.bullet_point('Mostrar tutorial de conexao do WhatsApp')

pdf.section_title('Passo 4: Painel de Administracao do Sistema')
pdf.body_text('Voce precisa de um painel para gerenciar todos os saloes:')
pdf.bullet_point('Lista de todos os saloes cadastrados')
pdf.bullet_point('Status de cada salao (ativo/inativo)')
pdf.bullet_point('Plano assinado de cada salao')
pdf.bullet_point('Faturamento total por mes')
pdf.bullet_point('Botao para desativar salao inadimplente')

pdf.section_title('Passo 5: Gateway de Pagamento')
pdf.body_text('Para cobrar assinaturas automaticamente:')
pdf.bullet_point('Integrar com Mercado Pago ou Stripe')
pdf.bullet_point('Plano de assinatura recorrente (cobranca mensal)')
pdf.bullet_point('Cartao de credito ou boleto bancario')
pdf.bullet_point('Cancelamento automatico se nao pagar')
pdf.bullet_point('Nota fiscal automatica')

pdf.section_title('Passo 6: App Mobile (PWA)')
pdf.body_text('Transformar o web app em PWA:')
pdf.bullet_point('Criar manifest.json com icone e cores')
pdf.bullet_point('Registrar Service Worker para cache offline')
pdf.bullet_point('Configurar icones para diferentes tamanhos de tela')
pdf.bullet_point('Testar em Android e iOS')

pdf.info_box('ORDEM DE PRIORIDADE', '1. Multi-tenant + Login -> 2. Gateway de Pagamento -> 3. PWA -> 4. Painel Admin -> 5. App Nativo (futuro)')

# ==================== 7. MONETIZACAO ====================
pdf.add_page()
pdf.chapter_title('7', 'MODELO DE MONETIZACAO E PRECOS')

pdf.section_title('Modelo: SaaS por Assinatura Mensal')
pdf.body_text('O modelo de negocio e Software as a Service (SaaS). Cada salao paga uma mensalidade para usar o sistema. E o mesmo modelo do Netflix, Spotify e outros servicos digitais.')

pdf.section_title('Planos e Precos')

# Table header
pdf.set_font('Helvetica', 'B', 9)
pdf.set_fill_color(94, 65, 255)
pdf.set_text_color(255, 255, 255)
pdf.table_row(['Recurso', 'Basico', 'Profissional', 'Premium'], [70, 35, 35, 35], True, (94, 65, 255))

# Rows
rows = [
    ['Preco/mes', 'R$ 49,90', 'R$ 89,90', 'R$ 149,90'],
    ['Agenda online', 'Sim', 'Sim', 'Sim'],
    ['Gestao de clientes', 'Sim', 'Sim', 'Sim'],
    ['Controle de vendas', 'Sim', 'Sim', 'Sim'],
    ['WhatsApp automatico', 'Nao', 'Sim', 'Sim'],
    ['Lembretes automaticos', 'Nao', 'Sim', 'Sim'],
    ['Relatorios avancados', 'Nao', 'Sim', 'Sim'],
    ['Gorjetas separadas', 'Nao', 'Sim', 'Sim'],
    ['Multi-profissional', 'Nao', 'Nao', 'Sim'],
    ['Comissoes', 'Nao', 'Nao', 'Sim'],
    ['API personalizada', 'Nao', 'Nao', 'Sim'],
    ['Suporte prioritario', 'Email', 'Chat', 'Chat + Tel.'],
]

for i, row in enumerate(rows):
    bg = (245, 245, 255) if i % 2 == 0 else None
    pdf.set_text_color(40, 40, 40)
    pdf.table_row(row, [70, 35, 35, 35], i == 0, bg)

pdf.ln(5)

pdf.section_title('Exemplo de Calculo para o Salao')
pdf.body_text('Um salao que fatura R$ 5.000/mes com o plano Profissional (R$ 89,90):')
pdf.bullet_point('Custo do sistema: R$ 89,90/mes (1.8% do faturamento)')
pdf.bullet_point('Reducao de faltas: economia de ~R$ 500/mes (menos horarios vagos)')
pdf.bullet_point('Tempo economizado: ~10h/mes (nao precisa ligar para confirmar)')
pdf.bullet_point('ROI (Retorno): O sistema se paga com 1-2 agendamentos salvos por mes')

pdf.section_title('Plano Anual (Desconto)')
pdf.body_text('Oferecer desconto para pagamento anual:')
pdf.bullet_point('Basico anual: R$ 479/ano (equivale a R$ 39,90/mes - 20% desconto)')
pdf.bullet_point('Profissional anual: R$ 863/ano (equivale a R$ 71,90/mes - 20% desconto)')
pdf.bullet_point('Premium anual: R$ 1.439/ano (equivale a R$ 119,90/mes - 20% desconto)')
pdf.body_text('Vantagem: Voce recebe o dinheiro antecipado e o cliente fica preso por 1 ano.')

pdf.info_box('DICA DE PRECO', 'Comece com precos promocionais nos primeiros 3 meses (50% de desconto). Isso atrai clientes rapidamente e gera prova social. Depois ajuste para o preco cheio.')

# ==================== 8. ESTRATEGIA DE VENDAS ====================
pdf.add_page()
pdf.chapter_title('8', 'ESTRATEGIA DE VENDAS E MARKETING')

pdf.section_title('Fase 1: Primeiros 10 Clientes (Mes 1-3)')
pdf.body_text('O objetivo e validar o produto e coletar depoimentos:')
pdf.bullet_point('Oferecer para saloes conhecidos pessoalmente')
pdf.bullet_point('14 dias gratis sem necessidade de cartao')
pdf.bullet_point('Instalacao e configuracao gratuita (voce faz pessoalmente)')
pdf.bullet_point('Suporte via WhatsApp pessoal')
pdf.bullet_point('Coletar feedback e melhorar o sistema')
pdf.bullet_point('Pedir depoimento em video apos 30 dias de uso')

pdf.section_title('Fase 2: Crescimento Local (Mes 3-6)')
pdf.body_text('Expandir para saloes da regiao:')
pdf.bullet_point('Visitar saloes pessoalmente com tablet demonstrando o app')
pdf.bullet_point('Parceria com distribuidores de produtos de beleza')
pdf.bullet_point('Indicacao: "Indique um salao e ganhe 1 mes gratis"')
pdf.bullet_point('Google Meu Negocio: "Sistema para salao de beleza [cidade]"')
pdf.bullet_point('Instagram: mostrar funcionalidades e depoimentos')

pdf.section_title('Fase 3: Escala Digital (Mes 6-12)')
pdf.body_text('Alcancar saloes de todo o Brasil:')
pdf.bullet_point('Google Ads: R$ 30/dia em "sistema para salao de beleza"')
pdf.bullet_point('Facebook/Instagram Ads: R$ 20/dia segmentado')
pdf.bullet_point('YouTube: videos tutoriais "como organizar seu salao"')
pdf.bullet_point('Blog: artigos sobre gestao de salao (SEO)')
pdf.bullet_point('Parcerias com influenciadores do nicho de beleza')

pdf.section_title('Canais de Venda')
pdf.bold_bullet('Venda direta', 'Ligar ou visitar saloes pessoalmente. Taxa de conversao: 10-20%.')
pdf.bold_bullet('Site/Landing page', 'mocachiq.com.br com formulario de cadastro. Conversao: 2-5%.')
pdf.bold_bullet('Indicacao', 'Clientes indicam outros saloes. Conversao: 30-40%.')
pdf.bold_bullet('Redes sociais', 'Instagram/TikTok com conteudo util. Conversao: 1-3%.')
pdf.bold_bullet('Google Ads', 'Anuncios para quem busca "sistema salao". Conversao: 3-8%.')

pdf.section_title('Metricas Importantes')
pdf.bullet_point('CAC (Custo de Aquisicao): Quanto custa conquistar 1 cliente')
pdf.bullet_point('LTV (Lifetime Value): Quanto o cliente paga durante todo o tempo')
pdf.bullet_point('Churn Rate: Percentual de clientes que cancelam por mes')
pdf.bullet_point('MRR (Monthly Recurring Revenue): Receita recorrente mensal')

pdf.info_box('META REALISTA', 'Mes 1-3: 10 clientes | Mes 3-6: 30 clientes | Mes 6-12: 100 clientes | Ano 2: 300+ clientes')

# ==================== 9. ASPECTOS LEGAIS ====================
pdf.add_page()
pdf.chapter_title('9', 'ASPECTOS LEGAIS E REGULAMENTACAO')

pdf.section_title('1. Abrir Empresa (MEI)')
pdf.body_text('O primeiro passo e formalizar o negocio:')
pdf.bullet_point('Acesse: portaldoempreendedor.gov.br')
pdf.bullet_point('Tipo: MEI (Microempreendedor Individual)')
pdf.bullet_point('Custo: Gratuito para abrir')
pdf.bullet_point('CNAE sugerido: 6201-5/01 (Desenvolvimento de programas de computador)')
pdf.bullet_point('CNAE adicional: 6311-9/00 (Tratamento de dados)')
pdf.bullet_point('Limite de faturamento: R$ 81.000/ano')
pdf.bullet_point('DAS mensal: ~R$ 75 (INSS + ISS)')

pdf.section_title('2. Quando Crescer (Migrar para ME)')
pdf.body_text('Quando faturar mais de R$ 81.000/ano:')
pdf.bullet_point('Migrar para ME (Microempresa)')
pdf.bullet_point('Regime: Simples Nacional')
pdf.bullet_point('Contador mensal: ~R$ 200-400')
pdf.bullet_point('Impostos: 6-15% do faturamento (depende do anexo)')

pdf.section_title('3. Termos de Uso')
pdf.body_text('Documento obrigatorio que define as regras de uso:')
pdf.bullet_point('Direitos e obrigacoes do usuario')
pdf.bullet_point('Direitos e obrigacoes do Moça ChiQ')
pdf.bullet_point('Politica de cancelamento e reembolso')
pdf.bullet_point('Limitacao de responsabilidade')
pdf.bullet_point('Propriedade intelectual')

pdf.section_title('4. Politica de Privacidade (LGPD)')
pdf.body_text('Obrigatorio pela Lei Geral de Protecao de Dados:')
pdf.bullet_point('Quais dados sao coletados')
pdf.bullet_point('Para que finalidade os dados sao usados')
pdf.bullet_point('Com quem os dados sao compartilhados')
pdf.bullet_point('Como o usuario pode solicitar exclusao')
pdf.bullet_point('Medidas de seguranca adotadas')
pdf.bullet_point('Contato do Encarregado de Dados (DPO)')

pdf.section_title('5. Contrato de Prestacao de Servicos')
pdf.body_text('Para clientes enterprise ou planos premium:')
pdf.bullet_point('Escopo dos servicos incluidos')
pdf.bullet_point('Valor e forma de pagamento')
pdf.bullet_point('Prazo de vigencia')
pdf.bullet_point('Conditoes de rescisao')
pdf.bullet_point('SLA (garantia de disponibilidade)')

pdf.section_title('6. Nota Fiscal')
pdf.body_text('Emitir nota fiscal para cada cliente:')
pdf.bullet_point('MEI: pode emitir NF pelo site da prefeitura')
pdf.bullet_point('ME: emitir pelo sistema do Simples Nacional')
pdf.bullet_point('Automatizar com: eNotas, Bling ou Nuvem Fiscal')

pdf.info_box('IMPORTANTE', 'Consulte um contador e um advogado para garantir que todos os documentos estao em conformidade. O investimento inicial e de ~R$ 500-1000 mas evita problemas futuros.')

# ==================== 10. CUSTOS OPERACIONAIS ====================
pdf.add_page()
pdf.chapter_title('10', 'CUSTOS OPERACIONAIS')

pdf.section_title('Custos Fixos Mensais')

pdf.set_font('Helvetica', 'B', 9)
pdf.set_fill_color(94, 65, 255)
pdf.set_text_color(255, 255, 255)
pdf.table_row(['Item', 'Custo (1-10 clientes)', 'Custo (50+ clientes)'], [80, 50, 50], True, (94, 65, 255))

custos = [
    ['Vercel (Hospedagem)', 'Gratis (Hobby)', 'US$ 20 (~R$ 100)'],
    ['Supabase (Banco)', 'Gratis (Free)', 'US$ 25 (~R$ 125)'],
    ['Oracle Cloud (WhatsApp)', 'Gratis (Free Tier)', 'Gratis (Free Tier)'],
    ['Dominio mocachiq.com.br', 'R$ 40/ano (~R$ 3/mes)', 'R$ 40/ano (~R$ 3/mes)'],
    ['MEI (Imposto)', '~R$ 75/mes', '~R$ 75/mes'],
    ['Email profissional', 'Gratis (Zoho)', 'R$ 30/mes (Google)'],
    ['Contador (quando ME)', 'Nao necessario', '~R$ 250/mes'],
    ['TOTAL ESTIMADO', '~R$ 78/mes', '~R$ 583/mes'],
]

for i, row in enumerate(custos):
    bg = (245, 245, 255) if i % 2 == 0 else None
    pdf.set_text_color(40, 40, 40)
    pdf.table_row(row, [80, 50, 50], i == len(custos)-1, bg)

pdf.ln(5)

pdf.section_title('Custos Iniciais (Uma Vez)')
pdf.bullet_point('Google Play Developer: US$ 25 (~R$ 130) - opcional')
pdf.bullet_point('Apple Developer: US$ 99/ano (~R$ 500) - opcional')
pdf.bullet_point('Documentos legais (advogado): ~R$ 500-1000')
pdf.bullet_point('Logo e identidade visual: ~R$ 200-500 (ou faca voce mesmo)')
pdf.bullet_point('TOTAL INICIAL: ~R$ 830 - R$ 2.130')

pdf.section_title('Custos Variaveis (Escala)')
pdf.body_text('Conforme o numero de clientes cresce:')
pdf.bullet_point('10 clientes: ~R$ 78/mes de custo -> Margem: ~R$ 821/mes')
pdf.bullet_point('50 clientes: ~R$ 583/mes de custo -> Margem: ~R$ 3.912/mes')
pdf.bullet_point('100 clientes: ~R$ 800/mes de custo -> Margem: ~R$ 8.190/mes')
pdf.bullet_point('500 clientes: ~R$ 2.000/mes de custo -> Margem: ~R$ 42.950/mes')

pdf.info_box('MARGEM DE LUCRO', 'O modelo SaaS tem margem de lucro de 80-95%. Isso significa que de cada R$ 100 recebidos, R$ 80-95 sao lucro liquido. E um dos modelos de negocio mais rentaveis que existe.')

# ==================== 11. PROJECAO DE RECEITA ====================
pdf.add_page()
pdf.chapter_title('11', 'PROJECAO DE RECEITA')

pdf.section_title('Cenario Conservador')
pdf.body_text('Considerando crescimento organico e vendas diretas:')

pdf.set_font('Helvetica', 'B', 9)
pdf.set_fill_color(94, 65, 255)
pdf.set_text_color(255, 255, 255)
pdf.table_row(['Periodo', 'Clientes', 'MRR', 'Receita Anual'], [40, 30, 40, 40], True, (94, 65, 255))

projecoes = [
    ['Mes 3', '10', 'R$ 899', '-'],
    ['Mes 6', '30', 'R$ 2.697', '-'],
    ['Mes 12', '60', 'R$ 5.394', 'R$ 32.364'],
    ['Ano 2', '150', 'R$ 13.485', 'R$ 161.820'],
    ['Ano 3', '400', 'R$ 35.960', 'R$ 431.520'],
]

for i, row in enumerate(projecoes):
    bg = (245, 245, 255) if i % 2 == 0 else None
    pdf.set_text_color(40, 40, 40)
    pdf.table_row(row, [40, 30, 40, 40], False, bg)

pdf.ln(5)

pdf.section_title('Cenario Otimista')
pdf.body_text('Com marketing digital agressivo e boa taxa de conversao:')

pdf.set_font('Helvetica', 'B', 9)
pdf.set_fill_color(94, 65, 255)
pdf.set_text_color(255, 255, 255)
pdf.table_row(['Periodo', 'Clientes', 'MRR', 'Receita Anual'], [40, 30, 40, 40], True, (94, 65, 255))

projecoes2 = [
    ['Mes 3', '20', 'R$ 1.798', '-'],
    ['Mes 6', '80', 'R$ 7.192', '-'],
    ['Mes 12', '200', 'R$ 17.980', 'R$ 107.880'],
    ['Ano 2', '600', 'R$ 53.940', 'R$ 647.280'],
    ['Ano 3', '1500', 'R$ 134.850', 'R$ 1.618.200'],
]

for i, row in enumerate(projecoes2):
    bg = (245, 245, 255) if i % 2 == 0 else None
    pdf.set_text_color(40, 40, 40)
    pdf.table_row(row, [40, 30, 40, 40], False, bg)

pdf.ln(5)

pdf.body_text('MRR = Monthly Recurring Revenue (Receita Recorrente Mensal)')
pdf.body_text('Considerando ticket medio de R$ 89,90 (plano Profissional).')

pdf.info_box('REALIDADE', 'A maioria dos SaaS leva 12-18 meses para atingir R$ 10.000/mes de MRR. Seja paciente e consistente. O importante e a taxa de crescimento mensal.')

# ==================== 12. CRONOGRAMA ====================
pdf.add_page()
pdf.chapter_title('12', 'CRONOGRAMA DE EXECUCAO')

pdf.section_title('Mes 1: Fundacao')
pdf.bullet_point('Abrir MEI e conta bancaria PJ')
pdf.bullet_point('Registrar dominio mocachiq.com.br')
pdf.bullet_point('Criar Politica de Privacidade e Termos de Uso')
pdf.bullet_point('Configurar multi-tenant no Supabase')
pdf.bullet_point('Criar sistema de cadastro/login para donos de salao')

pdf.section_title('Mes 2: Produto')
pdf.bullet_point('Adaptar o app atual para multi-tenant')
pdf.bullet_point('Criar pagina de cadastro de novo salao')
pdf.bullet_point('Implementar gateway de pagamento (Mercado Pago)')
pdf.bullet_point('Criar landing page de vendas')
pdf.bullet_point('Configurar PWA (manifest + service worker)')

pdf.section_title('Mes 3: Lancamento')
pdf.bullet_point('Testar com 3-5 saloes conhecidos (beta gratuito)')
pdf.bullet_point('Coletar feedback e corrigir bugs')
pdf.bullet_point('Criar material de vendas (PDF, video demo)')
pdf.bullet_point('Comecar a vender para saloes locais')
pdf.bullet_point('Meta: 5-10 clientes pagantes')

pdf.section_title('Mes 4-6: Crescimento Inicial')
pdf.bullet_point('Expandir para saloes da regiao')
pdf.bullet_point('Implementar programa de indicacao')
pdf.bullet_point('Criar conteudo para Instagram/TikTok')
pdf.bullet_point('Meta: 20-30 clientes')

pdf.section_title('Mes 7-12: Escala')
pdf.bullet_point('Iniciar Google Ads e Facebook Ads')
pdf.bullet_point('Criar blog com conteudo sobre gestao de salao')
pdf.bullet_point('Parcerias com distribuidores de produtos')
pdf.bullet_point('Meta: 60-100 clientes')

pdf.section_title('Ano 2: Consolidacao')
pdf.bullet_point('App nativo (Android + iOS)')
pdf.bullet_point('Equipe de suporte (1-2 pessoas)')
pdf.bullet_point('Funcionalidades avancadas (multi-unidade, etc.)')
pdf.bullet_point('Meta: 150-300 clientes')

pdf.info_box('DICA', 'Nao tente fazer tudo de uma vez. Comece simples, valide com clientes reais e evolua conforme o feedback. O melhor produto e aquele que resolve o problema do cliente.')

# ==================== 13. CHECKLIST ====================
pdf.add_page()
pdf.chapter_title('13', 'CHECKLIST DE LANCAMENTO')

pdf.section_title('Tecnico')
pdf.bullet_point('[ ] Banco de dados multi-tenant configurado')
pdf.bullet_point('[ ] Sistema de login/cadastro funcionando')
pdf.bullet_point('[ ] Gateway de pagamento integrado')
pdf.bullet_point('[ ] PWA configurado (manifest + service worker)')
pdf.bullet_point('[ ] WhatsApp funcionando para multiplas conexoes')
pdf.bullet_point('[ ] Backup automatico do banco de dados')
pdf.bullet_point('[ ] Monitoramento de erros (Sentry ou similar)')
pdf.bullet_point('[ ] SSL/HTTPS em todos os dominios')

pdf.section_title('Legal')
pdf.bullet_point('[ ] MEI aberto e ativo')
pdf.bullet_point('[ ] Conta bancaria PJ aberta')
pdf.bullet_point('[ ] Politica de Privacidade publicada')
pdf.bullet_point('[ ] Termos de Uso publicados')
pdf.bullet_point('[ ] Contrato de prestacao de servicos pronto')
pdf.bullet_point('[ ] Sistema de emissao de nota fiscal configurado')

pdf.section_title('Marketing')
pdf.bullet_point('[ ] Landing page de vendas pronta')
pdf.bullet_point('[ ] Logo e identidade visual definidos')
pdf.bullet_point('[ ] Instagram/TikTok criados')
pdf.bullet_point('[ ] Video demo de 2 minutos gravado')
pdf.bullet_point('[ ] PDF de apresentacao comercial pronto')
pdf.bullet_point('[ ] Depoimentos de 3 clientes beta coletados')

pdf.section_title('Vendas')
pdf.bullet_point('[ ] Lista de 50 saloes para prospectar')
pdf.bullet_point('[ ] Script de vendas preparado')
pdf.bullet_point('[ ] Periodo de teste gratis configurado (14 dias)')
pdf.bullet_point('[ ] Programa de indicacao definido')
pdf.bullet_point('[ ] Precos definidos e publicados')

pdf.section_title('Suporte')
pdf.bullet_point('[ ] Canal de suporte definido (WhatsApp/Email)')
pdf.bullet_point('[ ] FAQ criado')
pdf.bullet_point('[ ] Tutorial de onboarding pronto')
pdf.bullet_point('[ ] Documentacao tecnica basica')

pdf.ln(10)
pdf.set_font('Helvetica', 'B', 14)
pdf.set_text_color(94, 65, 255)
pdf.cell(0, 10, 'BOA SORTE COM O Moca ChiQ!', 0, 1, 'C')
pdf.ln(5)
pdf.set_font('Helvetica', '', 11)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 8, 'Voce tem um produto excelente nas maos.', 0, 1, 'C')
pdf.cell(0, 8, 'Agora e so executar com consistencia.', 0, 1, 'C')

# Save
output_path = r'C:\Users\Gabriel Barros\.anaconda\moca-chip-app\Plano_de_Negocios_Moca_ChiQ.pdf'
pdf.output(output_path)
print(f'PDF salvo em: {output_path}')
