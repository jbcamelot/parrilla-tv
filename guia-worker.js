/* guia-worker.js — Descarga y procesa la guía XMLTV dentro del propio navegador (sin servidor).
 * Mensaje de entrada: {url}   Mensajes de salida: {tipo:'progreso',...} | {tipo:'ok', datos} | {tipo:'error', msg}
 */
'use strict';
const FUENTE_GZ  = 'https://raw.githubusercontent.com/davidmuma/EPG_dobleM/master/guiatv.xml.gz';
const FUENTE_XML = 'https://raw.githubusercontent.com/davidmuma/EPG_dobleM/master/guiatv.xml';

self.onmessage = async ev => {
  try {
    const datos = await construir((ev.data && ev.data.url) || null);
    self.postMessage({tipo: 'ok', datos});
  } catch (e) {
    self.postMessage({tipo: 'error', msg: String(e && e.message || e)});
  }
};

// ---------------------------------------------------------------- descarga
async function construir(url) {
  const hayGzip = typeof DecompressionStream === 'function';
  if (!url) url = hayGzip ? FUENTE_GZ : FUENTE_XML;   // iOS < 16.4: versión sin comprimir
  const r = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), {cache: 'no-store'});
  if (!r.ok) throw new Error('No se pudo descargar la guía (HTTP ' + r.status + ')');
  const total = +r.headers.get('content-length') || 0;
  let leidos = 0, ultimo = 0;
  const contador = new TransformStream({
    transform(trozo, ctl) {
      leidos += trozo.length;
      if (leidos - ultimo > 262144) { ultimo = leidos; self.postMessage({tipo: 'progreso', fase: 'descarga', leidos, total}); }
      ctl.enqueue(trozo);
    }
  });
  let flujo = r.body.pipeThrough(contador);
  if (/\.gz(\?|$)/.test(url)) flujo = flujo.pipeThrough(new DecompressionStream('gzip'));
  const xml = await new Response(flujo).text();
  self.postMessage({tipo: 'progreso', fase: 'proceso'});
  return parsear(xml, url);
}

// ---------------------------------------------------------------- utilidades
const ENT = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"};
const decodifica = s => s.indexOf('&') < 0 ? s : s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e] ?? m));
const limpia = s => decodifica(s || '')
  .replace(/\[\/?COLOR[^\]]*\]/gi, '')
  .replace(/\\u([0-9a-f]{4})/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))
  .trim();
const atributo = (cab, nombre) => { const m = cab.match(new RegExp('\\b' + nombre + '="([^"]*)"')); return m ? decodifica(m[1]) : null; };

function porIdioma(cuerpo, etiqueta) {
  const re = new RegExp('<' + etiqueta + '(\\s[^>]*)?>([\\s\\S]*?)</' + etiqueta + '>', 'g');
  let m, primero = null;
  while ((m = re.exec(cuerpo))) {
    if (primero === null) primero = m[2];
    if (m[1] && /lang="es"/.test(m[1])) return limpia(m[2]);
  }
  return primero === null ? '' : limpia(primero);
}

function fecha(s) {   // '20261111075000 +0100' -> epoch (s)
  const t = Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10) || 0, +s.slice(10, 12) || 0, +s.slice(12, 14) || 0) / 1000;
  const m = /([+-])(\d{2})(\d{2})/.exec(s.slice(14));
  if (!m) return t;
  const off = (+m[2]) * 3600 + (+m[3]) * 60;
  return m[1] === '+' ? t - off : t + off;
}

// ---------------------------------------------------------------- clasificación
const RX_EXTRANJERO = /^(FR|PT|DE|UK|IT)\s*[·|]/;
const RX_DEPORTE = /sport|dazn|eurosport|espn|bein|tnt|golf|tennis|fight|motor|f1|rally|futebol|fussball|canal 11|scooore|sporting|l.equipe|infosport|premiere/i;
const GRUPOS = [
  ['Canales FAST / plataformas', /Rakuten TV|atresplayer|ATRESplayer|Sony One|^Infinity|Flooxer|^Kidz$|^FoQ$|El Hormiguero|El club de la comedia|Equipo de investigación|Aquí no hay|La Revuelta|Mr Bean|Star TVE|tlnovelas|DePelícula|Red Bull TV$|FIFA\+|Concert Channel|FashionTV|Shark Tank/i],
  ['Deportes internacionales', /ESPN|FOX SPORTS|TyC Sports|TUDN|beIN|DSPORTS|Sky Sports? |NBA TV/i],
  ['Nacionales (TDT)', /^(La 1|La 2|Antena 3|Cuatro|Telecinco|La Sexta|Neox|Nova|Mega|Atreseries|Factoría de Ficción|Energy|Divinity|Boing|Be Mad|Clan|Teledeporte|24 Horas|DMAX|DKISS|Ten|TRECE|Real Madrid TV|Squirrel TV|GOL PLAY|Paramount Network|Veo7)$/i],
  ['Movistar+', /^(M\+|Movistar)/i],
  ['Deportes', /DAZN|LaLiga|Eurosport|Teledeporte|Tennis|Padel|MMA|Fight|Golf|Motor|Moto ADV|DBike|Rugby|Horse|Nautical|Surf|Top Barça|Betis TV|^UCL$|Primera Federación|Fast&Fun|TRACE Sports|Real Madrid|Extreme Channel|XTRM|Garage TV|Esport ?3|Torol|Onetoro/i],
  ['Autonómicas', /Canal Sur|Andalucía TV|^TV3|3CatInfo|^SX3|El 33|TV3CAT|Telemadrid|La Otra|À Punt|^TVG|^etb|Aragón TV|CMM|Canal Extremadura|TPA[78]|La 7 (CyL|Murcia|Rioja)$|La Ocho Mediterráneo|IB3|TV Canaria|Navarra TV|Radio Televisión Ceuta|TV Melilla|^La [12] (Cataluña|Canarias)|24 horas (Cataluña|Canarias)|Popular TV|Atlántico TV/i],
  ['Infantil', /Disney|Nick|Baby TV|Dreamworks|Pocoy|Toon Goggles|Gametoon|Lolly|Gulli|Anime|Clan|Boing/i],
  ['Noticias', /CNN|BBC World|Al Jazeera|France 24|CNBC|Bloomberg|EuroNews|CGTN Español|Negocios TV|Deutsche W|NHK|Telesur|El Toro TV|Canal RED|Información TV|Sky News|Arirang/i],
  ['Cine y series', /TCM|Hollywood|AMC|Somos|Sundance|Runtime|Cine|FlixOlé|STAR Channel|AXN|Warner|Comedy Central|Calle 13|Cosmo|SciFi|SkyShowtime|HBO|Atrescine|DARK|Dark Rojo|Dpelis|BOM Cine|Verdi|Sangre Fría|Crimen|Telenovelas|Al cielo con ella|La Promesa|Cuéntame|BBC Series|Cine Friki/i],
  ['Documentales y estilo de vida', /National Geographic|Nat Geo|Discovery|BBC (Earth|History|Food|Lifestyle|Top Gear)|Historia|Odisea|Caza|Pesca|Iberalia|Cocina|Viaj|Dviaje|NatureTime|Love the Planet|Love Wine|Vivir con|Escapa|CGTN Documentary|Global Tendencias|Viajes y Sabores|Cazavisión|DKISS/i],
  ['Música', /MTV|Mezzo|Classica|Sol Música|Qello|Qwest|TRACE|Radio 3|Stingray|Bon Dia/i],
  ['Internacionales', /France [25]|^M6$|TV5|RTP|Pro TV|PRO TV|Caracol|Estrellas|TV Chile|Cubavisi|Nuestra Tele|Internacional|Europa|SAT$|Record|Solidaria TV|ATV Andorra|1\+1|EWTN/i],
  ['Locales', /^La [78] |Levante TV|Tele Elx|7teleValencia|Elche|Alacant|interalmer|Huelva TV|Onda|8madrid|Betevé|TELEVIGO|telemiño|Nós Televisión|Canal 10|Empord|TAC12|Costa Brava|Terrassa|Hospitalet|Bergued|Taronja|Reus|Canal21|Terres de l|TV Girona|^ETV$|matar|Sabadell|Pened|Badalona|El 9 TV|Cugat|Olot|VOTV|Canal Blau|Pirineus|Imás|Punt 3|GCM|Distrito TV|Mírame|La Séptima|Rek|EsTuTele|VE PLUS|AZ Corazón|acontra|^PTV |Lleida TV|Banyoles|Vallès Visió/i],
];
function grupoDe(nombre) {
  if (RX_EXTRANJERO.test(nombre)) return RX_DEPORTE.test(nombre) ? 'Deportes internacionales' : 'Internacionales';
  for (const [g, rx] of GRUPOS) if (rx.test(nombre)) return g;
  return 'Otros';
}

const GENEROS = [
  ['infantil', /infantil|children|animaci|cartoon|pre-school|youth/i],
  ['series', /^series|telenovela|soap|sitcom/i],
  ['cine', /\bcine\b|pel[ií]cula|movie|film\b/i],
  ['deportes', /deport|sport|f[uú]tbol|football|soccer|futebol|fu(ss|ß)ball|tenis|tennis|golf|baloncesto|basket|motor|formula|f1\b|moto ?gp|ciclismo|cycling|rugby|toros|boxing|mma|martial|marciais|cricket|padel|p[aá]del/i],
  ['noticias', /informa|news|noticia|actualitat|actualidad|tiempo|weather|current/i],
  ['series', /serie|soap|telenovela|sitcom/i],
  ['documental', /documental|document|doku|nature|naturaleza|viajes|travel|ciencia|science|historia|cultural|educativ/i],
  ['musica', /m[uú]sica|music|concierto|jazz|rock|pop|classical|cl[aá]sica/i],
  ['entretenimiento', /entreten|programa|magaz|show|reality|concurso|quiz|humor|comedy|ocio|estilo de vida|cocina|cooking|talk|variedades/i],
];
function generoDe(subtitulo, categorias) {
  for (const texto of [subtitulo.split('|')[0].trim(), categorias]) {
    if (!texto) continue;
    for (const [g, rx] of GENEROS) if (rx.test(texto)) return g;
  }
  return 'otro';
}

// ---------------------------------------------------------------- parseo
function parsear(xml, url) {
  const gen = /generator-info-name="([^"]*)"/.exec(xml.slice(0, 2000));
  const canales = [], idx = new Map();
  const nuevoCanal = (id, nombre, logo) => {
    const c = {i: canales.length, id, nombre, logo, grupo: grupoDe(nombre), n: 0};
    canales.push(c); idx.set(id, c.i); return c.i;
  };

  const reCh = /<channel\s([^>]*)>([\s\S]*?)<\/channel>/g;
  let m;
  while ((m = reCh.exec(xml))) {
    const id = atributo(m[1], 'id');
    if (!id || idx.has(id)) continue;
    const dn = /<display-name[^>]*>([\s\S]*?)<\/display-name>/.exec(m[2]);
    const ic = /<icon\s[^>]*src="([^"]*)"/.exec(m[2]);
    nuevoCanal(id, limpia(dn ? dn[1] : id), ic ? decodifica(ic[1]) : '');
  }

  // Se descarta lo que terminó antes de ayer a las 00:00 (la guía arrastra entradas antiguas)
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 1);
  const corte = d.getTime() / 1000;

  const progs = [], vistos = new Set();
  const rePr = /<programme\s([^>]*)>([\s\S]*?)<\/programme>/g;
  while ((m = rePr.exec(xml))) {
    const cab = m[1], cuerpo = m[2];
    const cid = atributo(cab, 'channel');
    const ini = fecha(atributo(cab, 'start') || '');
    const st = atributo(cab, 'stop');
    const fin = st ? fecha(st) : ini + 1800;
    if (!(fin > corte) || isNaN(ini)) continue;
    const ci = idx.has(cid) ? idx.get(cid) : nuevoCanal(cid, cid, '');
    const clave = ci + ':' + ini;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    const sub = porIdioma(cuerpo, 'sub-title');
    let cats = '', mc; const reC = /<category[^>]*>([^<]*)<\/category>/g;
    while ((mc = reC.exec(cuerpo))) if (!/^\d+$/.test(mc[1])) cats += ' ' + mc[1];
    const ic = /<icon\s[^>]*src="([^"]*)"/.exec(cuerpo);
    const edad = /<rating[^>]*>\s*<value>([^<]*)</.exec(cuerpo);
    const nota = /<star-rating[^>]*>\s*<value>([^<]*)</.exec(cuerpo);
    // [canal, inicio, fin, título, subtítulo, género, descripción, imagen, edad, nota]
    progs.push([ci, ini, fin, porIdioma(cuerpo, 'title') || '(sin título)', sub, generoDe(sub, cats),
                porIdioma(cuerpo, 'desc'), ic ? decodifica(ic[1]) : '', edad ? edad[1] : '', nota ? nota[1] : '']);
  }
  progs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let desde = Infinity, hasta = 0;
  for (const p of progs) { canales[p[0]].n++; if (p[1] < desde) desde = p[1]; if (p[2] > hasta) hasta = p[2]; }
  return {version: 1, canales, progs, desde, hasta, actualizado: Math.floor(Date.now() / 1000),
          generado: gen ? gen[1] : '', fuente: url};
}
