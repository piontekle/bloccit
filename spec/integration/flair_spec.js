const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/flair/";

const sequelize = require("../../src/db/models/index").sequelize;
const Flair = require("../../src/db/models").Flair

describe("routes : flair", () => {

  beforeEach((done) => {
    this.flair;

    sequelize.sync({force: true}).then((res) => {

      Flair.create({
        name: "Yay",
        color: "orange"
      })
      .then((flair) => {
        this.flair = flair;
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe("GET /flair", () => {
    it("should return a status code 200 and all flair", (done) => {
      request.get(base, (err, res, body) => {
        expect(err).toBeNull();
        expect(res.statusCode).toBe(200);
        expect(body).toContain("Flair");
        expect(body).toContain("Yay");
        done();
      });
    });
  });

  describe("GET /flair/new", () => {
    it("should render a new flair form", (done) => {
      request.get(`${base}new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Flair");
        done();
      });
    });
  });

  describe("POST /flair/create", () => {
    const options = {
      url: `${base}create`,
      form: {
        name: "Good",
        color: "grey"
      }
    };

    it("should create a new topic and redirect", (done) => {
      request.post(options, (err, res, body) => {
        Flair.findOne({where: {name: "Good"}})
        .then((flair) => {
          expect(res.statusCode).toBe(303);
          expect(flair.name).toBe("Good");
          expect(flair.color).toBe("grey");
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });
  });

  describe("GET /flair/:id", () => {
    it("should render a view with the selected topic", (done) => {
      request.get(`${base}${this.flair.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Yay");
        done();
      });
    });
  });

  describe("POST /flair/:id/destroy", () => {
    it("should delete the topic with the associated ID", (done) => {
      Flair.all()
      .then((flair) => {
        const flairCountBeforeDelete = flair.length;
        expect(flairCountBeforeDelete).toBe(1);

        request.post(`${base}${this.flair.id}/destroy`, (err, res, body) => {
          Flair.all()
          .then((flair) => {
            expect(err).toBeNull();
            expect(flair.length).toBe(flairCountBeforeDelete - 1);
            done();
          })
        });
      });
    });
  });

  describe("GET /flair/:id/edit", () => {
    it("should render a view with an edit topic form", (done) => {
      request.get(`${base}${this.flair.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Edit Flair");
        expect(body).toContain("Yay");
        done();
      });
    });
  });

  describe("POST /flair/:id/update", () => {
    it("should update the flair with the given values", (done) => {
      const options = {
        url: `${base}${this.flair.id}/update`,
        form: {
          name: "Yaysies",
          color: "orange"
        }
      };

      request.post(options, (err, res, body) => {
        expect(err).toBeNull();

        Flair.findOne({
          where: { id: this.flair.id }
        })
        .then((flair) => {
          expect(flair.name).toBe("Yaysies");
          done();
        });
      });
    });
  });

})
