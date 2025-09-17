declare module 'three.meshline' {
    import { BufferGeometry, Material, Mesh } from 'three';

    export class MeshLine extends BufferGeometry {
        constructor();
        geometry: BufferGeometry;
        points: Float32Array | number[];
        setPoints(points: Float32Array | number[], wcb: (p: number) => number): void;
        setGeometry(g: BufferGeometry, c?: (p: number) => number): void;
    }

    export class MeshLineMaterial extends Material {
        constructor(parameters?: {
            lineWidth?: number;
            color?: number | string;
            opacity?: number;
            resolution?: { x: number, y: number };
            sizeAttenuation?: boolean;
            dashArray?: number;
            dashOffset?: number;
            dashRatio?: number;
            useDash?: boolean;
            visibility?: number;
            alphaTest?: number;
            repeat?: { x: number, y: number };
            transparent?: boolean;
        });
        lineWidth: number;
        color: THREE.Color;
        opacity: number;
        resolution: THREE.Vector2;
        sizeAttenuation: boolean;
        dashArray: number;
        dashOffset: number;
        dashRatio: number;
        useDash: boolean;
        visibility: number;
        alphaTest: number;
        repeat: THREE.Vector2;
    }
}
