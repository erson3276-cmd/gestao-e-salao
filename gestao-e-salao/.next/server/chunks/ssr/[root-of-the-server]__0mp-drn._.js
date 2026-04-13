module.exports=[18622,(a,b,c)=>{b.exports=a.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},42602,(a,b,c)=>{"use strict";b.exports=a.r(18622)},87924,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactJsxRuntime},72131,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].React},70106,a=>{"use strict";var b=a.i(72131);let c=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim(),d=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)};var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let f=(0,b.createContext)({}),g=(0,b.forwardRef)(({color:a,size:d,strokeWidth:g,absoluteStrokeWidth:h,className:i="",children:j,iconNode:k,...l},m)=>{let{size:n=24,strokeWidth:o=2,absoluteStrokeWidth:p=!1,color:q="currentColor",className:r=""}=(0,b.useContext)(f)??{},s=h??p?24*Number(g??o)/Number(d??n):g??o;return(0,b.createElement)("svg",{ref:m,...e,width:d??n??e.width,height:d??n??e.height,stroke:a??q,strokeWidth:s,className:c("lucide",r,i),...!j&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0;return!1})(l)&&{"aria-hidden":"true"},...l},[...k.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(j)?j:[j]])});a.s(["default",0,(a,e)=>{let f=(0,b.forwardRef)(({className:f,...h},i)=>(0,b.createElement)(g,{ref:i,iconNode:e,className:c(`lucide-${d(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,f),...h}));return f.displayName=d(a),f}],70106)},33441,a=>{"use strict";let b=(0,a.i(70106).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);a.s(["Check",0,b],33441)},5151,a=>{"use strict";let b=(0,a.i(70106).default)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);a.s(["Copy",0,b],5151)},20494,a=>{"use strict";let b=(0,a.i(70106).default)("database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);a.s(["Database",0,b],20494)},656,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(5151),e=a.i(33441);let f=(0,a.i(70106).default)("external-link",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);var g=a.i(20494);a.s(["default",0,function(){let[a,h]=(0,c.useState)(!1),i=`-- GESTAO E SALAO - MULTI-TENANT SETUP
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
ON CONFLICT (id) DO NOTHING;`;return(0,b.jsx)("main",{className:"min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6",children:(0,b.jsxs)("div",{className:"max-w-2xl w-full space-y-8",children:[(0,b.jsxs)("div",{className:"text-center space-y-4",children:[(0,b.jsx)("div",{className:"w-20 h-20 mx-auto bg-[#121021] border border-white/5 rounded-[2rem] flex items-center justify-center",children:(0,b.jsx)(g.Database,{className:"w-10 h-10 text-[#5E41FF]"})}),(0,b.jsxs)("div",{children:[(0,b.jsxs)("h1",{className:"text-3xl font-black tracking-tighter italic uppercase text-white/90",children:["Gestão",(0,b.jsx)("span",{className:"text-[#5E41FF]",children:"E"}),"Salão"]}),(0,b.jsx)("p",{className:"text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 mt-2",children:"Setup do Banco de Dados"})]})]}),(0,b.jsxs)("div",{className:"bg-[#121021]/50 border border-white/5 rounded-[2rem] p-8 space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h2",{className:"text-sm font-black uppercase tracking-widest text-white mb-2",children:"Passo 1: Acesse o SQL Editor"}),(0,b.jsxs)("a",{href:"https://supabase.com/dashboard/project/ssdqkvsbhebrqihoekzz/sql",target:"_blank",className:"inline-flex items-center gap-2 px-4 py-3 bg-[#5E41FF]/10 border border-[#5E41FF]/20 rounded-xl text-[#5E41FF] text-sm font-bold hover:bg-[#5E41FF]/20 transition-all",children:["Abrir SQL Editor do Supabase ",(0,b.jsx)(f,{size:14})]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h2",{className:"text-sm font-black uppercase tracking-widest text-white mb-2",children:"Passo 2: Copie e cole o SQL"}),(0,b.jsx)("button",{onClick:function(){navigator.clipboard.writeText(i),h(!0),setTimeout(()=>h(!1),2e3)},className:"flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-all",children:a?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(e.Check,{size:14,className:"text-emerald-500"})," Copiado!"]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(d.Copy,{size:14})," Copiar SQL"]})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h2",{className:"text-sm font-black uppercase tracking-widest text-white mb-2",children:"Passo 3: Clique em Run"}),(0,b.jsx)("p",{className:"text-gray-500 text-xs",children:'Após colar o SQL, clique no botão "Run" no canto inferior direito.'})]}),(0,b.jsx)("div",{className:"p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl",children:(0,b.jsx)("p",{className:"text-emerald-400 text-xs font-bold",children:"Depois de rodar o SQL, o sistema multi-tenant estará ativado. Você já pode fechar esta página."})})]})]})})}],656)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0mp-drn._.js.map