"use strict";

Meteor.publish('products', function (options, productIds) {
    if (!productIds) this.ready();
    return Products.find({_id: {$in: productIds}}, options);
});

Meteor.publish('singleProduct', function (slug) {
    var product = Products.find({slug: slug});
    if (product.count() > 0) return product;
    this.ready();
});

Meteor.publishComposite('productInvitationData', function (userId) {
    return {
        find: function () {
            return Invitations.find({userId: userId}, {$and: [{status: 0}, {status: 1}]});
        },
        children: [
            {
                find: function (invitation) {
                    return Products.find({_id: invitation.productId}, {fields: {title: 1, userId: 1}});
                }
            }
        ]
    }
});