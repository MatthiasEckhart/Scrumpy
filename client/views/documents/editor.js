"use strict";

Template.editor.events = {
    "keydown input[name=title]": function (e) {
        var id;
        if (e.keyCode !== 13) {
            return;
        }
        e.preventDefault();
        $(e.target).blur();
        id = Session.get("document");
        return Documents.update({_id: id}, {
            $set: {
                title: e.target.value
            }
        });
    },
    "click button": function (e) {
        var id;
        e.preventDefault();
        id = Session.get("document");
        Session.set("document", null);
        return Meteor.call("deleteDocument", id);
    }
};

Template.editor.helpers({
    configAce: function () {
        return function (ace) {
            ace.setTheme('ace/theme/monokai');
            ace.setShowPrintMargin(false);
            return ace.getSession().setUseWrapMode(true);
        };
    },
    docid: function () {
        return Session.get("document");
    }
});