const K='smartborrow-v1',$=id=>document.getElementById(id);
let S,me=null,T='',F={q:'',c:'',s:''},qr=null,PI=null;
const hashItem=()=>{const h=decodeURIComponent(location.hash.slice(1)).toUpperCase();return /^EQ-\d+$/.test(h)?h:null};
const base=()=>S.base||location.href.split('#')[0];
function handlePending(){const id=PI;PI=null;try{history.replaceState(null,'',location.href.split('#')[0])}catch(e){}if(id)onCode(id)}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fd=t=>t?new Date(t).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}):'—';
const ST={available:['Available','ok'],borrowed:['Borrowed','wn'],pending:['Awaiting check','wn'],repair:['Under repair','mu'],lost:['Lost','er'],damaged:['Damaged','er']};
const chip=(t,c)=>`<span class="chip ${c}">${t}</span>`;
async function sha(t){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return btoa(t)}}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',3200)}
const U=id=>S.users.find(u=>u.id===id),I=id=>S.items.find(i=>i.id===id);
const now=()=>Date.now(),staff=()=>me&&me.role!=='borrower';
const openTx=i=>S.tx.find(t=>t.item===i&&t.status!=='closed');
const overdue=t=>t.status==='open'&&t.due<now();
function addItems(name,cat,desc,qty,cond){for(let k=1;k<=qty;k++){S.seq++;S.items.push({id:'EQ-'+String(S.seq).padStart(4,'0'),name:qty>1?`${name} #${k}`:name,cat,desc,cond,status:cond==='Good'?'available':'repair'})}}
async function init(){
 try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
 if(!S){S={seq:0,days:3,cats:['Audio-visual','Computers','Electrical','Laboratory','Sports'],users:[],items:[],tx:[],reports:[]};
  const mk=async(id,name,pw,role,kind)=>S.users.push({id,name,pw:await sha(pw),role,kind,status:'active'});
  await mk('admin','School Administrator','admin123','admin','Staff');await mk('custodian','Property Custodian','cust123','custodian','Staff');await mk('2026-0001','Demo Student','student123','borrower','Student');
  addItems('Projector','Audio-visual','HDMI/VGA classroom projector',2,'Good');addItems('Laptop','Computers','Teacher laptop with charger',2,'Good');
  addItems('Extension cord','Electrical','5-meter, 4 outlets',1,'Good');addItems('Portable speaker','Audio-visual','Bluetooth, battery powered',1,'Good');
  addItems('Microscope','Laboratory','Compound light microscope',1,'Good');addItems('Volleyball','Sports','Official size',1,'Good');save()}
  try{const sid=localStorage.getItem(K+'-me');if(sid&&U(sid)&&U(sid).status==='active')me=U(sid)}catch(e){}
  PI=hashItem();render();if(me&&PI)handlePending()}
function keep(){try{localStorage.setItem(K+'-me',me.id)}catch(e){}}
function refresh(){try{const d=JSON.parse(localStorage.getItem(K));if(d)S=d}catch(e){}render();toast('Updated.')}
addEventListener('storage',e=>{if(e.key===K&&e.newValue&&!$('dlg').open){try{S=JSON.parse(e.newValue)}catch(x){}render()}});
/* ---------- auth ---------- */
function authHTML(reg){return`<div class="auth card"><h1>SmartBorrow</h1><p class="mu">Borrow and return school equipment by scanning a QR code.</p>${PI?`<div class="ban">You scanned ${esc(PI)}. Log in to borrow or return it.</div>`:''}
<form onsubmit="return ${reg?'doReg':'doLogin'}(event)">${reg?`<label for="n">Full name</label><input id="n" required><label for="k">I am a</label><select id="k"><option>Student</option><option>Teacher</option><option>Staff</option></select>`:''}
<label for="i">School ID</label><input id="i" required autocomplete="username"><label for="p">Password</label><input id="p" type="password" required minlength="${reg?6:1}" autocomplete="${reg?'new-password':'current-password'}">
<p id="err" class="er"></p><div class="row"><button class="pri">${reg?'Create account':'Log in'}</button><button type="button" onclick="$('app').innerHTML=authHTML(${!reg})">${reg?'I have an account':'Create account'}</button></div></form>
${reg?'':'<p class="mu">Demo logins: admin / admin123, custodian / cust123, 2026-0001 / student123</p>'}</div>`}
async function doLogin(e){e.preventDefault();const u=U($('i').value.trim()),h=await sha($('p').value);
 if(!u||u.pw!==h)return $('err').textContent='Wrong School ID or password.',false;
 if(u.status!=='active')return $('err').textContent=u.status==='pending'?'Your account is waiting for administrator approval.':'This account is disabled. Contact the administrator.',false;
 me=u;keep();T='';render();if(PI)handlePending();return false}
async function doReg(e){e.preventDefault();const id=$('i').value.trim();if(U(id))return $('err').textContent='That School ID is already registered.',false;
 const u={id,name:$('n').value.trim(),pw:await sha($('p').value),role:'borrower',kind:$('k').value,status:'active'};S.users.push(u);save();
 me=u;keep();T='';render();toast('Account created. Welcome, '+u.name+'!');if(PI)handlePending();return false}
function logout(){me=null;try{localStorage.removeItem(K+'-me')}catch(e){}render()}
/* ---------- shell ---------- */
const TABS={borrower:[['equip','Equipment'],['mine','My items'],['hist','History']],
 custodian:[['equip','Equipment'],['tx','Transactions'],['issues','Reports'],['add','Add equipment']],
 admin:[['users','Users'],['equip','Equipment'],['tx','Transactions'],['issues','Reports'],['add','Add equipment'],['rules','Rules and summary']]};
function render(){const a=$('app');if(!me){a.innerHTML=authHTML(false);return}
 me=U(me.id);const tabs=TABS[me.role];if(!tabs.some(t=>t[0]===T))T=tabs[0][0];
 a.innerHTML=`<header><div class="brand"><b>SmartBorrow</b><small>${esc(me.name)} (${me.role})</small></div><div class="row"><button class="pri" onclick="scanner()">Scan QR</button><button onclick="refresh()">Refresh</button><button onclick="logout()">Log out</button></div></header>
 <nav>${tabs.map(t=>`<button class="${t[0]===T?'on':''}" onclick="T='${t[0]}';render()">${t[1]}</button>`).join('')}</nav>${banner()}<div id="v"></div>`;
 $('v').innerHTML=V[T]();if(T==='equip')list()}
function banner(){if(me.role!=='borrower')return'';const m=S.tx.filter(t=>t.user===me.id&&t.status==='open'&&t.due-now()<864e5);
 return m.length?`<div class="ban">${m.map(t=>`${esc(I(t.item).name)}: ${t.due<now()?'overdue since':'due'} ${fd(t.due)}`).join('<br>')}</div>`:''}
/* ---------- views ---------- */
const V={
equip(){return`<div class="row"><input id="q" placeholder="Search equipment" value="${esc(F.q)}" oninput="F.q=this.value;list()" aria-label="Search">
<select onchange="F.c=this.value;list()" aria-label="Category"><option value="">All categories</option>${S.cats.map(c=>`<option ${F.c===c?'selected':''}>${esc(c)}</option>`).join('')}</select>
<select onchange="F.s=this.value;list()" aria-label="Status"><option value="">All statuses</option>${Object.entries(ST).map(([k,v])=>`<option value="${k}" ${F.s===k?'selected':''}>${v[0]}</option>`).join('')}</select></div><br><div id="list" class="grid"></div>`},
mine(){const m=S.tx.filter(t=>t.user===me.id&&t.status!=='closed');
 return`<h2>Items I borrowed</h2>`+(m.length?`<div class="grid">${m.map(t=>{const i=I(t.item);return`<div class="card"><h3>${esc(i.name)}</h3><div class="mu">${i.id}</div>
 <p>Due ${fd(t.due)} ${t.status==='pending'?chip('Awaiting custodian check','wn'):overdue(t)?chip('Overdue','er'):chip('On time','ok')}</p>
 <div class="row">${t.status==='open'?`<button class="pri" onclick="reqReturn('${i.id}')">Return</button>`:''}<button onclick="reportM('${i.id}')">Report problem</button></div></div>`}).join('')}</div>`:'<p class="mu">You have no borrowed items. Scan an item’s QR code or open Equipment to borrow.</p>')},
hist(){return`<h2>Borrowing history</h2>`+txTable(S.tx.filter(t=>t.user===me.id))},
tx(){return`<h2>All transactions</h2>`+txTable(S.tx,1)},
issues(){const r=[...S.reports].reverse();return`<h2>Damage and loss reports</h2>`+(r.length?`<div class="tb"><table><tr><th>Date</th><th>Item</th><th>By</th><th>Problem</th><th></th></tr>${r.map(x=>`<tr><td>${fd(x.date)}</td><td>${esc(I(x.item)?.name)}<br><span class="mu">${x.item}</span></td><td>${esc(U(x.user)?.name||x.user)}</td><td>${chip(x.type,'er')} ${esc(x.note)}</td><td>${x.done?chip('Resolved','ok'):`<button onclick="resolve(${x.n})">Resolve</button>`}</td></tr>`).join('')}</table></div>`:'<p class="mu">No reports yet.</p>')},
add(){return`<h2>Register equipment</h2><form class="card" onsubmit="return doAdd(event)"><label for="an">Name</label><input id="an" required>
<label for="ac">Category</label><select id="ac">${S.cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select><label for="ad">Description</label><input id="ad">
<div class="row"><div><label for="aq">Quantity</label><input id="aq" type="number" min="1" max="50" value="1"></div><div><label for="ao">Condition</label><select id="ao"><option>Good</option><option>Needs repair</option></select></div></div>
<p class="mu">Every unit gets its own item code and QR label.</p><button class="pri">Register and print labels</button></form>`},
users(){return`<h2>User accounts</h2><div class="tb"><table><tr><th>Name</th><th>School ID</th><th>Role</th><th>Status</th><th></th></tr>${S.users.map(u=>`<tr><td>${esc(u.name)}<br><span class="mu">${u.kind}</span></td><td>${esc(u.id)}</td>
<td><select onchange="setRole('${esc(u.id)}',this.value)" ${u.id===me.id?'disabled':''}>${['borrower','custodian','admin'].map(r=>`<option ${u.role===r?'selected':''}>${r}</option>`).join('')}</select></td><td>${u.status}</td>
<td>${u.id===me.id?'':u.status==='active'?`<button class="dng" onclick="setSt('${esc(u.id)}','disabled')">Disable</button>`:`<button class="pri" onclick="setSt('${esc(u.id)}','active')">Approve</button>`}</td></tr>`).join('')}</table></div>`},
rules(){const c=k=>S.items.filter(i=>i.status===k).length,od=S.tx.filter(overdue).length,by={};S.tx.forEach(t=>by[t.item]=(by[t.item]||0)+1);
 const top=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5);
 return`<div class="stat">${[['Items',S.items.length],['Available',c('available')],['Borrowed',c('borrowed')+c('pending')],['Overdue',od],['Damaged or lost',c('damaged')+c('lost')]].map(s=>`<div class="card"><b>${s[1]}</b><span class="mu">${s[0]}</span></div>`).join('')}</div>
 <div class="grid"><div class="card"><h3>Borrowing rules</h3><label for="bd">Allowed borrowing period (days)</label><div class="row"><input id="bd" type="number" min="1" max="30" value="${S.days}"><button onclick="S.days=Math.max(1,+$('bd').value||3);save();toast('Rule saved')">Save</button></div>
 <label for="nc">Add category</label><div class="row"><input id="nc"><button onclick="addCat()">Add</button></div><p class="mu">${S.cats.map(esc).join(', ')}</p>
 <label for="bu">Website address used in QR codes</label><div class="row"><input id="bu" placeholder="https://your-site.com/" value="${esc(base())}"><button onclick="S.base=$('bu').value.trim();save();toast('Saved. Reprint labels to use it.')">Save</button></div><p class="mu">Set this to your live website before printing labels.</p></div>
 <div class="card"><h3>Most borrowed items</h3>${top.length?top.map(([k,n])=>`<div class="row sp"><span>${esc(I(k)?.name)}</span><b>${n}</b></div>`).join(''):'<p class="mu">No borrowing yet.</p>'}
 <br><button onclick="window.print()">Print summary</button></div></div>`}};
function txTable(a,st){a=[...a].reverse();if(!a.length)return'<p class="mu">No transactions yet.</p>';
 return`<div class="tb"><table><tr><th>Item</th>${st?'<th>Borrower</th>':''}<th>Borrowed</th><th>Due</th><th>Returned</th><th>Status</th></tr>${a.map(t=>`<tr><td>${esc(I(t.item)?.name)}<br><span class="mu">${t.item}</span></td>${st?`<td>${esc(U(t.user)?.name||t.user)}</td>`:''}<td>${fd(t.out)}</td><td>${fd(t.due)}</td><td>${fd(t.ret)}${t.cond?`<br><span class="mu">${esc(t.cond)}</span>`:''}</td>
<td>${t.status==='closed'?chip('Returned','ok'):t.status==='pending'?chip('Awaiting check','wn'):overdue(t)?chip('Overdue','er'):chip('Borrowed','wn')}${st&&t.status==='pending'?`<br><button class="pri" onclick="confirmM('${t.item}')">Check in</button>`:''}</td></tr>`).join('')}</table></div>`}
function list(){const q=F.q.toLowerCase(),a=S.items.filter(i=>(!q||(i.name+i.id+i.desc).toLowerCase().includes(q))&&(!F.c||i.cat===F.c)&&(!F.s||i.status===F.s));
 $('list').innerHTML=a.length?a.map(i=>{const t=openTx(i.id),s=ST[i.status];return`<div class="card"><div class="row sp"><h3>${esc(i.name)}</h3>${chip(s[0],s[1])}</div><div class="mu">${i.id}, ${esc(i.cat)}</div><p>${esc(i.desc)}</p>
 ${t&&staff()?`<p class="mu">Held by ${esc(U(t.user)?.name)}, due ${fd(t.due)}</p>`:''}
 <div class="row">${me.role==='borrower'?(i.status==='available'?`<button class="pri" onclick="borrowM('${i.id}')">Borrow</button>`:''):
 `${['available','repair','damaged','lost'].includes(i.status)?`<select onchange="setItem('${i.id}',this.value)" aria-label="Status">${['available','repair','damaged','lost'].map(k=>`<option value="${k}" ${i.status===k?'selected':''}>${ST[k][0]}</option>`).join('')}</select>`:''}<button onclick="labels(['${i.id}'])">QR label</button>`}</div></div>`}).join(''):'<p class="mu">No equipment matches your search.</p>'}
/* ---------- actions ---------- */
function modal(h){$('dlg').innerHTML=h;if(!$('dlg').open)$('dlg').showModal()}
const closeM=()=>$('dlg').close();
$('dlg').addEventListener('close',()=>{if(qr){const q=qr;qr=null;q.stop().then(()=>q.clear()).catch(()=>{})}});
function borrowM(id){const i=I(id);if(!i||i.status!=='available')return toast('This item is not available.');
 modal(`<h3>Borrow ${esc(i.name)}?</h3><p>${i.id}. Return it within ${S.days} day(s), by ${fd(now()+S.days*864e5)}.</p><div class="row"><button class="pri" onclick="borrow('${id}')">Confirm borrow</button><button onclick="closeM()">Cancel</button></div>`)}
function borrow(id){const i=I(id);if(i.status!=='available')return;S.tx.push({id:now(),item:id,user:me.id,out:now(),due:now()+S.days*864e5,ret:null,cond:'',status:'open'});i.status='borrowed';save();closeM();toast(i.name+' borrowed.');T='mine';render()}
function reqReturn(id){const t=openTx(id);if(!t||t.user!==me.id)return;t.status='pending';I(id).status='pending';save();closeM();toast('Return recorded. The custodian will check the item.');render()}
function confirmM(id){modal(`<h3>Check in ${esc(I(id).name)}</h3><label for="rc">Condition on return</label><select id="rc"><option>Good</option><option>Damaged</option><option>Missing parts</option></select><br><br><div class="row"><button class="pri" onclick="checkIn('${id}')">Confirm return</button><button onclick="closeM()">Cancel</button></div>`)}
function checkIn(id){const t=openTx(id),c=$('rc').value,i=I(id);t.status='closed';t.ret=now();t.cond=c;i.cond=c;i.status=c==='Good'?'available':'damaged';
 if(c!=='Good')S.reports.push({n:S.reports.length+1,item:id,user:t.user,type:c,note:'Found at check-in.',date:now(),done:false});save();closeM();toast('Return confirmed.');render()}
function reportM(id){modal(`<h3>Report a problem with ${esc(I(id).name)}</h3><label for="rt">Type</label><select id="rt"><option>Damaged</option><option>Missing</option></select><label for="rn">What happened?</label><textarea id="rn" rows="3"></textarea><br><div class="row"><button class="pri" onclick="report('${id}')">Send report</button><button onclick="closeM()">Cancel</button></div>`)}
function report(id){S.reports.push({n:S.reports.length+1,item:id,user:me.id,type:$('rt').value,note:$('rn').value.trim(),date:now(),done:false});save();closeM();toast('Report sent to the custodian.')}
function resolve(n){S.reports.find(r=>r.n===n).done=true;save();render()}
function setItem(id,s){I(id).status=s;save();toast('Status updated.');list()}
function setRole(id,r){U(id).role=r;save();toast('Role updated.')}
function setSt(id,s){U(id).status=s;save();render()}
function addCat(){const c=$('nc').value.trim();if(c&&!S.cats.includes(c)){S.cats.push(c);save();render()}}
function doAdd(e){e.preventDefault();const f=S.items.length;addItems($('an').value.trim(),$('ac').value,$('ad').value.trim(),Math.min(50,Math.max(1,+$('aq').value||1)),$('ao').value==='Good'?'Good':'Needs repair');save();
 labels(S.items.slice(f).map(i=>i.id));return false}
function labels(ids){modal(`<h3>QR labels</h3><p class="mu noprint">Print on durable or laminated stickers and attach one to each item.</p><div class="lbls">${ids.map(id=>`<div class="lbl"><b>${esc(I(id).name)}</b><div id="q-${id}"></div>${id}</div>`).join('')}</div><br><div class="row noprint"><button class="pri" onclick="window.print()">Print</button><button onclick="closeM();render()">Done</button></div>`);
 ids.forEach(id=>{try{new QRCode($('q-'+id),{text:base()+'#'+id,width:110,height:110})}catch(e){$('q-'+id).textContent='QR unavailable'}})}
/* ---------- scanning ---------- */
function scanner(){modal(`<h3>Scan equipment QR code</h3><div id="rd"></div><p class="mu">No camera or damaged label? Type the item code.</p><div class="row"><input id="mc" placeholder="EQ-0001" aria-label="Item code"><button class="pri" onclick="onCode($('mc').value)">Look up</button></div><br><button onclick="closeM()">Close</button>`);
 try{qr=new Html5Qrcode('rd');qr.start({facingMode:'environment'},{fps:10,qrbox:220},t=>{const q=qr;qr=null;q.stop().then(()=>q.clear()).catch(()=>{});onCode(t)},()=>{}).catch(()=>{qr=null;$('rd').innerHTML='<p class="er">Camera unavailable. Use the item code below.</p>'})}catch(e){$('rd').innerHTML='<p class="er">Scanner could not load. Use the item code below.</p>'}}
function onCode(raw){const m=String(raw).toUpperCase().match(/EQ-\d+/),id=m?m[0]:String(raw).trim().toUpperCase(),i=I(id);
 if(!i)return modal(`<h3>Code not recognized</h3><p>No equipment matches “${esc(raw)}”. Check the label or enter the code again.</p><button onclick="scanner()">Scan again</button> <button onclick="closeM()">Close</button>`);
 const t=openTx(id);
 if(me.role==='borrower'){if(i.status==='available')return borrowM(id);if(t&&t.user===me.id&&t.status==='open')return modal(`<h3>Return ${esc(i.name)}?</h3><p>Due ${fd(t.due)}.</p><div class="row"><button class="pri" onclick="reqReturn('${id}')">Confirm return</button><button onclick="closeM()">Cancel</button></div>`);
  return modal(`<h3>${esc(i.name)}</h3><p>${ST[i.status][0]}. You can’t borrow this item right now.</p><button onclick="closeM()">Close</button>`)}
 if(i.status==='pending')return confirmM(id);
 modal(`<h3>${esc(i.name)}</h3><p>${i.id}. ${ST[i.status][0]}${t?`, held by ${esc(U(t.user)?.name)}, due ${fd(t.due)}`:''}.</p>${t&&t.status==='open'?`<button class="pri" onclick="confirmM('${id}')">Check in now</button> `:''}<button onclick="closeM()">Close</button>`)}
addEventListener('hashchange',()=>{PI=hashItem();if(me&&PI)handlePending();else if(!me)render()});
init();
