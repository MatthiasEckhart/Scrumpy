"use strict";

Meteor.publish('sprints', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) return Sprints.find({productId: product._id});
    else this.ready();
});