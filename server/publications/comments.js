"use strict";

Meteor.publish('comments', function (slug) {
    var product = Products.findOne({slug: slug}),
        actElArr;
    if (product) {
        actElArr = [];
        ActivityStreamElements.find({productId: product._id}, {
            fields: {'_id': 1}
        }).forEach(function (actEl) {
            actElArr.push(actEl._id);
        });
        return Comments.find({actElId: {$in: actElArr}});
    }
    else this.ready();
});