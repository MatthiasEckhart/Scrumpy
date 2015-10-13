subscribeToOwnUser = function(userId) {
    Meteor.subscribe('ownUser', userId);
};