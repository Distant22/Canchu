module.exports = {
    databaseOptions: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: "user"
    },
  };
