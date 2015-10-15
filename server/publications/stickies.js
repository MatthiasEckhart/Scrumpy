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

Meteor.publishComposite('productStat', function () {
    return {
        find: function () {
            return Products.find({}, {sort: {lastModified: -1}, limit: 1});
        },
        children: [
            {
                find: function (product) {
                    return UserStories.find({productId: product._id})
                },
                children: [
                    {
                        find: function (userStory) {
                            return Stickies.find({storyId: userStory._id}, {fields: {productId: 1, status: 1, assigneeId: 1}});
                        }
                    }
                ]
            }
        ]
    }
});