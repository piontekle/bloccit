const request = require("request");
const server= require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("routes : posts", () => {
  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;
    this.post2;
    this.user2;

    sequelize.sync({force: true}).then((res) => {
      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe",
        role: "member"
      })
      .then((user) => {
        this.user = user;

        User.create({
          email: "member@member.com",
          password: "123456",
          role: "member"
        })
        .then((user2) => {
          this.user2 = user2;

          Topic.create({
            title: "Winter Games",
            description: "Post your Winter Games stories.",
            posts: [{
              title: "Snowball Fighting",
              body: "So much snow!",
              userId: this.user.id
            },
            {
              title: "Snowman Building",
              body: "It's tough when they're tall",
              userId: this.user2.id
            }]
          }, {
            include: {
              model: Post,
              as: "posts"
            }
          })
          .then((topic) => {
            this.topic = topic;
            this.post = topic.posts[0];
            this.post2 = topic.posts[1];
            done();
          })
        })
      })
    });
  });

  describe("guest user performing CRUD actions for Post", () => {
    beforeEach((done) => {
      request.get({
        url: "http://localhost:3000/auth/fake",
        form: {
          userId: 0
        }
      },
        (err, res, body) => {
          done();
      });
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should redirect to topic view", (done) => {
        request.get(`${base}/${this.topic.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain(this.topic.title);
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {

      it("should  not create a new post", (done) => {
        const options = {
          url:`${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite things to do besides watching paint dry!"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "Watching snow melt"}})
          .then((post) => {
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should not delete the post with the associated ID", (done) => {
        expect(this.topic.posts.length).toBe(2);

        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {

          Post.findById(1)
          .then((post) => {
            expect(err).toBeNull();
            expect(this.topic.posts.length).toBe(2);
            done();
          })
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should not render a view with an edit post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("Edit Post");
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should not update the post with the given values", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "So much snow!"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();

          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            expect(post.title).toBe("Snowball Fighting");
            done();
          });
        });
      });

    });

  });
// ------------------------------------------------------
//MEMBER TESTS
  describe("member user performing CRUD actions for posts", () => {
    beforeEach((done) => {
      request.get({
        url: "http://localhost:3000/auth/fake",
        form: {
          role: this.user.role,
          userId: this.user.id,
          email: this.user.email
        }
      }, (err, res, body) => {
        done();
      });
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should render a new post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {

      it("should create a new post and redirect", (done) => {
        const options = {
          url:`${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite things to do besides watching paint dry!",
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "Watching snow melt"}})
          .then((post) => {
            expect(post).not.toBeNull();
            expect(post.title).toBe("Watching snow melt");
            expect(post.body).toBe("Without a doubt my favorite things to do besides watching paint dry!");
            expect(post.topicId).not.toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

      it("should not create a new post that fails validations", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "a",
            body: "b"
          }
        };

        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "a"}})
          .then((post) => {
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should only delete the post with the associated ID if the member is the owner of the post", (done) => {
        expect(this.post.userId).toBe(this.user.id);

        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {

          Post.findById(this.post.id)
          .then((post) => {
            expect(err).toBeNull();
            expect(post).toBeNull();
            done();
          })
        });
      });

      it("should not delete the post with the associated ID if the member is not the owner of the post", (done) => {
        expect(this.post2.userId).toBe(this.user2.id);

        request.post(`${base}/${this.topic.id}/posts/${this.post2.id}/destroy`, (err, res, body) => {
          Post.findById(this.post2.id)
          .then((post) => {
            expect(err).toBeNull();
            expect(post).not.toBeNull();
            done();
          })
        })
      });

    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should only render a view with an edit post form if the member is the owner of the post", (done) => {
        expect(this.post.userId).toBe(this.user.id);

        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Post");
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });

      it("should not render a view with an edit post form if the member is not the owner of the post", (done) => {
          request.get(`${base}/${this.topic.id}/posts/${this.post2.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).not.toContain("Edit Topic");
          expect(body).toContain("Snowman Building");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should only update the post with the given values if the member is the owner of the post", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "So much snow!"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();

          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            expect(post.title).toBe("Snowman Building Competition");
            done();
          });
        });
      });

      it("should not update the post with the given values if the member is not the owner of the post", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post2.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "It's tough when they're tall"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();

          Post.findOne({
            where: {id: this.post2.id}
          })
          .then((post) => {
            expect(post.title).toBe("Snowman Building");
            done();
          });
        });
      });
    });

  });

  // ------------------------------------------------------
  //ADMIN TESTS
  describe("admin user performing CRUD actions for posts", () => {
    beforeEach((done) => {
      User.create({
        email: "admin@example.com",
        password: "123456",
        role: "admin"
      })
      .then((user) => {
        request.get({
          url: "http://localhost:3000/auth/fake",
          form: {
            role: user.role,
            userId: user.id,
            email: user.email
          }
        },
        (err, res, body) => {
          done();
        });
      });
    });

    describe("GET /topics/:topicId/posts/new", () => {
      it("should render a new post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/create", () => {

      it("should create a new post and redirect", (done) => {
        const options = {
          url:`${base}/${this.topic.id}/posts/create`,
          form: {
            title: "Watching snow melt",
            body: "Without a doubt my favorite things to do besides watching paint dry!"
          }
        };
        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "Watching snow melt"}})
          .then((post) => {
            expect(post).not.toBeNull();
            expect(post.title).toBe("Watching snow melt");
            expect(post.body).toBe("Without a doubt my favorite things to do besides watching paint dry!");
            expect(post.topicId).not.toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

      it("should not create a new post that fails validations", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/create`,
          form: {
            title: "a",
            body: "b"
          }
        };

        request.post(options, (err, res, body) => {
          Post.findOne({where: {title: "a"}})
          .then((post) => {
            expect(post).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });

    });

    describe("GET /topics/:topicId/posts/:id", () => {
      it("should render a view with the selected post", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {
      it("should delete the post with the associated ID", (done) => {
        expect(this.post).not.toBeNull();

        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {

          Post.findById(this.post.id)
          .then((post) => {
            expect(err).toBeNull();
            expect(post).toBeNull();
            done();
          })
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
      it("should render a view with an edit post form", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Post");
          expect(body).toContain("Snowball Fighting");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
      it("should return a status code 302", (done) => {
        request.post({
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "I love watching them melt slowly."
          }
        }, (err, res, body) => {
          expect(res.statusCode).toBe(302);
          done();
        });
      });

      it("should update the post with the given values", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "So much snow!"
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();

          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            expect(post.title).toBe("Snowman Building Competition");
            done();
          });
        });
      });
    });
  });

})
