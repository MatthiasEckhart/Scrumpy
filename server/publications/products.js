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

Meteor.publish('projectsForNotification', function () {
    var productIds = _.union(Roles.getRolesForUser(this.userId, "administrator"), Roles.getRolesForUser(this.userId, "developmentTeam"), Roles.getRolesForUser(this.userId, "productOwner"), Roles.getRolesForUser(this.userId, "scrumMaster"));
    if (productIds.length > 0) return Products.find({_id: {$in: productIds}}, {fields: {slug: 1}});
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