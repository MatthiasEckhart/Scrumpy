"use strict";

var insertSprintsHooks = {
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

AutoForm.addHooks('insert-sprint-form', insertSprintsHooks);