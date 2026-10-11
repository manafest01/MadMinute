/* ManaFlow web engine: everything the PC server did, running inside the browser.
   Library lives in this browser (IndexedDB). Music is read straight from folders you pick
   (File System Access API in Chrome/Edge). Nothing is uploaded anywhere. */
'use strict';
const MF = (() => {
  const VERSION = '3.0 Web';
  const AUDIO_EXT = new Set(['mp3','flac','wav','aiff','aif','m4a','aac','ogg','opus','wma','mp4','alac']);
  const CUE_COLORS = ['#e8264c','#ff8c1a','#f5d327','#3ee08f','#35dcff','#3d7bff','#b46bff','#ff5ec4'];
  const canPick = 'showDirectoryPicker' in window;

  // ---------------- storage (IndexedDB key/value)
  let dbp = null;
  function idb() {
    if (!dbp) dbp = new Promise((res, rej) => {
      const r = indexedDB.open('manaflow', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function kvGet(k) { const d = await idb(); return new Promise((res, rej) => { const q = d.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
  async function kvSet(k, v) { const d = await idb(); return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); }

  const DEF_SETTINGS = { show_serato: '0', bpm_double: '1', bpm_lo: '85', bpm_hi: '89' };
  let L = { nextId: 1, tracks: [], playlists: [], roots: [], settings: { ...DEF_SETTINGS }, rb_last_import: '', dups_checked: '' };
  const byId = new Map();
  const handles = new Map();     // rootId -> FileSystemDirectoryHandle
  const fileCache = new Map();   // trackId -> File (for webkitdirectory fallback and speed)
  const perm = new Map();        // rootId -> 'granted' | 'prompt' | 'denied'
  let saveT = null;
  function save() { clearTimeout(saveT); saveT = setTimeout(() => kvSet('lib', L).catch(() => {}), 400); }
  function reindex() { byId.clear(); L.tracks.forEach(t => byId.set(t.id, t)); }

  async function init() {
    try {
      const v = await kvGet('lib');
      if (v) { L = Object.assign(L, v); L.settings = Object.assign({ ...DEF_SETTINGS }, v.settings || {}); }
    } catch (e) { /* private window: library lives in memory only */ }
    reindex();
    for (const r of L.roots) {
      try {
        const h = await kvGet('h:' + r.id);
        if (h) { handles.set(r.id, h); perm.set(r.id, await h.queryPermission({ mode: 'read' })); }
        else perm.set(r.id, 'gone');
      } catch (e) { perm.set(r.id, 'gone'); }
    }
  }

  // ---------------- helpers
  const now = () => new Date().toISOString().slice(0, 19);
  const base = p => String(p || '').replace(/\\/g, '/').split('/').pop();
  const extOf = p => (base(p).split('.').pop() || '').toLowerCase();
  function fnameSuggest(name) {
    let stem = base(name).replace(/\.[^.]+$/, '').replace(/^\s*\d{1,3}\s*[-_.]\s*/, '').trim();
    const i = stem.indexOf(' - ');
    return i > 0 ? [stem.slice(0, i).trim(), stem.slice(i + 3).trim()] : ['', stem];
  }
  function category(t) {
    const p = (t.loc || t.rel || '').toLowerCase();
    if (/sample|loop|one ?shot|splice/.test(p)) return 'Samples/Loops';
    if (t.duration > 1200) return 'DJ Mix/Long Recording';
    return 'Music';
  }
  function linked(t) { return !!((t.root && t.rel && handles.has(t.root)) || fileCache.has(t.id)); }
  function hot(t) {
    const out = {};
    for (const [s, v] of Object.entries(t.rbHot || {})) out[s] = { slot: +s, pos_sec: v[0], color: v[1] || '', name: v[2] || '', source: 'rekordbox' };
    for (const [s, v] of Object.entries(t.mfHot || {})) { if (v === null) delete out[s]; else out[s] = { slot: +s, pos_sec: v[0], color: v[1] || CUE_COLORS[s], name: '', source: 'manaflow' }; }
    return Object.values(out).filter(h => h.slot >= 0 && h.slot < 8).sort((a, b) => a.slot - b.slot);
  }
  function status(t) { const n = hot(t).length; return !t.bpm ? 'Needs Analysis' : n >= 8 ? 'Ready' : n ? 'Some Cues' : 'No Cues'; }
  function driveOf(t) {
    if (t.root) { const r = L.roots.find(x => x.id === t.root); if (r) return r.name; }
    const m = /^([A-Za-z]):/.exec(t.loc || ''); return m ? m[1].toUpperCase() : '—';
  }
  function bpmRule() { return [L.settings.bpm_double === '1', parseFloat(L.settings.bpm_lo) || 85, parseFloat(L.settings.bpm_hi) || 89]; }
  function applyBpm(t) {
    const [on, lo, hi] = bpmRule();
    if (t.bpm_auto === -1) return;
    if (t.bpm_raw == null) t.bpm_raw = t.bpm;
    if (t.bpm_raw == null) return;
    if (on && t.bpm_raw >= lo && t.bpm_raw < hi) { t.bpm = Math.round(t.bpm_raw * 200) / 100; t.bpm_auto = 1; }
    else { t.bpm = t.bpm_raw; t.bpm_auto = 0; }
  }
  const inPl = () => { const s = new Set(); L.playlists.forEach(p => (p.tracks || []).forEach(i => s.add(i))); return s; };

  // ---------------- files
  async function fileFor(t) {
    if (fileCache.has(t.id)) return fileCache.get(t.id);
    const h = handles.get(t.root); if (!h || !t.rel) return null;
    if (perm.get(t.root) !== 'granted') return null;
    let d = h; const parts = t.rel.split('/');
    try {
      for (const p of parts.slice(0, -1)) d = await d.getDirectoryHandle(p);
      return await (await d.getFileHandle(parts[parts.length - 1])).getFile();
    } catch (e) { return null; }
  }
  async function* walk(dir, prefix) {
    for await (const [name, h] of dir.entries()) {
      if (name.startsWith('.') || name.startsWith('$')) continue;
      if (h.kind === 'directory') yield* walk(h, prefix + name + '/');
      else yield [prefix + name, h];
    }
  }

  // ---------------- jobs (same shape the screen expects)
  const J = { running: false, phase: 'idle', found: 0, new: 0, changed: 0, skipped: 0, system_listed: 0, missing: 0, probed: 0, probe_total: 0, errors: 0, current: '', finished_at: '' };
  let stop = false;
  function startJob(fn) {
    if (J.running) return false;
    Object.assign(J, { running: true, phase: 'starting', found: 0, new: 0, changed: 0, skipped: 0, missing: 0, probed: 0, probe_total: 0, errors: 0, current: '' });
    stop = false;
    (async () => { try { await fn(); J.phase = 'done'; } catch (e) { J.phase = 'error: ' + e.message; } finally { J.running = false; J.finished_at = now(); save(); } })();
    return true;
  }

  function linkIndex() {
    const idx = new Map();
    for (const t of L.tracks) if (!t.root && t.loc) { const k = base(t.loc).toLowerCase(); (idx.get(k) || idx.set(k, []).get(k)).push(t); }
    return idx;
  }
  async function scanRoot(r, files) {
    J.phase = 'listing files';
    const idx = linkIndex();
    const known = new Map(L.tracks.filter(t => t.root === r.id).map(t => [t.rel.toLowerCase(), t]));
    const iter = files ? files.map(f => [f.webkitRelativePath.split('/').slice(1).join('/'), f]) : walk(handles.get(r.id), '');
    for await (const [rel, h] of iter) {
      if (stop) return;
      if (!AUDIO_EXT.has(extOf(rel))) continue;
      J.found++; J.current = rel;
      let f; try { f = h.getFile ? await h.getFile() : h; } catch (e) { J.errors++; continue; }
      const k = rel.toLowerCase();
      let t = known.get(k);
      if (t) {
        if (t.size === f.size && Math.abs((t.mtime || 0) - f.lastModified) < 1000) { J.skipped++; if (files) fileCache.set(t.id, f); continue; }
        t.size = f.size; t.mtime = f.lastModified; t.needs_probe = 1; J.changed++;
      } else {
        const cands = (idx.get(base(rel).toLowerCase()) || []).filter(x => !x.root);
        const suffix = ('/' + r.name + '/' + rel).toLowerCase();
        t = cands.find(x => x.loc.replace(/\\/g, '/').toLowerCase().endsWith(suffix))
          || cands.find(x => x.loc.replace(/\\/g, '/').toLowerCase().endsWith('/' + k))
          || (cands.length === 1 ? cands[0] : cands.find(x => x.size === f.size));
        if (t) { t.root = r.id; t.rel = rel; t.size = f.size; t.mtime = f.lastModified; t.needs_probe = 1; J.changed++; }
        else {
          const [a, ti] = fnameSuggest(rel);
          t = { id: L.nextId++, name: base(rel), ext: extOf(rel), root: r.id, rel, size: f.size, mtime: f.lastModified, title: ti, artist: a,
                genre: '', added: now().slice(0, 10), needs_probe: 1, rbHot: {}, mfHot: {}, mem: [] };
          L.tracks.push(t); byId.set(t.id, t); J.new++;
        }
      }
      if (files) fileCache.set(t.id, f);
      if (J.found % 200 === 0) save();
    }
  }
  async function scanAll() {
    for (const r of L.roots) if (perm.get(r.id) === 'granted') await scanRoot(r);
    if (!stop) await probeAll();
  }

  // ---------------- tags (ID3v2) + length
  function syncsafe(b, o) { return (b[o] << 21) | (b[o + 1] << 14) | (b[o + 2] << 7) | b[o + 3]; }
  function dec(bytes, enc) {
    try {
      if (enc === 0) return new TextDecoder('latin1').decode(bytes);
      if (enc === 1) return new TextDecoder('utf-16').decode(bytes);
      if (enc === 2) return new TextDecoder('utf-16be').decode(bytes);
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) { return ''; }
  }
  async function id3(file, wantArt) {
    const head = new Uint8Array(await file.slice(0, 10).arrayBuffer());
    if (head[0] !== 0x49 || head[1] !== 0x44 || head[2] !== 0x33) return null;
    const ver = head[3], size = syncsafe(head, 6);
    const b = new Uint8Array(await file.slice(10, 10 + Math.min(size, 8e6)).arrayBuffer());
    const out = {}; let o = 0;
    while (o + 10 <= b.length) {
      const id = String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
      if (!/^[A-Z0-9]{4}$/.test(id)) break;
      const len = ver === 4 ? syncsafe(b, o + 4) : (b[o + 4] << 24 | b[o + 5] << 16 | b[o + 6] << 8 | b[o + 7]) >>> 0;
      const body = b.subarray(o + 10, o + 10 + len); o += 10 + len;
      if (id === 'APIC') {
        if (!wantArt) { out.hasArt = true; continue; }
        const enc = body[0]; let i = 1; while (i < body.length && body[i] !== 0) i++;
        const mime = dec(body.subarray(1, i), 0) || 'image/jpeg'; i += 2; // skip null + picture type
        if (enc === 1 || enc === 2) { while (i + 1 < body.length && !(body[i] === 0 && body[i + 1] === 0)) i += 2; i += 2; }
        else { while (i < body.length && body[i] !== 0) i++; i++; }
        out.art = new Blob([body.subarray(i)], { type: mime.includes('/') ? mime : 'image/' + mime.toLowerCase() });
      } else if (id[0] === 'T') {
        const v = dec(body.subarray(1), body[0]).replace(/\0+$/, '').trim();
        out[id] = v;
      }
    }
    return out;
  }
  function audioLen(file) {
    return new Promise(res => {
      const a = new Audio(); const u = URL.createObjectURL(file); let done = false;
      const fin = v => { if (done) return; done = true; URL.revokeObjectURL(u); res(v); };
      a.preload = 'metadata'; a.onloadedmetadata = () => fin(isFinite(a.duration) ? a.duration : null); a.onerror = () => fin(null);
      setTimeout(() => fin(null), 8000); a.src = u;
    });
  }
  async function probe(t) {
    const f = await fileFor(t); if (!f) return;
    const tags = t.ext === 'mp3' ? await id3(f).catch(() => null) : null;
    if (tags) {
      if (tags.TIT2 && t.title_src !== 'Manual' && t.title_src !== 'rekordbox') t.title = tags.TIT2;
      if (tags.TPE1 && t.artist_src !== 'Manual' && t.artist_src !== 'rekordbox') t.artist = tags.TPE1;
      if (tags.TALB) t.album = tags.TALB;
      if (tags.TCON && !t.genre) t.genre = tags.TCON.replace(/^\((\d+)\)$/, '$1');
      if (tags.TBPM && !t.bpm_raw && parseFloat(tags.TBPM)) { t.bpm_raw = parseFloat(tags.TBPM); t.bpm_auto = 0; t.bpm = t.bpm_raw; applyBpm(t); }
      if (tags.TKEY && !t.key) t.key = tags.TKEY;
      const y = parseInt(tags.TDRC || tags.TYER); if (y && !t.year) t.year = y;
    }
    const d = await audioLen(f); if (d) t.duration = d;
    t.needs_probe = 0;
  }
  async function probeAll(ids) {
    J.phase = 'analyzing';
    const list = L.tracks.filter(t => t.needs_probe && (!ids || ids.includes(t.id)) && linked(t));
    J.probe_total = list.length;
    for (const t of list) { if (stop) break; J.current = t.rel || t.name; await probe(t); J.probed++; if (J.probed % 25 === 0) save(); }
  }

  // ---------------- waveform + art
  const waveCache = new Map(), artCache = new Map();
  let actx = null;
  async function waveform(id, bars) {
    const key = id + ':' + bars; if (waveCache.has(key)) return waveCache.get(key);
    const t = byId.get(id); const f = t && await fileFor(t); if (!f) throw new Error('no file');
    actx = actx || new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 1, 44100);
    const buf = await actx.decodeAudioData(await f.arrayBuffer());
    const ch = buf.getChannelData(0), n = ch.length, step = Math.max(1, Math.floor(n / bars));
    const peaks = [], tone = [];
    for (let i = 0; i < bars; i++) {
      let pk = 0, e = 0, d = 0, prev = ch[i * step] || 0;
      for (let k = i * step; k < Math.min(n, (i + 1) * step); k += 8) { const v = ch[k]; const a = v < 0 ? -v : v; if (a > pk) pk = a; e += a; d += Math.abs(v - prev); prev = v; }
      peaks.push(Math.round(pk * 1000) / 1000); tone.push(e ? Math.min(1, d / e / 1.2) : 0);
    }
    const w = { peaks, tone, duration: buf.duration };
    if (!t.duration) { t.duration = buf.duration; save(); }
    waveCache.set(key, w); return w;
  }
  async function artURL(id) {
    if (artCache.has(id)) return artCache.get(id);
    const t = byId.get(id); let url = null;
    try { const f = t && t.ext === 'mp3' && await fileFor(t); if (f) { const tg = await id3(f, true); if (tg && tg.art && tg.art.size > 200) url = URL.createObjectURL(tg.art); } } catch (e) {}
    artCache.set(id, url); return url;
  }
  async function audioURL(id) { const t = byId.get(id); const f = t && await fileFor(t); return f ? URL.createObjectURL(f) : null; }

  // ---------------- rekordbox import
  function locToPath(loc) {
    let p = decodeURIComponent(String(loc || '').replace(/^file:\/\/localhost/, '').replace(/^file:\/\//, ''));
    if (/^\/[A-Za-z]:\//.test(p)) p = p.slice(1);
    return p;
  }
  async function importRekordbox(file) {
    const txt = await file.text();
    const doc = new DOMParser().parseFromString(txt, 'application/xml');
    const col = doc.querySelector('COLLECTION');
    if (!col) throw new Error('This does not look like a rekordbox collection XML.');
    const byLoc = new Map(L.tracks.filter(t => t.loc).map(t => [t.loc.toLowerCase(), t]));
    const idmap = {}; const st = { tracks: 0, matched: 0, added: 0, missing_files: 0, hot_cues: 0, playlists: 0 };
    for (const el of col.querySelectorAll(':scope > TRACK')) {
      st.tracks++;
      const loc = locToPath(el.getAttribute('Location'));
      let t = byLoc.get(loc.toLowerCase());
      if (!t) {
        const [a, ti] = fnameSuggest(loc);
        t = { id: L.nextId++, name: base(loc), ext: extOf(loc), loc, root: null, rel: null, size: +el.getAttribute('Size') || 0,
              title: ti, artist: a, genre: '', added: el.getAttribute('DateAdded') || now().slice(0, 10), rbHot: {}, mfHot: {}, mem: [] };
        L.tracks.push(t); byId.set(t.id, t); byLoc.set(loc.toLowerCase(), t); st.added++;
      } else st.matched++;
      const g = k => el.getAttribute(k) || '';
      if (g('Name') && t.title_src !== 'Manual') { t.title = g('Name'); t.title_src = 'rekordbox'; }
      if (g('Artist') && t.artist_src !== 'Manual') { t.artist = g('Artist'); t.artist_src = 'rekordbox'; }
      if (g('Genre')) t.genre = g('Genre');
      if (g('Tonality')) t.key = g('Tonality');
      if (g('Comments') && !t.comments) t.comments = g('Comments');
      if (+g('Year')) t.year = +g('Year');
      if (+g('TotalTime') && !t.duration) t.duration = +g('TotalTime');
      const bpm = parseFloat(g('AverageBpm'));
      if (bpm) { t.bpm_raw = bpm; t.bpm_auto = 0; t.bpm = bpm; applyBpm(t); }
      t.rbHot = {}; t.mem = [];
      for (const pm of el.querySelectorAll('POSITION_MARK')) {
        const num = parseInt(pm.getAttribute('Num') ?? '-1'), pos = parseFloat(pm.getAttribute('Start') || '0');
        const r = pm.getAttribute('Red'), gg = pm.getAttribute('Green'), b = pm.getAttribute('Blue');
        const color = r != null ? '#' + [r, gg, b].map(x => (+x).toString(16).padStart(2, '0')).join('') : '';
        if (num >= 0) { t.rbHot[num] = [pos, color, pm.getAttribute('Name') || '']; st.hot_cues++; }
        else t.mem.push([pos, pm.getAttribute('Name') || '']);
      }
      t.rb_id = g('TrackID'); idmap[t.rb_id] = t.id;
    }
    L.playlists = L.playlists.filter(p => p.source !== 'rekordbox');
    let pid = Math.max(0, ...L.playlists.map(p => p.id)) + 1;
    const walkNodes = (node, parent) => {
      [...node.children].filter(c => c.tagName === 'NODE').forEach((n, pos) => {
        const folder = n.getAttribute('Type') === '0';
        const p = { id: pid++, name: n.getAttribute('Name'), parent_id: parent, is_folder: folder ? 1 : 0, position: pos, source: 'rekordbox', tracks: [] };
        L.playlists.push(p);
        if (folder) walkNodes(n, p.id);
        else { st.playlists++; p.tracks = [...n.children].filter(c => c.tagName === 'TRACK').map(c => idmap[c.getAttribute('Key')]).filter(Boolean); }
      });
    };
    const pls = doc.querySelector('PLAYLISTS');
    if (pls) { const top = [...pls.children].find(c => c.tagName === 'NODE'); walkNodes(top && top.getAttribute('Name') === 'ROOT' ? top : pls, null); }
    st.missing_files = L.tracks.filter(t => !linked(t)).length;
    L.rb_last_import = now(); save();
    return st;
  }

  // ---------------- queries
  const VIEWS = {
    all: () => true, music: t => category(t) === 'Music', hascues: t => hot(t).length > 0, needs: t => !t.bpm,
    notinpl: (t, ip) => !ip.has(t.id), mixes: t => t.duration > 1200, samples: t => category(t) === 'Samples/Loops' || (t.duration && t.duration < 60),
    missing: t => !linked(t), dups: t => !!t.dup && linked(t)
  };
  const VIEW_NAMES = [['all', 'All Audio'], ['music', 'Music Tracks'], ['hascues', 'Has Hot Cues'], ['needs', 'Needs Analysis'], ['notinpl', 'Not in a Playlist'],
    ['mixes', 'DJ Mixes'], ['samples', 'Samples & Loops'], ['missing', 'Not Linked Yet'], ['dups', 'Duplicates']];
  const camel = k => { const n = parseInt(k); return isNaN(n) ? null : n * 2 + (/b$/i.test(k) ? 1 : 0); };
  const SORTS = {
    title: t => (t.title || '').toLowerCase(), artist: t => (t.artist || '').toLowerCase() + '\u0001' + (t.title || '').toLowerCase(),
    bpm: t => t.bpm || null, key: t => camel(t.key), genre: t => (t.genre || '').toLowerCase() || null, length: t => t.duration || null,
    rc: t => hot(t).length, added: t => t.added || null
  };
  function row(t) {
    return { id: t.id, title: t.title || t.name, artist: t.artist || '', bpm: t.bpm || null, key: t.key || '', genre: t.genre || '', ext: t.ext, duration: t.duration || null,
      rc: hot(t).length, sc: null, added: t.added, drive: driveOf(t), category: category(t), missing: linked(t) ? 0 : 1, is_system: 0,
      bpm_auto: t.bpm_auto || 0, bpm_raw: t.bpm_raw, dup: t.dup || null, status: status(t) };
  }
  function query(qs) {
    let list;
    if (qs.ids) { const s = new Set(qs.ids.split(',').map(Number)); list = L.tracks.filter(t => s.has(t.id)); }
    else if (qs.pl) { const p = L.playlists.find(x => x.id == qs.pl); list = p ? p.tracks.map(i => byId.get(i)).filter(Boolean) : []; }
    else { const ip = inPl(); const f = VIEWS[qs.view] || VIEWS.all; list = L.tracks.filter(t => f(t, ip)); }
    const off = new Set((qs.drives_off || '').split(',').filter(Boolean));
    if (off.size) list = list.filter(t => !off.has(driveOf(t)));
    for (const k of ['genre', 'mood', 'subgenre']) if (qs[k]) list = list.filter(t => (t[k] || '') === qs[k]);
    if (qs.era) list = list.filter(t => qs.era === 'Unknown' ? !t.year : (t.year && Math.floor(t.year / 10) * 10 + 's' === qs.era));
    if (qs.q) for (const w of qs.q.toLowerCase().split(/\s+/).filter(Boolean)) list = list.filter(t => ((t.title || '') + ' ' + (t.artist || '') + ' ' + (t.genre || '') + ' ' + (t.name || '')).toLowerCase().includes(w));
    if (qs.status && qs.status !== 'All') list = list.filter(t => status(t) === qs.status);
    const key = qs.sort && SORTS[qs.sort];
    if (key) {
      const d = qs.desc === '1' ? -1 : 1;
      list = list.map(t => [key(t), t]).sort((a, b) => (a[0] == null) - (b[0] == null) || (a[0] < b[0] ? -d : a[0] > b[0] ? d : 0)).map(x => x[1]);
    } else if (!qs.pl) list = list.slice().sort((a, b) => SORTS.artist(a) < SORTS.artist(b) ? -1 : 1);
    return list;
  }

  function summary() {
    const ip = inPl();
    const views = VIEW_NAMES.map(([id, name]) => ({ id, name, count: L.tracks.filter(t => VIEWS[id](t, ip)).length }));
    const cnt = (fn) => { const m = new Map(); L.tracks.forEach(t => { const v = fn(t); if (v) m.set(v, (m.get(v) || 0) + 1); }); return [...m].map(([v, n]) => ({ v, n })); };
    const drives = cnt(driveOf).map(x => ({ drive: x.v, n: x.n })).sort((a, b) => a.drive < b.drive ? -1 : 1);
    const types = cnt(t => (t.ext || '').toUpperCase()).map(x => ({ ext: x.v, n: x.n })).sort((a, b) => b.n - a.n);
    const ready = {}; L.tracks.forEach(t => { const s = status(t); ready[s] = (ready[s] || 0) + 1; });
    const playlists = L.playlists.map(p => ({ id: p.id, name: p.name, parent_id: p.parent_id, is_folder: p.is_folder, source: p.source, n: (p.tracks || []).length,
      notready: (p.tracks || []).filter(i => { const t = byId.get(i); return t && hot(t).length < 8; }).length }));
    const roots = L.roots.map(r => ({ id: r.id, path: r.name, enabled: 1, n: L.tracks.filter(t => t.root === r.id).length, perm: perm.get(r.id) || 'gone' }));
    const top = (fn, lim) => cnt(fn).sort((a, b) => b.n - a.n).slice(0, lim);
    return { app: 'ManaFlow', version: VERSION, web: true, views, drives, types, ready, playlists, roots, job: { ...J }, ffprobe: true, ffmpeg: true,
      rb_last_import: L.rb_last_import, settings: { ...L.settings, inbox_mode: 'later', analyze_sys: '0' }, inbox_new: 0, db: 'This browser', is_windows: false,
      browse: { genre: top(t => t.genre, 60), subgenre: top(t => t.subgenre, 60), mood: top(t => t.mood, 60),
        era: cnt(t => t.year ? Math.floor(t.year / 10) * 10 + 's' : 'Unknown').sort((a, b) => a.v < b.v ? 1 : -1) },
      dups_checked: L.dups_checked, usb: usbPending ? [{ root: 'usb', label: usbPending.label, n: usbPending.diffs.length }] : [],
      canPick, needsReconnect: L.roots.some(r => perm.get(r.id) === 'prompt'), exports: 'Your Downloads folder' };
  }
  function detail(id) {
    const t = byId.get(id); if (!t) return null;
    const r = row(t);
    return { ...t, ...r, catalog_title: r.title, catalog_artist: r.artist, musical_key: t.key || '', release_year: t.year || null,
      path: t.loc || (t.rel ? (driveOf(t) + '/' + t.rel) : t.name), hot: hot(t),
      cues: (t.mem || []).map(m => ({ source: 'rekordbox', kind: 'memory', slot: -1, pos_sec: m[0], name: m[1] })),
      playlists: L.playlists.filter(p => (p.tracks || []).includes(id)).map(p => p.name), bitrate: null, sample_rate: null };
  }

  // ---------------- duplicates
  async function findDups() {
    J.phase = 'finding duplicates';
    L.tracks.forEach(t => { delete t.dup; });
    const groups = new Map();
    for (const t of L.tracks) if (linked(t) && t.size) { const k = t.ext + ':' + t.size; (groups.get(k) || groups.set(k, []).get(k)).push(t); }
    const cands = [...groups.values()].filter(g => g.length > 1);
    J.probe_total = cands.reduce((a, g) => a + g.length, 0);
    for (const g of cands) {
      const hs = new Map();
      for (const t of g) {
        if (stop) return;
        J.current = t.rel || t.name;
        try { const f = await fileFor(t); const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await f.arrayBuffer()))].map(b => b.toString(16).padStart(2, '0')).join('');
          (hs.get(h) || hs.set(h, []).get(h)).push(t); } catch (e) { J.errors++; }
        J.probed++;
      }
      for (const [h, ts] of hs) if (ts.length > 1) ts.forEach(t => t.dup = h.slice(0, 16));
    }
    L.dups_checked = now();
  }

  // ---------------- exports
  function download(name, data, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  const xa = s => '"' + String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;') + '"';
  function exportRekordbox(qs) {
    const list = qs.ids || qs.pl ? query(qs) : L.tracks; const ids = new Set(list.map(t => t.id));
    const loc = t => { let p = (t.loc || (driveOf(t) + '/' + (t.rel || t.name))).replace(/\\/g, '/'); if (!p.startsWith('/')) p = '/' + p;
      return 'file://localhost' + encodeURI(p).replace(/#/g, '%23').replace(/\?/g, '%3F'); };
    const tr = list.map(t => {
      const marks = hot(t).map(h => { const c = (h.color || '').replace('#', ''); const rgb = c.length === 6 ? ` Red="${parseInt(c.slice(0, 2), 16)}" Green="${parseInt(c.slice(2, 4), 16)}" Blue="${parseInt(c.slice(4, 6), 16)}"` : '';
        return `<POSITION_MARK Name=${xa(h.name)} Type="0" Start="${(+h.pos_sec).toFixed(3)}" Num="${h.slot}"${rgb}/>`; })
        .concat((t.mem || []).map(m => `<POSITION_MARK Name=${xa(m[1])} Type="0" Start="${(+m[0]).toFixed(3)}" Num="-1"/>`)).join('');
      const a = `TrackID="${t.id}" Name=${xa(t.title || t.name)} Artist=${xa(t.artist)} Genre=${xa(t.genre)} Kind=${xa((t.ext || '').toUpperCase() + ' File')} Size="${t.size || 0}" TotalTime="${Math.round(t.duration || 0)}" AverageBpm="${(t.bpm || 0).toFixed(2)}" Tonality=${xa(t.key)} Comments=${xa(t.comments)}${t.year ? ` Year="${t.year}"` : ''} Location=${xa(loc(t))}`;
      return marks ? `<TRACK ${a}>${marks}</TRACK>` : `<TRACK ${a}/>`;
    });
    const node = pid => L.playlists.filter(p => (p.parent_id ?? null) === pid).sort((a, b) => a.position - b.position).map(p => p.is_folder
      ? (k => `<NODE Type="0" Name=${xa(p.name)} Count="${k.length}">${k.join('')}</NODE>`)(node(p.id))
      : (k => `<NODE Name=${xa(p.name)} Type="1" KeyType="0" Entries="${k.length}">${k.map(i => `<TRACK Key="${i}"/>`).join('')}</NODE>`)((p.tracks || []).filter(i => ids.has(i))));
    const kids = node(null);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<DJ_PLAYLISTS Version="1.0.0"><PRODUCT Name="ManaFlow" Version="${VERSION}" Company="Mana Industries"/><COLLECTION Entries="${tr.length}">\n${tr.join('\n')}\n</COLLECTION><PLAYLISTS><NODE Type="0" Name="ROOT" Count="1"><NODE Type="0" Name="ManaFlow" Count="${kids.length}">${kids.join('')}</NODE></NODE></PLAYLISTS></DJ_PLAYLISTS>\n`;
    download('ManaFlow-rekordbox.xml', xml, 'application/xml');
  }
  function exportCSV(qs) {
    const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = [['Title', 'Artist', 'BPM', 'Key', 'Genre', 'Length (s)', 'Format', 'Hot cues', 'Status', 'Location', 'Path'].map(q).join(',')];
    for (const t of query(qs)) lines.push([t.title || t.name, t.artist, t.bpm || '', t.key, t.genre, Math.round(t.duration || 0), (t.ext || '').toUpperCase(), hot(t).length,
      linked(t) ? status(t) : 'Not linked', driveOf(t), t.loc || t.rel || t.name].map(q).join(','));
    download('ManaFlow-report.csv', '﻿' + lines.join('\r\n'), 'text/csv');
  }
  const stag = (name, data) => { const n = new TextEncoder().encode(name); const out = new Uint8Array(8 + data.length); out.set(n, 0); new DataView(out.buffer).setUint32(4, data.length); out.set(data, 8); return out; };
  const u16 = s => { const b = new Uint8Array(s.length * 2); const v = new DataView(b.buffer); for (let i = 0; i < s.length; i++) v.setUint16(i * 2, s.charCodeAt(i)); return b; };
  const cat = (...a) => { const n = a.reduce((x, y) => x + y.length, 0); const o = new Uint8Array(n); let i = 0; a.forEach(x => { o.set(x, i); i += x.length; }); return o; };
  function crate(paths) {
    const parts = [stag('vrsn', u16('1.0/Serato ScratchLive Crate')), stag('osrt', cat(stag('tvcn', u16('song')), stag('brev', new Uint8Array([0]))))];
    for (const c of ['song', 'artist', 'bpm', 'key', 'length']) parts.push(stag('ovct', cat(stag('tvcn', u16(c)), stag('tvcw', u16('0')))));
    for (const p of paths) parts.push(stag('otrk', stag('ptrk', u16(p))));
    return cat(...parts);
  }
  async function exportSerato() {
    const byDrive = new Map();
    for (const p of L.playlists.filter(p => !p.is_folder)) {
      for (const i of p.tracks || []) {
        const t = byId.get(i); if (!t || !t.loc) continue;
        const m = /^([A-Za-z]):[\\/](.*)$/.exec(t.loc); if (!m) continue;
        const d = m[1].toUpperCase(); const mp = byDrive.get(d) || byDrive.set(d, new Map()).get(d);
        (mp.get(p.name) || mp.set(p.name, []).get(p.name)).push(m[2].replace(/\\/g, '/'));
      }
    }
    return byDrive;
  }
  async function writeCrates(dirHandle, plMap) {
    let sub; try { sub = dirHandle.name.toLowerCase() === 'subcrates' ? dirHandle : await dirHandle.getDirectoryHandle('Subcrates', { create: true }); } catch (e) { throw new Error('Could not open the Subcrates folder there.'); }
    let n = 0;
    for (const [name, paths] of plMap) {
      const safe = name.replace(/[\\/:*?"<>|%]/g, '_').trim() || 'Playlist';
      const fh = await sub.getFileHandle(`ManaFlow%%${safe}.crate`, { create: true });
      const w = await fh.createWritable(); await w.write(crate(paths)); await w.close(); n++;
    }
    return n;
  }
  function downloadCrates(plMap, drive) {
    for (const [name, paths] of plMap) download(`ManaFlow%%${name.replace(/[\\/:*?"<>|%]/g, '_')}.crate`, crate(paths), 'application/octet-stream');
  }

  // ---------------- USB cue sync (pick the USB stick's folder)
  let usbPending = null;
  function parseAnlz(buf) {
    const b = new DataView(buf); const u8 = new Uint8Array(buf);
    if (u8.length < 28 || String.fromCharCode(...u8.subarray(0, 4)) !== 'PMAI') return null;
    const out = { path: null, hot: null }; let pos = b.getUint32(4);
    while (pos + 12 <= u8.length) {
      const fc = String.fromCharCode(...u8.subarray(pos, pos + 4)), lh = b.getUint32(pos + 4), lt = b.getUint32(pos + 8);
      if (lt < 12 || pos + lt > u8.length) break;
      if (fc === 'PPTH') { const n = b.getUint32(pos + 12); out.path = new TextDecoder('utf-16be').decode(u8.subarray(pos + 16, pos + 16 + n)).replace(/\0+$/, ''); }
      else if ((fc === 'PCOB' || fc === 'PCO2') && b.getUint32(pos + 12) === 1) {
        const h = {}; let e = pos + lh;
        while (e + 12 <= pos + lt) {
          const ef = String.fromCharCode(...u8.subarray(e, e + 4)), el = b.getUint32(e + 8); if (el < 12) break;
          const hc = b.getUint32(e + 12);
          if (ef === 'PCPT' && hc > 0) h[hc - 1] = b.getUint32(e + 0x20) / 1000;
          if (ef === 'PCP2' && hc > 0) h[hc - 1] = b.getUint32(e + 0x14) / 1000;
          e += el;
        }
        if (fc === 'PCO2' || out.hot === null) out.hot = h;
      }
      pos += lt;
    }
    return out;
  }
  async function usbScan(root) {
    let anlz; try { anlz = await (await root.getDirectoryHandle('PIONEER')).getDirectoryHandle('USBANLZ'); }
    catch (e) { throw new Error('That folder has no PIONEER\\USBANLZ inside. Pick the top of the USB stick.'); }
    const found = new Map();
    for await (const [rel, h] of walk(anlz, '')) {
      if (!/ANLZ.*\.(DAT|EXT)$/i.test(rel)) continue;
      const a = parseAnlz(await (await h.getFile()).arrayBuffer()); if (!a || !a.path || !a.hot) continue;
      const ext = /\.EXT$/i.test(rel); const cur = found.get(a.path);
      if (!cur || ext) found.set(a.path, { hot: a.hot, ext });
    }
    const byName = new Map(); L.tracks.forEach(t => { const k = (t.name || base(t.loc || t.rel)).toLowerCase(); (byName.get(k) || byName.set(k, []).get(k)).push(t); });
    const diffs = [];
    for (const [p, info] of found) {
      const c = byName.get(base(p).toLowerCase()) || []; if (c.length !== 1) continue;
      const t = c[0]; const lib = {}; hot(t).forEach(h => lib[h.slot] = h.pos_sec);
      const usb = {}; for (const [k, v] of Object.entries(info.hot)) if (+k >= 0 && +k < 8) usb[+k] = v;
      const ch = [];
      for (let s = 0; s < 8; s++) { const a = lib[s], b = usb[s]; const L8 = 'ABCDEFGH'[s];
        if (a == null && b != null) ch.push(`${L8} added at ${Math.floor(b / 60)}:${String(Math.floor(b % 60)).padStart(2, '0')}`);
        else if (a != null && b == null) ch.push(`${L8} removed`);
        else if (a != null && Math.abs(a - b) > 0.05) ch.push(`${L8} moved ${(b - a > 0 ? '+' : '')}${(b - a).toFixed(1)}s`); }
      if (ch.length) diffs.push({ id: t.id, title: t.title || t.name, artist: t.artist || '', changes: ch, usb, lib });
    }
    usbPending = diffs.length ? { root: 'usb', label: '"' + root.name + '"', diffs } : null;
    return diffs.length;
  }
  function usbApply(ids) {
    if (!usbPending) throw new Error('No USB changes waiting.');
    let n = 0;
    for (const d of usbPending.diffs) {
      if (ids.size && !ids.has(d.id)) continue;
      const t = byId.get(d.id); t.mfHot = t.mfHot || {};
      for (let s = 0; s < 8; s++) { const a = d.lib[s], b = d.usb[s];
        if (b != null && (a == null || Math.abs(a - b) > 0.05)) t.mfHot[s] = [b, CUE_COLORS[s]];
        else if (a != null && b == null) t.mfHot[s] = null; }
      n++;
    }
    usbPending = null; save(); return { ok: true, n };
  }

  // ---------------- folders
  async function addFolder() {
    if (!canPick) throw new Error('This browser can\'t open folders. Use Chrome or Edge on your PC.');
    const h = await window.showDirectoryPicker({ id: 'manaflow-music', mode: 'read' });
    let r = L.roots.find(x => x.name === h.name);
    if (!r) { r = { id: 'r' + Date.now(), name: h.name }; L.roots.push(r); }
    handles.set(r.id, h); perm.set(r.id, 'granted');
    await kvSet('h:' + r.id, h).catch(() => {}); save();
    startJob(async () => { await scanRoot(r); if (!stop) await probeAll(); });
    return r;
  }
  async function addFolderFiles(files) {   // fallback: <input webkitdirectory>
    const name = files[0] ? files[0].webkitRelativePath.split('/')[0] : 'Folder';
    let r = L.roots.find(x => x.name === name); if (!r) { r = { id: 'r' + Date.now(), name }; L.roots.push(r); }
    perm.set(r.id, 'granted');
    startJob(async () => { await scanRoot(r, [...files]); if (!stop) await probeAll(); });
  }
  async function reconnect() {
    let ok = 0;
    for (const r of L.roots) { const h = handles.get(r.id); if (!h) continue;
      try { const p = await h.requestPermission({ mode: 'read' }); perm.set(r.id, p); if (p === 'granted') ok++; } catch (e) {} }
    return ok;
  }

  // ---------------- router: same addresses the PC server answered
  async function handle(method, path, body) {
    const u = new URL(path, location.href); const qs = Object.fromEntries(u.searchParams); const p = u.pathname.replace(/^.*\/api\//, '/api/');
    const data = body && typeof body === 'string' ? JSON.parse(body) : (body || {});
    let m;
    if (method === 'GET') {
      if (p === '/api/summary') return summary();
      if (p === '/api/tracks') { const all = query(qs); const off = +qs.offset || 0, lim = Math.min(+qs.limit || 200, 1000); return { total: all.length, rows: all.slice(off, off + lim).map(row) }; }
      if ((m = /^\/api\/track\/(\d+)$/.exec(p))) { const d = detail(+m[1]); if (!d) throw new Error('not found'); return d; }
      if ((m = /^\/api\/waveform\/(\d+)$/.exec(p))) return waveform(+m[1], +qs.bars || 120);
      if (p === '/api/job') return { ...J };
      if (p === '/api/usb') return usbPending ? [usbPending] : [];
      throw new Error('not found');
    }
    if (p === '/api/import/rekordbox') return importRekordbox(body);
    if (p === '/api/settings') {
      for (const [k, v] of Object.entries(data)) if (k in DEF_SETTINGS) L.settings[k] = String(v);
      if (['bpm_double', 'bpm_lo', 'bpm_hi'].some(k => k in data)) L.tracks.forEach(applyBpm);
      save(); return { ok: true };
    }
    if (p === '/api/roots') {
      if (data.remove) { const r = L.roots.find(x => x.name === data.remove || x.id === data.remove); if (r) { L.roots = L.roots.filter(x => x !== r); handles.delete(r.id); L.tracks.forEach(t => { if (t.root === r.id) { if (t.loc) { t.root = null; t.rel = null; } } }); L.tracks = L.tracks.filter(t => t.root !== r.id); reindex(); save(); } }
      return { ok: true };
    }
    if (p === '/api/scan') return { started: startJob(scanAll) };
    if (p === '/api/analyze') return { started: startJob(() => probeAll()) };
    if (p === '/api/stop') { stop = true; return { ok: true }; }
    if (p === '/api/dups') return { started: startJob(findDups) };
    if ((m = /^\/api\/cue\/(\d+)$/.exec(p))) {
      const t = byId.get(+m[1]); const s = +data.slot; if (!(s >= 0 && s < 8)) throw new Error('Hot cue slot must be A-H');
      t.mfHot = t.mfHot || {}; t.mfHot[s] = data.pos == null ? null : [Math.round(data.pos * 1000) / 1000, CUE_COLORS[s]]; save(); return detail(t.id);
    }
    if (p === '/api/bpm') { const t = byId.get(+data.id); if (t.bpm) { t.bpm_raw = t.bpm_raw ?? t.bpm; t.bpm = Math.round(t.bpm * (data.op === 'x2' ? 2 : .5) * 100) / 100; t.bpm_auto = -1; save(); } return detail(t.id); }
    if (p === '/api/bulk' || (m = /^\/api\/track\/(\d+)$/.exec(p))) {
      const ids = m ? [+m[1]] : (data.ids || []).map(Number); const f = m ? data : (data.fields || {});
      for (const id of ids) { const t = byId.get(id); if (!t) continue;
        for (const [k, v] of Object.entries(f)) { if (!m && String(v).trim() === '') continue;
          const key = { title: 'title', artist: 'artist', genre: 'genre', subgenre: 'subgenre', mood: 'mood', musical_key: 'key', comments: 'comments', bpm: 'bpm', release_year: 'year' }[k]; if (!key) continue;
          if (key === 'bpm') { t.bpm = parseFloat(v) || null; t.bpm_raw = t.bpm; t.bpm_auto = -1; }
          else if (key === 'year') t.year = parseInt(v) || null;
          else { t[key] = v; if (key === 'title') t.title_src = 'Manual'; if (key === 'artist') t.artist_src = 'Manual'; } } }
      save(); return m ? detail(ids[0]) : { ok: true };
    }
    if (p === '/api/usb') {
      if (data.action === 'import') return usbApply(new Set((data.ids || []).map(Number)));
      usbPending = null; return { ok: true };
    }
    throw new Error('not found');
  }

  return { init, handle, audioURL, artURL, addFolder, addFolderFiles, reconnect, exportRekordbox, exportCSV, exportSerato, writeCrates, downloadCrates, usbScan, canPick,
           wipe: async () => { await kvSet('lib', null); location.reload(); } };
})();
