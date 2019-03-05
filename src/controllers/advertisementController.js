const advertQueries = require("../db/queries.advertisements.js");

module.exports = {
  index(req, res, next){
    advertQueries.getAllAdverts((err, adverts) => {
      if(err){
        res.redirect(500, "static/index");
      } else {
        res.render("advertisements/index", {adverts});
      }
    })
  },
  new(req, res, next){
    res.render("advertisements/new");
  },
  create(req, res, next){
    let newAd = {
      title: req.body.title,
      description: req.body.description
    };
    advertQueries.addAdvert(newAd, (err, advert) => {
      if(err){
        res.redirect(505, "advertisements/new");
      } else {
        res.redirect(303, `/advertisements/${advert.id}`);
      }
    });
  },
  show(req, res, next){
    advertQueries.getAdvert(req.params.id, (err, advert) => {
      if(err){
        res.redirect(500, `/advertisements/${advert.id}`);
      } else {
        res.render("advertisements/show", {advert});
      }
    });
  },
  destroy(req, res, next){
    advertQueries.deleteAdvert(req.params.id, (err, advert) => {
      if(err){
        res.redirect(500, `/advertisements/${advert.id}`);
      } else {
        res.redirect(303, "/advertisements");
      }
    });
  },
  edit(req, res, next){
    advertQueries.getAdvert(req.params.id, (err, advert) => {
      if(err || advert == null){
        res.redirect(404, "/");
      } else {
        res.render("advertisements/edit", {advert});
      }
    });
  },
  update(req, res, next){
    advertQueries.updateAdvert(req.params.id, req.body, (err, advert) => {
      if(err || advert == null){
        res.redirect(404, `/advertisements/${req.params.id}/edit`);
      } else {
        res.redirect(`/advertisements/${advert.id}`)
      }
    })
  }

}
