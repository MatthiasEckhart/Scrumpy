var invitationsHooks = {
    before: {
        method: function(doc) {
            doc.slug = Router.current().params.slug;
            return doc;
        }
    }
};

AutoForm.addHooks('insert-scrum-master-invitations-form', invitationsHooks);
AutoForm.addHooks('insert-development-team-invitations-form', invitationsHooks);