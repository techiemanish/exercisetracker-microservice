const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : false}));

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
var db = mongoose.connection;
var ObjectId = require('mongodb').ObjectId;


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const Schema = mongoose.Schema;
const user = new Schema ({
  username: String,
  date: [String],
  duration: [Number],
  description:[String]
});
let User = mongoose.model('User', user);

app.post('/api/users', function(req, res){
  console.log("post method");
  let record = {
    username: req.body.username,
    date: [],
    duration: [],
    description:[]
  }
  User.create(record, function(err,data){
    if(err) return console.log(err);
    console.log(data);
    res.json({
      username : data['username'],
      _id : data['_id']
    });
    //done(null, data);
  })
});


app.get('/api/users', (req, res) => {
  db.collection('users').find({},{ projection: { _id: 1, username: 1} }).toArray(function(err, result){
    if(err) return console.log(err);
    res.json(result);
    //console.log(result);
  });
});

app.post('/api/users/:_id/exercises', function(req, res){
  let d = new Date(req.body.date);
  console.log(d.toDateString());
  const durationToAdd = req.body.duration;
  const descriptionToAdd = req.body.description;
  
  if(d == "Invalid Date"){
    let today = new Date();
    User.findById(req.params._id, (err, person) => {
    if(err) return console.log(err);
    person.date.push(today.toDateString());
    person.duration.push(durationToAdd);
    person.description.push(descriptionToAdd);
    person.save((err, updatedPerson)=>{
    if(err) return console.log(err);
      console.log(updatedPerson);
      res.json({
        _id : req.params._id,
        username: updatedPerson['username'],
        date : today.toDateString(),
        duration : durationToAdd,
        description : descriptionToAdd
      });
  })
  });
  }
  else{
    User.findById(req.params._id, (err, person) => {
    if(err) return console.log(err);
    person.date.push(d.toDateString());
    person.duration.push(durationToAdd);
    person.description.push(descriptionToAdd);
    person.save((err, updatedPerson)=>{
    if(err) return console.log(err);
      console.log(updatedPerson);
      res.json({
        _id : req.params._id,
        username: updatedPerson['username'],
        date : d.toDateString(),
        duration : durationToAdd,
        description : descriptionToAdd
      });
  })
  });
  }
});

app.get('/api/users/:id/logs', function(req, res){
  console.log(req.query.from);
  let urlfrom = req.query.from;
  let urlto = req.query.to;
  let urlLimit = req.query.limit;
   User.findById(req.params.id, (err, person) => {
    if(err) return console.log(err);
    if(urlfrom != undefined && urlto != undefined && urlLimit != undefined){
      console.log("from to limit exist");
      res.json({
        _id : req.params.id,
        username: person['username'],
        from: urlfrom,
        to : urlto,
        count : person['__v'],
        log: [{description: person['description'],
            duration: person['duration'],
            date: person['date']}]
      });
    }
    else{
      console.log("from to limit not exist");
      res.json({
      _id : req.params.id,
      username: person['username'],
      count : person['__v'],
      log: [{description: person['description'],
            duration: person['duration'],
            date: person['date']}]
    });
    }

    
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

