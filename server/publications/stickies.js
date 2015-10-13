"use strict";

Meteor.publish('stickiesBasic', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) return Stickies.find({productId: product._id});
    else this.ready();
});

Meteor.publish('stickiesAdvanced', function (storyIds) {
    return Stickies.find({storyId: {$in: storyIds}});
});

Meteor.publish('stickiesAdvancedByProductSlug', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) return Stickies.find({productId: product._id});
    else this.ready();
});

Meteor.publish('productStat', function () {
    let product = Products.findOne({}, {sort: {lastModified: -1}, limit: 1});
    if (product) return Stickies.find({productId: product._id}, {fields: {productId: 1, status: 1, assigneeId: 1}});
    else this.ready();
});