"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.changeColumn("Plans", "value", {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true,
            })
        ]);
    }
};
