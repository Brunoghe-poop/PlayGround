import * as THREE from 'three';
import './style.css';

const $ = (id) => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x656069);
scene.fog = new THREE.FogExp2(0x656069, 0.0125);
const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 180);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
const gl = renderer.getContext();
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
const rendererName = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
const softwareRenderer = /swiftshader|llvmpipe|software/i.test(rendererName);
const renderPixelRatio = () => softwareRenderer ? Math.min(devicePixelRatio, 0.8) : Math.min(devicePixelRatio, 1.5);
renderer.setPixelRatio(renderPixelRatio()); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = !softwareRenderer; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18;
$('game').appendChild(renderer.domElement);

const mat = (color, roughness = .9, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const stone = mat(0x45434a), stoneLight = mat(0x615d60), stoneDark = mat(0x302f35), earth = mat(0x403b3a), roadMat = mat(0x514b49), armor = mat(0x171b20, .42, .72), armorEdge = mat(0x46484a, .38, .78), leather = mat(0x382a23), cloth = mat(0x241d21), bone = mat(0xb9a997), enemyCloth = mat(0x453533), gold = mat(0x9c7951, .4, .65);
scene.add(new THREE.HemisphereLight(0xc9d2df, 0x30221c, 1.5));
const sun = new THREE.DirectionalLight(0xe4cbb0, 3.2); sun.position.set(-20, 32, 13); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -38; sun.shadow.camera.right = 38; sun.shadow.camera.top = 38; sun.shadow.camera.bottom = -38; sun.shadow.bias = -.00035; scene.add(sun);
const fill = new THREE.DirectionalLight(0x99a9c2, 1.05); fill.position.set(17, 15, -28); scene.add(fill);
const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), new THREE.MeshBasicMaterial({ color: 0xd7c9b8 })); moon.position.set(-28, 29, -85); scene.add(moon);

function box(parent, name, size, material, pos, rot) { const m = new THREE.Mesh(new THREE.BoxGeometry(...size), material); m.name = name; m.position.set(...pos); if (rot) m.rotation.set(...rot); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function sphere(parent, size, material, pos, seg = 12) { const m = new THREE.Mesh(new THREE.SphereGeometry(size, seg, Math.max(8, seg - 2)), material); m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function cylinder(parent, rt, rb, h, material, pos, seg = 8) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material); m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }

// A lonely road under a bruised, ash-filled sky.
const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), earth); ground.rotation.x = -Math.PI / 2; ground.position.y = -.12; ground.receiveShadow = true; scene.add(ground);
const road = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 120), roadMat); road.rotation.x = -Math.PI / 2; road.position.set(0, -.07, -37); road.receiveShadow = true; scene.add(road);
const rand = (a, b) => a + Math.random() * (b - a);
for (let i = 0; i < 42; i++) {
  const side = i % 2 ? 1 : -1, z = rand(-86, 20), x = side * rand(6.7, 24);
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rand(.28, 1.05), 0), i % 3 ? stoneDark : stone); rock.position.set(x, -.1 + rand(0, .24), z); rock.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3)); rock.scale.y = rand(.45, 1.2); rock.castShadow = true; rock.receiveShadow = true; scene.add(rock);
}
function deadTree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rand(-.4, .4); scene.add(g);
  cylinder(g, .25 * s, .42 * s, 3.2 * s, mat(0x302b2a), [0, 1.55 * s, 0], 6).rotation.z = -.12;
  for (const [y, lean, h] of [[1.5, -.8, 1.8], [2.05, .75, 1.55], [2.45, -.48, 1.15], [1.1, .55, 1]]) { const b = cylinder(g, .08 * s, .17 * s, h * s, mat(0x302b2a), [lean * s * .36, y * s, 0], 5); b.rotation.z = lean; }
}
for (let i = 0; i < 12; i++) deadTree((i % 2 ? 1 : -1) * rand(8, 20), rand(-58, 12), rand(.7, 1.35));

// The destination: a fortified city gate, visible long before it can be reached.
const wall = new THREE.Group(); wall.position.set(0, 0, -72); scene.add(wall);
box(wall, 'wall', [62, 12, 4], stone, [0, 5, -4]);
for (let x = -30; x <= 30; x += 3) box(wall, 'merlon', [1.1, 1.25, 4.2], stoneLight, [x, 11.45, -4]);
for (const x of [-25, -13, 13, 25]) {
  box(wall, 'tower', [6, 18, 7], stoneLight, [x, 8, -4.5]);
  box(wall, 'tower-cap', [7.4, .8, 8], stoneDark, [x, 17.4, -4.5]);
  for (let dx = -2.5; dx <= 2.5; dx += 1.25) box(wall, 'crenel', [.8, 1.2, 7], stoneLight, [x + dx, 18.4, -4.5]);
  for (let y = 5; y < 15; y += 3.3) { const win = box(wall, 'arrow-slit', [.5, 1.35, .08], stoneDark, [x, y, -.94]); }
}
// Gate recess, iron-bound doors and a welcoming strip of firelight.
box(wall, 'gate-shadow', [9.5, 8, .25], stoneDark, [0, 3.5, -1.88]);
box(wall, 'gate-left', [4.1, 7.4, .8], mat(0x31231f), [-2.05, 3.4, -1.45]); box(wall, 'gate-right', [4.1, 7.4, .8], mat(0x31231f), [2.05, 3.4, -1.45]);
for (let x = -4; x <= 4; x += 1.3) box(wall, 'door-iron', [.12, 7.1, 1], gold, [x, 3.4, -1.0]);
box(wall, 'arch-lintel', [12, 1.2, 6], stoneLight, [0, 8, -2]);
const gateGlow = new THREE.PointLight(0xd88035, 18, 22); gateGlow.position.set(0, 3.2, -69); scene.add(gateGlow);
function torch(x, z, y = 3.7) { const t = new THREE.Group(); t.position.set(x, y, z); scene.add(t); cylinder(t, .09, .12, .8, leather, [0, 0, 0], 7); const flame = new THREE.Mesh(new THREE.ConeGeometry(.19, .62, 7), new THREE.MeshBasicMaterial({ color: 0xff9a43 })); flame.position.y = .55; t.add(flame); const l = new THREE.PointLight(0xff8a36, 7, 10); l.position.y = .7; t.add(l); return { flame, l }; }
const torches = [torch(-5, -70), torch(5, -70), torch(-27, -68, 6), torch(27, -68, 6)];

// Character kit: individually articulated plates, cape and a long steel blade.
const player = new THREE.Group(); player.position.set(0, 0, 13); scene.add(player);
const rig = new THREE.Group(); player.add(rig);
const torso = new THREE.Group(); torso.position.y = 1.15; rig.add(torso);
box(torso, 'cuirass', [.76, .9, .43], armor, [0, .26, 0]); box(torso, 'breastplate', [.58, .48, .12], armorEdge, [0, .36, -.255]); box(torso, 'belt', [.82, .13, .48], leather, [0, -.18, 0]); box(torso, 'belt-buckle', [.16, .15, .06], gold, [0, -.18, -.26]);
for (const x of [-.47, .47]) { sphere(torso, .24, armorEdge, [x, .57, 0]); box(torso, 'pauldron', [.4, .22, .43], armor, [x * 1.05, .62, 0], [0, 0, x < 0 ? -.14 : .14]); cylinder(torso, .13, .16, .52, armor, [x * 1.06, .16, 0], 8); box(torso, 'gauntlet', [.2, .22, .23], armorEdge, [x * 1.06, -.07, 0]); }
const helmet = new THREE.Group(); helmet.position.set(0, 2.12, 0); rig.add(helmet); sphere(helmet, .31, armor, [0, .08, 0]);
const helm = new THREE.Mesh(new THREE.ConeGeometry(.34, .48, 5), armor); helm.position.y = .38; helm.rotation.y = Math.PI / 5; helm.castShadow = true; helmet.add(helm);
box(helmet, 'visor', [.39, .13, .24], armorEdge, [0, .05, -.17]); box(helmet, 'visor-shadow', [.27, .035, .035], mat(0x11151a), [0, .05, -.305]);
for (const x of [-.12, .12]) { const eye = new THREE.Mesh(new THREE.BoxGeometry(.035, .025, .02), new THREE.MeshBasicMaterial({ color: 0xe7a25b })); eye.position.set(x, .07, -.33); helmet.add(eye); }
const cape = new THREE.Mesh(new THREE.ConeGeometry(.62, 1.35, 5, 1, true), cloth); cape.position.set(0, .43, .32); cape.rotation.x = -.3; cape.castShadow = true; torso.add(cape);
const hips = new THREE.Group(); hips.position.y = .58; rig.add(hips);
const legs = [];
for (const x of [-.22, .22]) { const leg = new THREE.Group(); leg.position.set(x, 0, 0); hips.add(leg); box(leg, 'thigh', [.3, .46, .32], armor, [0, -.2, 0]); box(leg, 'knee', [.34, .18, .35], armorEdge, [0, -.43, -.025]); box(leg, 'greave', [.29, .45, .32], armor, [0, -.68, -.015]); box(leg, 'boot', [.32, .16, .48], leather, [0, -.91, -.08]); legs.push(leg); }
const swordArm = new THREE.Group(); swordArm.position.set(.56, 1.67, 0); rig.add(swordArm); cylinder(swordArm, .13, .16, .56, armor, [0, -.25, 0], 8).rotation.z = -.18; sphere(swordArm, .15, armorEdge, [0, -.55, -.04]);
const sword = new THREE.Group(); sword.position.set(.04, -.58, -.12); swordArm.add(sword);
box(sword, 'grip', [.09, .44, .09], leather, [0, -.16, 0]); box(sword, 'pommel', [.15, .14, .14], gold, [0, -.4, 0]); box(sword, 'crossguard', [.68, .11, .13], armorEdge, [0, .11, 0]);
const blade = new THREE.Mesh(new THREE.BoxGeometry(.24, 1.38, .065), armorEdge); blade.position.y = .84; blade.castShadow = true; sword.add(blade); const fuller = new THREE.Mesh(new THREE.BoxGeometry(.045, 1.18, .01), mat(0x858586, .35, .8)); fuller.position.set(0, .86, -.039); sword.add(fuller);
const offArm = new THREE.Group(); offArm.position.set(-.56, 1.65, 0); rig.add(offArm); cylinder(offArm, .13, .15, .54, armor, [0, -.25, 0], 8);

// Hostile dead: deliberate, readable silhouettes rather than imported placeholders.
const enemies = [];
function makeEnemy(x, z, kind = 'hollow') {
  const root = new THREE.Group(); root.position.set(x, 0, z); scene.add(root);
  const body = new THREE.Group(); root.add(body);
  const wrap = kind === 'wraith' ? mat(0x302c39) : enemyCloth;
  cylinder(body, .26, .32, .82, wrap, [0, 1.05, 0], 7); box(body, 'ribcage', [.48, .54, .18], bone, [0, 1.22, -.2]);
  for (let i = 0; i < 3; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(.24 - i * .025, .035, 5, 9, Math.PI), bone); rib.rotation.x = Math.PI / 2; rib.position.set(0, 1.35 - i * .13, -.23); body.add(rib); }
  sphere(body, .25, bone, [0, 1.83, 0]); box(body, 'jaw', [.27, .12, .23], stoneDark, [0, 1.7, -.1]);
  for (const x1 of [-.09, .09]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff6a38 })); e.position.set(x1, 1.86, -.216); body.add(e); }
  const limbs = [];
  for (const side of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(side * .31, 1.43, 0); body.add(arm); cylinder(arm, .07, .095, .55, bone, [side * .08, -.25, 0], 6).rotation.z = side * -.14; sphere(arm, .12, bone, [side * .16, -.56, -.03]); limbs.push(arm); const leg = new THREE.Group(); leg.position.set(side * .14, .7, 0); body.add(leg); cylinder(leg, .08, .11, .65, bone, [0, -.3, 0], 6); limbs.push(leg); }
  const weapon = new THREE.Group(); weapon.position.set(.47, .7, -.09); body.add(weapon); box(weapon, 'rusted-blade', [.1, 1.08, .07], mat(0x69605b, .7, .4), [0, -.28, 0]); box(weapon, 'rust-guard', [.38, .08, .1], stoneDark, [0, .28, 0]);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6a27, transparent: true, opacity: 0 }); const burn = new THREE.Group(); root.add(burn);
  for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(rand(.07, .16), rand(.45, .8), 5), flameMat.clone()); f.position.set(rand(-.3, .3), rand(.6, 1.8), rand(-.2, .2)); f.userData.phase = rand(0, 6); burn.add(f); }
  const light = new THREE.PointLight(0xff5d20, 0, 5); light.position.y = 1.2; root.add(light);
  const enemy = { root, body, limbs, weapon, burn, light, health: kind === 'wraith' ? 100 : 70, burning: 0, attack: rand(1.2, 2.8), hit: 0, speed: kind === 'wraith' ? 1.5 : 1.15, kind, dead: false, phase: rand(0, 8) };
  enemies.push(enemy); return enemy;
}
makeEnemy(-2.8, -8); makeEnemy(3.2, -24); makeEnemy(-1.9, -38, 'wraith');

// Small procedural ambience: low embers drift in the air; the gate burns warmly ahead.
const embers = [];
const emberMat = new THREE.MeshBasicMaterial({ color: 0xe7a25b, transparent: true, opacity: .8 });
for (let i = 0; i < 75; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(rand(.012, .04), 5, 4), emberMat); p.position.set(rand(-20, 20), rand(.2, 7), rand(-80, 17)); scene.add(p); embers.push({ mesh: p, speed: rand(.15, .65), phase: rand(0, 6) }); }

const keys = new Set(), touchKeys = new Set();
const playerState = { health: 100, stamina: 100, mana: 60, speed: 0, facing: 0, action: '', actionTime: 0, invuln: 0, attackCooldown: 0, fireCooldown: 0, lock: false, started: false, won: false, sound: true, steps: 0 };
const projectiles = [];
let camYaw = 0, camPitch = .2, dragging = false, pointer = { x: 0, y: 0 }, messageTimer = 0, toastTimer = 0, audioCtx = null;
const forwardVec = new THREE.Vector3();
function say(text, duration = 2.4) { $('message-copy').textContent = text; $('center-message').classList.add('visible'); messageTimer = duration; }
function toast(text, duration = 2) { $('toast').textContent = text; $('toast').classList.add('visible'); toastTimer = duration; }
function sound(freq = 180, duration = .12, type = 'triangle', volume = .035) { if (!playerState.sound) return; try { audioCtx ??= new AudioContext(); const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, audioCtx.currentTime); o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * .55), audioCtx.currentTime + duration); g.gain.setValueAtTime(volume, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration); o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + duration); } catch {} }
function beginAttack() { if (!playerState.started || playerState.won || playerState.attackCooldown > 0 || playerState.action === 'dodge') return; playerState.action = 'attack'; playerState.actionTime = 0; playerState.attackCooldown = .72; sound(135, .23, 'sawtooth', .025); }
function castFire() {
  if (!playerState.started || playerState.won || playerState.fireCooldown > 0 || playerState.mana < 20 || playerState.action === 'dodge') { if (playerState.mana < 20) toast('MAGIA INSUFICIENTE'); return; }
  playerState.mana -= 20; playerState.fireCooldown = .8; playerState.action = 'cast'; playerState.actionTime = 0; sound(310, .26, 'sine', .045);
  const dir = new THREE.Vector3(Math.sin(playerState.facing), 0, -Math.cos(playerState.facing));
  if (playerState.lock && targetEnemy && !targetEnemy.dead) { dir.set(targetEnemy.root.position.x - player.position.x, 0, targetEnemy.root.position.z - player.position.z).normalize(); playerState.facing = Math.atan2(dir.x, -dir.z); }
  const orb = new THREE.Group(); const core = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe6a3 })); orb.add(core);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(.39, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff6929, transparent: true, opacity: .58 })); orb.add(shell);
  const light = new THREE.PointLight(0xff782b, 5, 9); orb.add(light); orb.position.set(player.position.x + dir.x * .8, 1.65, player.position.z + dir.z * .8); scene.add(orb);
  projectiles.push({ mesh: orb, dir, life: 3.2, speed: 15 });
}
function dodge() { if (!playerState.started || playerState.won || playerState.stamina < 27 || playerState.action === 'dodge') return; playerState.action = 'dodge'; playerState.actionTime = 0; playerState.stamina -= 27; playerState.invuln = .56; sound(95, .18, 'triangle', .025); }
let targetEnemy = null;
function nearestEnemy() { let best = null, dmin = 18; for (const e of enemies) if (!e.dead) { const d = e.root.position.distanceTo(player.position); if (d < dmin) { dmin = d; best = e; } } return best; }
function damageEnemy(e, amount, fire = false) {
  if (e.dead) return; e.health -= amount; e.hit = .18; sound(fire ? 290 : 90, .15, fire ? 'sine' : 'square', .025);
  e.body.traverse(o => { if (o.isMesh && o.material && o.material.emissive) { o.material.emissive.setHex(0x5b2014); } });
  if (fire) { e.burning = 60; toast('ALVO EM CHAMAS · 01:00', 2.4); $('fire-hint').classList.add('visible'); }
  if (e.health <= 0) { e.dead = true; e.root.userData.fade = 1; toast('UM MORTO VOLTA AO SILÊNCIO', 2); if (targetEnemy === e) targetEnemy = null; }
}
function resolveMelee() {
  const facing = new THREE.Vector3(Math.sin(playerState.facing), 0, -Math.cos(playerState.facing));
  let hit = false;
  for (const e of enemies) if (!e.dead) { const delta = e.root.position.clone().sub(player.position); const d = delta.length(); delta.normalize(); if (d < 3.05 && facing.dot(delta) > .12) { damageEnemy(e, 48); hit = true; } }
  if (hit) { player.position.addScaledVector(facing, -.16); }
}
function hurtPlayer(amount) { if (playerState.invuln > 0 || playerState.won) return; playerState.health = Math.max(0, playerState.health - amount); playerState.invuln = .62; $('combat-flash').classList.add('hit'); setTimeout(() => $('combat-flash').classList.remove('hit'), 190); sound(72, .24, 'sawtooth', .05); if (playerState.health <= 0) { playerState.health = 100; playerState.stamina = 100; playerState.mana = 60; player.position.set(0, 0, 13); enemies.forEach(e => { e.health = e.kind === 'wraith' ? 100 : 70; e.dead = false; e.burning = 0; e.root.visible = true; e.root.scale.setScalar(1); e.root.position.y = 0; e.root.userData.fade = 1; e.light.intensity = 0; e.burn.children.forEach(f => f.material.opacity = 0); }); say('AS CINZAS O TRAZEM DE VOLTA', 2.5); } }

let lastTime = performance.now();
let lastRenderTime = lastTime;
function update(dt, time) {
  if (!playerState.started) { camera.position.set(8.7, 5.2, 22); camera.lookAt(0, 1.2, -15); renderer.render(scene, camera); requestAnimationFrame(loop); return; }
  // Preserve real-time movement on software renderers while keeping long tab stalls stable.
  dt = Math.min(dt, .12);
  playerState.invuln = Math.max(0, playerState.invuln - dt); playerState.attackCooldown = Math.max(0, playerState.attackCooldown - dt); playerState.fireCooldown = Math.max(0, playerState.fireCooldown - dt);
  if (messageTimer > 0 && (messageTimer -= dt) <= 0) $('center-message').classList.remove('visible'); if (toastTimer > 0 && (toastTimer -= dt) <= 0) $('toast').classList.remove('visible');
  if (playerState.lock) { if (!targetEnemy || targetEnemy.dead) targetEnemy = nearestEnemy(); if (targetEnemy && !targetEnemy.dead) { const d = targetEnemy.root.position.clone().sub(player.position); playerState.facing = Math.atan2(d.x, -d.z); $('target-label').classList.add('visible'); } else $('target-label').classList.remove('visible'); }
  const moveX = (keys.has('d') || touchKeys.has('right') ? 1 : 0) - (keys.has('a') || touchKeys.has('left') ? 1 : 0);
  const moveZ = (keys.has('s') || touchKeys.has('back') ? 1 : 0) - (keys.has('w') || touchKeys.has('forward') ? 1 : 0);
  const moving = Math.hypot(moveX, moveZ) > .1 && !playerState.won;
  const forward = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw)), right = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));
  let dir = forward.multiplyScalar(-moveZ).add(right.multiplyScalar(moveX)); if (dir.lengthSq() > .001) dir.normalize();
  let desiredSpeed = moving ? (keys.has('shift') ? 5.1 : 3.6) : 0;
  if (playerState.action === 'dodge') desiredSpeed = 8.5;
  playerState.speed = THREE.MathUtils.damp(playerState.speed, desiredSpeed, moving || playerState.action === 'dodge' ? 8 : 10, dt);
  if (moving && playerState.action !== 'dodge' && !playerState.lock) playerState.facing = THREE.MathUtils.damp(playerState.facing, Math.atan2(dir.x, -dir.z), 9, dt);
  if (playerState.action === 'dodge') { dir.set(Math.sin(playerState.facing), 0, -Math.cos(playerState.facing)); if (playerState.actionTime === 0) { const moveDir = moving ? forward.clone().multiplyScalar(-moveZ).add(right.clone().multiplyScalar(moveX)).normalize() : dir.clone(); if (moveDir.lengthSq() > .01) dir.copy(moveDir); } }
  const actionLocked = ['attack', 'cast'].includes(playerState.action) && playerState.actionTime < .4;
  if ((moving || playerState.action === 'dodge') && !actionLocked) { player.position.addScaledVector(dir, playerState.speed * dt); player.position.x = THREE.MathUtils.clamp(player.position.x, -5.3, 5.3); player.position.z = THREE.MathUtils.clamp(player.position.z, -68, 17); }
  playerState.actionTime += dt;
  if (playerState.action === 'attack') { const t = playerState.actionTime; swordArm.rotation.x = t < .2 ? -1.5 * (t / .2) : t < .45 ? -1.5 + 2.8 * ((t - .2) / .25) : 1.3 * (1 - (t - .45) / .35); swordArm.rotation.z = t > .2 && t < .48 ? -.7 : 0; if (t >= .22 && t - dt < .28 && !playerState.didHit) { resolveMelee(); playerState.didHit = true; } if (t > .82) { playerState.action = ''; playerState.didHit = false; } }
  else if (playerState.action === 'cast') { swordArm.rotation.x = -.35; offArm.rotation.x = playerState.actionTime < .25 ? -.8 : .25; if (playerState.actionTime > .5) { playerState.action = ''; swordArm.rotation.x = 0; offArm.rotation.x = 0; } }
  else if (playerState.action === 'dodge') { rig.rotation.x = .55 * Math.sin(Math.PI * Math.min(1, playerState.actionTime / .5)); if (playerState.actionTime > .55) { playerState.action = ''; rig.rotation.x = 0; } }
  else { swordArm.rotation.x = THREE.MathUtils.damp(swordArm.rotation.x, 0, 8, dt); swordArm.rotation.z = THREE.MathUtils.damp(swordArm.rotation.z, 0, 8, dt); offArm.rotation.x = THREE.MathUtils.damp(offArm.rotation.x, 0, 8, dt); }
  player.rotation.y = playerState.facing;
  const stride = moving && !actionLocked ? Math.sin(time * 9) * Math.min(1, playerState.speed / 3.5) : 0;
  legs[0].rotation.x = stride; legs[1].rotation.x = -stride; torso.rotation.z = moving ? Math.sin(time * 4.5) * .035 : 0; torso.position.y = 1.15 + (moving ? Math.abs(Math.sin(time * 9)) * .045 : 0);
  cape.rotation.z = moving ? Math.sin(time * 5) * .1 : Math.sin(time * 2) * .025;
  if (playerState.action !== 'dodge') playerState.stamina = Math.min(100, playerState.stamina + dt * 17); playerState.mana = Math.min(60, playerState.mana + dt * 1.1);
  for (const e of enemies) {
    if (e.dead) { e.root.userData.fade = Math.max(0, (e.root.userData.fade ?? 1) - dt * .34); e.root.scale.setScalar(Math.max(.01, e.root.userData.fade)); e.root.position.y = -.1 * (1 - e.root.userData.fade); continue; }
    const delta = player.position.clone().sub(e.root.position); const d = delta.length();
    if (e.burning > 0) { e.burning = Math.max(0, e.burning - dt); e.light.intensity = 4 + Math.sin(time * 17) * 1.2; e.burn.children.forEach(f => { f.material.opacity = .58 + Math.sin(time * 12 + f.userData.phase) * .2; f.scale.y = .8 + Math.sin(time * 14 + f.userData.phase) * .35; f.position.y = .7 + Math.abs(Math.sin(time * 11 + f.userData.phase)) * 1.25; }); e.health -= dt * .75; if (Math.floor(e.burning) % 10 === 0 && Math.ceil(e.burning) !== Math.ceil(e.burning + dt)) toast(`CHAMAS · 00:${String(Math.ceil(e.burning)).padStart(2, '0')}`, 1); if (e.burning === 0) { e.light.intensity = 0; e.burn.children.forEach(f => f.material.opacity = 0); $('fire-hint').classList.remove('visible'); } if (e.health <= 0) { damageEnemy(e, 100); continue; } }
    else e.light.intensity = 0;
    if (e.hit > 0) { e.hit -= dt; e.body.position.y = Math.sin((.18 - e.hit) * 45) * .06; } else e.body.position.y = 0;
    if (d < 12 && d > 1.7 && !playerState.won) { delta.normalize(); e.root.position.addScaledVector(delta, e.speed * dt); e.root.rotation.y = Math.atan2(-delta.x, delta.z); }
    if (d < 2.15 && !playerState.won) { e.attack -= dt; if (e.attack <= 0) { e.attack = rand(1.7, 2.7); e.weapon.rotation.z = -1.3; setTimeout(() => { e.weapon.rotation.z = 0; }, 250); hurtPlayer(e.kind === 'wraith' ? 18 : 13); } }
    const strideEnemy = Math.sin(time * 6 + e.phase) * (d < 12 && d > 1.8 ? .5 : .08); e.limbs[0].rotation.x = strideEnemy; e.limbs[1].rotation.x = -strideEnemy; e.limbs[2].rotation.x = -strideEnemy; e.limbs[3].rotation.x = strideEnemy;
  }
  for (let i = projectiles.length - 1; i >= 0; i--) { const p = projectiles[i]; p.life -= dt; p.mesh.position.addScaledVector(p.dir, p.speed * dt); p.mesh.rotation.x += dt * 3; p.mesh.rotation.z += dt * 2; let hit = null; for (const e of enemies) if (!e.dead && p.mesh.position.distanceTo(new THREE.Vector3(e.root.position.x, 1, e.root.position.z)) < .95) { hit = e; break; } if (hit) { damageEnemy(hit, 18, true); scene.remove(p.mesh); projectiles.splice(i, 1); } else if (p.life <= 0 || p.mesh.position.z < -74 || Math.abs(p.mesh.position.x) > 20) { scene.remove(p.mesh); projectiles.splice(i, 1); } }
  for (const ember of embers) { ember.mesh.position.y += dt * ember.speed; ember.mesh.position.x += Math.sin(time + ember.phase) * dt * .12; if (ember.mesh.position.y > 8) { ember.mesh.position.y = .2; ember.mesh.position.z = rand(-80, 17); } }
  torches.forEach((t, i) => { t.flame.scale.y = .85 + Math.sin(time * 11 + i) * .18; t.l.intensity = 6 + Math.sin(time * 9 + i * 2) * 1.3; });
  const camDistance = 7.3; const target = new THREE.Vector3(player.position.x, player.position.y + 1.55, player.position.z);
  const desiredCam = new THREE.Vector3(player.position.x + Math.sin(camYaw) * camDistance, player.position.y + 3.2 + camPitch * 3, player.position.z + Math.cos(camYaw) * camDistance);
  camera.position.lerp(desiredCam, 1 - Math.exp(-7 * dt)); camera.lookAt(target);
  const dist = Math.max(0, Math.round(player.position.z + 72)); const progress = THREE.MathUtils.clamp((13 - player.position.z) / 85, 0, 1);
  $('distance-value').textContent = `${dist} m`; $('quest-progress').style.width = `${Math.max(3, progress * 100)}%`; $('location-name').textContent = player.position.z < -50 ? 'PORTÕES DE VALE SOMBRIO' : player.position.z < -16 ? 'ESTRADA DOS CAÍDOS' : 'CHARNECA DAS CINZAS'; $('world-coords').textContent = `${Math.abs(player.position.x).toFixed(0)} · ${Math.abs(player.position.z).toFixed(0)}`;
  $('health-fill').style.width = `${playerState.health}%`; $('stamina-fill').style.width = `${playerState.stamina}%`; $('mana-fill').style.width = `${playerState.mana / 60 * 100}%`; $('health-value').textContent = Math.ceil(playerState.health); $('stamina-value').textContent = Math.ceil(playerState.stamina); $('mana-value').textContent = Math.ceil(playerState.mana);
  if (player.position.z < -67 && !playerState.won) { playerState.won = true; $('ending').classList.remove('hidden'); }
  renderer.render(scene, camera);
}
function loop(now) { if (softwareRenderer && now - lastRenderTime < 1000 / 30) { requestAnimationFrame(loop); return; } const dt = (now - lastTime) / 1000; lastTime = now; lastRenderTime = now; update(dt, now / 1000); requestAnimationFrame(loop); }
requestAnimationFrame(loop);

$('begin-button').addEventListener('click', () => { playerState.started = true; $('intro').classList.add('hidden'); $('boss-warning').classList.add('visible'); say('ATRAVESSE A ESTRADA. ENCONTRE ABRIGO.', 3); audioCtx?.resume(); });
$('continue-button').addEventListener('click', () => location.reload());
$('sound-toggle').addEventListener('click', () => { playerState.sound = !playerState.sound; $('sound-toggle').innerHTML = `${playerState.sound ? '♫' : '♪'} <span>${playerState.sound ? 'SOM' : 'MUDO'}</span>`; if (playerState.sound) sound(440, .13); });
window.addEventListener('keydown', e => { const key = e.key.toLowerCase(); if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault(); keys.add(key); if (key === ' ' || key === 'shift' && e.repeat === false) { if (key === ' ') dodge(); } if (key === 'f' && !e.repeat) castFire(); if (key === 'tab' && !e.repeat) { e.preventDefault(); playerState.lock = !playerState.lock; targetEnemy = nearestEnemy(); $('target-label').classList.toggle('visible', playerState.lock && !!targetEnemy); toast(playerState.lock ? 'ALVO FIXADO' : 'ALVO LIBERADO', 1); } if (key === 'e' && !e.repeat) beginAttack(); });
window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
renderer.domElement.addEventListener('pointerdown', e => { pointer.x = e.clientX; pointer.y = e.clientY; if (e.button === 1 || (e.button === 0 && e.altKey)) { dragging = true; renderer.domElement.setPointerCapture(e.pointerId); } else if (e.button === 0) beginAttack(); else if (e.button === 2) castFire(); });
renderer.domElement.addEventListener('pointermove', e => { if (!dragging) return; camYaw -= (e.clientX - pointer.x) * .006; camPitch = THREE.MathUtils.clamp(camPitch + (e.clientY - pointer.y) * .003, -.25, .65); pointer.x = e.clientX; pointer.y = e.clientY; });
renderer.domElement.addEventListener('pointerup', () => { dragging = false; });
renderer.domElement.addEventListener('wheel', e => { camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * .018, 42, 68); camera.updateProjectionMatrix(); }, { passive: true });
for (const button of document.querySelectorAll('[data-move]')) { const move = button.dataset.move; button.addEventListener('pointerdown', e => { e.preventDefault(); touchKeys.add(move); button.setPointerCapture(e.pointerId); }); for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(ev, () => touchKeys.delete(move)); }
for (const button of document.querySelectorAll('[data-action]')) { button.addEventListener('pointerdown', e => { e.preventDefault(); const action = button.dataset.action; if (action === 'attack') beginAttack(); if (action === 'fire') castFire(); if (action === 'dodge') dodge(); }); }
window.addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setPixelRatio(renderPixelRatio()); renderer.setSize(innerWidth, innerHeight); });
