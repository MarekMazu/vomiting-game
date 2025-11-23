import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';

@Injectable({
    providedIn: 'root'
})
export class GameEngineService implements OnDestroy {
    private canvas!: HTMLCanvasElement;
    private renderer!: THREE.WebGLRenderer;
    private camera!: THREE.PerspectiveCamera;
    private scene!: THREE.Scene;
    private particles: { mesh: THREE.Mesh; velocity: THREE.Vector3 }[] = [];
    private targets: THREE.Mesh[] = [];
    public score: number = 0;
    private frameId: number = 0;
    private euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
    private cameraGroup!: THREE.Group;

    constructor(private ngZone: NgZone) { }

    ngOnDestroy(): void {
        if (this.frameId != null) {
            cancelAnimationFrame(this.frameId);
        }
        if (this.renderer != null) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
        }
    }

    createScene(canvas: ElementRef<HTMLCanvasElement>): void {
        this.canvas = canvas.nativeElement;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);

        // Camera group for rotation
        this.cameraGroup = new THREE.Group();
        this.cameraGroup.position.y = 2;
        this.scene.add(this.cameraGroup);

        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.cameraGroup.add(this.camera);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);

        // Targets
        this.createTarget(0, 0.5, -5);
        this.createTarget(-3, 0.5, -5);
        this.createTarget(3, 0.5, -5);
        this.createTarget(0, 0.5, -8);
    }

    private createTarget(x: number, y: number, z: number): void {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        this.scene.add(cube);
        this.targets.push(cube);
    }

    rotateCamera(yaw: number, pitch: number): void {
        this.euler.setFromQuaternion(this.cameraGroup.quaternion);
        this.euler.y += yaw;
        this.euler.x += pitch;
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
        this.cameraGroup.quaternion.setFromEuler(this.euler);
    }

    vomit(): void {
        // Make multiple particles for a stream effect
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const geometry = new THREE.SphereGeometry(0.3, 8, 8);
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const particle = new THREE.Mesh(geometry, material);

                const startPos = new THREE.Vector3();
                this.camera.getWorldPosition(startPos);

                const direction = new THREE.Vector3();
                this.camera.getWorldDirection(direction);

                particle.position.copy(startPos).add(direction.clone().multiplyScalar(0.5));
                this.scene.add(particle);

                const velocity = direction.clone().multiplyScalar(0.8);
                velocity.y += 0.15;

                this.particles.push({ mesh: particle, velocity });
            }, i * 50);
        }
    }

    animate(): void {
        this.ngZone.runOutsideAngular(() => {
            if (document.readyState !== 'loading') {
                this.render();
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    this.render();
                });
            }
        });
    }

    private render(): void {
        this.frameId = requestAnimationFrame(() => {
            this.render();
        });

        this.updateParticles();
        this.renderer.render(this.scene, this.camera);
    }

    private updateParticles(): void {
        const gravity = new THREE.Vector3(0, -0.01, 0);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.velocity.add(gravity);
            p.mesh.position.add(p.velocity);

            // Collision with targets
            for (const target of this.targets) {
                const distance = p.mesh.position.distanceTo(target.position);
                if (distance < 0.8) {
                    // Hit! Turn target green
                    (target.material as THREE.MeshStandardMaterial).color.setHex(0x00ff00);
                    this.score++;

                    // Create splat on target
                    this.createSplat(p.mesh.position.clone(), target);

                    // Remove particle
                    this.scene.remove(p.mesh);
                    p.mesh.geometry.dispose();
                    (p.mesh.material as THREE.Material).dispose();
                    this.particles.splice(i, 1);
                    return;
                }
            }

            // Collision with floor
            if (p.mesh.position.y < 0.15) {
                // Create splat on floor
                this.createSplat(p.mesh.position.clone());

                // Remove particle
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                (p.mesh.material as THREE.Material).dispose();
                this.particles.splice(i, 1);
            }
        }
    }

    private createSplat(position: THREE.Vector3, target?: THREE.Mesh): void {
        if (target) {
            // Splat on target - create small sphere on surface
            const splatGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const splatMaterial = new THREE.MeshBasicMaterial({ color: 0x00aa00 });
            const splat = new THREE.Mesh(splatGeometry, splatMaterial);
            splat.position.copy(position);
            this.scene.add(splat);
        } else {
            // Splat on floor - create flat circle
            const splatGeometry = new THREE.CircleGeometry(0.3, 16);
            const splatMaterial = new THREE.MeshBasicMaterial({
                color: 0x00aa00,
                transparent: true,
                opacity: 0.7
            });
            const splat = new THREE.Mesh(splatGeometry, splatMaterial);
            splat.position.set(position.x, 0.01, position.z); // Slightly above floor
            splat.rotation.x = -Math.PI / 2; // Rotate to lay flat
            this.scene.add(splat);
        }
    }

    resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }
}
