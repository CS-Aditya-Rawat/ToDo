const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Xcaliber:Aditsh@firstone.yyycs.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser:true, useUnifiedTopology:true});
mongoose.set('useFindAndModify', false);

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name:"Welcome to your todo List",
});

const item2 = new Item({
  name:"Hit the + button to add the task",
});

const item3 = new Item({
  name:"<-- Hit this to delete the task",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name:String,
  items:[itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItem){

    if (foundItem.length === 0) {
      Item.insertMany(defaultItems, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Succesfully Added");
      }
    });
    res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName,
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    })
  }
});

app.post("/delete", function(req, res){
  const checkboxItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkboxItemId, function(err){
      if (err){
        console.log(err);
      }
    })
    res.redirect("/");
  } else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkboxItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      };
    });
  }
  
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a list
        const list = new List({
          name:customListName,
          items:defaultItems
        });
      
        list.save();
        res.redirect("/"+customListName)
      } else {
        //Show an existing List
        res.render("list", {listTitle:foundList.name, newListItems: foundList.items})
      }
    } 
  });

  
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port ==null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started succesfully");
});
