'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Jobs', 'input_path', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('Jobs', 'output_path', {
      type: Sequelize.TEXT,
      allowNull: true, // or false if required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Jobs', 'input_path', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('Jobs', 'output_path', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
