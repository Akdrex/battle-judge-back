const { DataTypes } = require('sequelize')
const sequelize = require('../utils/db-connection');
const bcrypt = require('bcrypt');

const User = sequelize.define('users', {
        role: {
            type: DataTypes.ENUM('admin', 'judge', 'participant'),
            defaultValue: 'participant',
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(32),
            unique: true,
            allowNull: false,
        },
        mail: {
            type: DataTypes.STRING(32),
            allowNull: false,
            validate: {
                is: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            }
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        team: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
        hooks: {
            // Create one
            beforeCreate: (user) => {
                user.dataValues.password = bcrypt.hashSync(user.password, 10)
            },
            // Create multiple
            beforeBulkCreate: (users) => {
                users.forEach((user) => {
                    user.dataValues.password = bcrypt.hashSync(user.password, 10);
                });
            },
        }
    }
)

module.exports = User;