const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Story = sequelize.define('Story', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    points :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    posted_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'stories',
    timestamps: false,
});

module.exports = Story;
