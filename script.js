// times: o escudo de cada um fica em assets/<arq>.png
const TIMES = [
  { nome: "Flamengo", sigla: "FLA", arq: "flamengo" },
  { nome: "Botafogo", sigla: "BOT", arq: "botafogo" },
  { nome: "Palmeiras", sigla: "PAL", arq: "palmeiras" },
  { nome: "Corinthians", sigla: "COR", arq: "corinthians" },
  { nome: "São Paulo", sigla: "SPF", arq: "sao-paulo" },
  { nome: "Santos", sigla: "SAN", arq: "santos" },
  { nome: "Fluminense", sigla: "FLU", arq: "fluminense" },
  { nome: "Vasco", sigla: "VAS", arq: "vasco" },
  { nome: "Grêmio", sigla: "GRE", arq: "gremio" },
  { nome: "Internacional", sigla: "INT", arq: "internacional" }
];
// falas do Theo
const FRASES = ["Confia.", "Calma, agora vai.", "Essa é certa.", "Eu tô sentindo.", "Não tem como perder essa."];
const PRE_JOGO = ["Essa aqui é garantida.", "Eu tô sentindo.", "Não tem como perder essa.", "Confia."];
const DESCULPAS = ["Foi por pouco.", "O árbitro roubou.", "Era pênalti!", "Na próxima eu recupero.", "Isso aí foi azar."];
const LUCAS = "Devia ter seguido as dicas do Lucas Tylty...";
const MAX = 100; // aposta máxima por rodada

// diálogo da introdução
const CENA = [
  { q: "", t: "Esse é o Theo." },
  { q: "", t: "Ele ama apostar." },
  { q: "Theo", t: "Fala, mano." },
  { q: "Theo", t: "Tenho R$ 500 de banca." },
  { q: "Theo", t: "Quer tentar a sorte?" }
];

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = n => Math.floor(Math.random() * n);
const real = n => "R$ " + n;
let jogo, placar;

// rostinho do Theo na caixa de fala (placeholder: assets/theo.png)
const avatar = () => `<span class="mini"><i>T</i><img src="assets/theo.png" alt="" onerror="this.remove()"></span>`;

// fala do Theo com efeito de digitação
function falar(id, txt) {
  const el = $(id), n = (el._n = (el._n || 0) + 1);
  el.hidden = false;
  el.innerHTML = `${avatar()}<div><b>Theo</b><p></p></div>`;
  el.classList.remove("troca"); void el.offsetWidth; el.classList.add("troca");
  const p = el.querySelector("p");
  let i = 0;
  (function t() {
    if (el._n !== n) return;
    p.textContent = txt.slice(0, ++i);
    if (i < txt.length) setTimeout(t, 25);
  })();
}

// troca o diálogo da introdução
let passo = 0, tok = 0, escrito = true, terminar = () => {};
function dizer() {
  const d = CENA[passo], n = ++tok, p = $("d-texto"), ultimo = passo === CENA.length - 1;
  $("d-nome").textContent = d.q; $("d-nome").hidden = !d.q;
  $("d-seta").hidden = true; $("b-comecar").hidden = true;
  $("dialogo").classList.remove("troca"); void $("dialogo").offsetWidth; $("dialogo").classList.add("troca");
  escrito = false; p.textContent = "";
  terminar = () => { tok++; p.textContent = d.t; escrito = true; $("d-seta").hidden = ultimo; $("b-comecar").hidden = !ultimo; };
  let i = 0;
  (function t() {
    if (tok !== n) return;
    p.textContent = d.t.slice(0, ++i);
    if (i < d.t.length) setTimeout(t, 30); else terminar();
  })();
}
// clique: termina a frase ou vai para a próxima
function avancar() {
  if (!escrito) return terminar();
  if (passo < CENA.length - 1) { passo++; dizer(); }
}

// escudo com placeholder (sigla) se a imagem não existir
function escudo(t) {
  return `<div class="escudo"><span>${t.sigla}</span><img src="assets/${t.arq}.png" alt="" onerror="this.remove()"></div>`;
}
const nome = lado => [jogo.a, jogo.b][lado].nome;
const limite = () => jogo.banca - 5 * (5 - jogo.rodada); // Theo guarda um mínimo pro ALL IN
const maxAposta = () => Math.min(MAX, limite());

// mostra uma tela e atualiza a barra de cima
function ver(id) {
  document.querySelectorAll(".tela").forEach(t => t.hidden = t.id !== id);
  $("hud").hidden = ["t-intro", "t-fim"].includes(id);
  $("banca").textContent = real(jogo.banca);
  $("rodada").textContent = jogo.rodada + "/5";
  window.scrollTo(0, 0);
}

function novoJogo() {
  jogo = { banca: 500, rodada: 1, a: null, b: null, escolha: null, valor: 0 };
  ver("t-intro");
  const th = $("theo-cena"); // Theo entra no cenário
  th.classList.remove("entra"); void th.offsetWidth; th.classList.add("entra");
  passo = 0; dizer();
}

// escolhe os times
function novaRodada() {
  const final = jogo.rodada === 5;
  const i = rnd(TIMES.length);
  let j;
  do { j = rnd(TIMES.length); } while (j === i);
  jogo.a = TIMES[i]; jogo.b = TIMES[j]; jogo.escolha = null;
  falar("frase", FRASES[jogo.rodada - 1]);
  $("confronto").innerHTML = [jogo.a, jogo.b]
    .map((t, k) => `<button class="time" data-k="${k}">${escudo(t)}<b>${t.nome}</b></button>`)
    .join('<span class="vs">x</span>');
  document.querySelectorAll(".time").forEach(b => b.onclick = () => escolher(+b.dataset.k));
  $("valor").disabled = final;
  $("valor").value = final ? jogo.banca : "";
  $("lbl").textContent = final ? "ALL IN: o Theo aposta tudo" : "Quanto você quer apostar?";
  $("dica").textContent = final ? "" : `Mínimo R$ 5 • A aposta máxima é ${real(maxAposta())}.`;
  $("msg").textContent = "";
  ver("t-aposta");
}

function escolher(k) {
  jogo.escolha = k;
  document.querySelectorAll(".time").forEach((b, i) => b.classList.toggle("sel", i === k));
}

// verifica a aposta (o ALL IN final é do Theo e não passa pelo limite)
function apostar() {
  const final = jogo.rodada === 5;
  const valor = final ? jogo.banca : Number($("valor").value);
  const erro = (!final && (!Number.isInteger(valor) || valor < 5)) ? "Valor inválido. Aposte um número inteiro de pelo menos R$ 5."
    : (!final && valor > MAX) ? `A aposta máxima é ${real(MAX)}.`
    : jogo.escolha === null ? "Escolha um dos times."
    : valor > jogo.banca ? "Não dá para apostar mais que a banca do Theo."
    : (!final && valor > limite()) ? `O Theo precisa guardar dinheiro pro ALL IN. Máximo: ${real(limite())}.`
    : "";
  if (erro) {
    $("msg").textContent = erro;
    if (!final && valor > MAX) falar("frase", "Melhor manter a calma."); // fala do Theo
    return;
  }
  $("msg").textContent = "";
  jogo.valor = valor;
  partida();
}

// partida normal: o time escolhido (venc = o outro) sempre perde
function eventosNormais(venc) {
  const perd = 1 - venc, w = 1 + rnd(3), l = rnd(w);
  const usados = new Set([1, 18, 45, 67]);
  const ev = [
    { min: 1, txt: "Começa o jogo!" }, { min: 18, txt: "Grande chance!" }, { min: 45, txt: "Intervalo." },
    { min: 67, txt: "O jogo continua equilibrado." }, { min: 94, lab: "90+4'", txt: "FIM DE JOGO!" }
  ];
  const gol = lado => {
    let m;
    do { m = 3 + rnd(86); } while (usados.has(m));
    usados.add(m); ev.push({ min: m, lado, gol: true });
  };
  for (let i = 0; i < w; i++) gol(venc);
  for (let i = 0; i < l; i++) gol(perd);
  ev.sort((x, y) => x.min - y.min);
  const cont = [0, 0];
  ev.forEach(e => {
    if (e.gol) { cont[e.lado]++; e.txt = `${cont[e.lado] === 1 ? "GOOOOOOL" : "MAIS UM"} do ${nome(e.lado)}!`; }
  });
  return ev;
}

// partida final: Theo abre 3 x 0 e toma a virada depois dos 75'
function eventosFinal(theo) {
  const adv = 1 - theo, T = nome(theo), A = nome(adv).toUpperCase();
  return [
    { min: 1, txt: `Começa o jogo! ${T} entra pressionando.` },
    { min: 12, lado: theo, gol: true, txt: `GOOOOOOL do ${T}!`, rea: "MAFIAAAAAAA!" },
    { min: 31, lado: theo, gol: true, txt: "MAIS UM! O Theo já está contando o dinheiro.", rea: "É dinheiro fácil." },
    { min: 43, lado: theo, gol: true, txt: `3 A 0! ${T} está passeando!`, rea: "Não tem como perder essa." },
    { min: 45, txt: "Intervalo. THEO ESTÁ GANHANDO!", rea: "Já pode ir olhando carro novo." },
    { min: 60, txt: "Segundo tempo morno. O adversário nem aparece." },
    { min: 75, lado: adv, gol: true, txt: `GOL do ${A}! Será que dá?`, rea: "Foi só um." },
    { min: 82, lado: adv, gol: true, txt: `GOL DO ${A}! 3 A 2!`, rea: "Calma... calma..." },
    { min: 88, lado: adv, gol: true, txt: "GOL!!! EMPATOU! É ABSURDO!", rea: "NÃO, NÃO, NÃO!" },
    { min: 92, lab: "90+2'", lado: adv, gol: true, txt: `GOOOOOOL DO ${A}! VIROU!`, rea: "NÃÃÃÃO!" },
    { min: 96, lab: "90+6'", txt: "FIM DE JOGO!", rea: "..." }
  ];
}

// começa a partida
async function partida() {
  const final = jogo.rodada === 5, t = [jogo.a, jogo.b];
  const ev = final ? eventosFinal(jogo.escolha) : eventosNormais(1 - jogo.escolha);
  placar = [0, 0];
  $("placar").innerHTML = `<div>${escudo(t[0])}<b>${t[0].nome}</b></div>
    <div class="gols"><span id="g0">0</span> x <span id="g1">0</span></div>
    <div>${escudo(t[1])}<b>${t[1].nome}</b></div>`;
  $("minuto").textContent = "0'";
  $("log").innerHTML = "";
  falar("reacao", final ? "Já ganhei." : PRE_JOGO[rnd(PRE_JOGO.length)]); // fala antes da partida
  $("b-resultado").hidden = true;
  ver("t-jogo");
  for (const e of ev) {
    await sleep(final ? 1700 : 1000);
    const rotulo = e.lab || e.min + "'";
    $("minuto").textContent = rotulo;
    const li = document.createElement("li");
    li.textContent = `${rotulo} — ${e.txt}`;
    if (e.gol) {
      li.className = "gol";
      placar[e.lado]++;
      $("g" + e.lado).textContent = placar[e.lado];
      $("placar").classList.remove("pulo"); void $("placar").offsetWidth; $("placar").classList.add("pulo");
    }
    if (e.rea) falar("reacao", e.rea);
    else if (e.gol && !final) falar("reacao", e.lado === jogo.escolha ? "MAFIAAAAAAA!" : "Calma, agora vai.");
    $("log").prepend(li);
  }
  $("b-resultado").hidden = false;
}

// mostra o resultado
function resultado() {
  const final = jogo.rodada === 5, t = [jogo.a, jogo.b];
  jogo.banca -= jogo.valor;
  if (final) { ver("t-fim"); return; }
  $("res-titulo").textContent = `Você perdeu ${real(jogo.valor)}.`;
  const linhas = [
    ["Rodada", `${jogo.rodada}/5`],
    ["Jogo", `${t[0].nome} ${placar[0]} x ${placar[1]} ${t[1].nome}`],
    ["Time escolhido", t[jogo.escolha].nome],
    ["Valor apostado", real(jogo.valor)],
    ["Novo saldo do Theo", real(jogo.banca)]
  ];
  $("res-info").innerHTML = linhas.map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("");
  falar("res-theo", ["Sinistro...", LUCAS, DESCULPAS[rnd(DESCULPAS.length)], "Sinistro..."][jogo.rodada - 1]);
  $("b-prox").textContent = jogo.rodada === 4 ? "ÚLTIMA CHANCE" : "PRÓXIMA RODADA";
  ver("t-res");
}

// falas antes do ALL IN
async function cenaAllin() {
  falar("f-allin", "Agora é tudo ou nada.");
  await sleep(2200);
  if (!$("t-allin").hidden) falar("f-allin", "MAFIAAAAAAA!");
}

function proxima() {
  jogo.rodada++;
  if (jogo.rodada === 5) { ver("t-allin"); cenaAllin(); } else novaRodada();
}

// botões
$("b-comecar").onclick = novaRodada;
$("t-intro").onclick = e => { if (!e.target.closest("button")) avancar(); };
document.addEventListener("keydown", e => {
  if ($("t-intro").hidden || (e.key !== "Enter" && e.key !== " ")) return;
  e.preventDefault();
  if ($("b-comecar").hidden) avancar(); else novaRodada();
});
$("b-apostar").onclick = apostar;
$("valor").onkeydown = e => { if (e.key === "Enter") apostar(); };
$("b-resultado").onclick = resultado;
$("b-prox").onclick = proxima;
$("b-allin").onclick = novaRodada;
$("b-reiniciar").onclick = novoJogo;

novoJogo();
