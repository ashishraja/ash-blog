//jshint esversion:6
const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
  path: "Config/config.env",
});

mongoose.connect(process.env.DB_URI);


const blogSchema = {
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  markdown: {
    type: String,
    required: true
  },
};
const Blog = mongoose.model('Blog', blogSchema);


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async function (req, res) {
  const blog = await Blog.find();
  res.render("home", { home: homeStartingContent, posts: blog });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contact: contactContent });
});

app.get("/about", function (req, res) {
  res.render("about", { about: aboutContent });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", async function (req, res) {
  const post = {
    title: req.body.postTitle,
    description: req.body.postBody,
    markdown: req.body.postMarkdown
  }
  await Blog.create(post);
  res.redirect("/");
});

app.get("/posts/:postName", async function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);
  const posts = await Blog.find();
  posts.forEach(function (post) {
    const storedTitle = _.lowerCase(post.title);

    if (requestedTitle === storedTitle) {
      res.render("post", {
        title: post.title,
        markdown: post.markdown
      });
    }
  });
});

app.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  res.render("edit" ,{  post:blog });
});

app.post("/edit/:id", async (req, res) => {
  const updatedTitle = req.body.updatedTitle;
  const updatedDescription = req.body.updatedDescription;
  const updatedMarkdown = req.body.updatedMarkdown;
  const blog = await Blog.findById(req.params.id);

  if (updatedTitle) {
      blog.title = updatedTitle;
  }
  if (updatedDescription) {
      blog.description = updatedDescription;
  }
  if (updatedMarkdown) {
      blog.markdown = updatedMarkdown;
  }
  await blog.save();
  
  res.redirect("/");

});


app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.delete;
  const blog = await Blog.findById(checkedItemId);
  await blog.deleteOne()
  res.redirect("/");
});


app.listen(process.env.PORT, function () {
  console.log(`Server is working on port : ${process.env.PORT} `);
});
