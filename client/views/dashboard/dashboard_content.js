"use strict";

Template.dashboardContent.helpers({
    emptyProducts: function () {
        return _.union(
                Roles.getRolesForUser(Meteor.userId(), "developmentTeam"),
                Roles.getRolesForUser(Meteor.userId(), "productOwner"),
                Roles.getRolesForUser(Meteor.userId(), "scrumMaster"),
                Roles.getRolesForUser(Meteor.userId(), "administrator")
            ).length === 0;
    },
    totalProductsUser: function () {
        return Products.find().count();
    },
    productStatTitle: function (type) {
        var product = Products.findOne({_id: Session.get(type)});
        if (product) {
            return product.title;
        }
    },
    oneProductExist: function () {
        return Products.find().count() >= 1;
    },
    totalTasksDoneForProduct: function () {
        return Stickies.find({productId: Session.get("productStat"), status: 4}).count();
    }
});

Template.dashboardContent.events({
    'click .new-conversation': function (e) {
        e.preventDefault();
        Router.go('privateMessageCreate');
    }
});