"use strict";

Template.vision.helpers({
    author: function () {
        let user = Users.findOne({_id: this.product.userId});
        if (user) return user.username;
        else return "Anonymous";
    }
});