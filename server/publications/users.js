"use strict";

Meteor.publish(null, function () {
    return Users.find({_id: this.userId}, {
        fields: {
            notifications: 1,
            'settingsNotifications': 1,
            'privateMessages': 1
        }
    });
});

Meteor.publish('ownUser', function (userId) {
    return Users.find({_id: userId});
});

Meteor.publish('usernamesRoles', function () {
    return Users.find({}, {
        fields: {'username': 1, 'roles': 1}
    });
});

Meteor.publish('userProfile', function (username) {
    return Users.find({username: username}, {fields: {'profile': 1, 'username': 1, 'roles': 1, 'createdAt': 1}});
});

Meteor.publish('usernames', function () {
    return Users.find({}, {
        fields: {'username': 1}
    });
});

Meteor.publish('userProductAuthor', function (productSlug) {
    let product = Products.findOne({slug: productSlug});
    if (product) return Users.find({_id: product.userId}, {
        fields: {
            'profile.image': 1,
            'username': 1,
            'profile.firstName': 1,
            'profile.lastName': 1,
            'profile.online': 1,
            'profile.color': 1,
            'roles': 1
        }
    });
    else this.ready();
});

Meteor.publish('recipientsAvatars', function (slug) {
    let recipients = [];
    let conversation = Conversations.findOne({slug: slug});
    if (conversation) {
        recipients = _.union(recipients, conversation.recipients);
        recipients.push(conversation.userId);
        return Users.find({_id: {$in: recipients}}, {
            fields: {
                'profile.image': 1,
                'username': 1,
                'profile.online': 1,
                'profile.color': 1
            }
        });
    }
    else this.ready();
});

Meteor.publishComposite('usersInvitationAuthors', function (userId) {
    return {
        find: function () {
            return Invitations.find({userId: userId});
        },
        children: [
            {
                find: function (invitation) {
                    return Products.find({_id: invitation.productId}, {fields: {title: 1, userId: 1}});
                },
                children: [
                    {
                        find: function (product) {
                            return Users.find({_id: product.userId}, {
                                fields: {
                                    'profile.image': 1,
                                    'username': 1,
                                    'profile.firstName': 1,
                                    'profile.lastName': 1,
                                    'profile.online': 1,
                                    'profile.color': 1
                                }
                            });
                        }
                    }
                ]
            }
        ]
    }
});

Meteor.publishComposite('usersInvitationRecipient', function (productSlug) {
    return {
        find: function () {
            return Products.find({slug: productSlug}, {limit: 1});
        },
        children: [
            {
                find: function (product) {
                    return Users.find({_id: product.userId}, {
                        fields: {
                            'profile.image': 1,
                            'username': 1,
                            'profile.firstName': 1,
                            'profile.lastName': 1,
                            'profile.online': 1,
                            'profile.color': 1
                        }
                    });
                }
            }
        ]
    }
});

Meteor.publishComposite('usersInvitationAcceptedAuthors', function (userId) {
    return {
        find: function () {
            return Invitations.find({userId: userId, status: 1});
        },
        children: [
            {
                find: function (invitation) {
                    return Products.find({_id: invitation.productId}, {fields: {title: 1, userId: 1}});
                },
                children: [
                    {
                        find: function (product) {
                            return Users.find({_id: product.userId}, {
                                fields: {
                                    'profile.image': 1,
                                    'username': 1,
                                    'profile.firstName': 1,
                                    'profile.lastName': 1,
                                    'profile.online': 1,
                                    'profile.color': 1
                                }
                            });
                        }
                    }
                ]
            }
        ]
    }
});

Meteor.publishComposite('usersInvited', function (slug) {
    return {
        find: function () {
            return Products.find({slug: slug}, {limit: 1});
        },
        children: [
            {
                find: function (product) {
                    return Invitations.find({productId: product._id});
                },
                children: [
                    {
                        find: function (invitation) {
                            return Users.find({_id: invitation.userId}, {
                                fields: {
                                    'profile.image': 1,
                                    'username': 1,
                                    'roles': 1,
                                    'profile.online': 1,
                                    'profile.color': 1
                                }
                            });
                        }
                    }
                ]
            }
        ]
    }
});

Meteor.publishComposite('allRecipientsAvatarsInvolved', function (userId) {
    return {
        find: function () {
            return Conversations.find({$or: [{'userId': userId}, {'recipients': userId}]});
        },
        children: [
            {
                find: function (conversation) {
                    let recipients = conversation.recipients;
                    recipients.push(conversation.userId);
                    return Users.find({_id: {$in: recipients}}, {
                        fields: {
                            'profile.image': 1,
                            'username': 1,
                            'profile.online': 1,
                            'profile.color': 1
                        }
                    });
                }
            }
        ]
    }
});