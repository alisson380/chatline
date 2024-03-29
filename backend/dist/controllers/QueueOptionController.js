"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedia = exports.mediaUpload = exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const CreateService_1 = __importDefault(require("../services/QueueOptionService/CreateService"));
const ListService_1 = __importDefault(require("../services/QueueOptionService/ListService"));
const UpdateService_1 = __importDefault(require("../services/QueueOptionService/UpdateService"));
const ShowService_1 = __importDefault(require("../services/QueueOptionService/ShowService"));
const DeleteService_1 = __importDefault(require("../services/QueueOptionService/DeleteService"));
const lodash_1 = require("lodash");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const QueueOption_1 = __importDefault(require("../models/QueueOption"));
const index = async (req, res) => {
    const { queueId, queueOptionId, parentId } = req.query;
    const queueOptions = await (0, ListService_1.default)({ queueId, queueOptionId, parentId });
    return res.json(queueOptions);
};
exports.index = index;
const store = async (req, res) => {
    const queueOptionData = req.body;
    const queueOption = await (0, CreateService_1.default)(queueOptionData);
    return res.status(200).json(queueOption);
};
exports.store = store;
const show = async (req, res) => {
    const { queueOptionId } = req.params;
    const queueOption = await (0, ShowService_1.default)(queueOptionId);
    return res.status(200).json(queueOption);
};
exports.show = show;
const update = async (req, res) => {
    const { queueOptionId } = req.params;
    const queueOptionData = req.body;
    const queueOption = await (0, UpdateService_1.default)(queueOptionId, queueOptionData);
    return res.status(200).json(queueOption);
};
exports.update = update;
const remove = async (req, res) => {
    const { queueOptionId } = req.params;
    await (0, DeleteService_1.default)(queueOptionId);
    return res.status(200).json({ message: "Option Delected" });
};
exports.remove = remove;
const mediaUpload = async (req, res) => {
    const { queueOptionId } = req.params;
    const files = req.files;
    const file = (0, lodash_1.head)(files);
    try {
        const queue = await QueueOption_1.default.findByPk(queueOptionId);
        queue.update({
            mediaPath: file.filename,
            mediaName: file.originalname
        });
        return res.send({ mensagem: "Arquivo Salvo" });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
};
exports.mediaUpload = mediaUpload;
const deleteMedia = async (req, res) => {
    const { queueOptionId } = req.params;
    try {
        const queue = await QueueOption_1.default.findByPk(queueOptionId);
        const filePath = path_1.default.resolve("public", queue.mediaPath);
        const fileExists = fs_1.default.existsSync(filePath);
        if (fileExists) {
            fs_1.default.unlinkSync(filePath);
        }
        queue.mediaPath = null;
        queue.mediaName = null;
        await queue.save();
        return res.send({ mensagem: "Arquivo excluído" });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
};
exports.deleteMedia = deleteMedia;
