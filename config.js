require("dotenv").config();

const sslAccepts = ["true", "t", "yes", "y"].map(x => x.toUpperCase()); 

module.exports = {
    HOST : process.env.HOST,
    SSL : sslAccepts.includes(process.env.SSL.toUpperCase()) ? true : false,
    SERVER_PORT : process.env.SERVER_PORT,
    APP_PORT : process.env.APP_PORT,
    DB_PORT : process.env.DB_PORT,
}