import { Vector3 } from '@babylonjs/core';
import {UniversalCamera} from '@babylonjs/core/Cameras/universalCamera';
import {Scene} from '@babylonjs/core/scene';

class CameraManagerClass {

  private camera!: UniversalCamera;

  init(scene: Scene): void {

    this.camera = new UniversalCamera(
      'camera',
      new Vector3(0, 4, -30), // x=centré, y=légèrement haut, z=derrière
      scene
    );

    // La caméra regarde vers l'avant 
    this.camera.setTarget(new Vector3(0, 0, 10));

    // Champ de vision
    this.camera.fov = 0.8;
  }

  getCamera(): UniversalCamera {
    return this.camera;
  }

}

export const CameraManager = new CameraManagerClass();