---
name: 3d-web-experience
description: >-
  Use this skill to design and implement 3D elements and immersive web experiences using WebGL, Three.js, and React Three Fiber.
---

# 3D Web Experience Guidelines

When the user requests 3D features, WebGL effects, or immersive experiences, follow these guidelines:

1.  **Tech Stack**: Prefer using React Three Fiber (R3F) and Three.js within Next.js or React applications to seamlessly integrate 3D elements.
2.  **Performance Optimization**: 
    - Keep polygon counts low for 3D models.
    - Use Draco compression for GLTF/GLB models.
    - Manage texture sizes appropriately (e.g., using WebP or optimizing resolutions).
3.  **Graceful Degradation**: Always provide 2D fallbacks or simpler interactions for users on lower-end devices or browsers that don't support WebGL well.
4.  **Lighting and Materials**: Use physically based rendering (PBR) materials, and be mindful of lighting costs. Prefer baked shadows/lighting where possible for performance.
5.  **Camera & Controls**: Implement smooth camera controls (like `OrbitControls` or `PresentationControls` from `@react-three/drei`) to allow users to interact intuitively with 3D scenes.
6.  **Accessibility**: Ensure that 3D experiences don't block critical information and can be navigated or bypassed if needed. Provide screen-reader-friendly text alternatives.
