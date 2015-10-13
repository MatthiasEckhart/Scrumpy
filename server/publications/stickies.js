"use strict";

Meteor.publish('stickiesByProductSlug', function (slug) {
    let product = Products.findOne({slug: slug});
    if (product) {
        let storyIds = UserStories.find({productId: product._id}).map((story) => story._id);
        return Stickies.find({storyId: {$in: storyIds}});
    } else this.ready();
});

Meteor.publish('stickiesAdvanced', function (storyIds) {
    return Stickies.find({storyId: {$in: storyIds}});
});

Meteor.publish('productStat', function () {
    let product = Products.findOne({}, {sort: {lastModified: -1}, limit: 1});
    if (product) {
        let storyIds = UserStories.find({productId: product._id}).map((story) => story._id);
        return Stickies.find({storyId: {$in: storyIds}}, {fields: {productId: 1, status: 1, assigneeId: 1}});
    } else this.ready();
});