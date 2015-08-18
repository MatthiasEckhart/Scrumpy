"use strict";

Template.documentTitle.helpers({
    title: function () {
        var _ref;
        return (_ref = Documents.findOne(this + "")) != null ? _ref.title : void 0;
    }
});