const path = require('path');
const fse = require('fs-extra');
const fs = require('fs').promises;
const Handlebars = require('handlebars');

const initializePath = async (directoryPath) => {
    await fse.emptyDir(directoryPath);
}

const createFile = async (directory, prefix, name, extension, content) => {
    try {
        const fileName = `${prefix}${name}.${extension}`;
        const filePath = path.join(directory, fileName.toLowerCase());
        await fs.writeFile(filePath, content);
        return filePath;
    } catch (error) {
        console.log(error);
    }
};

const readFile = async (filePath) => {
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer.toString();
}

const getTemplate = async (filePath) => {
    const content = await readFile(filePath);
    return Handlebars.compile(content);
}

module.exports = {
    initializePath,
    createFile,
    getTemplate
};