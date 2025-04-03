const express= require("express");
const app= express();
const path=require("path");
const mysql=require("mysql2");
const bodyParser = require("body-parser");
const multer = require("multer");


const port=8080;
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.json({limit:"10mb"}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");


const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"ksharma2005",
    database:"bakebite"
});

db.connect((err)=>{
    if (err){
        console.log("database failed to connect",err);
    }
    else{
        console.log("database connected successfully");
    }

    app.get("/", (req, res) => {
        res.render("landingpage.ejs");
    });    
})
app.get("/home",(req,res)=>{
    res.render("home.ejs");
})
app.get("/select",(req,res)=>{
    res.render("options.ejs");
})

app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
app.get("/profile",(req,res)=>{
    res.render("profile.ejs");
})
app.get("/upload",(req,res)=>{
    res.render("upload.ejs")
})
app.get("/postDetailsPage", (req, res) => {
    res.render("postDetails.ejs");
});

app.get("/posts", (req, res) => {
    res.render("allpost.ejs");
});


app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.json({ message: 'Error occurred' });
        if (results.length > 0) {
            return res.json({ message: 'Email already exists' });
        }
        db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password], (err, result) => {
                if (err) return res.json({ success:false, message: 'Error occurred' });
                res.json({success:true, message: 'User registered successfully',username:results[0].username,email:results[0].email  });
            });
    });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) return res.json({success:false, message: 'Error occurred' });
        if (results.length === 0) {
            return res.json({success:false, message: 'Wrong email or password' });
        }
        res.json({ success:true,message: 'Login successful',username:results[0].username,email:results[0].email });
    });
});

app.post("/upload",upload.single("image") ,(req, res) => {
    const { user,email, foodname, quantity, description, contact } = req.body;
    const image = req.file ? req.file.buffer.toString("base64") : null; // Convert image to base64
    const q = "INSERT INTO posts(user,email, foodname, quantity, description, contact, image) VALUES(?,?, ?, ?, ?, ?, ?);";
    db.query(q, [user, email ,foodname, quantity, description, contact, image], (err, result) => {
        if (err) {
            console.error("Error inserting post:", err);
            res.status(500).send("Error uploading post");
        } else {
            res.json({ message: "Post uploaded successfully!", id: result.insertId });;
        }
    });
});

app.get("/postDetails", (req, res) => {
    const {username} = req.query;
    console.log("Received username:", username);
    
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }
    const q = "SELECT id,foodname, quantity, description, contact, image FROM posts WHERE user = ?";
    
    db.query(q, [username], (err, result) => {
        if (err) {
            console.log("Error showing posts", err);
            return res.status(500).send("Error showing post");
        }
        const posts = result.map(post => ({
            id:post.id,
            foodname: post.foodname,
            quantity: post.quantity,
            description: post.description,
            contact: post.contact,
            image: post.image ? Buffer.from(post.image).toString("base64") : null

        }));
       
        res.json(posts);
    });
});

app.delete("/delete/:id",(req,res)=>{
    const id=req.params.id;
    console.log("Deleting post ID:", id);
    console.log("Received DELETE request for ID:", req.params.id); 
    const q="DELETE FROM posts WHERE id=?"
    db.query(q,[id],(err,result)=>{
        if(err){
            console.log("error deleting post",err)
            return res.status(500).json("error deleting post");
        }
        res.json({message:"post deleted successfully"});
    })
})

app.get("/allpost",(req,res)=>{
    const q=`SELECT posts.*, users.email 
        FROM posts 
        JOIN users ON posts.user = users.username`;
    db.query(q,(err,result)=>{
        if (err) {
            console.log("Error showing posts", err);
            return res.status(500).send("Error showing post");
        }
        const posts = result.map(post => ({
            id:post.id,
            username:post.user,
            email:post.email,
            foodname: post.foodname,
            quantity: post.quantity,
            description: post.description,
            contact: post.contact,
            image: post.image ? Buffer.from(post.image).toString("base64") : null

        }));
        
        res.json(posts);
    })
})

app.listen(port,()=>{
    console.log(`listening to ${port}`)
})