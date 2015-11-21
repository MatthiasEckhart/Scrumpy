"use strict";

Meteor.methods({
    createActElProductCreate: function (productId, userId) {
        let product = getDocument(Products, productId);
        let el = _.extend(getBaseActEl(1, productId, userId), {
            productTitle: product.title
        });
        insertActivityStreamElement(el);
    },
    createActElProductTitleEdit: function (productId, userId, oldProductTitle) {
        let product = getDocument(Products, productId);
        let el = _.extend(getBaseActEl(2, product._id, userId), {
            newProductTitle: product.title,
            oldProductTitle: oldProductTitle
        });
        insertActivityStreamElement(el);
    },
    createActElUserInvitationAccepted: function (productId, userId, role) {
        let product = getDocument(Products, productId);
        let el = _.extend(getBaseActEl(3, product._id, userId), {
            role: role
        });
        insertActivityStreamElement(el);
    },
    createActElUserInvitationDeclined: function (productId, userId, role) {
        let product = getDocument(Products, productId);
        let el = _.extend(getBaseActEl(4, product._id, userId), {
            role: role
        });
        insertActivityStreamElement(el);
    },
    createActElSprintCreate: function (productId, userId, sprintGoal, sprintStartDate, sprintEndDate) {
        let el = _.extend(getBaseActEl(5, productId, userId), {
            sprintGoal: sprintGoal,
            sprintStartDate: sprintStartDate,
            sprintEndDate: sprintEndDate
        });
        insertActivityStreamElement(el);
    },
    createActElUserStory: function (userStoryId, userId) {
        let userStory = getDocument(UserStories, userStoryId);
        let el = _.extend(getBaseActEl(6, userStory.productId, userId), {
            userStoryTitle: userStory.title
        });
        insertActivityStreamElement(el);
    },
    createActElUserStoryPrioritized: function (productId, userId, userStoryTitle, priority) {
        let el = _.extend(getBaseActEl(7, productId, userId), {
            userStoryTitle: userStoryTitle,
            priority: parseInt(priority, 10)
        });
        insertActivityStreamElement(el);
    },
    createActElStickyCreate: function (productId, userId, stickyTitle, userStoryTitle, sprintGoal) {
        let el = _.extend(getBaseActEl(8, productId, userId), {
            userStoryTitle: userStoryTitle,
            stickyTitle: stickyTitle,
            sprintGoal: sprintGoal
        });
        insertActivityStreamElement(el);
    },
    createActElStickyMoved: function (productId, userId, stickyTitle, oldStickyStatus, newStickyStatus) {
        let el = _.extend(getBaseActEl(9, productId, userId), {
            stickyTitle: stickyTitle,
            oldStickyStatus: parseInt(oldStickyStatus, 10),
            newStickyStatus: parseInt(newStickyStatus, 10)
        });
        insertActivityStreamElement(el);
    },
    createActElStickyEditTitle: function (productId, userId, oldStickyTitle, newStickyTitle) {
        let el = _.extend(getBaseActEl(10, productId, userId), {
            oldStickyTitle: oldStickyTitle,
            newStickyTitle: newStickyTitle
        });
        insertActivityStreamElement(el);
    },
    createActElStickyEditDescription: function (productId, userId, oldStickyDescription, newStickyDescription) {
        let el = _.extend(getBaseActEl(11, productId, userId), {
            oldStickyDescription: oldStickyDescription,
            newStickyDescription: newStickyDescription
        });
        insertActivityStreamElement(el);
    },
    createActElUserStoryEditTitle: function (productId, userId, oldUserStoryTitle, newUserStoryTitle) {
        let el = _.extend(getBaseActEl(12, productId, userId), {
            oldUserStoryTitle: oldUserStoryTitle,
            newUserStoryTitle: newUserStoryTitle
        });
        insertActivityStreamElement(el);
    },
    createActElUserStoryEditDescription: function (productId, userId, oldUserStoryDescription, newUserStoryDescription) {
        let el = _.extend(getBaseActEl(13, productId, userId), {
            oldUserStoryDescription: oldUserStoryDescription,
            newUserStoryDescription: newUserStoryDescription
        });
        insertActivityStreamElement(el);
    },
    createActElStickyRemoved: function (productId, userId, stickyTitle) {
        let el = _.extend(getBaseActEl(14, productId, userId), {
            stickyTitle: stickyTitle
        });
        insertActivityStreamElement(el);
    },
    createActElUserStoryRemoved: function (productId, userId, userStoryTitle) {
        let el = _.extend(getBaseActEl(15, productId, userId), {
            userStoryTitle: userStoryTitle
        });
        insertActivityStreamElement(el);
    },
    createActElSprintEditGoal: function (productId, userId, oldSprintGoal, newSprintGoal) {
        let el = _.extend(getBaseActEl(16, productId, userId), {
            oldSprintGoal: oldSprintGoal,
            newSprintGoal: newSprintGoal
        });
        insertActivityStreamElement(el);
    },
    createActElSprintEditStartDate: function (productId, userId, oldSprintStartDate, newSprintStartDate, sprintGoal) {
        let el = _.extend(getBaseActEl(17, productId, userId), {
            oldSprintStartDate: oldSprintStartDate,
            newSprintStartDate: newSprintStartDate,
            sprintGoal: sprintGoal
        });
        insertActivityStreamElement(el);
    },
    createActElSprintEditEndDate: function (productId, userId, oldSprintEndDate, newSprintEndDate, sprintGoal) {
        let el = _.extend(getBaseActEl(18, productId, userId), {
            oldSprintEndDate: oldSprintEndDate,
            newSprintEndDate: newSprintEndDate,
            sprintGoal: sprintGoal
        });
        insertActivityStreamElement(el);
    },
    createActElSprintRemoved: function (productId, userId, sprintGoal) {
        let el = _.extend(getBaseActEl(19, productId, userId), {
            sprintGoal: sprintGoal
        });
        insertActivityStreamElement(el);
    },
    createActElStickyEffortChanged: function (productId, userId, oldEffort, newEffort, stickyTitle) {
        let el = _.extend(getBaseActEl(20, productId, userId), {
            oldEffort: oldEffort,
            newEffort: newEffort,
            stickyTitle: stickyTitle
        });
        insertActivityStreamElement(el);
    },
    createActElUserStoryStoryPointsChanged: function (productId, userId, oldStoryPoints, newStoryPoints, userStoryTitle) {
        let el = _.extend(getBaseActEl(21, productId, userId), {
            oldStoryPoints: oldStoryPoints,
            newStoryPoints: newStoryPoints,
            userStoryTitle: userStoryTitle
        });
        insertActivityStreamElement(el);
    },
    createActElUserStoryBusinessValueChanged: function (productId, userId, oldBusinessValue, newBusinessValue, userStoryTitle) {
        let el = _.extend(getBaseActEl(22, productId, userId), {
            oldBusinessValue: oldBusinessValue,
            newBusinessValue: newBusinessValue,
            userStoryTitle: userStoryTitle
        });
        insertActivityStreamElement(el);
    }
});

function getBaseActEl(type, productId, userId) {
    return {
        type: type,
        userId: userId,
        productId: productId
    };
}

function insertActivityStreamElement(el) {
    ActivityStreamElements.insert(el);
}