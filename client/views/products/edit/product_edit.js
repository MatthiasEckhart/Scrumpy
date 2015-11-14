"use strict";

Template.productEdit.events({
    'click #delete-product': function (e, t) {
        e.preventDefault();
        throwDialog('warning', 'Wait!', 'Are you sure you want delete the product ' + this.title + '?', 'Sure, delete it', 'No, do not delete', 'delete-product-confirm', {
            productId: this._id,
            userId: Meteor.userId()
        });
    }
});

Template.productEdit.onRendered(function () {
    Session.set('activeNavTab', 'productEdit');
});