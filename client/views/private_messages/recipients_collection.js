// Local (client-only) collection, Recipients collection will only exist in the browser and will make no attempt to
// synchronize with the server.
Recipients = new Meteor.Collection(null);

clearRecipients = function () {
    Recipients.remove({}); // remove all recipients in collection
};