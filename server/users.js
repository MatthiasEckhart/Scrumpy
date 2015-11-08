"use strict";

Meteor.methods({
    markAllNotificationsAsRead: function (userId) {
        var userNotifications = Users.findOne({_id: userId}).notifications;
        // removing all references
        Users.update({_id: userId}, {$set: {notifications: []}});
        _.each(userNotifications, function (item) {
            if (Users.find({notifications: {$in: [item]}}).count() === 0) {
                // no users with this notification -> delete main notification
                Notifications.remove({_id: item});
            }
        });
    },
    markSingleNotificationAsRead: function (userId, notificationId) {
        // removing reference
        Users.update({_id: userId}, {$pull: {notifications: notificationId}});
        if (Users.find({notifications: {$in: [notificationId]}}).count() === 0) {
            // no users with this notification -> delete main notification
            Notifications.remove({_id: notificationId});
        }
    },
    changeUserPassword: function (doc) {
        /* Important server-side check for security and data integrity. */
        check(doc, Schema.changePassword);
        let checkCurrentPassword = Accounts._checkPassword(Users.findOne({_id: doc.userId}), doc.currentPassword);
        if (_.has(checkCurrentPassword, 'error')) throw checkCurrentPassword.error;
        else Accounts.setPassword(checkCurrentPassword.userId, doc.newPassword, {logout: false});
    },
    doUserRegister: function (doc) {
        /* Important server-side check for security and data integrity. */
        check(doc, Schema.register);
        Accounts.createUser({username: doc.username, password: doc.password});
        return doc;
    },
    isUsernameAvailable: function (username) {
        if (Users.find({username: username}).count() > 0) throw new Meteor.Error(500, "Username already in use.", "Please choose a different username.");
    }
});

Accounts.config({forbidClientAccountCreation: true});

Accounts.onCreateUser(function (options, user) {
    _.extend(user, {profile: {color: getRandomColor()}, notifications: []});
    return user;
});

function getRandomColor() {
    let colors = ["#7bd148", "#5484ed", "#a4bdfc", "#46d6db", "#7ae7bf", "#51b749", "#fbd75b", "#ffb878", "#ff887c", "#dc2127", "#dbadff", "#e1e1e1"];
    return colors[Math.floor(Math.random() * colors.length)];
}