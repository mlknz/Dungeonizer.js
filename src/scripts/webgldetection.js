module.exports = () => {
    if (!!window.WebGLRenderingContext) {
        const canvas = document.createElement('canvas');
        const names = ['webgl', 'experimental-webgl', 'moz-webgl'];
        let gl = false;

        for (let i = 0; i < names.length; i++) {
            try {
                gl = canvas.getContext(names[i]);
                if (gl && typeof gl.getParameter === 'function') {
                    /* WebGL is enabled */
                    return true;
                }
            } catch (e) {
                console.log('Unable to initialize WebGL. Your browser may not support it.'); // eslint-disable-line no-console
            }
        }

        /* WebGL is supported, but disabled */
        return false;
    }
    /* WebGL not supported*/
    return false;
};
