"use strict";

Meteor.publish('notifications', function (id) {
    return Notifications.find({_id: {$in: id}});
});
