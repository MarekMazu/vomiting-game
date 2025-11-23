declare module 'three/examples/jsm/controls/PointerLockControls' {
    import { Camera, EventDispatcher, Object3D } from 'three';

    export class PointerLockControls extends EventDispatcher {
        constructor(camera: Camera, domElement?: HTMLElement);
        isLocked: boolean;
        minPolarAngle: number;
        maxPolarAngle: number;
        pointerSpeed: number;

        getObject(): Object3D;
        getDirection(v: Object3D): Object3D;
        lock(): void;
        unlock(): void;
        connect(): void;
        disconnect(): void;
        dispose(): void;
        addEventListener(type: string, listener: (event: any) => void): void;
        hasEventListener(type: string, listener: (event: any) => void): void;
        removeEventListener(type: string, listener: (event: any) => void): void;
        dispatchEvent(event: { type: string;[attachment: string]: any }): void;
    }
}
