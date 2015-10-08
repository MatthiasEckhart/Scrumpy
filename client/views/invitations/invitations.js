"use strict";

Template.invitations.helpers({
    invitations: function () {
        return Invitations.find({}, {sort: {status: 1}});
    },
    user: function () {
        let product = Products.findOne({_id: this.productId});
        if (product) return Users.findOne({_id: product.userId});
    },
    productTitle: function () {
        let product = Products.findOne({_id: this.productId});
        if (product) return product.title;
        else return "Unknown";
    },
    roleFormatted: function () {
        return this.role == 2 ? "Scrum Master" : "Development Team member";
    },
    createdAtFormatted: function () {
        return moment(this.createdAt).format("MMMM Do YYYY, h:mm:ss a");
    },
    statusFormatted: function () {
        if (this.status == 0) return "pending";
        else if (this.status == 1) return "accepted";
        else return "declined";
    },
    statusCss: function () {
        if (this.status == 0) return "label-default";
        else if (this.status == 1) return "label-success";
        else return "label-danger";
    }
});

Template.invitations.events({
    'click .accept-invitation': function () {
        if (this.status == 0) {
            Meteor.call('addUserToRole', this.productId, Meteor.userId(), this.role, (error) => {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return;
                }
                Invitations.update({_id: this._id}, {$set: {status: 1}});
            });
        }
    },
    'click .decline-invitation': function () {
        if (this.status == 0 || this.status == 1) {
            Meteor.call('removeUserFromRole', this.productId, Meteor.userId(), this.role, (error) => {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return;
                }
                Invitations.update({_id: this._id}, {$set: {status: 2}});
            });
        }
    }
});