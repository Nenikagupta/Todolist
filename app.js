const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _=require("Lodash");

const dt=require(__dirname + "/date.js");
const app=express();

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));

//console.log(dt())

//use mongodb to add element in list
//mongoose.connect("mongodb+srv://admin-nenika:nicky123@cluster0-fu3ux.mongodb.net/todolistDB",{useNewUrlParser: true,useUnifiedTopology: true});
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true,useUnifiedTopology: true});
const todoSchema=new mongoose.Schema({
  work:String
});
const Item=mongoose.model("Item",todoSchema);
const item1=new Item({
  work:"Click + to add new item"
});
const item2=new Item({
  work:"Click checkbox, if work has done"
});
const item3=new Item({
  work:"For new workplace, add work in search-bar"
});

const defaultitems=[item1,item2,item3];

const listSchema=({
  name:String,
  items:[todoSchema]
});

const List=mongoose.model("List",listSchema);

app.set('view engine', 'ejs');  //using express to use ejs as a view engine

app.get("/",function(req,res){
  Item.find({},function(err,founditems){
    if(founditems.length===0){  //add default items once in list(if list has no item)
      Item.insertMany(defaultitems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfuly inserted");
        }
      });
      res.redirect("/");//redirect to get function again so that this times else loop executed & res.render executed
    }
    else{
      res.render("list", { workplace: "Today" , newcontent:founditems} );
    }

  });
});

app.get("/:topic",function(req,res){
  var requestedtopic=_.lowerCase(req.params.topic);
  var topic=_.capitalize([string=requestedtopic]);

  List.findOne({name:topic},function(err,foundList){
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        //create a new list
        const list=new List({
          name:topic,
          items:defaultitems
        });

        list.save();
        res.redirect("/" + topic);
      }
      else{
        //shows an existing liste
        res.render("list",{workplace:foundList.name , newcontent:foundList.items});
      }
    }
  });

});


app.post("/",function(req,res){

  const itemName=req.body.Addnewitem;
  const workplace=req.body.list;

  var anotheritem=new Item({
    work:itemName
  });

  if(workplace=="Today"){
    anotheritem.save();
    res.redirect("/");
  }else{
    List.findOne({name:workplace},function(err,foundList){
      foundList.items.push(anotheritem);
      foundList.save();
      res.redirect("/"+ workplace);
    });
  }

});

app.post("/delete",function(req,res){
  const deleteditem=req.body.checkbox;
  const listName=req.body.list;

 if(listName=="Today"){
    Item.deleteOne({_id:deleteditem},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("successfuly deleted");
        res.redirect("/");//redirect so that all items in the list print
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteditem}}}, {useFindAndModify: false},function(err,foundList){
        res.redirect("/"+listName);
    });
  }

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
  console.log("Server has started Successfulyon");
});
