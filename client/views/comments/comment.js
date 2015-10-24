"use strict";

Template.comment.helpers({
    productOwnerOrOwnerOfComment: function () {
        var actEl = ActivityStreamElements.findOne({_id: this.actElId});
        if (actEl) return (this.userId == Meteor.userId()) || Roles.userIsInRole(Meteor.userId(), [actEl.productId], 'productOwner');
        return false;
    },
    user: function () {
        return Users.findOne({_id: this.userId});
    }
});

Template.comment.events({
    'click .delete-comment': function (e) {
        e.preventDefault();
        throwDialog('warning', 'Wait!', 'Are you sure you want delete this comment?', 'Relax, I know what I am doing', 'No, do not delete', 'delete-comment-confirm', this);
    }
});