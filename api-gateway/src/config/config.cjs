require('dotenv').config(); // Optional: load from .env

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || null,
        database: process.env.DB_NAME || 'transcoder_dev',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: console.log
    },
}