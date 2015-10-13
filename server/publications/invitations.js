"use strict";

Meteor.publish('invitations', function (userId) {
    return Invitations.find({userId: userId}, {$and: [{status: 0}, {status: 1}]});
});

Meteor.publish('productInvitations', function (slug) {
    var product = Products.findOne({slug: slug});
    if (product) return Invitations.find({productId: product._id});
    else this.ready();
});