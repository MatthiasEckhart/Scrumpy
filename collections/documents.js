Documents = new Mongo.Collection('documents');

Documents.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});