"use strict";

Meteor.publish('burndown', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) return Burndown.find({productId: product._id});
    else this.ready();
});