// your code goes here
// === ОСНОВА ===
const base64Input = document.getElementById("base64Input");
const copyBtn = document.getElementById("copyBtn");
const pasteBtn = document.getElementById("pasteBtn");

// все инпуты
function getAllInputs() {
    return document.querySelectorAll("input[data-offset]");
}

// === BASE64 ===
function base64ToBytes(base64) {
    const binary = atob(base64);
    return Array.from(binary).map(c => c.charCodeAt(0));
}

function bytesToBase64(bytes) {
    return btoa(bytes.map(b => String.fromCharCode(b)).join(""));
}

// === ЧТЕНИЕ ===
function readFloat(bytes, offset) {
    const view = new DataView(new ArrayBuffer(4));
    for (let i = 0; i < 4; i++) {
        view.setUint8(i, bytes[offset + i]);
    }
    return view.getFloat32(0, true);
}

function readInt(bytes, offset) {
    const view = new DataView(new ArrayBuffer(4));
    for (let i = 0; i < 4; i++) {
        view.setUint8(i, bytes[offset + i]);
    }
    return view.getInt32(0, true);
}

function readByte(bytes, offset) {
    return bytes[offset];
}

// === ЗАПИСЬ ===
function writeFloat(bytes, offset, value) {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, value, true);
    for (let i = 0; i < 4; i++) {
        bytes[offset + i] = view.getUint8(i);
    }
}

function writeInt(bytes, offset, value) {
    const view = new DataView(new ArrayBuffer(4));
    view.setInt32(0, value, true);
    for (let i = 0; i < 4; i++) {
        bytes[offset + i] = view.getUint8(i);
    }
}

function writeByte(bytes, offset, value) {
    value = Math.max(0, Math.min(255, Math.round(value)));
    bytes[offset] = value;
}

// === ВАЛИДАЦИЯ ===
function validate(input) {
    let value = parseFloat(input.value);
    if (isNaN(value)) value = 0;

    const type = input.dataset.type;

    if (type === "byte") {
        value = Math.max(0, Math.min(255, Math.round(value)));
    }

    if (type === "int") {
        value = Math.round(value);
    }

    if (type === "float") {
        value = parseFloat(value.toFixed(2));
    }

    input.value = value;
}

function validateAll() {
    getAllInputs().forEach(validate);
}

// === DECODE ===
function decode() {
    let bytes = base64ToBytes(base64Input.value);

    getAllInputs().forEach(input => {
        const offset = parseInt(input.dataset.offset);
        const type = input.dataset.type;

        let value;

        if (type === "float") value = readFloat(bytes, offset);
        if (type === "int") value = readInt(bytes, offset);
        if (type === "byte") value = readByte(bytes, offset);

        input.value = type === "float"
            ? value.toFixed(2)
            : value;
    });
}

// === ENCODE ===
function encode() {
    validateAll();

    let bytes = base64ToBytes(base64Input.value);

    getAllInputs().forEach(input => {
        const offset = parseInt(input.dataset.offset);
        const type = input.dataset.type;
        let value = parseFloat(input.value);

        if (type === "float") writeFloat(bytes, offset, value);
        if (type === "int") writeInt(bytes, offset, value);
        if (type === "byte") writeByte(bytes, offset, value);
    });

    base64Input.value = bytesToBase64(bytes);
}

// === АВТО ОБРАБОТКА ===
getAllInputs().forEach(input => {
    input.addEventListener("blur", () => validate(input));
});

// === КНОПКИ ===
copyBtn.onclick = async () => {
    encode(); // важно!
    await navigator.clipboard.writeText(base64Input.value);
};

pasteBtn.onclick = async () => {
    base64Input.value = await navigator.clipboard.readText();
    decode();
};

// === РЕЖИМЫ ===
const btnClassic = document.getElementById('btn-classic');
const btnHide = document.getElementById('btn-hide');
const classicParams = document.getElementById('classic-params');
const hideParams = document.getElementById('hide-params');

function switchMode(mode) {
    if (mode === 'classic') {
        classicParams.style.display = 'block';
        hideParams.style.display = 'none';
        btnClassic.classList.add('active');
        btnHide.classList.remove('active');
    } else {
        classicParams.style.display = 'none';
        hideParams.style.display = 'block';
        btnHide.classList.add('active');
        btnClassic.classList.remove('active');
    }
}

btnClassic.onclick = () => switchMode('classic');
btnHide.onclick = () => switchMode('hide');