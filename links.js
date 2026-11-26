/* CNZ Link-Seite – gemeinsamer Code: Icons, Adress-Prüfung, Daten, PIN-Hash.
   Hier musst du normalerweise nichts ändern. */

/* ---------- Icons (Voreinstellungen) ---------- */
const ICONS = {
  youtube:   "fa-brands fa-youtube",
  instagram: "fa-brands fa-instagram",
  tiktok:    "fa-brands fa-tiktok",
  spotify:   "fa-brands fa-spotify",
  snapchat:  "fa-brands fa-snapchat",
  twitch:    "fa-brands fa-twitch",
  discord:   "fa-brands fa-discord",
  x:         "fa-brands fa-x-twitter",
  facebook:  "fa-brands fa-facebook",
  whatsapp:  "fa-brands fa-whatsapp",
  github:    "fa-brands fa-github",
  mail:      "fa-solid fa-envelope",
  telefon:   "fa-solid fa-phone",
  link:      "fa-solid fa-link"
};
const ICON_NAMEN = {
  youtube:"YouTube", instagram:"Instagram", tiktok:"TikTok", spotify:"Spotify", snapchat:"Snapchat",
  twitch:"Twitch", discord:"Discord", x:"X", facebook:"Facebook", whatsapp:"WhatsApp",
  github:"GitHub", mail:"E-Mail", telefon:"Telefon", link:"Link"
};
const ICON_ALIAS = {
  yt:"youtube", insta:"instagram", ig:"instagram", "tik tok":"tiktok", twitter:"x", "x-twitter":"x",
  email:"mail", "e-mail":"mail", tel:"telefon", phone:"telefon", gh:"github", wa:"whatsapp", snap:"snapchat"
};

function normText(s){ return String(s||"").trim().toLowerCase(); }
function escH(s){ return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* Ist das ein eigenes Bild? (hochgeladen = data:image…, oder Datei im Ordner, z. B. bilder/youtube.png, oder https://….png) */
function istBild(s){
  s = String(s||"").trim();
  if (!s) return false;
  if (/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[A-Za-z0-9+\/=]+$/i.test(s)) return true;
  if (/^https:\/\/\S+\.(png|jpe?g|webp|gif|svg)(\?\S*)?$/i.test(s)) return true;
  if (/^(?!.*\.\.)[\w\-.\/]+\.(png|jpe?g|webp|gif|svg)$/i.test(s)) return true;
  return false;
}
function iconKey(n){ const k = normText(n); return ICONS[k] ? k : (ICON_ALIAS[k] || "link"); }
function iconHTML(icon){
  if (istBild(icon)) return `<img class="icon-img" src="${escH(String(icon).trim())}" alt="" draggable="false">`;
  return `<i class="${ICONS[iconKey(icon)]}"></i>`;
}

/* ---------- Adressen prüfen (nur https, http, mailto, tel – nichts anderes wird geöffnet) ---------- */
function sichereUrl(u){
  u = String(u||"").trim();
  if (!u) return "";
  if (/^https?:\/\/[^\s"'<>]+$/i.test(u)) return u;
  if (/^mailto:[^\s"'<>]+$/i.test(u)) return u;
  if (/^tel:\+?[0-9 ()\-]{3,}$/i.test(u)) return u;
  if (/^[a-z][a-z0-9+.\-]*:/i.test(u)) return "";                 // andere Schemata (javascript: usw.) → abgelehnt
  if (/^[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"'<>]+$/.test(u)) return "mailto:" + u;
  if (/^[\w\-]+(\.[\w\-]+)+(\/[^\s"'<>]*)?$/.test(u)) return "https://" + u;
  return "";
}

/* ---------- Daten ---------- */
function normLink(l){
  l = (l && typeof l === "object") ? l : {};
  const ic = String(l.icon||"").trim();
  return { aktiv: l.aktiv !== false, name: String(l.name||""), url: String(l.url||""), icon: istBild(ic) ? ic : iconKey(ic) };
}
function normDaten(j){
  j = (j && typeof j === "object") ? j : {};
  const lb = String(j.logoBild||"").trim();
  return {
    logoText: typeof j.logoText === "string" ? j.logoText : "CNZ",
    logoBild: istBild(lb) ? lb : "",
    status:   typeof j.status === "string" ? j.status : "Official Hub",
    links:    (Array.isArray(j.links) ? j.links : []).map(normLink)
  };
}

/* ---------- Speicher auf diesem Gerät ---------- */
const LOKAL_KEY = "cnz_links_lokal";
const LOKAL_STAND_KEY = "cnz_links_stand";
function lokalerStand(){ try{ return localStorage.getItem(LOKAL_STAND_KEY)||""; }catch(e){ return ""; } }
function lokaleDaten(){
  try{
    const raw = localStorage.getItem(LOKAL_KEY); if (!raw) return null;
    const d = normDaten(JSON.parse(raw));
    return d.links.length ? d : null;
  }catch(e){ return null; }
}

/* ---------- SHA-256 (läuft auch ohne https) ---------- */
function sha256(text){
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const bytes = Array.from(unescape(encodeURIComponent(text)), c=>c.charCodeAt(0));
  const l = bytes.length*8; bytes.push(0x80);
  while (bytes.length%64!==56) bytes.push(0);
  for (let i=7;i>=0;i--) bytes.push(i>3?0:(l>>>(i*8))&255);
  let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const r=(x,n)=>(x>>>n)|(x<<(32-n));
  for (let o=0;o<bytes.length;o+=64){
    const w=new Array(64);
    for (let i=0;i<16;i++) w[i]=(bytes[o+i*4]<<24)|(bytes[o+i*4+1]<<16)|(bytes[o+i*4+2]<<8)|bytes[o+i*4+3];
    for (let i=16;i<64;i++){ const s0=r(w[i-15],7)^r(w[i-15],18)^(w[i-15]>>>3), s1=r(w[i-2],17)^r(w[i-2],19)^(w[i-2]>>>10); w[i]=(w[i-16]+s0+w[i-7]+s1)|0; }
    let [a,b,c,d,e,f,g,h]=H;
    for (let i=0;i<64;i++){
      const t1=(h+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+K[i]+w[i])|0;
      const t2=((r(a,2)^r(a,13)^r(a,22))+((a&b)^(a&c)^(b&c)))|0;
      h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
    }
    H=H.map((x,i)=>(x+[a,b,c,d,e,f,g,h][i])|0);
  }
  return H.map(x=>(x>>>0).toString(16).padStart(8,"0")).join("");
}
function passwortHash(pw, salz){ let h=salz+":"+pw; for(let i=0;i<2000;i++) h=sha256(h+salz); return h; }
