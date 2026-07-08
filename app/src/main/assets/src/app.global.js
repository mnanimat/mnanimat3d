(() => {
const THREE = window.THREE; const { OrbitControls } = window;

const app = document.querySelector("#app");
const canvas = document.querySelector("#viewportCanvas");
const previewCanvas = document.querySelector("#previewCanvas");
const toolList = document.querySelector("#toolList");
const contextBar = document.querySelector("#contextBar");
const outliner = document.querySelector("#outliner");
const propertiesPanel = document.querySelector("#propertiesPanel");
const propertiesTitle = document.querySelector("#propertiesTitle");
const workspaceTitle = document.querySelector("#workspaceTitle");
const workspaceKicker = document.querySelector("#workspaceKicker");
const viewName = document.querySelector("#viewName");
const viewStats = document.querySelector("#viewStats");
const sceneStats = document.querySelector("#sceneStats");
const selectionStatus = document.querySelector("#selectionStatus");
const hintStatus = document.querySelector("#hintStatus");
const frameSlider = document.querySelector("#frameSlider");
const frameReadout = document.querySelector("#frameReadout");
const playButton = document.querySelector("#playButton");
const sculptCursor = document.querySelector("#sculptCursor");
const nodeOverlay = document.querySelector("#nodeOverlay");
const startOverlay = document.querySelector("#startOverlay");
const projectDialog = document.querySelector("#projectDialog");
const prefsDialog = document.querySelector("#prefsDialog");
const prefsContent = document.querySelector("#prefsContent");
const toast = document.querySelector("#toast");
const fileInput = document.querySelector("#fileInput");
const keyRows = document.querySelector("#keyRows");

const state = {
  workspace: "modelagem",
  tool: "select",
  frame: 72,
  playing: false,
  selected: null,
  selectedProjectType: "geral",
  prefPage: "interface",
  showGrid: true,
  showRig: false,
  shadeMode: "material",
  primitiveCount: 0,
  userObjects: [],
};

const workspaceData = {
  modelagem: {
    title: "Modelagem",
    kicker: "Oficina de malha",
    view: "Perspectiva de criação",
    stats: "Coleção | Personagem e cenário",
    tools: [
      ["select", "▣", "Selecionar"],
      ["move", "↕", "Mover"],
      ["rotate", "⟳", "Rotacionar"],
      ["scale", "□", "Escalar"],
      ["knife", "╱", "Cortar"],
      ["loop", "⌁", "Loop"],
      ["measure", "⌞", "Medir"],
    ],
    context: [
      ["select", "Modo Objeto", ["Modo Objeto", "Editar Malha", "Vertex Paint"]],
      ["button", "Adicionar cubo", "cube"],
      ["button", "Adicionar esfera", "sphere"],
      ["button", "Adicionar cilindro", "cylinder"],
      ["button", "Adicionar torus", "torus"],
      ["button", "Espelhar", "mirror"],
    ],
  },
  escultura: {
    title: "Escultura",
    kicker: "Oficina de volume",
    view: "Vista de escultura",
    stats: "Busto | DynTopo ativo",
    tools: [
      ["draw", "●", "Desenhar"],
      ["smooth", "≈", "Suavizar"],
      ["pinch", "◇", "Pinçar"],
      ["inflate", "◯", "Inflar"],
      ["flatten", "▭", "Achatar"],
      ["mask", "◒", "Máscara"],
      ["pose", "⚯", "Pose"],
    ],
    context: [
      ["select", "Esculpir", ["Esculpir", "Pintura", "Máscara"]],
      ["range", "Raio", "brushRadius", 14, 90, 46],
      ["range", "Força", "brushStrength", 1, 100, 42],
      ["select", "Textura", ["Argila", "Ranhuras", "Poros"]],
      ["button", "Remalhar", "remesh"],
    ],
  },
  animacao: {
    title: "Animação",
    kicker: "Oficina de movimento",
    view: "Rig em pose",
    stats: "Coleção | Armature e controles",
    tools: [
      ["select", "▣", "Selecionar"],
      ["pose", "⚯", "Pose"],
      ["key", "◆", "Keyframe"],
      ["path", "⌁", "Trajetória"],
      ["camera", "▱", "Câmera"],
      ["audio", "♪", "Áudio"],
    ],
    context: [
      ["select", "Modo Pose", ["Modo Pose", "Dope Sheet", "Graph Editor"]],
      ["button", "Inserir key", "keyframe"],
      ["button", "Espelhar pose", "mirrorPose"],
      ["button", "Loop 2s", "loopAnimation"],
      ["select", "Interpolação", ["Bezier", "Linear", "Constante"]],
    ],
  },
  renderizacao: {
    title: "Renderização",
    kicker: "Oficina de imagem",
    view: "Câmera RenderView",
    stats: "Cena | Iluminação e passes",
    tools: [
      ["camera", "▱", "Câmera"],
      ["light", "✦", "Luz"],
      ["material", "◐", "Material"],
      ["region", "▧", "Região"],
      ["sample", "⋮", "Amostras"],
    ],
    context: [
      ["button", "Renderizar", "render"],
      ["select", "Motor", ["Forge RT", "Eevee Next", "Path Trace"]],
      ["select", "Câmera", ["RenderCam", "CloseCam", "WideCam"]],
      ["button", "Salvar imagem", "saveImage"],
      ["button", "Bloom", "bloom"],
    ],
  },
  composicao: {
    title: "Composição",
    kicker: "Oficina de nós",
    view: "Editor de composição",
    stats: "Cena | Render layers",
    tools: [
      ["select", "▣", "Selecionar"],
      ["node", "◇", "Nó"],
      ["wire", "⌁", "Conectar"],
      ["frame", "□", "Moldura"],
      ["mute", "◌", "Isolar"],
    ],
    context: [
      ["button", "Adicionar nó", "addNode"],
      ["button", "Auto layout", "autoLayout"],
      ["select", "Preview", ["Imagem final", "Albedo", "Profundidade"]],
      ["button", "Aplicar", "compose"],
    ],
  },
  scripts: {
    title: "Scripts",
    kicker: "Oficina técnica",
    view: "Console de automação",
    stats: "API | Cena ativa",
    tools: [
      ["select", "▣", "Selecionar"],
      ["run", "▶", "Executar"],
      ["record", "●", "Macro"],
      ["inspect", "⌕", "Inspecionar"],
      ["plugin", "▤", "Plugin"],
    ],
    context: [
      ["button", "Executar script", "runScript"],
      ["button", "Gerar operador", "operator"],
      ["select", "Linguagem", ["MN Script", "Python", "JavaScript"]],
      ["button", "Abrir addons", "addons"],
    ],
  },
};

const trackedObjects = [];
const sceneItems = [
  { id: "camera", label: "Câmera RenderView", type: "camera" },
  { id: "key", label: "Luz Chave", type: "light" },
  { id: "fill", label: "Luz de Preenchimento", type: "light" },
  { id: "character", label: "Personagem MN", type: "mesh" },
  { id: "rig", label: "Controles do Rig", type: "rig" },
  { id: "stage", label: "Base de Pedra", type: "mesh" },
  { id: "house", label: "Casa de Teste", type: "mesh" },
  { id: "bust", label: "Busto de Escultura", type: "mesh" },
  { id: "room", label: "Ateliê Render", type: "mesh" },
];

let renderer;
let scene;
let camera;
let controls;
let grid;
let selectionBox;
let raycaster;
let pointer;
let clock;
let statsTimer = 0;
let previewRenderer;
let previewScene;
let previewCamera;
let previewModel;

const groups = {};
const characterParts = {};

initMainScene();
initPreviewScene();
bindUI();
setWorkspace("modelagem");
createKeyRows();
renderOutliner();
renderProperties();
renderPrefs();
applyLaunchParams();
resizeRenderers();
animate();

function initMainScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11161d);
  scene.fog = new THREE.Fog(0x11161d, 24, 62);

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 150);
  camera.position.set(7, 5.5, 9);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1.25, 0);
  controls.maxDistance = 38;
  controls.minDistance = 3;

  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const hemi = new THREE.HemisphereLight(0xa9c8ff, 0x2a1b12, 1.9);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(5, 8, 6);
  key.castShadow = false;
  scene.add(key);

  const fill = new THREE.PointLight(0x5aa6ff, 30, 18);
  fill.position.set(-5, 3.5, -3);
  scene.add(fill);

  grid = new THREE.GridHelper(42, 42, 0x34526a, 0x25313b);
  grid.position.y = -0.02;
  scene.add(grid);

  selectionBox = new THREE.BoxHelper(new THREE.Object3D(), 0x49a0ff);
  selectionBox.visible = false;
  scene.add(selectionBox);

  groups.stage = createStage();
  groups.character = createCharacter();
  groups.rig = createRigControls();
  groups.house = createHouse();
  groups.bust = createSculptBust();
  groups.room = createRenderRoom();

  scene.add(groups.stage, groups.character, groups.rig, groups.house, groups.bust, groups.room);
  groups.house.position.set(-4.7, 0, -2.2);
  groups.house.scale.setScalar(0.55);
  groups.bust.position.set(0, 0.1, 0);
  groups.room.position.set(0, 0, 0);

  canvas.addEventListener("pointerdown", selectFromViewport);
  canvas.addEventListener("pointermove", moveSculptCursor);
  window.addEventListener("resize", resizeRenderers);
}

function initPreviewScene() {
  previewRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, antialias: true, alpha: true });
  previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
  previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  previewRenderer.toneMappingExposure = 1.15;

  previewScene = new THREE.Scene();
  previewScene.background = new THREE.Color(0x0d141c);

  previewCamera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  previewCamera.position.set(4.2, 2.8, 6.6);
  previewCamera.lookAt(0, 1.2, 0);

  previewScene.add(new THREE.HemisphereLight(0xc7ddff, 0x201b18, 2.1));
  const rim = new THREE.DirectionalLight(0x56a8ff, 3);
  rim.position.set(-3, 5, 4);
  previewScene.add(rim);
  const warm = new THREE.PointLight(0xffa558, 20, 16);
  warm.position.set(3, 2.4, 3);
  previewScene.add(warm);

  previewModel = createCharacter();
  previewModel.scale.setScalar(0.92);
  previewScene.add(previewModel);
  const pedestal = createStage();
  pedestal.scale.setScalar(0.65);
  previewScene.add(pedestal);
}

function createStage() {
  const group = new THREE.Group();
  group.name = "Base de Pedra";

  const stone = new THREE.MeshStandardMaterial({
    color: 0x6a5a47,
    roughness: 0.82,
    metalness: 0.02,
  });
  const moss = new THREE.MeshStandardMaterial({ color: 0x59742a, roughness: 0.9 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.6, 0.45, 44), stone);
  base.position.y = 0.2;
  base.name = "Pedestal";
  group.add(base);

  for (let i = 0; i < 18; i += 1) {
    const angle = (i / 18) * Math.PI * 2;
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.36), stone.clone());
    block.material.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.07);
    block.position.set(Math.cos(angle) * 2.44, 0.38, Math.sin(angle) * 2.44);
    block.rotation.y = -angle;
    block.name = `Bloco ${i + 1}`;
    group.add(block);
  }

  for (let i = 0; i < 16; i += 1) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.55 + Math.random() * 0.4, 5), moss);
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.2 + Math.random() * 1.1;
    blade.position.set(Math.cos(angle) * radius, 0.66, Math.sin(angle) * radius);
    blade.rotation.z = (Math.random() - 0.5) * 0.55;
    blade.rotation.x = (Math.random() - 0.5) * 0.4;
    blade.name = "Folhagem";
    group.add(blade);
  }

  trackedObjects.push(base);
  return group;
}

function createCharacter() {
  const group = new THREE.Group();
  group.name = "Personagem MN";

  const skin = new THREE.MeshStandardMaterial({ color: 0xd99565, roughness: 0.55 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x3b2115, roughness: 0.72 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0xe2c99b, roughness: 0.65 });
  const vest = new THREE.MeshStandardMaterial({ color: 0x5b3b28, roughness: 0.78 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x352b24, roughness: 0.8 });
  const scarf = new THREE.MeshStandardMaterial({ color: 0xb75032, roughness: 0.62 });
  const boot = new THREE.MeshStandardMaterial({ color: 0x271913, roughness: 0.72 });

  const hips = addMesh(group, new THREE.SphereGeometry(0.48, 32, 20), pants, [0, 1.12, 0], [1.05, 0.72, 0.72], "Quadril");
  const torso = addMesh(group, new THREE.CapsuleGeometry(0.46, 0.9, 12, 24), shirt, [0, 2.0, 0], [0.92, 1, 0.72], "Torso");
  torso.rotation.x = 0.08;
  addMesh(group, new THREE.BoxGeometry(0.78, 0.92, 0.18), vest, [0, 2.0, -0.28], [1, 1, 1], "Colete");

  const head = addMesh(group, new THREE.SphereGeometry(0.46, 36, 24), skin, [0, 2.86, 0.03], [0.9, 1.05, 0.86], "Cabeça");
  characterParts.head = head;

  const nose = addMesh(group, new THREE.ConeGeometry(0.085, 0.22, 12), skin, [0, 2.86, 0.43], [1, 1, 1], "Nariz");
  nose.rotation.x = Math.PI / 2;

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1010, roughness: 0.35 });
  addMesh(group, new THREE.SphereGeometry(0.045, 16, 10), eyeMat, [-0.16, 2.95, 0.43], [1, 1, 1], "Olho L");
  addMesh(group, new THREE.SphereGeometry(0.045, 16, 10), eyeMat, [0.16, 2.95, 0.43], [1, 1, 1], "Olho R");

  for (let i = 0; i < 14; i += 1) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.62, 8), hair);
    const angle = (i / 14) * Math.PI * 2;
    spike.position.set(Math.cos(angle) * 0.31, 3.26 + Math.sin(i) * 0.03, Math.sin(angle) * 0.26);
    spike.rotation.z = Math.cos(angle) * 0.8;
    spike.rotation.x = Math.sin(angle) * 0.95 + Math.PI * 0.08;
    spike.name = "Mecha";
    group.add(spike);
  }

  const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.075, 12, 42), scarf);
  scarfRing.position.set(0, 2.46, 0.02);
  scarfRing.rotation.x = Math.PI / 2;
  scarfRing.scale.set(1.1, 0.78, 1);
  scarfRing.name = "Lenço";
  group.add(scarfRing);

  characterParts.leftArm = limb(group, [-0.58, 2.18, 0], [-1.0, 1.65, 0.05], skin, "Braço L", 0.12);
  characterParts.rightArm = limb(group, [0.58, 2.18, 0], [1.02, 1.65, 0.02], skin, "Braço R", 0.12);
  characterParts.leftLeg = limb(group, [-0.28, 0.95, 0], [-0.42, 0.18, 0.04], pants, "Perna L", 0.16);
  characterParts.rightLeg = limb(group, [0.28, 0.95, 0], [0.42, 0.18, 0.04], pants, "Perna R", 0.16);

  addMesh(group, new THREE.BoxGeometry(0.38, 0.18, 0.68), boot, [-0.43, 0.03, 0.12], [1, 1, 1], "Bota L");
  addMesh(group, new THREE.BoxGeometry(0.38, 0.18, 0.68), boot, [0.43, 0.03, 0.12], [1, 1, 1], "Bota R");

  const belt = addMesh(group, new THREE.TorusGeometry(0.48, 0.035, 8, 36), boot, [0, 1.42, 0.01], [1.1, 0.74, 0.22], "Cinto");
  belt.rotation.x = Math.PI / 2;

  group.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = false;
      node.receiveShadow = true;
      node.userData.selectable = true;
      trackedObjects.push(node);
    }
  });

  return group;
}

function limb(parent, start, end, material, name, radius) {
  const group = new THREE.Group();
  group.name = name;
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const mid = startVec.clone().lerp(endVec, 0.5);
  const length = startVec.distanceTo(endVec);
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 10, 18), material);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), endVec.clone().sub(startVec).normalize());
  mesh.name = `${name} Malha`;
  group.add(mesh);
  parent.add(group);
  return group;
}

function createRigControls() {
  const group = new THREE.Group();
  group.name = "Controles do Rig";
  const yellow = new THREE.LineBasicMaterial({ color: 0xf2c84b });
  const blue = new THREE.LineBasicMaterial({ color: 0x3e8cff });
  const green = new THREE.LineBasicMaterial({ color: 0x6fd47d });

  [
    [0, 1.42, 0, 0.72, yellow, "Controle Quadril"],
    [0, 2.5, 0, 0.62, yellow, "Controle Peito"],
    [-1.05, 1.56, 0, 0.28, blue, "Controle Mão L"],
    [1.05, 1.56, 0, 0.28, blue, "Controle Mão R"],
    [-0.42, 0.18, 0.05, 0.34, green, "Controle Pé L"],
    [0.42, 0.18, 0.05, 0.34, green, "Controle Pé R"],
  ].forEach(([x, y, z, r, mat, name]) => {
    const line = circleLine(r, mat);
    line.position.set(x, y, z);
    line.rotation.x = Math.PI / 2;
    line.name = name;
    group.add(line);
  });

  return group;
}

function createHouse() {
  const group = new THREE.Group();
  group.name = "Casa de Teste";
  const wall = new THREE.MeshStandardMaterial({ color: 0xa7a8a2, roughness: 0.83 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x49525c, roughness: 0.76 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xd5d4ca, roughness: 0.65 });
  const glow = new THREE.MeshStandardMaterial({ color: 0xffc066, emissive: 0xff8f28, emissiveIntensity: 0.8 });

  addMesh(group, new THREE.BoxGeometry(3, 1.75, 2.5), wall, [0, 0.92, 0], [1, 1, 1], "Corpo Casa");
  const roofMesh = addMesh(group, new THREE.ConeGeometry(2.25, 1.0, 4), roof, [0, 2.1, 0], [1, 0.62, 0.82], "Telhado");
  roofMesh.rotation.y = Math.PI / 4;
  addMesh(group, new THREE.BoxGeometry(0.42, 0.72, 0.1), glow, [-0.75, 0.95, 1.28], [1, 1, 1], "Janela L");
  addMesh(group, new THREE.BoxGeometry(0.42, 0.72, 0.1), glow, [0.75, 0.95, 1.28], [1, 1, 1], "Janela R");
  addMesh(group, new THREE.BoxGeometry(0.56, 1.05, 0.12), trim, [0, 0.68, 1.3], [1, 1, 1], "Porta");
  addMesh(group, new THREE.BoxGeometry(0.36, 0.92, 0.36), trim, [0.7, 2.55, -0.2], [1, 1, 1], "Chaminé");
  return group;
}

function createSculptBust() {
  const group = new THREE.Group();
  group.name = "Busto de Escultura";
  const clay = new THREE.MeshStandardMaterial({
    color: 0x85827c,
    roughness: 0.72,
    metalness: 0.0,
  });

  addMesh(group, new THREE.SphereGeometry(0.85, 48, 32), clay, [0, 2.1, 0], [0.82, 1.08, 0.88], "Cabeça Esculpida");
  addMesh(group, new THREE.CapsuleGeometry(0.68, 1.2, 16, 32), clay, [0, 0.92, 0], [1.2, 0.82, 0.72], "Tronco Esculpido");
  addMesh(group, new THREE.SphereGeometry(0.38, 32, 20), clay, [-0.72, 1.25, 0], [1.3, 0.78, 0.86], "Ombro L");
  addMesh(group, new THREE.SphereGeometry(0.38, 32, 20), clay, [0.72, 1.25, 0], [1.3, 0.78, 0.86], "Ombro R");
  addMesh(group, new THREE.ConeGeometry(0.15, 0.58, 18), clay, [-0.45, 2.86, 0.04], [0.82, 1, 0.82], "Chifre L").rotation.z = 0.35;
  addMesh(group, new THREE.ConeGeometry(0.15, 0.58, 18), clay, [0.45, 2.86, 0.04], [0.82, 1, 0.82], "Chifre R").rotation.z = -0.35;
  addMesh(group, new THREE.BoxGeometry(0.48, 0.09, 0.08), clay, [-0.28, 2.28, 0.72], [1, 1, 1], "Sobrancelha L").rotation.z = -0.18;
  addMesh(group, new THREE.BoxGeometry(0.48, 0.09, 0.08), clay, [0.28, 2.28, 0.72], [1, 1, 1], "Sobrancelha R").rotation.z = 0.18;
  addMesh(group, new THREE.TorusGeometry(0.18, 0.025, 8, 22), clay, [0, 1.88, 0.78], [1, 0.32, 0.16], "Boca");

  group.traverse((node) => {
    if (node.isMesh) {
      node.userData.selectable = true;
      trackedObjects.push(node);
    }
  });
  return group;
}

function createRenderRoom() {
  const group = new THREE.Group();
  group.name = "Ateliê Render";
  const wood = new THREE.MeshStandardMaterial({ color: 0x6d4125, roughness: 0.74 });
  const wall = new THREE.MeshStandardMaterial({ color: 0x574c42, roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xb8d8ff, roughness: 0.18, metalness: 0.02, transparent: true, opacity: 0.68 });
  const lamp = new THREE.MeshStandardMaterial({ color: 0xffc176, emissive: 0xff9d45, emissiveIntensity: 0.9 });

  addMesh(group, new THREE.BoxGeometry(8.5, 0.18, 7), wood, [0, -0.05, 0], [1, 1, 1], "Piso Madeira");
  addMesh(group, new THREE.BoxGeometry(8.5, 4.2, 0.16), wall, [0, 2.05, -3.45], [1, 1, 1], "Parede Fundo");
  addMesh(group, new THREE.BoxGeometry(0.16, 4.2, 7), wall, [-4.2, 2.05, 0], [1, 1, 1], "Parede Lateral");
  addMesh(group, new THREE.BoxGeometry(3.7, 0.18, 1.1), wood, [-0.8, 1.0, -2.38], [1, 1, 1], "Mesa");
  addMesh(group, new THREE.BoxGeometry(0.16, 0.9, 0.16), wood, [-2.45, 0.48, -2.75], [1, 1, 1], "Pé Mesa L");
  addMesh(group, new THREE.BoxGeometry(0.16, 0.9, 0.16), wood, [0.85, 0.48, -2.75], [1, 1, 1], "Pé Mesa R");
  addMesh(group, new THREE.BoxGeometry(1.85, 1.35, 0.08), glass, [2.1, 2.25, -3.33], [1, 1, 1], "Janela");
  addMesh(group, new THREE.BoxGeometry(0.1, 1.55, 0.12), wood, [2.1, 2.25, -3.24], [1, 1, 1], "Moldura V");
  addMesh(group, new THREE.BoxGeometry(2.0, 0.1, 0.12), wood, [2.1, 2.25, -3.24], [1, 1, 1], "Moldura H");
  addMesh(group, new THREE.SphereGeometry(0.18, 24, 16), lamp, [-1.55, 1.32, -2.3], [1, 1, 1], "Luminária");

  const sun = new THREE.PointLight(0xffbe74, 28, 8);
  sun.position.set(2.2, 2.5, -2.5);
  sun.name = "Luz Janela";
  group.add(sun);
  return group;
}

function addMesh(parent, geometry, material, position, scale, name) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.name = name;
  mesh.userData.baseColor = material.color ? material.color.getHex() : 0xffffff;
  parent.add(mesh);
  return mesh;
}

function circleLine(radius, material) {
  const points = [];
  for (let i = 0; i <= 80; i += 1) {
    const angle = (i / 80) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
}

function bindUI() {
  document.querySelectorAll("[data-workspace]").forEach((button) => {
    button.addEventListener("click", () => setWorkspace(button.dataset.workspace));
  });

  document.querySelector("#homeButton").addEventListener("click", () => showOverlay());
  document.querySelector("#newProjectButton").addEventListener("click", () => openModal(projectDialog));
  document.querySelector("#prefsButton").addEventListener("click", () => openModal(prefsDialog));
  document.querySelector("#saveRenderButton").addEventListener("click", saveImage);
  document.querySelector("#addPrimitiveButton").addEventListener("click", () => createPrimitive("cube"));
  document.querySelector("#deleteButton").addEventListener("click", deleteSelected);
  document.querySelector("#focusButton").addEventListener("click", focusSelection);
  document.querySelector("#toggleGridButton").addEventListener("click", toggleGrid);
  document.querySelector("#resetCameraButton").addEventListener("click", () => setCameraForWorkspace(state.workspace));
  document.querySelector("#shadeButton").addEventListener("click", cycleShade);
  document.querySelector("#fullscreenButton").addEventListener("click", toggleFullscreen);
  document.querySelector("#createProjectButton").addEventListener("click", createProject);
  document.querySelector("#prevFrameButton").addEventListener("click", () => setFrame(state.frame - 1));
  document.querySelector("#nextFrameButton").addEventListener("click", () => setFrame(state.frame + 1));
  playButton.addEventListener("click", togglePlayback);
  frameSlider.addEventListener("input", () => setFrame(Number(frameSlider.value)));
  fileInput.addEventListener("change", handleFakeImport);

  document.querySelectorAll("[data-close-overlay]").forEach((button) => {
    button.addEventListener("click", hideOverlay);
  });
  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => closeModals());
  });
  document.querySelectorAll("[data-start-action]").forEach((button) => {
    button.addEventListener("click", () => handleStartAction(button.dataset.startAction));
  });
  document.querySelectorAll("[data-project-type]").forEach((button) => {
    button.addEventListener("click", () => selectProjectType(button));
  });
  document.querySelectorAll("[data-pref-page]").forEach((button) => {
    button.addEventListener("click", () => selectPrefPage(button));
  });

  contextBar.addEventListener("click", handleContextAction);
  toolList.addEventListener("click", handleToolClick);
  outliner.addEventListener("click", handleOutlinerClick);
  propertiesPanel.addEventListener("input", handlePropertyInput);
  propertiesPanel.addEventListener("change", handlePropertyInput);
  document.querySelector("#sceneSearch").addEventListener("input", renderOutliner);
}

function setWorkspace(workspace) {
  state.workspace = workspace;
  app.dataset.workspace = workspace;
  const data = workspaceData[workspace];
  workspaceTitle.textContent = data.title;
  workspaceKicker.textContent = data.kicker;
  viewName.textContent = data.view;
  viewStats.textContent = data.stats;
  hintStatus.textContent = workspace === "animacao" ? "Arraste chaves na linha do tempo" : "Arraste para orbitar a vista";

  document.querySelectorAll(".workspace-tabs button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.workspace === workspace);
  });

  renderTools();
  renderContextBar();
  renderOutliner();
  renderProperties();
  renderNodeOverlay();
  applyWorkspaceVisibility();
  setCameraForWorkspace(workspace);
}

function applyLaunchParams() {
  const params = new URLSearchParams(window.location.search);
  const launchWorkspace = params.get("workspace");
  if (params.get("mobile") === "1") {
    document.body.classList.add("mobile-shell");
  }
  if (launchWorkspace && workspaceData[launchWorkspace]) {
    setWorkspace(launchWorkspace);
  }
  if (params.get("start") === "0") {
    hideOverlay();
  }
}

function renderTools() {
  const tools = workspaceData[state.workspace].tools;
  if (!tools.some(([id]) => id === state.tool)) {
    state.tool = tools[0][0];
  }
  toolList.innerHTML = tools
    .map(
      ([id, icon, label]) => `
      <button class="tool-button ${id === state.tool ? "is-active" : ""}" data-tool="${id}" aria-label="${label}" title="${label}">
        <span class="tool-icon">${icon}</span>
      </button>
    `,
    )
    .join("");
}

function renderContextBar() {
  const controlsMarkup = workspaceData[state.workspace].context
    .map((item) => {
      if (item[0] === "select") {
        return `<select aria-label="${item[1]}">${item[2].map((option) => `<option>${option}</option>`).join("")}</select>`;
      }
      if (item[0] === "range") {
        return `<label class="range-control">${item[1]} <input type="range" data-range="${item[2]}" min="${item[3]}" max="${item[4]}" value="${item[5]}" /></label>`;
      }
      return `<button data-action="${item[2]}">${item[1]}</button>`;
    })
    .join('<span class="mini-separator"></span>');
  contextBar.innerHTML = controlsMarkup;
}

function renderOutliner() {
  const query = document.querySelector("#sceneSearch").value.trim().toLowerCase();
  const dynamicItems = state.userObjects.map((mesh) => ({
    id: mesh.uuid,
    label: mesh.name,
    type: "mesh",
    object: mesh,
  }));
  const items = [...sceneItems, ...dynamicItems].filter((item) => item.label.toLowerCase().includes(query));
  outliner.innerHTML = items
    .map((item) => {
      const selected = state.selected && (state.selected.name === item.label || state.selected.uuid === item.id);
      const visible = item.object ? item.object.visible : groupVisible(item.id);
      return `
        <button class="outliner-row ${selected ? "is-selected" : ""}" data-object-id="${item.id}">
          <span class="type-icon">${iconForType(item.type)}</span>
          <span>${item.label}</span>
          <span class="visibility">${visible ? "◉" : "○"}</span>
        </button>
      `;
    })
    .join("");
}

function renderProperties() {
  const selected = state.selected;
  propertiesTitle.textContent = selected ? selected.name : "Cena";
  const object = selected || groups.character;
  const position = object.position || new THREE.Vector3();
  const rotation = object.rotation || new THREE.Euler();
  const scale = object.scale || new THREE.Vector3(1, 1, 1);
  const material = selected && selected.material ? selected.material : null;

  if (state.workspace === "renderizacao") {
    propertiesPanel.innerHTML = `
      <section class="prop-section">
        <h3>Amostragem</h3>
        ${propInput("Render", "samples", 128)}
        ${propInput("Preview", "preview", 32)}
        ${propSelect("Ruído", "denoise", ["Adaptativo", "Temporal", "Desligado"])}
      </section>
      <section class="prop-section">
        <h3>Iluminação</h3>
        ${propSelect("Motor", "engine", ["Forge RT", "Eevee Next", "Path Trace"])}
        ${propToggle("Sombras", true)}
        ${propToggle("Oclusão", true)}
        ${propToggle("Bloom", true)}
      </section>
      <section class="prop-section">
        <h3>Saída</h3>
        ${propSelect("Resolução", "resolution", ["1920 x 1080", "2560 x 1440", "3840 x 2160"])}
        ${propSelect("Formato", "format", ["PNG", "EXR", "WebP"])}
      </section>
    `;
    return;
  }

  if (state.workspace === "scripts") {
    propertiesPanel.innerHTML = `
      <section class="prop-section">
        <h3>Script ativo</h3>
        <div class="code-panel">scene.select("Personagem MN")
operator.keyframe.insert(frame=${state.frame})
render.preview.update()</div>
      </section>
      <section class="prop-section">
        <h3>Plugins</h3>
        ${propToggle("Import glTF", true)}
        ${propToggle("Rig rápido", true)}
        ${propToggle("Node Kit", true)}
      </section>
    `;
    return;
  }

  propertiesPanel.innerHTML = `
    <section class="prop-section">
      <h3>Transformação</h3>
      ${vectorInput("Localização", "position", position, 0.1)}
      ${vectorInput("Rotação", "rotation", new THREE.Vector3(radToDeg(rotation.x), radToDeg(rotation.y), radToDeg(rotation.z)), 1)}
      ${vectorInput("Escala", "scale", scale, 0.05)}
    </section>
    <section class="prop-section">
      <h3>${state.workspace === "escultura" ? "Pincel" : "Material"}</h3>
      ${
        state.workspace === "escultura"
          ? `${propInput("Raio", "brushPanelRadius", 46)}${propInput("Força", "brushPanelStrength", 42)}${propToggle("Simetria X", true)}`
          : `${swatches()}${propSelect("Sombreamento", "shading", ["Material", "Aramado", "Sólido"])}`
      }
    </section>
    <section class="prop-section">
      <h3>Dados</h3>
      ${propInput("Vértices", "verts", selected ? 1280 + Math.round(selected.scale.length() * 720) : 24960)}
      ${propInput("Faces", "faces", selected ? 960 + Math.round(selected.scale.length() * 520) : 18420)}
    </section>
  `;

  if (material && material.color) {
    propertiesPanel.querySelectorAll(".swatch").forEach((button) => {
      button.addEventListener("click", () => {
        material.color.set(button.dataset.color);
        material.needsUpdate = true;
        toastMessage("Material atualizado");
      });
    });
  }
}

function vectorInput(label, prop, vector, step) {
  return ["x", "y", "z"]
    .map((axis, index) => {
      const value = Number(vector[axis]).toFixed(prop === "rotation" ? 0 : 2);
      const axisLabel = index === 0 ? label : "";
      return `
        <label class="prop-row">
          <span>${axisLabel} ${axis.toUpperCase()}</span>
          <input data-prop="${prop}" data-axis="${axis}" type="number" step="${step}" value="${value}" />
        </label>
      `;
    })
    .join("");
}

function propInput(label, name, value) {
  return `
    <label class="prop-row">
      <span>${label}</span>
      <input name="${name}" type="number" value="${value}" />
    </label>
  `;
}

function propSelect(label, name, options) {
  return `
    <label class="prop-row">
      <span>${label}</span>
      <select name="${name}">
        ${options.map((option) => `<option>${option}</option>`).join("")}
      </select>
    </label>
  `;
}

function propToggle(label, checked) {
  return `
    <label class="toggle-row">
      <span>${label}</span>
      <input type="checkbox" ${checked ? "checked" : ""} />
    </label>
  `;
}

function swatches() {
  const colors = ["#49a0ff", "#f2a94b", "#62cc8b", "#d99565", "#8b7bff", "#e6e1d6"];
  return `<div class="swatches">${colors.map((color) => `<button class="swatch" data-color="${color}" style="background:${color}" aria-label="Cor ${color}"></button>`).join("")}</div>`;
}

function renderPrefs() {
  const pages = {
    interface: `
      <div class="pref-grid">
        ${prefSelect("Tema", ["Escuro técnico", "Alto contraste", "Claro neutro"])}
        ${prefRange("Escala da interface", 80, 130, 100)}
        ${propToggle("Exibir grades", state.showGrid)}
        ${propToggle("Exibir informações de viewport", true)}
        ${propToggle("Salvar preferências ao sair", true)}
      </div>
    `,
    viewport: `
      <div class="pref-grid">
        ${prefSelect("Navegação", ["Orbit MN", "Trackball", "CAD"])}
        ${prefRange("Sensibilidade", 20, 120, 72)}
        ${propToggle("Gizmos de transformação", true)}
        ${propToggle("Eixos coloridos", true)}
        ${propToggle("Sombras em tempo real", true)}
      </div>
    `,
    addons: `
      <div class="pref-grid">
        ${addonRow("Import-Export: glTF 2.0", true)}
        ${addonRow("LoopKit", true)}
        ${addonRow("Node Forge", true)}
        ${addonRow("Auto IK", true)}
        ${addonRow("Animation Layers", true)}
        ${addonRow("Bool Studio", false)}
      </div>
    `,
    sistema: `
      <div class="pref-grid">
        ${prefSelect("Dispositivo de render", ["Automático", "GPU dedicada", "CPU"])}
        ${prefRange("Cache de textura", 1, 16, 8)}
        ${propToggle("Salvar backups", true)}
        ${propToggle("Relatórios de falha", false)}
      </div>
    `,
  };
  prefsContent.innerHTML = pages[state.prefPage];
}

function prefSelect(label, options) {
  return `
    <label class="prop-row">
      <span>${label}</span>
      <select>${options.map((option) => `<option>${option}</option>`).join("")}</select>
    </label>
  `;
}

function prefRange(label, min, max, value) {
  return `
    <label class="prop-row">
      <span>${label}</span>
      <input type="range" min="${min}" max="${max}" value="${value}" />
    </label>
  `;
}

function addonRow(name, checked) {
  return `
    <label class="addon-row">
      <input type="checkbox" ${checked ? "checked" : ""} />
      <span>${name}</span>
      <button aria-label="Abrir detalhes">↗</button>
    </label>
  `;
}

function renderNodeOverlay() {
  if (state.workspace === "composicao") {
    nodeOverlay.innerHTML = `
      <div class="node-card" style="left: 7%; top: 18%;">
        <strong>Render Layers</strong>
        <span class="node-socket"><span>Imagem</span><span>●</span></span>
        <span class="node-socket"><span>Profundidade</span><span>●</span></span>
      </div>
      <div class="node-card" style="left: 38%; top: 34%;">
        <strong>Grade de Cor</strong>
        <span class="node-socket"><span>● Entrada</span><span>Saída ●</span></span>
        <span class="node-socket"><span>Contraste</span><span>1.18</span></span>
      </div>
      <div class="node-card" style="right: 9%; top: 18%;">
        <strong>Composite</strong>
        <span class="node-socket"><span>● Imagem</span><span>Final</span></span>
      </div>
      <span class="node-wire" style="left: 24%; top: 31%; width: 18%; transform: rotate(13deg);"></span>
      <span class="node-wire" style="left: 52%; top: 42%; width: 24%; transform: rotate(-17deg);"></span>
    `;
  } else if (state.workspace === "scripts") {
    nodeOverlay.innerHTML = `
      <div class="script-editor">
        <div class="script-toolbar"><span>mn_scene_setup.ms</span><button data-action="runScript">Executar</button></div>
        <pre><code>scene = MN.current_scene()
hero = scene.object("Personagem MN")
hero.rotation.y = frame / 250 * 6.283
hero.keyframe("rotation", frame)
render.preview(samples=32)</code></pre>
      </div>
    `;
  } else {
    nodeOverlay.innerHTML = "";
  }
}

function applyWorkspaceVisibility() {
  const workspace = state.workspace;
  groups.stage.visible = ["modelagem", "animacao", "composicao", "scripts"].includes(workspace);
  groups.character.visible = ["modelagem", "animacao", "composicao", "scripts"].includes(workspace);
  groups.rig.visible = workspace === "animacao";
  groups.house.visible = workspace === "modelagem";
  groups.bust.visible = workspace === "escultura";
  groups.room.visible = workspace === "renderizacao";
  state.userObjects.forEach((object) => {
    object.visible = workspace !== "renderizacao" && workspace !== "escultura";
  });
  grid.visible = state.showGrid && workspace !== "renderizacao";
  scene.background.set(workspace === "renderizacao" ? 0x120f0d : 0x11161d);
  scene.fog.color.copy(scene.background);
}

function setCameraForWorkspace(workspace) {
  const views = {
    modelagem: { pos: [7, 5.5, 9], target: [0, 1.35, 0] },
    escultura: { pos: [0, 2.4, 5.1], target: [0, 1.85, 0] },
    animacao: { pos: [6.8, 4.2, 7.8], target: [0, 1.55, 0] },
    renderizacao: { pos: [4.5, 2.5, 5.5], target: [-0.25, 1.55, -1.6] },
    composicao: { pos: [7.4, 5.3, 8.8], target: [0, 1.35, 0] },
    scripts: { pos: [6.2, 4.6, 8.2], target: [0, 1.35, 0] },
  };
  const view = views[workspace];
  camera.position.set(...view.pos);
  controls.target.set(...view.target);
  controls.update();
}

function setFrame(frame) {
  state.frame = Math.max(1, Math.min(250, Math.round(frame)));
  frameSlider.value = state.frame;
  frameReadout.value = state.frame;
  frameReadout.textContent = state.frame;
  poseCharacter(state.frame);
}

function poseCharacter(frame) {
  const t = (frame / 250) * Math.PI * 2;
  if (characterParts.leftArm) {
    characterParts.leftArm.rotation.z = Math.sin(t) * 0.25 - (state.workspace === "animacao" ? 0.42 : 0.05);
    characterParts.rightArm.rotation.z = Math.cos(t * 0.8) * 0.22 + (state.workspace === "animacao" ? 0.32 : 0.05);
    characterParts.leftLeg.rotation.x = Math.sin(t) * 0.16;
    characterParts.rightLeg.rotation.x = -Math.sin(t) * 0.16;
    characterParts.head.rotation.y = Math.sin(t * 0.55) * 0.08;
  }
  if (groups.rig) {
    groups.rig.rotation.y = Math.sin(t * 0.35) * 0.04;
  }
}

function createKeyRows() {
  const rows = [
    [18, 42, 72, 104, 138, 176, 212],
    [24, 58, 92, 124, 162, 196, 232],
    [32, 72, 112, 152, 192, 236],
    [48, 88, 128, 168, 208],
  ];
  keyRows.innerHTML = rows
    .map(
      (keys) => `
      <div class="key-row">
        ${keys.map((frame) => `<span class="key-dot" style="left:${(frame / 250) * 100}%"></span>`).join("")}
      </div>
    `,
    )
    .join("");
}

function handleToolClick(event) {
  const button = event.target.closest("[data-tool]");
  if (!button) return;
  state.tool = button.dataset.tool;
  renderTools();
  selectionStatus.textContent = workspaceData[state.workspace].tools.find(([id]) => id === state.tool)?.[2] || "Ferramenta";
}

function handleContextAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const primitiveMap = {
    cube: "cube",
    sphere: "sphere",
    cylinder: "cylinder",
    torus: "torus",
  };
  if (primitiveMap[action]) createPrimitive(primitiveMap[action]);
  else if (action === "saveImage" || action === "render") saveImage();
  else if (action === "keyframe") addKeyframe();
  else if (action === "runScript") runScript();
  else if (action === "addons") {
    state.prefPage = "addons";
    openModal(prefsDialog);
    syncPrefButtons();
    renderPrefs();
  } else if (action === "addNode" || action === "autoLayout" || action === "compose") {
    toastMessage("Nós reorganizados na composição");
  } else {
    toastMessage(`${button.textContent} aplicado`);
  }
}

function handleOutlinerClick(event) {
  const row = event.target.closest("[data-object-id]");
  if (!row) return;
  const id = row.dataset.objectId;
  const userObject = state.userObjects.find((object) => object.uuid === id);
  if (userObject) {
    selectObject(userObject);
    return;
  }
  const mapping = {
    character: groups.character,
    stage: groups.stage,
    house: groups.house,
    bust: groups.bust,
    room: groups.room,
    rig: groups.rig,
  };
  const object = mapping[id];
  if (object) selectObject(object);
}

function handlePropertyInput(event) {
  const input = event.target;
  if (!input.dataset.prop || !state.selected) return;
  const axis = input.dataset.axis;
  const value = Number(input.value);
  if (Number.isNaN(value)) return;

  if (input.dataset.prop === "rotation") {
    state.selected.rotation[axis] = degToRad(value);
  } else {
    state.selected[input.dataset.prop][axis] = value;
  }
  updateSelectionBox();
}

function selectFromViewport(event) {
  if (state.workspace === "escultura") {
    sculptTap();
    return;
  }
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(trackedObjects.concat(state.userObjects), false);
  if (hits.length) {
    selectObject(hits[0].object);
  }
}

function moveSculptCursor(event) {
  const rect = canvas.getBoundingClientRect();
  sculptCursor.style.left = `${event.clientX - rect.left}px`;
  sculptCursor.style.top = `${event.clientY - rect.top}px`;
}

function sculptTap() {
  const target = groups.bust.children.find((mesh) => mesh.name === "Cabeça Esculpida");
  if (target) {
    target.scale.x += 0.008;
    target.scale.y += 0.005;
    target.scale.z += 0.008;
    toastMessage("Volume de escultura aplicado");
    updateSelectionBox();
  }
}

function selectObject(object) {
  state.selected = object;
  selectionStatus.textContent = object.name;
  updateSelectionBox();
  renderOutliner();
  renderProperties();
}

function updateSelectionBox() {
  if (state.selected) {
    selectionBox.setFromObject(state.selected);
    selectionBox.visible = true;
  } else {
    selectionBox.visible = false;
  }
}

function createPrimitive(kind) {
  const materials = {
    cube: new THREE.MeshStandardMaterial({ color: 0x4fa0ff, roughness: 0.62 }),
    sphere: new THREE.MeshStandardMaterial({ color: 0x68c887, roughness: 0.58 }),
    cylinder: new THREE.MeshStandardMaterial({ color: 0xf2a94b, roughness: 0.7 }),
    torus: new THREE.MeshStandardMaterial({ color: 0xd48cff, roughness: 0.52 }),
  };
  const geometries = {
    cube: new THREE.BoxGeometry(0.82, 0.82, 0.82),
    sphere: new THREE.SphereGeometry(0.48, 32, 18),
    cylinder: new THREE.CylinderGeometry(0.42, 0.42, 0.9, 32),
    torus: new THREE.TorusGeometry(0.44, 0.13, 16, 48),
  };
  state.primitiveCount += 1;
  const mesh = new THREE.Mesh(geometries[kind], materials[kind]);
  mesh.name = `${labelForPrimitive(kind)} ${state.primitiveCount}`;
  const angle = state.primitiveCount * 0.9;
  mesh.position.set(Math.cos(angle) * 1.6, 0.95 + (kind === "sphere" ? 0.2 : 0), Math.sin(angle) * 1.25);
  mesh.userData.selectable = true;
  mesh.userData.baseColor = mesh.material.color.getHex();
  scene.add(mesh);
  state.userObjects.push(mesh);
  trackedObjects.push(mesh);
  selectObject(mesh);
  renderOutliner();
  toastMessage(`${mesh.name} adicionado`);
}

function deleteSelected() {
  if (!state.selected) return;
  const object = state.selected;
  if (state.userObjects.includes(object)) {
    scene.remove(object);
    state.userObjects = state.userObjects.filter((item) => item !== object);
    state.selected = null;
    updateSelectionBox();
    renderOutliner();
    renderProperties();
    toastMessage("Objeto removido");
  } else {
    object.visible = !object.visible;
    toastMessage(object.visible ? "Objeto visível" : "Objeto oculto");
    renderOutliner();
  }
}

function focusSelection() {
  if (!state.selected) {
    controls.target.set(0, 1.35, 0);
  } else {
    const box = new THREE.Box3().setFromObject(state.selected);
    controls.target.copy(box.getCenter(new THREE.Vector3()));
  }
  controls.update();
}

function toggleGrid() {
  state.showGrid = !state.showGrid;
  applyWorkspaceVisibility();
  toastMessage(state.showGrid ? "Grades exibidas" : "Grades ocultas");
}

function cycleShade() {
  const modes = ["material", "solid", "wire"];
  state.shadeMode = modes[(modes.indexOf(state.shadeMode) + 1) % modes.length];
  scene.traverse((node) => {
    if (node.isMesh && node.material) {
      node.material.wireframe = state.shadeMode === "wire";
      node.material.flatShading = state.shadeMode === "solid";
      node.material.needsUpdate = true;
    }
  });
  toastMessage(`Visualização: ${state.shadeMode}`);
}

function toggleFullscreen() {
  const shell = document.querySelector("#viewportShell");
  if (document.fullscreenElement) document.exitFullscreen();
  else shell.requestFullscreen?.();
}

function togglePlayback() {
  state.playing = !state.playing;
  playButton.textContent = state.playing ? "Ⅱ" : "▶";
}

function addKeyframe() {
  const row = keyRows.querySelector(".key-row");
  if (row) {
    row.insertAdjacentHTML("beforeend", `<span class="key-dot" style="left:${(state.frame / 250) * 100}%"></span>`);
  }
  toastMessage(`Keyframe no quadro ${state.frame}`);
}

function runScript() {
  groups.character.rotation.y += Math.PI / 8;
  toastMessage("Script executado na cena");
}

function saveImage() {
  renderer.render(scene, camera);
  const filename = `mn-animat3d-frame-${state.frame}.png`;
  const dataUrl = canvas.toDataURL("image/png");

  if (window.AndroidApp && typeof window.AndroidApp.saveImage === "function") {
    window.AndroidApp.saveImage(dataUrl, filename);
    toastMessage("Imagem enviada para salvar no Android");
    return;
  }

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
  toastMessage("Imagem exportada");
}

function createProject() {
  state.userObjects.forEach((object) => scene.remove(object));
  state.userObjects = [];
  state.selected = null;
  state.primitiveCount = 0;
  closeModals();
  hideOverlay();
  setWorkspace(state.selectedProjectType === "animacao" ? "animacao" : state.selectedProjectType === "modelagem" ? "modelagem" : "modelagem");
  renderOutliner();
  renderProperties();
  toastMessage("Projeto criado");
}

function handleStartAction(action) {
  if (action === "new") openModal(projectDialog);
  if (action === "example") {
    hideOverlay();
    setWorkspace("animacao");
    setFrame(72);
    toastMessage("Exemplo carregado");
  }
  if (action === "open") fileInput.click();
  if (action === "prefs") openModal(prefsDialog);
}

function handleFakeImport() {
  hideOverlay();
  createPrimitive("cube");
  state.selected.name = "Importado glTF";
  toastMessage("Arquivo preparado no viewport");
  fileInput.value = "";
}

function selectProjectType(button) {
  state.selectedProjectType = button.dataset.projectType;
  document.querySelectorAll("[data-project-type]").forEach((item) => item.classList.toggle("is-selected", item === button));
}

function selectPrefPage(button) {
  state.prefPage = button.dataset.prefPage;
  syncPrefButtons();
  renderPrefs();
}

function syncPrefButtons() {
  document.querySelectorAll("[data-pref-page]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.prefPage === state.prefPage);
  });
}

function openModal(modal) {
  modal.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");
}

function closeModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
  });
}

function showOverlay() {
  startOverlay.classList.add("is-visible");
}

function hideOverlay() {
  startOverlay.classList.remove("is-visible");
}

function groupVisible(id) {
  const group = groups[id];
  if (group) return group.visible;
  return true;
}

function iconForType(type) {
  return {
    camera: "▱",
    light: "✦",
    mesh: "▽",
    rig: "⌁",
  }[type] || "□";
}

function labelForPrimitive(kind) {
  return {
    cube: "Cubo",
    sphere: "Esfera",
    cylinder: "Cilindro",
    torus: "Torus",
  }[kind];
}

function radToDeg(value) {
  return (value * 180) / Math.PI;
}

function degToRad(value) {
  return (value * Math.PI) / 180;
}

function resizeRenderers() {
  const width = canvas.clientWidth || 1;
  const height = canvas.clientHeight || 1;
  if (canvas.width !== Math.floor(width * renderer.getPixelRatio()) || canvas.height !== Math.floor(height * renderer.getPixelRatio())) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const previewWidth = previewCanvas.clientWidth || 1;
  const previewHeight = previewCanvas.clientHeight || 1;
  const previewRatio = previewRenderer.getPixelRatio();
  if (
    previewCanvas.width !== Math.floor(previewWidth * previewRatio) ||
    previewCanvas.height !== Math.floor(previewHeight * previewRatio)
  ) {
    previewRenderer.setSize(previewWidth, previewHeight, false);
    previewCamera.aspect = previewWidth / previewHeight;
    previewCamera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  if (state.playing) {
    setFrame(state.frame >= 250 ? 1 : state.frame + dt * 30);
  }

  const elapsed = clock.elapsedTime;
  groups.stage.rotation.y += 0.0008;
  if (previewModel) {
    previewModel.rotation.y = Math.sin(elapsed * 0.35) * 0.28;
  }
  if (state.workspace !== "animacao") {
    poseCharacter(state.frame + Math.sin(elapsed) * 2);
  }

  controls.update();
  renderer.render(scene, camera);
  previewRenderer.render(previewScene, previewCamera);
  statsTimer += dt;
  if (statsTimer > 0.45) {
    updateSceneStats();
    statsTimer = 0;
  }
}

function updateSceneStats() {
  const objectCount = 8 + state.userObjects.length;
  const verts = 24960 + state.userObjects.length * 840 + Math.round(Math.abs(Math.sin(clock.elapsedTime)) * 80);
  const faces = 18420 + state.userObjects.length * 560;
  const memory = 312 + state.userObjects.length * 18;
  sceneStats.textContent = `Objetos: ${objectCount} | Vértices: ${verts.toLocaleString("pt-BR")} | Faces: ${faces.toLocaleString("pt-BR")} | Memória: ${memory} MB`;
}

function toastMessage(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

})();
