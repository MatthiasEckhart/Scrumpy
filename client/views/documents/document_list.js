"use strict";

Template.documentList.helpers({
    documents: function () {
        return Documents.find({productId: this._id});
    }
});

Template.documentList.events({
    "click #new-document": function () {
        return Documents.insert({
            title: "Untitled",
            productId: this._id
        }, function (err, id) {
            if (err) throwAlert("error", "Error!", err);
            if (!id) return;
            return Session.set("document", id);
        });
    }
});