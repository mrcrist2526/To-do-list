const express = require("express");
// allows me to call express with "app"
const app = express();
// the local port my server is sending docs to
const mongoose = require('mongoose');
var _ = require('lodash');

//a acces to view folder for multiple ejs templates/pages
app.set("view engine", "ejs");


// body parser to access post request payload information
app.use(express.urlencoded({
  extended: true
}));

// allows for one styles sheet to be applied across mulitple pages/templatess
app.use(express.static("public"));

// allows functions to be outsourced to seperate pages to be called back
const date = require(__dirname + "/date.js")
// DATABASE
// connects to mongoDB and creates a db "toDoList"
const uri = "mongodb+srv://mason-admin:Test12345@cluster0.5rqj1.mongodb.net/toDoList";
mongoose.connect(uri);
  //  { useNewUrlParser: true, useUnifiedTopology: true });
// creates a schematic that all items in the collection abide to
const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);




// creates the collection
const Item = mongoose.model("Item", itemsSchema);
// items i will add to collection in toDoListDB
const code = {
  name: "Code"
};

const read = {
  name: "Read"
};

const dontSmoke = {
  name: "Do not Smoke"
}

// When a request is made to the localHost address this function is executed.
app.get("/", function(req, res) {
  // calls an outsourced ejs function and assigns it to day to then be rendered on "list" page
  let day = date.getDay();
  // Searches in Mongo DB under the items collection and cR(eads)ud all of the items.
  Item.find({}, (err, items) => {
    // checks if there are items in the collection
    if (items.length === 0) {
      // if no items, adds items
      Item.insertMany([code, read, dontSmoke], e => {
        if (e) {
          console.log(e);
        } else {
          console.log("Added default items");
        }
      });
      // redirects to home page so that added items display
      res.redirect("/");
    } else {
      // renders the list page as "/" and applies ejs data
      res.render("list", {
        title: day,
        newTaskItems: items
      });
    }
  })
});


// allows for adding new tasks to lists
app.post("/", function(req, res) {
  // retreives input value from html input
  let newTask = req.body.newTask;
  // retreives list name from html button value!!! Neat!
  let listName = req.body.list;
  // creates an object so the new task can be added to the database
  const taskAdd = new Item({
    name: newTask
  });
  // checs if the list title is the same as todays...
  // if so adds task to home list
  if (listName === date.getDay()) {
    // adds new task to database
    taskAdd.save();
    // reloads page to home page so added data will appear
    res.redirect("/");
    // checks to see if the item is being added to a custom list
  } else {
    // Mongoose find query to see if their is a list alreay in the List database
    List.findOne({
      name: listName
      // callback function takes err and results as arguments
    }, (err, foundList) => {
      if (!err) {
        // if list was found, taps into results "items" array and pushes new item
        foundList.items.push(taskAdd);
        // saves items
        foundList.save();
        // redirects to custom list page
        res.redirect("/" + listName)
      }
    })
  }
});

app.post("/delete", (req, res) => {
  const listName = req.body.listName;

  if(listName === date.getDay()){
  Item.deleteOne({
    _id: req.body.checkbox
  }, (err) => {
    if(!err){
      res.redirect("/")
      console.log("redirected home")
    }
  })
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: req.body.checkbox}}}, (err, foundList) => {
    if (!err){
      res.redirect("/" + listName)
    }
  })
}
});


app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, (err, results) => {
    if (!err) {
      if (!results) {
        const newCustomList = new List({
          name: customListName,
          items: [code, read, dontSmoke]
        });
        newCustomList.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          title: results.name,
          newTaskItems: results.items
        })
      }
    }
  });
});






app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);
