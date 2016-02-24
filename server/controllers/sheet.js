var db = require('../db');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

module.exports = {
  getSheets: getSheets,
  getSheet: getSheet,
  updateSheet: updateSheet,
  createSheet: createSheet,
  deleteSheet: deleteSheet,
  importSheets: importSheets
};

/**
 * Finds all records in the sheet collection
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getSheets(req, res)
{
  db.find('sheets', function(docs)
  {
    ok(res, docs);
  },
  function(err)
  {
    error(res, err);
  });
}

/**
 * Finds all matching records in the sheet collection
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getSheet(req, res)
{
    db.find('sheets', function(docs)
    {
      ok(res, docs);
    },
    function(err)
    {
      error(res, err);
    });
}

/**
 * Updates matching records in the sheet collection
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function updateSheet(req, res)
{
  var sheetId = parseInt(req.params.sheetId);
  var sheet = req.body;

  db.update('sheets', {_id: sheetId}, sheet, function(response)
  {
    ok(res, response);
  },
  function(err)
  {
    error(res, err);
  });
}

/**
 * Updates matching records in the sheet collection
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function createSheet(req, res)
{
  var sheet = req.body;

  db.insert('sheets', sheet, function(doc)
  {
    ok(res, doc);
  },
  function(err)
  {
    error(res, err);
  });
}

/**
 * Updates matching records in the sheet collection
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function deleteSheet(req, res)
{
  var sheetId = parseInt(req.params.sheetId);

  db.remove('sheets', {_id: sheetId}, function(docs)
  {
    ok(res, docs);
  },
  function(err)
  {
    error(res, err);
  });
}

/**
 * Import from JSON file and load into Mongo. Updates if already exists, otherwise creates new.
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function importSheets(req, res)
{
  var importFile = fs.readFileSync(path.normalize(__dirname + '/../data/ski_sheets.json', 'utf8'));
  importFile = JSON.parse(importFile);

  var pages = importFile.pages;
  var sheets = [];

  pages.forEach(function(page)
  {
    sheets = sheets.concat(page.results);
  });

  var errors = [];
  var data = [];

  var finished = _.after(sheets.length, function()
  {
    if (data.length === 0)
    {
      error(res, errors);
    }
    else
    {
      ok(res, {data: data, errors: errors});
    }

  });

  db.drop('sheets', function()
  {
    _.forEach(sheets, function(sheet)
    {
      db.insert('sheets', sheet, function(docs)
      {
        data.push(sheet);
        finished();
      },
      function(err)
      {
        errors.push(err);
        finished();
      });
    });
  });
}

/**
 * Sends a formatted OK response
 * @param {object} res - Express response
 * @param {object} data - Requested data
 */
function ok(res, data)
{
  res.send({status: 'OK', results: data});
}

/**
 * Sends a formatted error response
 * @param {object} res - Express response
 * @param {object} err - Error object/string
 */
function error(res, err)
{
  res.status(500).send({status: 'ERR', error: err});
}
