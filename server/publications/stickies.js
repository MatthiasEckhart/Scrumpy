"use strict";

Meteor.publishComposite('stickiesByProductSlug', function (productSlug) {
    return {
        find: function () {
            return Products.find({slug: productSlug});
        },
        children: [
            {
                find: function (product) {
                    return UserStories.find({productId: product._id});
                },
                children: [
                    {
                        find: function (userStory) {
                            return Stickies.find({storyId: userStory._id});
                        }
                    }
                ]
            }
        ]
    }
});

Meteor.publishComposite('stickiesAdvanced', function (sprintId) {
    return {
        find: function () {
            return UserStories.find({sprintId: sprintId});
        },
        children: [
            {
                find: function (userStory) {
                    return Stickies.find({storyId: userStory._id});
                }
            }
        ]
    }
});

Meteor.publishComposite('tasksCompletedByInvitation', function () {
    return {
        find: function () {
            return Invitations.find({userId: this.userId, status: 1});
        },
        children: [
            {
                find: function (invitation) {
                    return UserStories.find({productId: invitation.productId})
                },
                children: [
                    {
                        find: function (userStory) {
                            return Stickies.find({storyId: userStory._id}, {fields: {status: 1}});
                        }
                    }
                ]
            }
        ]
    }
});

Meteor.publishComposite('tasksCompletedByProductUserId', function () {
    return {
        find: function () {
            return Products.find({userId: this.userId});
        },
        children: [
            {
                find: function (product) {
                    return UserStories.find({productId: product._id})
                },
                children: [
                    {
                        find: function (userStory) {
                            return Stickies.find({storyId: userStory._id}, {fields: {status: 1}});
                        }
                    }
                ]
            }
        ]
    }
});