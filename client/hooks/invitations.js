"use strict";

var invitationsHooks = {
    before: {
        method: function (doc) {
            doc.productId = this.currentDoc._id;
            return doc;
        }
    },
    onSuccess: function (formType, result) {
        /* Check if server method returned an object.
         * Only the server method which handles development team invitations, returns a result object. */
        if (result) {
            /* If we invited users to work on an advanced product, redirect current user to sprint planning page. */
            if (result.advancedMode) Router.go('sprintPlanning', {slug: result.slug});
            /* If we invited users to work on a regular product, redirect current user to task board page. */
            else Router.go('taskBoardPage', {slug: result.slug});
            /* Something went wrong. Redirect user to dashboard. */
        } else Router.go('dashboard');
    }
};

AutoForm.addHooks('insert-invitations-form', invitationsHooks);