(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,75254,e=>{"use strict";var s=e.i(71645);let a=(...e)=>e.filter((e,s,a)=>!!e&&""!==e.trim()&&a.indexOf(e)===s).join(" ").trim(),t=e=>{let s=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,s,a)=>a?a.toUpperCase():s.toLowerCase());return s.charAt(0).toUpperCase()+s.slice(1)};var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let o=(0,s.createContext)({}),r=(0,s.forwardRef)(({color:e,size:t,strokeWidth:r,absoluteStrokeWidth:l,className:n="",children:d,iconNode:E,...c},T)=>{let{size:N=24,strokeWidth:h=2,absoluteStrokeWidth:p=!1,color:x="currentColor",className:m=""}=(0,s.useContext)(o)??{},I=l??p?24*Number(r??h)/Number(t??N):r??h;return(0,s.createElement)("svg",{ref:T,...i,width:t??N??i.width,height:t??N??i.height,stroke:e??x,strokeWidth:I,className:a("lucide",m,n),...!d&&!(e=>{for(let s in e)if(s.startsWith("aria-")||"role"===s||"title"===s)return!0;return!1})(c)&&{"aria-hidden":"true"},...c},[...E.map(([e,a])=>(0,s.createElement)(e,a)),...Array.isArray(d)?d:[d]])});e.s(["default",0,(e,i)=>{let o=(0,s.forwardRef)(({className:o,...l},n)=>(0,s.createElement)(r,{ref:n,iconNode:i,className:a(`lucide-${t(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,o),...l}));return o.displayName=t(e),o}],75254)},43531,e=>{"use strict";let s=(0,e.i(75254).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);e.s(["Check",0,s],43531)},74886,e=>{"use strict";let s=(0,e.i(75254).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);e.s(["Copy",0,s],74886)},58041,e=>{"use strict";let s=(0,e.i(75254).default)("database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);e.s(["Database",0,s],58041)},6575,e=>{"use strict";var s=e.i(43476),a=e.i(71645),t=e.i(74886),i=e.i(43531);let o=(0,e.i(75254).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);var r=e.i(58041);e.s(["default",0,function(){let[e,l]=(0,a.useState)(!1),n=`-- GESTAO E SALAO - MULTI-TENANT SETUP
-- Execute no: https://supabase.com/dashboard/project/ssdqkvsbhebrqihoekzz/sql

-- 1. Criar tabela de Saloes
CREATE TABLE IF NOT EXISTS salons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT UNIQUE NOT NULL,
  owner_password TEXT NOT NULL,
  owner_phone TEXT,
  whatsapp_number TEXT,
  address TEXT,
  image_url TEXT,
  plan TEXT DEFAULT 'profissional',
  status TEXT DEFAULT 'active',
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar salon_id em todas as tabelas
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE comissao ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE whatsapp_status ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE blocked_slots ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE working_hours ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES salons(id);

-- 3. Criar indices
CREATE INDEX IF NOT EXISTS idx_appointments_salon ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon ON customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_vendas_salon ON vendas(salon_id);
CREATE INDEX IF NOT EXISTS idx_despesas_salon ON despesas(salon_id);
CREATE INDEX IF NOT EXISTS idx_comissao_salon ON comissao(salon_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_salon ON whatsapp_messages(salon_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_salon ON blocked_slots(salon_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_salon ON working_hours(salon_id);
CREATE INDEX IF NOT EXISTS idx_professionals_salon ON professionals(salon_id);
CREATE INDEX IF NOT EXISTS idx_notes_salon ON notes(salon_id);

-- 4. Criar bucket de storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('salon-photos', 'salon-photos', true)
ON CONFLICT (id) DO NOTHING;`;return(0,s.jsx)("main",{className:"min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6",children:(0,s.jsxs)("div",{className:"max-w-2xl w-full space-y-8",children:[(0,s.jsxs)("div",{className:"text-center space-y-4",children:[(0,s.jsx)("div",{className:"w-20 h-20 mx-auto bg-[#121021] border border-white/5 rounded-[2rem] flex items-center justify-center",children:(0,s.jsx)(r.Database,{className:"w-10 h-10 text-[#5E41FF]"})}),(0,s.jsxs)("div",{children:[(0,s.jsxs)("h1",{className:"text-3xl font-black tracking-tighter italic uppercase text-white/90",children:["Gestão",(0,s.jsx)("span",{className:"text-[#5E41FF]",children:"E"}),"Salão"]}),(0,s.jsx)("p",{className:"text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 mt-2",children:"Setup do Banco de Dados"})]})]}),(0,s.jsxs)("div",{className:"bg-[#121021]/50 border border-white/5 rounded-[2rem] p-8 space-y-6",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("h2",{className:"text-sm font-black uppercase tracking-widest text-white mb-2",children:"Passo 1: Acesse o SQL Editor"}),(0,s.jsxs)("a",{href:"https://supabase.com/dashboard/project/ssdqkvsbhebrqihoekzz/sql",target:"_blank",className:"inline-flex items-center gap-2 px-4 py-3 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-xl text-[#5E41FF] text-sm font-bold hover:bg-[#5E41FF]/20 transition-all",children:["Abrir SQL Editor do Supabase ",(0,s.jsx)(o,{size:14})]})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("h2",{className:"text-sm font-black uppercase tracking-widest text-white mb-2",children:"Passo 2: Copie e cole o SQL"}),(0,s.jsx)("button",{onClick:function(){navigator.clipboard.writeText(n),l(!0),setTimeout(()=>l(!1),2e3)},className:"flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-all",children:e?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(i.Check,{size:14,className:"text-emerald-500"})," Copiado!"]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t.Copy,{size:14})," Copiar SQL"]})})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("h2",{className:"text-sm font-black uppercase tracking-widest text-white mb-2",children:"Passo 3: Clique em Run"}),(0,s.jsx)("p",{className:"text-gray-500 text-xs",children:'Após colar o SQL, clique no botão "Run" no canto inferior direito.'})]}),(0,s.jsx)("div",{className:"p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl",children:(0,s.jsx)("p",{className:"text-emerald-400 text-xs font-bold",children:"Depois de rodar o SQL, o sistema multi-tenant estará ativado. Você já pode fechar esta página."})})]})]})})}],6575)}]);