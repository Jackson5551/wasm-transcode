'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Files', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Jobs',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('input', 'output'),
        allowNull: false
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      size: {
        type: Sequelize.BIGINT
      },
      mime_type: {
        type: Sequelize.STRING
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Files');
  }
};
