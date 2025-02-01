
export const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const createFragmentShader = (videoTextures, segments, subsectionsPerSegment) => `
    varying vec2 vUv;
    ${videoTextures.map((_, idx) => `uniform sampler2D videoTexture${idx};`).join("\n")}

    void main() {
        vec4 color = vec4(0.0);
        float subsectionWidth = 1.0 / ${subsectionsPerSegment}.0;

        ${segments.map((segment) => `
            if (vUv.y > ${segment.minY} && vUv.y <= ${segment.maxY}) {
                float segmentHeight = ${segment.maxY} - ${segment.minY};
                int subsectionIndex = int(floor(vUv.x / subsectionWidth));
                vec2 localUv;

                localUv.x = (vUv.x - (subsectionWidth * float(subsectionIndex))) * ${subsectionsPerSegment}.0;
                localUv.y = (vUv.y - ${segment.minY}) / segmentHeight;

                switch(subsectionIndex) {
                    ${segment.videos.map((video, i) => 
                        video.textureIndex >= 0 ? 
                        `case ${i}: color = texture2D(videoTexture${video.textureIndex}, localUv); break;` : 
                        `case ${i}: color = vec4(0.0); break;`
                    ).join('\n')}
                }
            }
        `).join(" else ")}
        
        gl_FragColor = color;
    }
`;
