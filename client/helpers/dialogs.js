// Local (client-only) collection, Dialogs collection will only exist in the browser and will make no attempt to synchronize with the server.
Dialogs = new Meteor.Collection(null);

throwDialog = function (type, message, details, actionButton, link, actionClass, data) {
    if (Dialogs.find({details: details}).count() === 0) {
        Dialogs.insert({
            type: type,
            message: message,
            details: details,
            actionButton: actionButton,
            link: link,
            actionClass: actionClass,
            data: data
        });
    } else {
        // highlight current dialog message
        var elId = '#' + Dialogs.findOne({details: details})._id;
        $(elId).effect('highlight');
    }
};

clearDialogs = function () {
    Dialogs.remove({}); // remove all dialogs in collection
};