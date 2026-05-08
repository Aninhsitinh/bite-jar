const User = require('./User');
const Jar = require('./Jar');
const FoodItem = require('./FoodItem');

User.hasMany(Jar, { foreignKey: 'userId' });
Jar.belongsTo(User, { foreignKey: 'userId' });

Jar.hasMany(FoodItem, { foreignKey: 'jarId', as: 'items' });
FoodItem.belongsTo(Jar, { foreignKey: 'jarId', as: 'jar' });

module.exports = {
  User,
  Jar,
  FoodItem
};
