import { Scene }                    from '@babylonjs/core/scene';
import { Vector3 }                  from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 }           from '@babylonjs/core/Maths/math.color';
import { HemisphericLight }         from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight }         from '@babylonjs/core/Lights/directionalLight';
import { MeshBuilder }              from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial }         from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture }           from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';
import { Mesh }                     from '@babylonjs/core/Meshes/mesh';
import { Animation }                from '@babylonjs/core/Animations/animation';

class SceneManagerClass {

  private scene!: Scene;

  init(scene: Scene): void {
    this.scene = scene;

    this.setupBackground();
    this.setupLights();
    this.setupFog();
    this.createSkyDome();
    this.createBaseGround();
    this.createGrassField(40, 40, 1);
    this.createTrees();
    this.createClouds();
    this.createFlowers();
    this.setupBloom();
  }

  // ── Fond ──────────────────────────────────────────────
  private setupBackground(): void {
    this.scene.clearColor = new Color4(0.53, 0.80, 0.98, 1);
  }

  // ── Lumières ──────────────────────────────────────────
  private setupLights(): void {
    const sky       = new HemisphericLight('sky', new Vector3(0, 1, 0), this.scene);
    sky.intensity   = 0.7;
    sky.diffuse     = new Color3(0.9, 0.95, 1.0);
    sky.groundColor = new Color3(0.3, 0.6, 0.2);
    sky.specular    = new Color3(0.1, 0.1, 0.1);

    const sun     = new DirectionalLight('sun', new Vector3(-1, -2, -1), this.scene);
    sun.position  = new Vector3(20, 40, 20);
    sun.intensity = 1.0;
    sun.diffuse   = new Color3(1.0, 0.95, 0.8);
    sun.specular  = new Color3(0.3, 0.3, 0.2);
  }

  // ── Fog ───────────────────────────────────────────────
  private setupFog(): void {
    this.scene.fogMode    = Scene.FOGMODE_EXP2;
    this.scene.fogColor   = new Color3(0.7, 0.85, 1.0);
    this.scene.fogDensity = 0.008;
  }

  // ── Ciel ──────────────────────────────────────────────
  private createSkyDome(): void {
    const dome = MeshBuilder.CreateSphere(
      'skyDome',
      { diameter: 600, segments: 16, sideOrientation: Mesh.BACKSIDE },
      this.scene
    );

    const mat           = new StandardMaterial('skyMat', this.scene);
    mat.disableLighting = true;

    const tex  = new DynamicTexture('skyTex', { width: 512, height: 512 }, this.scene);
    const ctx  = tex.getContext() as CanvasRenderingContext2D;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0,    '#4a90d9');
    grad.addColorStop(0.5,  '#87ceeb');
    grad.addColorStop(0.85, '#c8e8f5');
    grad.addColorStop(1,    '#f0f8ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    tex.update();

    mat.emissiveTexture = tex;
    mat.backFaceCulling = false;
    dome.material       = mat;
  }

  // ── Sol de base ───────────────────────────────────────
  private createBaseGround(): void {
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 50, height: 50, subdivisions: 30, updatable: true },
      this.scene
    );

    const mat         = new StandardMaterial('groundMat', this.scene);
    mat.diffuseColor  = new Color3(0.18, 0.38, 0.12);
    mat.specularColor = new Color3(0, 0, 0);
    ground.material   = mat;

    // Relief léger
    const positions = ground.getVerticesData('position') as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const x        = positions[i];
      const z        = positions[i + 2];
      positions[i+1] = Math.sin(x * 0.3) * 0.3 + Math.cos(z * 0.2) * 0.25;
    }
    ground.updateVerticesData('position', positions);
    ground.refreshBoundingInfo();
  }

  // ── Champ d'herbe courbée ─────────────────────────────
  //
  //  fieldWidth  : largeur du champ en unités Babylon
  //  fieldDepth  : profondeur du champ
  //  density     : nombre de brins par unité carrée
  //
  //  Technique :
  //  - 5 mesh "maîtres" avec des courbures différentes
  //  - Chaque maître = CreateGround pivoté verticalement
  //    puis vertices déplacés pour simuler la courbe
  //  - Les brins sont des instances des maîtres
  //    → géométrie partagée sur le GPU = très performant
  //  - Chaque brin = 2 plans croisés à 90°
  //    → visible de tous les angles
  // ─────────────────────────────────────────────────────
  private createGrassField(
    fieldWidth: number,
    fieldDepth: number,
    density: number = 3
  ): void {

    const totalBlades = fieldWidth * fieldDepth * density;

    // ── Texture du brin ───────────────────────────────
    // Dégradé vert foncé (bas) → vert clair (haut) → pointe jaune
    // Forme effilée peinte en Canvas 2D
    const bladeTex = new DynamicTexture(
      'bladeTex',
      { width: 64, height: 128 },
      this.scene
    );
    const ctx  = bladeTex.getContext() as CanvasRenderingContext2D;
    const grad = ctx.createLinearGradient(0, 128, 0, 0);
    grad.addColorStop(0,    '#1a4a1a'); // base — vert très foncé
    grad.addColorStop(0.4,  '#2d7a2d'); // vert moyen
    grad.addColorStop(0.75, '#4aaa3a'); // vert clair
    grad.addColorStop(0.9,  '#7acc50'); // vert jaune
    grad.addColorStop(1,    '#aadd66'); // pointe claire

    // Forme effilée — triangle arrondi
    ctx.clearRect(0, 0, 64, 128);
    ctx.beginPath();
    ctx.moveTo(32, 0);                       // pointe haute
    ctx.quadraticCurveTo(52, 60, 60, 128);  // courbe droite
    ctx.lineTo(4, 128);                       // bas gauche
    ctx.quadraticCurveTo(12, 60, 32, 0);    // courbe gauche
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    bladeTex.update();
    bladeTex.hasAlpha = true;

    // ── Matériau partagé entre tous les maîtres ───────
    const bladeMat           = new StandardMaterial('bladeMat', this.scene);
    bladeMat.diffuseTexture  = bladeTex;
    bladeMat.opacityTexture  = bladeTex; // même texture pour le canal alpha
    bladeMat.backFaceCulling = false;    // visible des deux côtés
    bladeMat.specularColor   = new Color3(0, 0, 0);
    bladeMat.emissiveColor   = new Color3(0.05, 0.12, 0.02);

    // ── 5 maîtres avec courbures différentes ──────────
    // -0.12 = très courbé gauche → 0 = droit → +0.12 = très courbé droite
    const curvatures = [-0.12, -0.06, 0, 0.06, 0.12];
    const masters: Mesh[] = [];

    curvatures.forEach((curvature, idx) => {

      // CreateGround supporte subdivisions — CreatePlane non
      // On le pivote ensuite pour le rendre vertical
      const master = MeshBuilder.CreateGround(
        `bladeMaster_${idx}`,
        { width: 0.15, height: 0.6, subdivisions: 4, updatable: true },
        this.scene
      );

      // Pivote pour le rendre vertical (plan horizontal → plan vertical)
      master.rotation.x = -Math.PI / 2;

      // "Cuit" la rotation dans les vertices
      // Sans ça, la manipulation des positions ci-dessous
      // serait dans le mauvais espace de coordonnées
      master.bakeCurrentTransformIntoVertices();

      master.material  = bladeMat;
      master.isVisible = false; // maître invisible — seules les instances sont visibles

      // ── Courber les vertices ───────────────────────
      // v   = X (horizontal)
      // v+1 = Y (hauteur)
      // v+2 = Z (profondeur)
      const positions = master.getVerticesData('position') as Float32Array;

      for (let v = 0; v < positions.length; v += 3) {

        // Normalise la hauteur entre 0 (bas du brin) et 1 (haut du brin)
        // Le brin fait 0.6 de haut, centré en Y : va de -0.3 à +0.3
        const t = (positions[v + 1] + 0.3) / 0.6;

        // Courbure en X — t*t = quadratique
        // Effet naturel : base droite, pointe très courbée
        positions[v]     += curvature * t * t;

        // Légère courbure en Z pour la profondeur
        positions[v + 2] += curvature * 0.3 * t;
      }

      master.updateVerticesData('position', positions);
      masters.push(master);
    });

    // ── Instances ─────────────────────────────────────
    for (let i = 0; i < totalBlades; i++) {

      const px = (Math.random() - 0.5) * fieldWidth;
      const pz = (Math.random() - 0.5) * fieldDepth;

      // Hauteur variable — donne vie au champ
      const heightScale = 0.7 + Math.random() * 0.8; // 0.7× à 1.5×

      // Maître aléatoire = courbure aléatoire
      const master = masters[Math.floor(Math.random() * masters.length)];

      // 2 plans croisés à 90° = visible de tous les angles
      for (let cross = 0; cross < 2; cross++) {
        const blade = master.createInstance(`blade_${i}_${cross}`);

        blade.position.set(px, (0.6 * heightScale) / 2, pz);
        blade.scaling.set(1, heightScale, 1);

        // Rotation Y aléatoire + 90° entre les deux plans croisés
        blade.rotation.y = Math.random() * Math.PI + (cross * Math.PI / 2);

        // Légère inclinaison naturelle
        blade.rotation.z = (Math.random() - 0.5) * 0.2;
      }
    }
  }

  // ── Arbres Ghibli ─────────────────────────────────────
  private createTrees(): void {
    const treePositions = [
      [6, 0, 10], [-8, 0, 14], [12, 0, 6], [-14, 0, -6],
      [4, 0, -12], [-6, 0, 18], [18, 0, -4], [-16, 0, 10],
    ];

    const treeColors = [
      new Color3(0.18, 0.65, 0.22),
      new Color3(0.22, 0.72, 0.18),
      new Color3(0.28, 0.58, 0.20),
    ];

    treePositions.forEach(([x, y, z], i) => {

      // Tronc
      const trunk = MeshBuilder.CreateCylinder(
        'trunk' + i,
        { height: 2.5, diameterTop: 0.3, diameterBottom: 0.5, tessellation: 8 },
        this.scene
      );
      trunk.position.set(x, 1.25, z);
      const trunkMat         = new StandardMaterial('trunkMat' + i, this.scene);
      trunkMat.diffuseColor  = new Color3(0.38, 0.22, 0.10);
      trunkMat.specularColor = new Color3(0.05, 0.03, 0.01);
      trunk.material         = trunkMat;

      // Feuillage bas — sphère écrasée
      const leafLow = MeshBuilder.CreateSphere(
        'leafLow' + i,
        { diameterX: 3.5 + Math.random(), diameterY: 2.2, diameterZ: 3.5 + Math.random(), segments: 8 },
        this.scene
      );
      leafLow.position.set(x, 3.2, z);

      // Feuillage haut — plus petit
      const leafHigh = MeshBuilder.CreateSphere(
        'leafHigh' + i,
        { diameterX: 2.4, diameterY: 2.0, diameterZ: 2.4, segments: 8 },
        this.scene
      );
      leafHigh.position.set(x + 0.2, 4.5, z - 0.2);

      [leafLow, leafHigh].forEach((leaf, j) => {
        const lMat         = new StandardMaterial('leafMat' + i + j, this.scene);
        lMat.diffuseColor  = treeColors[i % treeColors.length];
        lMat.specularColor = new Color3(0.05, 0.1, 0.05);
        leaf.material      = lMat;
      });
    });
  }

  // ── Nuages animés ─────────────────────────────────────
  private createClouds(): void {
    const cloudDefs = [
      { x: -15, y: 18, z: 30, scale: 1.2 },
      { x:  10, y: 22, z: 40, scale: 0.9 },
      { x: -30, y: 20, z: 20, scale: 1.5 },
      { x:  25, y: 19, z: 35, scale: 1.0 },
    ];

    const cloudParts = [
      { dx: 0,    dy: 0,    dz: 0,   s: 1.0  },
      { dx: 2.2,  dy: -0.3, dz: 0.3, s: 0.8  },
      { dx: -2.0, dy: -0.4, dz: 0.2, s: 0.75 },
      { dx: 1.0,  dy: 0.6,  dz: 0,   s: 0.65 },
      { dx: -1.0, dy: 0.5,  dz: 0.2, s: 0.6  },
    ];

    cloudDefs.forEach((def, ci) => {
      cloudParts.forEach((p, pi) => {

        const part = MeshBuilder.CreateSphere(
          `cloud${ci}_${pi}`,
          { diameter: 3.5 * def.scale * p.s, segments: 8 },
          this.scene
        );
        part.position.set(
          def.x + p.dx * def.scale,
          def.y + p.dy * def.scale,
          def.z + p.dz * def.scale
        );
        part.scaling.y = 0.45;

        const mat         = new StandardMaterial(`cloudMat${ci}_${pi}`, this.scene);
        mat.diffuseColor  = new Color3(1, 1, 1);
        mat.emissiveColor = new Color3(0.9, 0.9, 0.95);
        mat.alpha         = 0.88;
        mat.specularColor = new Color3(0, 0, 0);
        part.material     = mat;

        // Animation dérive horizontale en boucle
        const anim   = new Animation(
          `cloudAnim${ci}_${pi}`,
          'position.x',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CYCLE
        );
        const startX = def.x + p.dx * def.scale;
        anim.setKeys([
          { frame: 0,   value: startX },
          { frame: 300, value: startX + 8 },
          { frame: 600, value: startX },
        ]);
        part.animations = [anim];
        this.scene.beginAnimation(part, 0, 600, true);
      });
    });
  }

  // ── Fleurs ────────────────────────────────────────────
  private createFlowers(): void {
    const flowerColors = [
      new Color3(1, 0.3, 0.5),
      new Color3(1, 0.9, 0.2),
      new Color3(0.6, 0.3, 1),
      new Color3(1, 0.5, 0.1),
      new Color3(1, 1, 1),
    ];

    for (let i = 0; i < 80; i++) {
      const px = (Math.random() - 0.5) * 50;
      const pz = (Math.random() - 0.5) * 50;

      // Tige
      const stem = MeshBuilder.CreateCylinder(
        'stem' + i,
        { height: 0.5, diameter: 0.06, tessellation: 6 },
        this.scene
      );
      stem.position.set(px, 0.25, pz);
      const stemMat        = new StandardMaterial('stemMat' + i, this.scene);
      stemMat.diffuseColor = new Color3(0.2, 0.6, 0.15);
      stem.material        = stemMat;

      // Fleur
      const flower = MeshBuilder.CreateDisc(
        'flower' + i,
        { radius: 0.18, tessellation: 6, sideOrientation: Mesh.DOUBLESIDE },
        this.scene
      );
      flower.position.set(px, 0.52, pz);
      flower.rotation.x  = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      flower.rotation.z  = Math.random() * Math.PI;
      const fMat         = new StandardMaterial('flowerMat' + i, this.scene);
      fMat.diffuseColor  = flowerColors[i % flowerColors.length];
      fMat.emissiveColor = flowerColors[i % flowerColors.length].scale(0.2);
      fMat.specularColor = new Color3(0, 0, 0);
      flower.material    = fMat;
    }
  }

  // ── Bloom ─────────────────────────────────────────────
  private setupBloom(): void {
    const pipeline                    = new DefaultRenderingPipeline('pipeline', true, this.scene);
    pipeline.bloomEnabled             = true;
    pipeline.bloomWeight              = 0.25;
    pipeline.bloomKernel              = 64;
    pipeline.bloomThreshold           = 0.7;
    pipeline.imageProcessingEnabled   = true;
    pipeline.imageProcessing.contrast = 1.1;
    pipeline.imageProcessing.exposure = 1.05;
  }

  getScene(): Scene {
    return this.scene;
  }
}

export const SceneManager = new SceneManagerClass();