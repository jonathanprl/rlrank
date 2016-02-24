var config = require('../config');
var mongodb = require('mongojs')(config.mongodb.connection);

module.exports = {
  find: find,
  insert: insert,
  upsert: upsert,
  update: update,
  remove: remove,
  drop: drop
};

/**
 * Finds all records in the employee collection
 * @param {string} collectionName - MongoDB collection name
 * @param {function} callback - Success or error callback function
 */
function find(collectionName, callback)
{
  mongodb.collection(collectionName).find(function (err, docs)
  {
    if (err)
    {
      console.log(err);
      callback(null, err);
      return;
    }

    callback(docs, null);
  });
}

/**
 * Insert document into a collection
 * @param {string} collectionName - MongoDB collection name
 * @param {object} doc - Document
 * @param {function} callback - Success or error callback function
 */
function insert(collectionName, doc, callback)
{
  mongodb.collection(collectionName).insert(doc, function(err, docs)
  {
    if (err)
    {
      console.log(err);
      callback(null, err);
      return;
    }

    callback(docs, null);
  });
}

/**
 * Insert document into a collection if doesn't already exist
 * @param {string} collectionName - MongoDB collection name
 * @param {string} query - MongoDB query
 * @param {object} doc - Document
 * @param {function} callback - Success or error callback function
 */
function upsert(collectionName, query, doc, callback)
{
  mongodb.collection(collectionName).update(query, doc, {upsert: true}, function(err, docs)
  {
    if (err)
    {
      console.log(err);
      callback(null, err);
      return;
    }

    callback(docs, null);
  });
}

/**
 * Update document in collection which matches query
 * @param {string} collectionName - MongoDB collection name
 * @param {string} query - MongoDB query
 * @param {object} doc - Document
 * @param {function} callback - Success or error callback function
 */
function update(collectionName, query, doc, callback)
{
  mongodb.collection(collectionName).update(query, doc, function(err, doc)
  {
    if (err)
    {
      console.log(err);
      callback(null, err);
      return;
    }

    callback(doc, null);
  });
}

/**
 * Remove document that matches query
 * @param {string} collectionName - MongoDB collection name
 * @param {string} query - MongoDB query
 * @param {function} callback - Success or error callback function
 */
function remove(collectionName, query, callback)
{
  mongodb.collection(collectionName).remove(query, function(err, doc)
  {
    if (err)
    {
      console.log(err);
      callback(null, err);
      return;
    }

    callback(doc, null);
  });
}

/**
 * Drop collection
 * @param {string} collectionName - MongoDB collection name
 * @param {function} callback - Success or error callback function
 */
function drop(collectionName, callback)
{
  mongodb.collection(collectionName).drop(function(err, doc)
  {
    if (err)
    {
      console.log(err);
      callback(null, err);
      return;
    }

    callback(doc, null);
  });
}
