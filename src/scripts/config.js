const webgldetection = require('./webgldetection');

module.exports = {
    basePath: '',
    webglEnabled: webgldetection()
};
