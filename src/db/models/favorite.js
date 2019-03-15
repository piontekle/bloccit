'use strict';
module.exports = (sequelize, DataTypes) => {
  var Favorite = sequelize.define('Favorite', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Favorite.associate = function(models) {
    Favorite.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    })

    Favorite.belongsTo(models.Post, {
      foreignKey: "postId",
      onDelete: "CASCADE"
    });
  };
  return Favorite;
};
