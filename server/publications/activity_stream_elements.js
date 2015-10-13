"use strict";

Meteor.publish('activityStreamElements', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) return ActivityStreamElements.find({productId: product._id});
    else this.ready();
});