"use strict";

Meteor.methods({
    createRole: function (productId, userId) {
        let product = Products.findOne({_id: productId});
        if (!product) throw new Meteor.Error(500, "Product not found.", "Please contact support team.");
        if (product.advancedMode) Roles.addUsersToRoles(userId, [productId], 'productOwner');
        else Roles.addUsersToRoles(userId, [productId], 'administrator');
    }
});