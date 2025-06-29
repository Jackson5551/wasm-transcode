'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Jobs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      input_path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      output_path: {
        type: Sequelize.STRING
      },
      input_format: {
        type: Sequelize.STRING
      },
      output_format: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('queued', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'queued'
      },
      progress: {
        type: Sequelize.FLOAT // 0.0 - 100.0
      },
      error_message: {
        type: Sequelize.TEXT
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Jobs');
  }
};
