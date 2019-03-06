const flairQueries = require("../db/queries.flair.js");

module.exports = {
  index(req, res, next){
    flairQueries.getAllFlair((err, flair) => {
      if(err){
        res.redirect(500, "static/index");
      } else {
        res.render("flair/index", {flair});
      }
    })
  },
  new(req, res, next){
    res.render("flair/new");
  },
  create(req, res, next){
    let newFlair = {
      name: req.body.name,
      color: req.body.color
    };
    flairQueries.addFlair(newFlair, (err, flair) => {
      if(err){
        res.redirect(500, "/flair/new");
      } else {
        res.redirect(303, `/flair/${flair.id}`);
      }
    });
  },
  show(req, res, next){
    flairQueries.getFlair(req.params.id, (err, flair) => {
      if (err || flair == null) {
        res.redirect(404, "/");
      } else {
        res.render("flair/show", {flair});
      }
    });
  },
  destroy(req, res, next){
    flairQueries.deleteFlair(req.params.id, (err, flair) => {
      if(err){
        res.redirect(500, `/flair/${flair.id}`);
      } else {
        res.redirect(303, "/flair");
      }
    });
  },
  edit(req, res, next){
    flairQueries.getFlair(req.params.id, (err, flair) => {
      if(err || flair == null){
        res.redirect(404, "/");
      } else {
        res.render("flair/edit", {flair});
      }
    });
  },
  update(req, res, next){
    flairQueries.updateFlair(req.params.id, req.body, (err, flair) => {
      if(err || flair == null){
        res.redirect(404, `/flair/${req.params.id}/edit`);
      } else {
        res.redirect(`/flair/${flair.id}`);
      }
    });
  }

}
