"use strict";

Template.memberMultipleSelect.events({
    'click .select-multiple-user-element': function (e) {
        operateMultipleSelect($('#select-multiple-product option[value=' + e.currentTarget.value + ']'));
    }
});

Template.memberMultipleSelect.helpers({
    totalResultSetEmpty: function () {
        return Session.equals('totalResultSetEmpty', true);
    }
});

Template.memberMultipleSelect.rendered = function () {
    Session.set('totalResultSetEmpty', true);
};