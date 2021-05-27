const elliptic = require("elliptic");
const ec = new elliptic.ec("secp256k1");

function generateKeyPair() {
    var keyPair = ec.genKeyPair();
    return {
        publicKey: keyPair.getPublic("hex"),
        privateKey: keyPair.getPrivate("hex")
    };
}

function getKeysFromPrivate(privateKey) {
    return ec.keyFromPrivate(privateKey);
}

function singData(privateKey, data) {
        const keys = ec.keyFromPrivate(privateKey);
        const sig = keys.sign(data, 'base64');
        return sig.toDER('hex');
}

function verifySignature(publicKey, data, signature) {
    const key = ec.keyFromPublic(publicKey, 'hex');
    return key.verify(data, signature);
}

module.exports  = {
    generateKeyPair,
    getKeysFromPrivate,
    singData,
    verifySignature
}