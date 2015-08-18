"use strict";

Template.documentItem.helpers({
    current: function () {
        return Session.equals("document", this._id);
    }
});

Template.documentItem.events = {
    "click a": function (e) {
        e.preventDefault();
        return Session.set("document", this._id);
    }
};