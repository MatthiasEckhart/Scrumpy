"use strict";

var sprintInsertHooks = {
    before: {
        insert: function (doc) {
            /* Extend our document (sprint) with a reference to the corresponding product. */
            doc.productId = this.currentDoc._id;
            return doc;
        }
    },
    onSuccess: function (formType, result) {
        let sprint = Sprints.findOne({_id: result});
        if (sprint) {
            Burndown.insert({sprintId: sprint._id, productId: sprint.productId});
            Meteor.call('createActElSprintCreate', sprint.productId, Meteor.userId(), sprint.goal, sprint.startDate, sprint.endDate, function (error) {
                if (error) {
                    throwAlert('error', error.reason, error.details);
                    return null;
                }
                throwAlert('success', 'Success', 'You created a new sprint!');
            });
        }
    }
};

var sprintUpdateHooks = {
    onSuccess: function (formType, result) {
        let currentDoc = this.currentDoc, updateDoc = this.updateDoc['$set'];
        /* If user has updated the sprint goal, start date or end date, we want to create the corresponding activity stream element. */
        if (currentDoc.goal != updateDoc.goal ||
            currentDoc.startDate != updateDoc.startDate ||
            currentDoc.endDate != updateDoc.endDate) {
            let sprint = Sprints.findOne({_id: currentDoc._id});
            if (sprint) {
                let product = Products.findOne({_id: sprint.productId});
                if (product.advancedMode) {
                    /* Check if sprint goal has been changed. */
                    if (currentDoc.goal != updateDoc.goal) {
                        Meteor.call('createActElSprintEditGoal', product._id, Meteor.userId(), currentDoc.goal, updateDoc.goal, function (error) {
                            if (error) throwAlert('error', error.reason, error.details);
                        });
                    }
                    /* Check if sprint start date has been changed. */
                    if (currentDoc.startDate.getTime() != updateDoc.startDate.getTime()) {
                        Meteor.call('createActElSprintEditStartDate', product._id, Meteor.userId(), currentDoc.startDate, updateDoc.startDate, currentDoc.goal, function (error) {
                            if (error) throwAlert('error', error.reason, error.details);
                        });
                    }
                    /* Check if sprint end date has been changed. */
                    if (currentDoc.endDate.getTime() != updateDoc.endDate.getTime()) {
                        Meteor.call('createActElSprintEditEndDate', product._id, Meteor.userId(), currentDoc.endDate, updateDoc.endDate, currentDoc.goal, function (error) {
                            if (error) throwAlert('error', error.reason, error.details);
                        });
                    }
                }
            }
        }
    }
};

AutoForm.addHooks('insert-sprint-form', sprintInsertHooks);
AutoForm.addHooks('update-sprint-form', sprintUpdateHooks);