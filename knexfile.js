module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: 'MrPolasDB2o26', // La misma contraseña de antes
      database: 'MrPolasDB'
    },
    migrations: {
      directory: './migrations'
    }
  }
};