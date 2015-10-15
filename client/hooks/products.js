"use strict";

var insertProductHooks = {
    onSuccess: function (formType, result) {
        Meteor.call('getProductSlug', result, function (error, productSlug) {
            if (error) {
                throwAlert("error", error.reason, error.details);
                return;
            }
            Meteor.call('createActElProductCreate', result, Meteor.userId(), function (error) {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return;
                }
                Meteor.call('createRole', result, Meteor.userId(), function (error) {
                    if (error) {
                        throwAlert('error', error.reason, error.details);
                        return;
                    }
                    DashboardStatisticsPrivate.insert({productId: result, data: []})
                    Session.set('productCreate', true);
                    Router.go('invite', {slug: productSlug});
                });
            });
        });
    }
};

var updateProductHooks = {
    onSuccess: function (formType, result) {
        /* If user has updated the product title, we want to create the corresponding activity stream element. */
        if (this.currentDoc.title != this.updateDoc['$set'].title) {
            Meteor.call('createActElProductTitleEdit', this.currentDoc._id, Meteor.userId(), this.currentDoc.title, function (error) {
                if (error) throwAlert('error', error.reason, error.details);
            });
        }
        /* We need to retrieve the updated product, because the title/slug may have changed. */
        let product = Products.findOne({_id: this.currentDoc._id});
        if (product) {
            if (this.currentDoc.advancedMode) Router.go('productDashboard', {slug: product.slug});
            else Router.go('taskBoardPage', {slug: product.slug});
        } else Router.go('dashboard');

    }
};

AutoForm.addHooks('insert-product-form', insertProductHooks);
AutoForm.addHooks('update-product-form', updateProductHooks);