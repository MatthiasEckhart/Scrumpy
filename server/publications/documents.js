"use strict";

Meteor.publish('documents', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) return Documents.find({productId: product._id});
    else this.ready();
});