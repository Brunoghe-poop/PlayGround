import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('game');
  const ui = {
    overlay: $('overlay'), title: $('title-panel'), pause: $('pause-panel'), shrine: $('shrine-panel'),
    death: $('death-panel'), victory: $('victory-panel'), health: $('health-fill'), healthText: $('health-text'),
    stamina: $('stamina-fill'), staminaText: $('stamina-text'), mana: $('mana-fill'), manaText: $('mana-text'),
    level: $('level-badge'), souls: $('souls-count'), className: $('class-name'), objective: $('objective-text'),
    distance: $('objective-distance'), target: $('target-ui'), targetName: $('target-name'), targetFill: $('target-fill'),
    toast: $('toast'), prompt: $('interact-prompt'), flask: $('flask-count'), shrineStats: $('shrine-stats')
  };
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9aa9a5);
  scene.fog = new THREE.Fog(0x9aa9a5, 28, 93);
  const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, .1, 150);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  scene.add(new THREE.HemisphereLight(0xdce9e7, 0x30372e, 2.0));
  const sun = new THREE.DirectionalLight(0xffe6c6, 3.2);
  sun.position.set(-18, 30, -15); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -38; sun.shadow.camera.right = 38;
  sun.shadow.camera.top = 38; sun.shadow.camera.bottom = -38; sun.shadow.bias = -.00025;
  scene.add(sun);
  const mat = (color, roughness = .8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const M = {
    ground: mat(0x64736b), snow: mat(0xb7c3bb), path: mat(0x626963), stone: mat(0x626a64), dark: mat(0x202725),
    steel: mat(0x303a3e, .34, .78), edge: mat(0x839092, .27, .82), gold: mat(0x927c4f, .35, .72), leather: mat(0x3c3026),
    cloth: mat(0x343a35), bone: mat(0xc0bda8), enemy: mat(0x4c554d), boss: mat(0x443c32), wood: mat(0x443a2c)
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(130, 100), M.ground);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.13; ground.receiveShadow = true; scene.add(ground);
  const pathPoints = [new THREE.Vector3(-62, -.02, 1), new THREE.Vector3(-35, -.02, 0), new THREE.Vector3(-10, -.02, 1.2), new THREE.Vector3(12, -.02, -1.5), new THREE.Vector3(38, -.02, 0), new THREE.Vector3(62, -.02, 1)];
  const roadCurve = new THREE.CatmullRomCurve3(pathPoints);
  const roadGeometry = new THREE.BufferGeometry();
  const roadSegments = 100, roadHalfWidth = 4.1, roadVertices = [], roadIndices = [];
  for (let i = 0; i <= roadSegments; i++) {
    const t = i / roadSegments, point = roadCurve.getPointAt(t), tangent = roadCurve.getTangentAt(t);
    const sideX = -tangent.z, sideZ = tangent.x;
    roadVertices.push(point.x - sideX * roadHalfWidth, -.02, point.z - sideZ * roadHalfWidth);
    roadVertices.push(point.x + sideX * roadHalfWidth, -.02, point.z + sideZ * roadHalfWidth);
    if (i < roadSegments) {
      const a = i * 2, b = a + 1, c = a + 3, d = a + 2;
      roadIndices.push(a, b, c, a, c, d);
    }
  }
  roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(roadVertices, 3));
  roadGeometry.setIndex(roadIndices);
  roadGeometry.computeVertexNormals();
  const road = new THREE.Mesh(roadGeometry, M.path);
  road.receiveShadow = true; scene.add(road);
  const rng = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const addMesh = (parent, geometry, material, pos, scale, cast = true) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...pos); if (scale) mesh.scale.set(...scale);
    mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  // Wind-carved snow shelves, stones, and a sparse ring of frost pines frame the road.
  for (let i = 0; i < 100; i++) {
    const x = rng(i + 11) * 118 - 59, z = rng(i + 177) * 70 - 35;
    if (Math.abs(z) < 6.6 || (x + 15) ** 2 + z ** 2 < 55 || (x - 37) ** 2 + z ** 2 < 95) continue;
    const rock = addMesh(scene, new THREE.DodecahedronGeometry(1, 0), i % 3 ? M.stone : M.snow,
      [x, -.02, z], [.25 + rng(i + 40) * 1.1, .18 + rng(i + 80) * .55, .25 + rng(i + 90) * .7]);
    rock.rotation.set(rng(i + 4), rng(i + 8) * 3, rng(i + 9));
  }
  const pineMats = [mat(0x34483f), mat(0x293c34), mat(0x22332f)];
  for (let i = 0; i < 46; i++) {
    const x = rng(i + 300) * 112 - 56, z = rng(i + 600) * 62 - 31;
    if (Math.abs(z) < 8.5 || (x + 15) ** 2 + z ** 2 < 100 || (x - 37) ** 2 + z ** 2 < 160) continue;
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rng(i + 22) * 6.28; scene.add(g);
    const h = 2.1 + rng(i + 44) * 2.2;
    addMesh(g, new THREE.CylinderGeometry(.13, .25, h * .48, 6), M.wood, [0, h * .24, 0], null);
    for (let j = 0; j < 3; j++) addMesh(g, new THREE.ConeGeometry(h * (.32 - j * .055), h * .48, 7), pineMats[j], [0, h * (.35 + j * .22), 0], null);
  }
  // Ancient burial ring.
  const ruin = new THREE.Group(); ruin.position.set(37, 0, 0); scene.add(ruin);
  const ruinRing = new THREE.Mesh(new THREE.TorusGeometry(5.2, .38, 8, 24), M.stone);
  ruinRing.rotation.x = Math.PI / 2; ruinRing.position.y = .08; ruinRing.castShadow = true; ruin.add(ruinRing);
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2, h = 1.2 + rng(i + 990) * 1.5;
    const pillar = addMesh(ruin, new THREE.CylinderGeometry(.38, .52, h, 6), M.stone, [Math.cos(a) * 5.2, h / 2, Math.sin(a) * 5.2]);
    pillar.rotation.z = (rng(i + 44) - .5) * .2;
    addMesh(ruin, new THREE.BoxGeometry(1.05, .2, 1.05), M.snow, [Math.cos(a) * 5.2, h + .05, Math.sin(a) * 5.2]);
  }
  // Blue-flame shrine.
  const shrine = new THREE.Group(); shrine.position.set(-15, 0, 0); scene.add(shrine);
  addMesh(shrine, new THREE.CylinderGeometry(1.7, 2.05, .38, 10), M.stone, [0, .18, 0]);
  addMesh(shrine, new THREE.CylinderGeometry(1.35, 1.55, .22, 10), M.edge, [0, .48, 0]);
  addMesh(shrine, new THREE.BoxGeometry(.85, 1.5, .85), M.dark, [0, 1.25, 0]);
  addMesh(shrine, new THREE.ConeGeometry(.75, .85, 4), M.stone, [0, 2.36, 0]);
  const shrineLight = new THREE.PointLight(0x69dce4, 0, 10, 2); shrineLight.position.set(0, 1.7, 0); shrine.add(shrineLight);
  const shrineFlame = new THREE.Mesh(new THREE.IcosahedronGeometry(.28, 1), new THREE.MeshBasicMaterial({ color: 0x87f5ff }));
  shrineFlame.position.set(0, 1.7, 0); shrine.add(shrineFlame);
  // A fully procedural steel-plated knight, built from separate articulated armor pieces.
  function makeKnight(isBoss = false) {
    const root = new THREE.Group(), rig = new THREE.Group(); root.add(rig); scene.add(root);
    const scale = isBoss ? 1.32 : 1;
    rig.scale.setScalar(scale);
    const armor = isBoss ? M.boss : M.steel;
    const torso = addMesh(rig, new THREE.CylinderGeometry(.34, .46, .83, 8), armor, [0, 1.22, 0], null);
    torso.rotation.z = -.04;
    addMesh(rig, new THREE.BoxGeometry(.69, .14, .48), M.edge, [0, 1.45, .02]);
    addMesh(rig, new THREE.SphereGeometry(.31, 10, 8), armor, [0, 1.83, 0], [1, 1.05, .92]);
    addMesh(rig, new THREE.BoxGeometry(.44, .12, .39), M.dark, [0, 1.79, .19]);
    addMesh(rig, new THREE.BoxGeometry(.28, .09, .12), M.gold, [0, 1.58, .25]);
    const helm = addMesh(rig, new THREE.SphereGeometry(.31, 10, 8, 0, Math.PI * 2, 0, Math.PI * .72), armor, [0, 2.14, 0]);
    helm.scale.set(1, 1.05, .95);
    addMesh(rig, new THREE.BoxGeometry(.37, .1, .13), M.dark, [0, 2.12, .26]);
    for (const side of [-1, 1]) {
      const pauldron = addMesh(rig, new THREE.SphereGeometry(.29, 8, 6), armor, [side * .53, 1.53, 0], [1.2, .8, 1]);
      pauldron.rotation.z = side * -.16;
      addMesh(rig, new THREE.BoxGeometry(.28, .55, .31), armor, [side * .56, 1.15, 0]);
      addMesh(rig, new THREE.BoxGeometry(.3, .12, .33), M.edge, [side * .56, .93, .02]);
      addMesh(rig, new THREE.BoxGeometry(.23, .6, .3), armor, [side * .22, .48, 0]);
      addMesh(rig, new THREE.BoxGeometry(.28, .2, .43), M.dark, [side * .22, .12, .1]);
      for (let k = 0; k < 2; k++) addMesh(rig, new THREE.BoxGeometry(.13, .06, .48), M.edge, [side * .22, .58 - k * .16, .015]);
    }
    const sword = new THREE.Group(); sword.position.set(.66, 1.25, .02); rig.add(sword);
    addMesh(sword, new THREE.BoxGeometry(.14, .16, .24), M.gold, [0, 0, .03]);
    addMesh(sword, new THREE.BoxGeometry(.075, .5, .09), M.leather, [0, -.2, 0]);
    addMesh(sword, new THREE.BoxGeometry(.12, .11, .13), M.gold, [0, -.45, 0]);
    const blade = addMesh(sword, new THREE.BoxGeometry(.12, 1.15, .16), M.edge, [0, .38, 0]);
    blade.rotation.z = .035;
    addMesh(sword, new THREE.ConeGeometry(.09, .23, 4), M.edge, [0, .98, 0]);
    return { root, rig, sword };
  }
  const heroModel = makeKnight(false);
  const shrineData = { x: -15, z: 0, lit: false };
  const player = { x: -34, z: 0, hp: 120, maxHp: 120, stamina: 100, maxStamina: 100, mana: 100, maxMana: 100, flasks: 3, souls: 0, level: 1, damage: 24, face: 0, attack: 0, heavy: false, roll: 0, invuln: 0, cooldown: 0, casting: false, fireTick: 0, upgrades: { vitality: 0, edge: 0, flame: 0 } };
  const enemies = [];
  function makeEnemy(x, z, name, boss = false) {
    const model = makeKnight(boss); model.root.scale.setScalar(boss ? 1.22 : .8);
    model.rig.scale.setScalar(boss ? 1.32 : .8);
    const e = { x, z, name, boss, model, hp: boss ? 330 : 90, maxHp: boss ? 330 : 90, alive: true, state: 'idle', timer: .8 + Math.random(), face: Math.PI, cooldown: 0 };
    enemies.push(e); pointEnemy(e); return e;
  }
  makeEnemy(-2, -2.3, 'SENTINELA PÚTRIDA');
  makeEnemy(9, 2.4, 'SAQUEADOR EXILADO');
  makeEnemy(37, 0, 'GUARDIÃO DO SEPULCRO', true);
  heroModel.root.position.set(player.x, 0, player.z);
  heroModel.root.rotation.y = player.face;
  camera.position.set(player.x + 1.5, 17.5, player.z + 23);
  camera.lookAt(player.x, 0, player.z);
  const keys = new Set(), particles = [];
  const particleGeometry = new THREE.SphereGeometry(1, 6, 5);
  let mode = 'title', last = performance.now(), toastTime = 0, soundOn = false, audio = null, stick = { x: 0, y: 0 }, pointer = null, stickPointer = null, fireHeld = false;
  const clamp = THREE.MathUtils.clamp;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const say = (text) => { ui.toast.textContent = text; ui.toast.classList.add('show'); toastTime = 2.2; };
  function beep(freq = 220, dur = .08, type = 'sine', volume = .025) {
    if (!soundOn) return;
    try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); const o = audio.createOscillator(), g = audio.createGain();
      o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(volume, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + dur);
      o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + dur);
    } catch { /* Audio is optional. */ }
  }
  function showPanel(panel) { ui.overlay.classList.remove('hidden-overlay'); [ui.title, ui.pause, ui.shrine, ui.death, ui.victory].forEach(p => p.classList.add('hidden')); panel.classList.remove('hidden'); }
  function hideOverlay() { ui.overlay.classList.add('hidden-overlay'); }
  function burst(x, z, color, count = 8, spread = 1) {
    for (let i = 0; i < count; i++) {
      const size = .06 + Math.random() * .12;
      const mesh = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, depthWrite: false }));
      mesh.scale.setScalar(size); scene.add(mesh);
      particles.push({ x, z, y: .5 + Math.random() * 1.4, vx: (Math.random() - .5) * spread, vz: (Math.random() - .5) * spread, vy: .8 + Math.random() * 2, life: .35 + Math.random() * .5, max: .85, mesh });
    }
  }
  function updateHud() {
    ui.health.style.width = `${100 * player.hp / player.maxHp}%`; ui.healthText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
    ui.stamina.style.width = `${100 * player.stamina / player.maxStamina}%`; ui.staminaText.textContent = `${Math.ceil(player.stamina)} / ${player.maxStamina}`;
    ui.mana.style.width = `${100 * player.mana / player.maxMana}%`; ui.manaText.textContent = `${Math.ceil(player.mana)} / ${player.maxMana}`;
    ui.level.textContent = player.level; ui.souls.textContent = `${player.souls} ${player.souls === 1 ? 'ALMA' : 'ALMAS'}`;
    ui.className.textContent = 'VIAJANTE'; ui.flask.textContent = player.flasks;
    const boss = enemies[2];
    const target = enemies.filter(e => e.alive && distance(player, e) < 14).sort((a, b) => distance(player, a) - distance(player, b))[0] || (boss.alive && distance(player, boss) < 23 ? boss : null);
    if (target) { ui.target.classList.add('visible'); ui.targetName.textContent = target.name; ui.targetFill.style.width = `${Math.max(0, target.hp / target.maxHp * 100)}%`; }
    else ui.target.classList.remove('visible');
    ui.prompt.classList.toggle('visible', mode === 'play' && distance(player, shrineData) < 3.2);
    if (!shrineData.lit) { ui.objective.textContent = 'Encontre a chama azul no caminho antigo'; ui.distance.textContent = `${Math.max(0, Math.round(distance(player, shrineData)))} m · uma chama azul`; }
    else if (enemies.some(e => e.alive && !e.boss)) { ui.objective.textContent = 'Derrote os guardiões da estrada'; ui.distance.textContent = 'As almas inquietas bloqueiam o caminho'; }
    else if (boss.alive) { ui.objective.textContent = 'Atravesse as ruínas e enfrente o guardião'; ui.distance.textContent = `${Math.round(distance(player, boss))} m · uma presença desperta`; }
    else { ui.objective.textContent = 'A aurora retorna ao desfiladeiro'; ui.distance.textContent = 'O caminho está livre'; }
    if (mode === 'shrine') refreshShrine();
  }
  function refreshShrine() {
    ui.shrineStats.innerHTML = `<span>✦ ${player.souls} ALMAS</span><span>♥ ${Math.ceil(player.hp)} / ${player.maxHp}</span><span>♨ ${Math.ceil(player.mana)} / ${player.maxMana}</span>`;
    document.querySelectorAll('.upgrade-card').forEach(button => { button.disabled = player.souls < 1; });
  }
  function start() { mode = 'play'; hideOverlay(); last = performance.now(); say('ATRAVESSE O CAMINHO E ACENDA O SANTUÁRIO'); }
  function togglePause() { if (mode === 'play') { mode = 'pause'; showPanel(ui.pause); } else if (mode === 'pause') { mode = 'play'; hideOverlay(); last = performance.now(); } }
  function openShrine() { mode = 'shrine'; showPanel(ui.shrine); refreshShrine(); }
  function interact() {
    if (mode !== 'play') return;
    if (distance(player, shrineData) < 3.25) {
      if (!shrineData.lit) { shrineData.lit = true; shrineLight.intensity = 4; say('A CHAMA AZUL SE ACENDE. SANTUÁRIO ATIVADO.'); burst(shrineData.x, shrineData.z, '#72e6ed', 28, 2.4); beep(540, .28); }
      openShrine(); return;
    }
  }
  function upgrade(type) {
    if (mode !== 'shrine' || player.souls < 1) return;
    player.souls--; player.upgrades[type]++;
    if (type === 'vitality') { player.maxHp += 25; player.hp = Math.min(player.maxHp, player.hp + 25); }
    if (type === 'edge') player.damage += 7;
    if (type === 'flame') { player.maxMana += 25; player.mana = player.maxMana; }
    refreshShrine(); updateHud(); say('APRIMORAMENTO ADQUIRIDO');
  }
  function rest() {
    player.hp = player.maxHp; player.stamina = player.maxStamina; player.mana = player.maxMana; player.flasks = 3;
    for (const e of enemies) if (e.alive) { e.hp = e.maxHp; e.state = 'idle'; e.timer = 1; }
    refreshShrine(); updateHud(); say('A CHAMA RESTAURA SUAS FORÇAS'); beep(440, .18, 'triangle');
  }
  function attack(heavy = false) {
    if (mode !== 'play' || player.attack > 0 || player.cooldown > 0 || player.roll > 0 || player.casting) return;
    const cost = heavy ? 34 : 20; if (player.stamina < cost) { say('VIGOR INSUFICIENTE'); return; }
    player.stamina -= cost; player.heavy = heavy; player.attack = heavy ? .68 : .43; player.cooldown = heavy ? .82 : .48; beep(heavy ? 120 : 190, .08, 'triangle');
  }
  function dodge() {
    if (mode !== 'play' || player.roll > 0 || player.stamina < 27) return;
    player.stamina -= 27; player.roll = .36; player.invuln = .48; player.attack = 0;
    if (keys.has('w') || keys.has('s') || keys.has('a') || keys.has('d') || stick.x || stick.y) {
      player.x += (keys.has('d') ? 1 : keys.has('a') ? -1 : stick.x) * 2.2;
      player.z += (keys.has('s') ? 1 : keys.has('w') ? -1 : stick.y) * 2.2;
    } else { player.x += Math.sin(player.face) * 2.2; player.z += Math.cos(player.face) * 2.2; }
    burst(player.x, player.z, '#d6e0d8', 7); beep(105, .11, 'sawtooth', .018);
  }
  function heal() {
    if (mode !== 'play' || player.flasks < 1 || player.hp >= player.maxHp) return;
    player.flasks--; player.hp = Math.min(player.maxHp, player.hp + 48); burst(player.x, player.z, '#f3a05b', 14); say('A BRASA AQUECE O SANGUE'); beep(470, .18);
  }
  function kill(e) {
    e.alive = false; e.hp = 0; player.souls += e.boss ? 5 : 1; burst(e.x, e.z, e.boss ? '#d9b866' : '#b9d1c6', 24, 3);
    say(e.boss ? 'O GUARDIÃO CAIU · +5 ALMAS' : 'INIMIGO DERROTADO · +1 ALMA'); player.level = Math.min(3, player.level + 1);
    if (e.boss) { mode = 'victory'; showPanel(ui.victory); beep(700, .6); }
    updateHud();
  }
  function damageEnemy(e, amount) {
    if (!e.alive) return;
    e.hp -= amount; e.state = 'stagger'; e.timer = .35;
    burst(e.x, e.z, e.boss ? '#df7957' : '#ded4af', 8, 1.8);
    if (e.hp <= 0) kill(e);
  }
  function damagePlayer(amount) {
    if (player.invuln > 0 || mode !== 'play') return;
    player.hp = Math.max(0, player.hp - amount); player.invuln = .65; burst(player.x, player.z, '#c85047', 10, 1.6); beep(75, .16, 'sawtooth', .03);
    if (player.hp <= 0) { mode = 'death'; player.souls = Math.floor(player.souls / 2); showPanel(ui.death); }
  }
  function pointEnemy(e) { e.model.root.position.set(e.x, 0, e.z); e.model.root.rotation.y = e.face; }
  function update(dt) {
    if (toastTime > 0 && (toastTime -= dt) <= 0) ui.toast.classList.remove('show');
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.life -= dt; p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt; p.vy -= 3 * dt;
      if (p.life <= 0) { scene.remove(p.mesh); p.mesh.material.dispose(); particles.splice(i, 1); }
      else { p.mesh.position.set(p.x, p.y, p.z); p.mesh.material.opacity = Math.min(.9, p.life / p.max); }
    }
    shrineFlame.scale.setScalar(.85 + Math.sin(performance.now() * .008) * .16);
    shrineLight.intensity = shrineData.lit ? 3.4 + Math.sin(performance.now() * .006) * .6 : 0;
    if (mode !== 'play') return;
    player.cooldown = Math.max(0, player.cooldown - dt); player.invuln = Math.max(0, player.invuln - dt);
    player.casting = keys.has('f') || fireHeld;
    player.stamina = Math.min(player.maxStamina, player.stamina + 19 * dt);
    let mx = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + stick.x;
    let mz = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0) + stick.y;
    const mag = Math.hypot(mx, mz); if (mag > 1) { mx /= mag; mz /= mag; }
    const aim = enemies.filter(e => e.alive && distance(player, e) < 15).sort((a, b) => distance(player, a) - distance(player, b))[0];
    if (mag > .12) player.face = Math.atan2(mx, mz);
    if (player.roll > 0) { player.roll = Math.max(0, player.roll - dt); }
    else if (mag > .01 && player.attack <= 0) { const speed = player.casting ? 1.7 : 4.5; player.x += mx * speed * dt; player.z += mz * speed * dt; }
    player.x = clamp(player.x, -59, 59); player.z = clamp(player.z, -30, 30);
    if (player.attack > 0) {
      const previous = player.attack; player.attack = Math.max(0, player.attack - dt);
      if (previous > (player.heavy ? .40 : .25) && player.attack <= (player.heavy ? .40 : .25)) {
        const target = enemies.filter(e => e.alive && distance(player, e) < (player.heavy ? 3.4 : 2.65))
          .sort((a, b) => distance(player, a) - distance(player, b))[0];
        if (target) { const angle = Math.atan2(target.x - player.x, target.z - player.z); if (Math.abs(THREE.MathUtils.euclideanModulo(angle - player.face + Math.PI, Math.PI * 2) - Math.PI) < 1.25) damageEnemy(target, player.damage * (player.heavy ? 1.9 : 1)); }
      }
    }
    player.casting = keys.has('f') || fireHeld;
    if (player.casting && player.mana > 0) {
      player.mana = Math.max(0, player.mana - 22 * dt); player.fireTick -= dt;
      const reach = 1.5 + Math.random() * 4.2;
      const sx = player.x + Math.sin(player.face) * reach, sz = player.z + Math.cos(player.face) * reach;
      if (Math.random() < .9) burst(sx + (Math.random() - .5) * .45, sz + (Math.random() - .5) * .45, Math.random() > .35 ? '#ff8b32' : '#ffe08a', 1, .7);
      if (player.fireTick <= 0) {
        player.fireTick = .18;
        const target = enemies.filter(e => e.alive && distance(player, e) < 8).sort((a, b) => distance(player, a) - distance(player, b))[0];
        if (target) { const dx = target.x - player.x, dz = target.z - player.z, forward = (dx * Math.sin(player.face) + dz * Math.cos(player.face)) / (distance(player, target) || 1); if (forward > .55) damageEnemy(target, 5 + player.upgrades.flame * 1.5); }
      }
    } else if (player.mana < player.maxMana) player.mana = Math.min(player.maxMana, player.mana + 7 * dt);
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = distance(player, e); e.timer -= dt;
      if (e.state === 'stagger') { if (e.timer <= 0) e.state = 'idle'; pointEnemy(e); continue; }
      if (d < (e.boss ? 17 : 12)) {
        e.face = Math.atan2(player.x - e.x, player.z - e.z);
        if (e.state === 'idle' && d > (e.boss ? 3.2 : 2.1)) { e.x += Math.sin(e.face) * (e.boss ? 1.65 : 1.35) * dt; e.z += Math.cos(e.face) * (e.boss ? 1.65 : 1.35) * dt; }
        else if (e.state === 'idle') { e.state = 'windup'; e.timer = e.boss ? .86 : .68; burst(e.x, e.z, e.boss ? '#e46550' : '#dd9b58', 3, 1); }
        else if (e.state === 'windup' && e.timer <= 0) { e.state = 'attack'; e.timer = .35; if (d < (e.boss ? 4.1 : 2.8)) damagePlayer(e.boss ? 25 : 15); }
        else if (e.state === 'attack' && e.timer <= 0) { e.state = 'recover'; e.timer = e.boss ? 1.1 : .83; }
        else if (e.state === 'recover' && e.timer <= 0) e.state = 'idle';
      } else if (e.state !== 'idle') e.state = 'idle';
      pointEnemy(e);
    }
    heroModel.root.position.set(player.x, 0, player.z);
    heroModel.root.rotation.y = player.face;
    heroModel.rig.position.y = Math.sin(performance.now() * .006) * (mag > .1 ? .045 : .015);
    heroModel.sword.rotation.x = player.attack > 0 ? -.7 - Math.sin(player.attack * 9) * .8 : 0;
    heroModel.sword.rotation.z = player.attack > 0 ? .8 : 0;
    const camTarget = new THREE.Vector3(player.x, 0, player.z);
    const camPos = new THREE.Vector3(player.x + 1.5, 17.5, player.z + 23);
    camera.position.lerp(camPos, 1 - Math.pow(.001, dt)); camera.lookAt(camTarget);
    for (const e of enemies) { e.model.rig.position.y = e.state === 'windup' ? Math.sin(performance.now() * .025) * .06 : 0; e.model.sword.rotation.z = e.state === 'attack' ? .9 : 0; }
    updateHud();
  }
  function respawn() {
    player.x = shrineData.lit ? shrineData.x - 2.4 : -34;
    player.z = shrineData.lit ? shrineData.z : 0;
    player.hp = player.maxHp; player.stamina = player.maxStamina; player.mana = player.maxMana;
    player.flasks = 3; player.attack = 0; player.roll = 0; player.invuln = 1.2; player.cooldown = 0;
    for (const e of enemies) if (e.alive) { e.state = 'idle'; e.timer = 1; }
    mode = 'play'; hideOverlay(); last = performance.now(); updateHud(); say('VOCÊ RETORNA À VIGÍLIA');
  }
  function isTypingTarget(target) { return target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(target.tagName); }
  function keyDown(event) {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    keys.add(key);
    if (event.repeat) return;
    if (key === 'escape') { if (mode === 'play' || mode === 'pause') togglePause(); else if (mode === 'shrine') { mode = 'play'; hideOverlay(); } return; }
    if (key === 'e') { interact(); return; }
    if (key === 'j') { attack(false); return; }
    if (key === 'shift') { attack(true); return; }
    if (key === ' ') { dodge(); return; }
    if (key === 'q') heal();
  }
  function resize() {
    const width = Math.max(1, innerWidth), height = Math.max(1, innerHeight);
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  }
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => { keys.clear(); fireHeld = false; stick = { x: 0, y: 0 }; });
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', event => {
    if (mode !== 'play' || event.button !== 0) return;
    fireHeld = true; pointer = event.pointerId; canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointerup', event => { if (pointer === event.pointerId) { fireHeld = false; pointer = null; } });
  canvas.addEventListener('pointercancel', () => { fireHeld = false; pointer = null; });
  canvas.addEventListener('contextmenu', event => event.preventDefault());
  const stickZone = $('stick-zone'), stickKnob = $('stick-knob');
  stickZone.addEventListener('pointerdown', event => {
    event.preventDefault(); stickPointer = event.pointerId; stickZone.setPointerCapture(event.pointerId);
    moveStick(event);
  });
  function moveStick(event) {
    const rect = stickZone.getBoundingClientRect(), max = rect.width * .34;
    const dx = event.clientX - (rect.left + rect.width / 2), dy = event.clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(dx, dy), scale = len > max ? max / len : 1;
    stick = { x: dx * scale / max, y: dy * scale / max };
    stickKnob.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
  }
  stickZone.addEventListener('pointermove', event => { if (event.pointerId === stickPointer) moveStick(event); });
  function releaseStick(event) {
    if (event.pointerId !== stickPointer) return;
    stickPointer = null; stick = { x: 0, y: 0 }; stickKnob.style.transform = '';
  }
  stickZone.addEventListener('pointerup', releaseStick);
  stickZone.addEventListener('pointercancel', releaseStick);
  document.querySelectorAll('.touch-action').forEach(button => {
    const action = button.dataset.action;
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); button.setPointerCapture(event.pointerId);
      if (action === 'fire') fireHeld = true;
      if (action === 'attack') attack(false);
      if (action === 'dodge') dodge();
    });
    const release = () => { if (action === 'fire') fireHeld = false; };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  });
  $('begin-btn').addEventListener('click', start);
  $('resume-btn').addEventListener('click', togglePause);
  $('leave-shrine').addEventListener('click', () => { mode = 'play'; hideOverlay(); });
  $('rest-btn').addEventListener('click', rest);
  $('respawn-btn').addEventListener('click', respawn);
  $('continue-btn').addEventListener('click', () => { mode = 'play'; hideOverlay(); last = performance.now(); });
  $('flask-btn').addEventListener('click', heal);
  $('sound-btn').addEventListener('click', event => {
    soundOn = !soundOn; event.currentTarget.querySelector('span').textContent = soundOn ? 'SOM ON' : 'SOM OFF';
    if (soundOn) { beep(440, .08); if (audio?.state === 'suspended') audio.resume(); }
  });
  document.querySelectorAll('.upgrade-card').forEach(button => button.addEventListener('click', () => upgrade(button.dataset.upgrade)));
  updateHud();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, .05); last = now;
    update(dt); renderer.render(scene, camera); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

