ActivityStreamElements = new Mongo.Collection('activityStreamElements');

ActivityStreamElements.deny({
    insert: denyPermission,
    update: denyPermission,
    remove: denyPermission
});

Meteor.methods({
    createActElProductCreate: function (productId, userId) {
        if (Meteor.isServer) {
            var base = getBaseActEl(1, productId, userId),
                product = Products.findOne({_id: productId}),
                el;
            if (product) {
                el = _.extend(base, {
                    productTitle: product.title
                });
                insertActivityStreamElement(el);
            }
        }
    },
    createActElProductTitleEdit: function (productId, userId, oldProductTitle) {
        if (Meteor.isServer) {
            var base = getBaseActEl(2, productId, userId),
                product = Products.findOne({_id: productId}),
                el;
            if (product) {
                el = _.extend(base, {
                    newProductTitle: product.title,
                    oldProductTitle: oldProductTitle
                });
                insertActivityStreamElement(el);
            }
        }
    },
    createActElUserInvitationAccepted: function (productId, userId, role, status) {
        if (Meteor.isServer) {
            var base = getBaseActEl(3, productId, userId),
                el = _.extend(base, {
                    role: role,
                    status: parseInt(status, 10)
                });
            insertActivityStreamElement(el);
        }
    },
    createActElUserInvitationDeclined: function (productId, userId, status) {
        if (Meteor.isServer) {
            var base = getBaseActEl(4, productId, userId),
                el = _.extend(base, {
                    status: parseInt(status, 10)
                });
            insertActivityStreamElement(el);
        }
    },
    createActElSprintCreate: function (productId, userId, sprintGoal, sprintStartDate, sprintEndDate) {
        if (Meteor.isServer) {
            var base = getBaseActEl(5, productId, userId),
                el = _.extend(base, {
                    sprintGoal: sprintGoal,
                    sprintStartDate: sprintStartDate,
                    sprintEndDate: sprintEndDate
                });
            insertActivityStreamElement(el);
        }
    },
    createActElUserStory: function (productId, userId, userStoryTitle) {
        if (Meteor.isServer) {
            var base = getBaseActEl(6, productId, userId),
                el = _.extend(base, {
                    userStoryTitle: userStoryTitle
                });
            insertActivityStreamElement(el);
        }
    },
    createActElUserStoryPrioritized: function (productId, userId, userStoryTitle, priority) {
        if (Meteor.isServer) {
            var base = getBaseActEl(7, productId, userId),
                el = _.extend(base, {
                    userStoryTitle: userStoryTitle,
                    priority: parseInt(priority, 10)
                });
            insertActivityStreamElement(el);
        }
    },
    createActElStickyCreate: function (productId, userId, stickyTitle, userStoryTitle, sprintGoal) {
        if (Meteor.isServer) {
            var base = getBaseActEl(8, productId, userId),
                el = _.extend(base, {
                    userStoryTitle: userStoryTitle,
                    stickyTitle: stickyTitle,
                    sprintGoal: sprintGoal
                });
            insertActivityStreamElement(el);
        }
    },
    createActElStickyMoved: function (productId, userId, stickyTitle, oldStickyStatus, newStickyStatus) {
        if (Meteor.isServer) {
            var base = getBaseActEl(9, productId, userId),
                el = _.extend(base, {
                    stickyTitle: stickyTitle,
                    oldStickyStatus: parseInt(oldStickyStatus, 10),
                    newStickyStatus: parseInt(newStickyStatus, 10)
                });
            insertActivityStreamElement(el);
        }
    },
    createActElStickyEditTitle: function (productId, userId, oldStickyTitle, newStickyTitle) {
        if (Meteor.isServer) {
            var base = getBaseActEl(10, productId, userId),
                el = _.extend(base, {
                    oldStickyTitle: oldStickyTitle,
                    newStickyTitle: newStickyTitle
                });
            insertActivityStreamElement(el);
        }
    },
    createActElStickyEditDescription: function (productId, userId, oldStickyDescription, newStickyDescription) {
        if (Meteor.isServer) {
            var base = getBaseActEl(11, productId, userId),
                el = _.extend(base, {
                    oldStickyDescription: oldStickyDescription,
                    newStickyDescription: newStickyDescription
                });
            insertActivityStreamElement(el);
        }
    },
    createActElUserStoryEditTitle: function (productId, userId, oldUserStoryTitle, newUserStoryTitle) {
        if (Meteor.isServer) {
            var base = getBaseActEl(12, productId, userId),
                el = _.extend(base, {
                    oldUserStoryTitle: oldUserStoryTitle,
                    newUserStoryTitle: newUserStoryTitle
                });
            insertActivityStreamElement(el);
        }
    },
    createActElUserStoryEditDescription: function (productId, userId, oldUserStoryDescription, newUserStoryDescription) {
        if (Meteor.isServer) {
            var base = getBaseActEl(13, productId, userId),
                el = _.extend(base, {
                    oldUserStoryDescription: oldUserStoryDescription,
                    newUserStoryDescription: newUserStoryDescription
                });
            insertActivityStreamElement(el);
        }
    },
    createActElStickyRemoved: function (productId, userId, stickyTitle) {
        if (Meteor.isServer) {
            var base = getBaseActEl(14, productId, userId),
                el = _.extend(base, {
                    stickyTitle: stickyTitle
                });
            insertActivityStreamElement(el);
        }
    },
    createActElUserStoryRemoved: function (productId, userId, storyTitle) {
        if (Meteor.isServer) {
            var base = getBaseActEl(15, productId, userId),
                el = _.extend(base, {
                    storyTitle: storyTitle
                });
            insertActivityStreamElement(el);
        }
    },
    createActElSprintEditGoal: function (productId, userId, oldSprintGoal, newSprintGoal) {
        if (Meteor.isServer) {
            var base = getBaseActEl(16, productId, userId),
                el = _.extend(base, {
                    oldSprintGoal: oldSprintGoal,
                    newSprintGoal: newSprintGoal
                });
            insertActivityStreamElement(el);
        }
    },
    createActElSprintEditStartDate: function (productId, userId, oldSprintStartDate, newSprintStartDate) {
        if (Meteor.isServer) {
            var base = getBaseActEl(17, productId, userId),
                el = _.extend(base, {
                    oldSprintStartDate: oldSprintStartDate,
                    newSprintStartDate: newSprintStartDate
                });
            insertActivityStreamElement(el);
        }
    },
    createActElSprintEditEndDate: function (productId, userId, oldSprintEndDate, newSprintEndDate) {
        if (Meteor.isServer) {
            var base = getBaseActEl(18, productId, userId),
                el = _.extend(base, {
                    oldSprintEndDate: oldSprintEndDate,
                    newSprintEndDate: newSprintEndDate
                });
            insertActivityStreamElement(el);
        }
    },
    createActElSprintRemoved: function (productId, userId, sprintGoal) {
        if (Meteor.isServer) {
            var base = getBaseActEl(19, productId, userId),
                el = _.extend(base, {
                    sprintGoal: sprintGoal
                });
            insertActivityStreamElement(el);
        }
    },
    createActElStickyEffortChanged: function (productId, userId, oldEffort, newEffort, stickyTitle) {
        if (Meteor.isServer) {
            var base = getBaseActEl(20, productId, userId),
                el = _.extend(base, {
                    oldEffort: oldEffort,
                    newEffort: newEffort,
                    stickyTitle: stickyTitle
                });
            insertActivityStreamElement(el);
        }
    }
});

function getBaseActEl(type, productId, userId) {
    return {
        type: type,
        submitted: new Date(),
        userId: userId,
        productId: productId
    };
}

function insertActivityStreamElement(el) {
    var sumActEl = ActivityStreamElements.find({productId: el.productId}).count();
    // remove last activity stream element if there are already more than 50 elements in collection to this specific product
    if (sumActEl >= 50) {
        ActivityStreamElements.find({productId: el.productId}, {
            sort: {submitted: 1},
            limit: 1
        }).forEach(function (item) {
            // remove all corresponding comments
            Comments.remove({actElId: item._id});
            ActivityStreamElements.remove({_id: item._id});
        });
    }
    ActivityStreamElements.insert(el);
}