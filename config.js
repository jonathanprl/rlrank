module.exports = {
    test: 'Hello',
    port: 8080,
    services: {
      qpx: {
        key: 'AIzaSyDg1CrKmm9o5Jf2GeSyWt8hZsGtDye-nHo',
        endpoint: 'https://www.googleapis.com/qpxExpress/v1/trips'
      }
    },
    mongodb: {
      connection: 'mongodb://localhost:27017/rlrank'
    }
};
