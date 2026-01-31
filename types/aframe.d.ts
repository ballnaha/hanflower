import 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'a-scene': any;
            'a-assets': any;
            'a-camera': any;
            'a-entity': any;
            'a-video': any;
            'a-asset-item': any;
            'a-marker': any;
            'a-box': any;
            'a-sphere': any;
            'a-cylinder': any;
            'a-plane': any;
            'a-sky': any;
            'a-image': any;
            'a-text': any;
            'a-gltf-model': any;
            'a-obj-model': any;
            'a-light': any;
            'a-cursor': any;
        }
    }
}
