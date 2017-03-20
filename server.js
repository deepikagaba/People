var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var PEOPLE_COLLECTION = "people";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
mongodb.MongoClient.connect("mongodb://127.0.0.1:27017/People", function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// PEOPLE API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/people"
 *    GET: finds all people
 *    POST: creates a new person
 */

app.get("/people", function(req, res) {
  db.collection(PEOPLE_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get people.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.post("/people", function(req, res) {
  var newPerson = req.body;
  newPerson.createDate = new Date();

  if (!(req.body.name)) {
    handleError(res, "Invalid user input", "Must provide a name.", 400);
  }

  db.collection(PEOPLE_COLLECTION).insertOne(newPerson, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new person.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/people/:id"
 *    GET: find people by id
 *    PUT: update people by id
 *    DELETE: deletes people by id
 */

app.get("/people/:id", function(req, res) {
  db.collection(PEOPLE_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get people");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/people/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(PEOPLE_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update people");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/people/:id", function(req, res) {
  db.collection(PEOPLE_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete people");
    } else {
      res.status(204).end();
    }
  });
});