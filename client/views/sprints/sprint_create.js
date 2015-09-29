"use strict";

var sprintStartDatepickerOpen, sprintEndDatepickerOpen, sprintStartDateInputSelector, sprintEndDateInputSelector;

Template.sprintCreate.destroyed = function () {
    destoryDatepicker();
};

Template.sprintCreate.rendered = function () {
    var dateToday = new Date(),
        productId = this.data._id,
        newestSprint;

    if (noSprintsInProduct(productId)) {
        Session.set('minDate', dateToday);
    } else {
        newestSprint = Sprints.find({productId: productId}, {sort: {endDate: -1}, limit: 1}).fetch();
        Session.set('minDate', newestSprint[0].endDate);
    }
    sprintStartDateInputSelector = $(getSelectorType("sprintStartDateInput"));
    sprintEndDateInputSelector = $(getSelectorType("sprintEndDateInput"));
    sprintStartDatepickerOpen = false;
    sprintEndDatepickerOpen = false;
    initDatepicker();

    sprintStartDateInputSelector.change(function () {
        var that = this;
        sprintDateInputsChanged('startDate', dateToday, productId, that);
    });
    sprintEndDateInputSelector.change(function () {
        var that = this;
        sprintDateInputsChanged('endDate', dateToday, productId, that);
    });
};

function sprintDateInputsChanged(type, dateToday, productId, obj) {
    if (noSprintsInProduct(productId)) {
        if (type === 'startDate') {
            preventManualTypedInvalidDate(obj, dateToday);
        } else if (type === 'endDate') {
            preventManualTypedInvalidDate(obj, moment(dateToday).add(7, 'days').toDate());
        }
    } else {
        var newestSprint = Sprints.find({productId: productId}, {sort: {endDate: -1}, limit: 1}).fetch();
        if (type === 'startDate') {
            preventManualTypedInvalidDate(obj, newestSprint[0].endDate);
        } else if (type === 'endDate') {
            preventManualTypedInvalidDate(obj, moment(newestSprint[0].endDate).add(7, 'days').toDate());
        }
    }
}

function preventManualTypedInvalidDate(obj, dateVar) {
    var updatedDate = $(obj).val(),
        instance = $(obj).data("datepicker"),
        date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, updatedDate, instance.settings);
    if (moment(date).isBefore(dateVar)) {
        $(obj).datepicker("setDate", dateVar);
        throwAlert('warning', 'Oops!', 'You cannot choose dates in past or dates which already have a sprint.');
    }
}

function initDatepicker() {
    sprintStartDateInputSelector.datepicker({
        showAnim: 'slideDown',
        minDate: Session.get('minDate'),
        dateFormat: 'MM d, yy',
        onSelect: function () {
            sprintStartDatepickerOpen = false;
        }
    });
    sprintEndDateInputSelector.datepicker({
        showAnim: 'slideDown',
        minDate: moment(Session.get('minDate')).add(1, 'days').toDate(),
        dateFormat: 'MM d, yy',
        onSelect: function () {
            sprintEndDatepickerOpen = false;
        }
    });
}

function destoryDatepicker() {
    sprintStartDateInputSelector.datepicker("destroy");
    sprintEndDateInputSelector.datepicker("destroy");
    var uiDatepickerSelector = $(getSelectorType("uiDatepicker"));
    if (uiDatepickerSelector.length > 0) {
        uiDatepickerSelector.remove();
    }
}

function setDatepickerMinDate() {
    sprintStartDateInputSelector.datepicker('option', 'minDate', Session.get('minDate'));
    sprintEndDateInputSelector.datepicker('option', 'minDate', moment(Session.get('minDate')).add(1, 'days').toDate());
}

function noSprintsInProduct(productId) {
    return Sprints.find({productId: productId}).count() === 0;
}

Template.sprintCreate.helpers({
    currentDate: function () {
        if (noSprintsInProduct(this._id)) {
            return moment().format('MMMM D, YYYY');
        }
        var newestSprint = Sprints.find({productId: this._id}, {sort: {endDate: -1}, limit: 1}).fetch();
        return moment(newestSprint[0].endDate).format('MMMM D, YYYY');
    },
    dateInSevenDays: function () {
        if (noSprintsInProduct(this._id)) {
            return moment().add(7, 'days').format('MMMM D, YYYY');
        }
        var newestSprint = Sprints.find({productId: this._id}, {sort: {endDate: -1}, limit: 1}).fetch();
        return moment(newestSprint[0].endDate).add(7, 'days').format('MMMM D, YYYY');
    }
});

Template.sprintCreate.events({
    'click #datepicker-start-date-button': function (e) {
        e.preventDefault();
        sprintStartDatepickerOpen = operateDatepicker(sprintStartDatepickerOpen, getSelectorType("sprintStartDateInput"));
    },
    'click #datepicker-end-date-button': function (e) {
        e.preventDefault();
        sprintEndDatepickerOpen = operateDatepicker(sprintEndDatepickerOpen, getSelectorType("sprintEndDateInput"));
    },
    'click .create-sprint': function (e) {
        e.preventDefault();
        var sprintProperties = {
                startDate: moment($(getSelectorType("sprintStartDateInput")).val(), 'MMMM D, YYYY').toDate(),
                endDate: moment($(getSelectorType("sprintEndDateInput")).val(), 'MMMM D, YYYY').toDate(),
                goal: $(getSelectorType("sprintGoalInput")).val(),
                productId: this._id,
                submitted: new Date()
            },
            noEmptyFields = isNotEmpty(getSelectorType("sprintStartDateInput"), sprintProperties.startDate) & isNotEmpty(getSelectorType("sprintEndDateInput"), sprintProperties.endDate) & isNotEmpty(getSelectorType("sprintGoalInput"), sprintProperties.goal),
            dupl;

        if (!noEmptyFields) {
            throwAlert('warning', 'Error', 'Please fill in all required fields.');
        } else if (moment(sprintProperties.endDate).isBefore(sprintProperties.startDate)) {
            throwAlert('error', 'Oops!', 'Your sprint end date is before start date, or your date format is invalid.');
            highlightErrorForField(getSelectorType("sprintStartDateInput"));
            highlightErrorForField(getSelectorType("sprintEndDateInput"));
        } else {
            dupl = Sprints.find({
                startDate: sprintProperties.startDate,
                endDate: sprintProperties.endDate,
                productId: sprintProperties.productId
            }).count();
            if (dupl == 0) {
                var sprintId = Sprints.insert(sprintProperties);
                if (sprintId) {
                    Burndown.insert({sprintId: sprintId, productId: sprintProperties.productId});
                    $("#new-sprint-accordion").trigger("click");
                    $(getSelectorType("sprintGoalInput")).val("");
                    Session.set('minDate', sprintProperties.endDate);
                    setDatepickerMinDate();
                    Session.set("staleUserStoryOrSprint", true);
                    Meteor.call('createActElSprintCreate', sprintProperties.productId, Meteor.user()._id, sprintProperties.goal, sprintProperties.startDate, sprintProperties.endDate, function (error) {
                        if (error) {
                            throwAlert('error', error.reason, error.details);
                            return null;
                        }
                        throwAlert('success', 'Yeah!', 'You created a new sprint!');
                    });
                }
            } else {
                throwAlert('error', 'Ooops!', 'You already created that sprint!');
            }
        }
    }
});

function getSelectorType(type) {
    if (type === "sprintStartDateInput") {
        return "#sprint-start-date-input";
    } else if (type === "sprintEndDateInput") {
        return "#sprint-end-date-input";
    } else if (type === "sprintGoalInput") {
        return "#sprint-goal-input";
    } else if (type === "uiDatepicker") {
        return "#ui-datepicker-div";
    }
}