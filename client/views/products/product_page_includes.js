"use strict";

Template.productPageIncludes.helpers({
    noSprints: function () {
        return Sprints.find({productId: this._id}).count() === 0;
    }
});
Template.productPageIncludes.events({
    'click .goToCurrentSprint': function () {
        var sprint = Sprints.findOne({
            productId: this._id,
            startDate: {$lte: new Date(new Date().toISOString())},
            endDate: {$gte: new Date(new Date().toISOString())}
        });
        Router.go('taskBoardPage', {
            slug: this.slug,
            startDate: moment(sprint.startDate).format('YYYY-MM-DD'),
            endDate: moment(sprint.endDate).format('YYYY-MM-DD')
        });
    }
});