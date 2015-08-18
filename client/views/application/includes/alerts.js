"use strict";

Template.alerts.helpers({
    alerts: function () {
        return Alerts.find();
    },
    type: function (type) {
        return this.type === type;
    },
    message: function () {
        return this.message;
    },
    details: function () {
        return this.details;
    }
});

Template.alerts.events({
    'click .close': function () {
        Alerts.remove(this._id);
    }
});