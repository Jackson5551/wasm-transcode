'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Jobs", "ready", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "output_format"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Jobs", "ready", );
  }
};
