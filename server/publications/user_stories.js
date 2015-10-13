"use strict";

Meteor.publish('userStoriesBasic', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product)return UserStories.find({productId: product._id});
    else this.ready();
});

Meteor.publish('userStoriesAdvanced', function (slug, startDate, endDate) {
    var product = Products.findOne({slug: slug}),
        sprint;
    if (product) {
        if (!product.advancedMode) {
            this.ready();
            return;
        }
        sprint = Sprints.findOne({startDate: startDate, endDate: endDate, productId: product._id});
        if (sprint) return UserStories.find({sprintId: sprint._id});
        else this.ready();
    }
    else this.ready();
});