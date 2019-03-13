const ApplicationPolicy = require("./application");

module.exports = class PostPolicy extends ApplicationPolicy {

  new() {
    return this.new();
  }

  create() {
    return this.new();
  }

  edit() {
    return this.edit();
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }
}
