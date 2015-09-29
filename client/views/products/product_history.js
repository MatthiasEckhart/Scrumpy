"use strict";

Template.productHistory.rendered = function () {
    var routerStartDate = moment(Router.current().params.startDate).toDate(),
        routerEndDate = moment(Router.current().params.endDate).toDate(), selectedSprint;
    if (routerStartDate && routerEndDate) {
        selectedSprint = Sprints.findOne({startDate: routerStartDate, endDate: routerEndDate});
        if (selectedSprint) {
            $(getProductHistorySelectorString(selectedSprint._id)).addClass('disabled');
        }
    }
};

Template.productHistory.helpers({
    sprints: function () {
        return Sprints.find({productId: this._id});
    },
    startDateFormatted: function () {
        return formatDate(this.startDate, false);
    },
    endDateFormatted: function () {
        return formatDate(this.endDate, false);
    },
    startDateUrlFormatted: function () {
        return formatDate(this.startDate, true);
    },
    endDateUrlFormatted: function () {
        return formatDate(this.endDate, true);
    },
    slug: function() {
        var product = Products.findOne({_id: this.productId});
        return product && product.slug;
    },
    isCurrentSprint: function() {
        /* MomentJS: isBetween is currently not available (> 2.9).
         * Therefore, we need to use a workaround. */
        return (!(moment(new Date()).isBefore(this.startDate) || moment(new Date()).isAfter(this.endDate)));
    }
});

Template.productHistory.events({
    'click #activate-sprint': function (e) {
        e.preventDefault();
        var selectorForSelectedElement = $(getSelectMultipleSprintElementSelectorString()),
            len = selectorForSelectedElement.length,
            sprintId,
            sprint;
        if (len == 1) {
            sprintId = selectorForSelectedElement.val();
            sprint = Sprints.findOne({_id: sprintId});
            if (sprint) {
                $('#activate-sprint').addClass('disabled');
                selectorForSelectedElement.removeClass('selected');
                $(getProductHistorySelectorString(sprintId)).addClass('disabled');
                Router.go('taskBoardPage', {
                    slug: this.slug,
                    startDate: moment(sprint.startDate).format('YYYY-MM-DD'),
                    endDate: moment(sprint.endDate).format('YYYY-MM-DD')
                });
            }
        } else {
            throwAlert('error', 'Ops!', 'Something went wrong.');
        }
    }
});

function formatDate(date, isUrl) {
    if (isUrl) return moment(date).format('YYYY-MM-DD');
    return moment(date).format('MMMM D, YYYY');
}

function getProductHistorySelectorString(sprintId) {
    return '#select-multiple-product-history option[value=' + sprintId + ']';
}

function getSelectMultipleSprintElementSelectorString() {
    return 'option.select-multiple-sprint-element.selected';
}