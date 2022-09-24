let express = require('express');
let app = express();
let dotenv = require('dotenv');
dotenv.config()
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let mongoUrl = "mongodb+srv://local:test12345@cluster0.f8vmc.mongodb.net/?retryWrites=true&w=majority"
let port = process.env.PORT||7600;
let bodyParser = require('body-parser');
let cors = require('cors');
let db;
let col_name = "users";


app.use(bodyParser.urlencoded({ extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.set('views','./src/views')
app.set('view engine','ejs')

app.get('/health',(req,res)=>{
    res.send('Heath Ok')
})
app.get('/',(req,res) => {
    db.collection(col_name).find({}).toArray((err,result) => {
        if(err) throw err;
        res.render('index',{data:result});
    })
})

app.get('/new',(req,res) => {
    res.status(200).render('forms')
})

//get users
app.get('/users',(req,res) => {
    let query = {}
    if(req.query.city && req.query.role){
        query ={ city:req.query.city, role:req.query.role,isActive:true}
    }else if(req.query.city){
        query = { city:req.query.city,isActive:true}
    }else if(req.query.role){
        query = { role:req.query.role,isActive:true}
    }else if(req.query.isActive){
        let isActive = req.query.isActive
        if(isActive == "false"){
            isActive = false
        }else{
            isActive = true
        }
        query = {isActive}
    }
    db.collection(col_name).find(query).toArray((err,result) => {
        if(err) throw err;
        res.status(200).send(result)
    })
})
// perticular user
app.get('/user/:id',(req,res)=>{
    let _id = mongo.ObjectId(req.params.id)
    db.collection(col_name).find({_id}).toArray((err,result)=>{
        if (err) throw err;
        res.status(200).send(result)
    })
})
//add users
app.post('/addUser',(req,res) => {
    let data = {
        name:req.body.name,
        city:req.body.city,
        phone:req.body.phone,
        role:req.body.role?req.body.role:'User',
        isActive:true
    }
    db.collection(col_name).insert(data,(err,result) => {
        if(err) throw err;
        //res.status(200).send('Data Added successfully')
        res.redirect('/')
    })
})
//update user
app.put('/updateUser',(req,res)=>{
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set: {
                name:req.body.name,
                city:req.body.city,
                phone:req.body.phone,
                role:req.body.role,
                isActive:true

            }



        },(err,result)=>{
            res.send('data updated sucessfully')
        }
    )

 
        
})
///delete user
app.delete('/deleteUser',(req,res) => {
    let _id = mongo.ObjectId(req.body._id);
    db.collection(col_name).remove({_id},(err,result) => {
        if(err) throw err;
        res.status(200).send('User Deleted')
    })
})
//soft delete
app.put('/deactivateUser',(req,res)=>{
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set: {
                isActive: false
            }

        },(err,result) => {
            res.send('Deactivated')
        }


    )

})
//soft delete
app.put('/activateUser',(req,res)=>{
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set: {
                isActive: true
            }

        },(err,result) => {
            res.send('activated')
        }


    )

})

MongoClient.connect(mongoUrl, (err, client)=>{
    if (err) console.log('error while connecting')
     db = client.db('nareshit')
     app.listen(port,() =>{
        console.log(`Listening on port ${port}`)
     })
    
})



