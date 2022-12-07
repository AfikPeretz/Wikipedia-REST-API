const express = require('express');
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/wikiDB');

const articleSchema = new mongoose.Schema({
    title: { type : String , unique : true},
    content: String
});

const Article = mongoose.model('Article', articleSchema);


app.route('/articles')

.get(function(req, res){
    Article.find({}, function(err, results){
        if (!err){
            res.send(results);
        } else {
            res.send(err);
        }
    });
})

.post(function(req, res){
    const newArticle = new Article({
        title: req.body.title,
        content: req.body.content
    });
    newArticle.save(function(err){
        if (!err){
            res.send("Successfully added a new article!");
        } else {
            res.send(err);
        }
    });
})

.delete(function(req, res){
    Article.deleteMany(function(err){
        if (!err){
            res.send("Successfully deleted all articles.");
        } else {
            res.send(err);
        }
    });
});

//////////////////////////////////////////////Requests Targetting A Specific Article/////////////////////////////////////////////////////////////////

app.route('/articles/:articleName')

.get(function(req, res){
    const articleNameReadyForComparing = _.lowerCase(req.params.articleName).split(" ").join("");
    Article.find({}, function(err, result){
        if (!err){
            let checkIfSend = true;
            result.forEach(article => {
                if (articleNameReadyForComparing === _.lowerCase(article.title)){
                    checkIfSend = false;
                    res.send(article);
                }
            });
            if (checkIfSend){
                res.send("Article not exists.")
            }
        } else {
            res.send(err);
        }
    });
})

.put(function(req, res){
    Article.replaceOne(
        { title: req.params.articleName },
        { title: req.body.title, content: req.body.content},
        function(err, result) {
          if (err) {
            res.send(err);
          } else {
            res.send("Successfully replaced articles!");
          }
        }
    );
})

.patch(function(req, res){
    Article.updateOne(
        {title: req.params.articleName}, 
        {title: req.body.title, content: req.body.content}, 
        function(err){
            if (!err){
                res.send("Successfully updated articles!");
            } else {
                res.send(err);
            }
        }        
    );
})

.delete(function(req, res){
    Article.deleteOne({title: req.params.articleName}, function(err){
        if (!err){
            res.send("Successfully deleted articles!");
        } else {
            res.send(err);
        }
    })
});



app.listen(3000, function() {
    console.log("Server started on port 3000");
});