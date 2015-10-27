"use strict";

Template.activityStream.helpers({
    activityStreamElements: function () {
        return ActivityStreamElements.find({productId: this._id}, {sort: {createdAt: -1}});
    }
});