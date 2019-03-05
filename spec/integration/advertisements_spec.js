const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/advertisements/";
const sequelize = require("../../src/db/models/index").sequelize;
const Advert = require("../../src/db/models").Advertisement;

describe("routes : advertisements", () => {
  beforeEach((done) => {
    this.advert;
    sequelize.sync({force: true}).then((res) => {
      Advert.create({
        title: "Google Ad",
        description: "Search your every question"
      })
      .then((advert) => {
        this.advert = advert;
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe("GET /advertisements", () => {
    it("should return a status code 200 and all advertisements", (done) => {
      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(err).toBeNull();
        expect(body).toContain("Ads");
        expect(body).toContain("Google Ad");
        done();
      });
    });
  });

  describe("GET /advertisements/new", () => {
    it("should render a new ad form", (done) => {
      request.get(`${base}new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Ad");
        done();
      });
    });
  });

  describe("POST /advertisements/create", () => {
    const options = {
      url: `${base}create`,
      form: {
        title: "Green Day concert",
        description: "American Idiot Tour 2010"
      }
    };

    it("should create a new topic and redirect", (done) => {
      request.post(options, (err, res, body) => {
        Advert.findOne({where: {title: "Green Day concert"}})
        .then((advert) => {
          expect(res.statusCode).toBe(303);
          expect(advert.title).toBe("Green Day concert");
          expect(advert.description).toBe("American Idiot Tour 2010");
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });
  });

  describe("GET /advertisements/:id", () => {
    it("should render a view with the select advertisement", (done) => {
      request.get(`${base}${this.advert.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Google Ad");
        done();
      });
    });
  });

  describe("POST /advertisements/:id/destroy", () => {
    it("should delete the advertisement with the associated ID", (done) => {
      Advert.all()
      .then((adverts) => {
        const advertCountBeforeDelete = adverts.length;

        expect(advertCountBeforeDelete).toBe(1);

        request.post(`${base}${this.advert.id}/destroy`, (err, res, body) => {
          Advert.all()
          .then((adverts) => {
            expect(err).toBeNull();
            expect(adverts.length).toBe(advertCountBeforeDelete - 1);
            done();
          })
        });
      });
    });
  });

  describe("GET /advertisements/:id/edit", () => {
    it("should render a view with an edit topic form", (done) => {
      request.get(`${base}${this.advert.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Edit Ad");
        expect(body).toContain("Google Ad");
        done();
      });
    });
  });

  describe("POST /advertisements/:id/update", () => {
    it("should update the topic with the given values", (done) => {
      const options = {
        url: `${base}${this.advert.id}/update`,
        form: {
          title: "Google Advertisement",
          description: "Search your every question"
        }
      };

      request.post(options, (err, res, body) => {
        expect(err).toBeNull();

        Advert.findOne({
          where: { id: this.advert.id }
        })
        .then((advert) => {
          expect(advert.title).toBe("Google Advertisement")
          done();
        });
      });
    });
  });

})
