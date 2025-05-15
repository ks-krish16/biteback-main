const express= require("express");
const app= express();
const path=require("path");
const mysql=require("mysql2");
const bodyParser = require("body-parser");
const multer = require("multer");
const supabase = require("./supabaseClient");
require('dotenv').config();


const port=8080;
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.json({limit:"10mb"}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");





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


app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    const { data: existingUser, error: selectError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email);

    if (selectError) return res.json({ message: "Error occurred" });
    if (existingUser.length > 0) return res.json({ message: "Email already exists" });

    const { data, error } = await supabase
        .from("users")
        .insert([{ username, email, password }]);

    if (error) return res.json({ success: false, message: "Error occurred" });

    res.json({ success: true, message: "User registered successfully", username, email });
});



app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password);

    if (error || data.length === 0)
        return res.json({ success: false, message: "Wrong email or password" });

    res.json({
        success: true,
        message: "Login successful",
        username: data[0].username,
        email: data[0].email,
    });
});



app.post("/upload", upload.single("image"), async (req, res) => {
    const { user, email, foodname, quantity, description, contact } = req.body;
    const image = req.file ? req.file.buffer.toString("base64") : null;

    const { data, error } = await supabase
        .from("posts")
        .insert([{ user, email, foodname, quantity, description, contact, image }]);

    if (error) return res.status(500).send("Error uploading post");

    res.json({ message: "Post uploaded successfully!", id: data[0].id });
});



app.get("/postDetails", async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Username is required" });

    const { data, error } = await supabase
        .from("posts")
        .select("id, foodname, quantity, description, contact, image")
        .eq("user", username);

    if (error) return res.status(500).send("Error showing post");

    const posts = data.map(post => ({
        ...post,
        image: post.image ? Buffer.from(post.image, "base64").toString("base64") : null,
    }));

    res.json(posts);
});



app.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) return res.status(500).json("Error deleting post");

    res.json({ message: "Post deleted successfully" });
});


app.get("/allpost", async (req, res) => {
    const { data, error } = await supabase
        .from("posts")
        .select("*, users:users(email)")
        .order("id", { ascending: false });

    if (error) return res.status(500).send("Error showing post");

    const posts = data.map(post => ({
        ...post,
        email: post.users?.email || post.email,
        image: post.image ? Buffer.from(post.image, "base64").toString("base64") : null,
    }));

    res.json(posts);
});

app.listen(port,()=>{
    console.log(`listening to ${port}`)
})

app.listen(port,()=>{
    console.log(`listening to ${port}`)
})
