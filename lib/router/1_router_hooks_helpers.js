/**
 * Warning! Do not rename this file. Currently, we are not able to control Meteor's file load order.
 * As a consequence, we need to guarantee that this file loads before router.js.
 */
scrumTeamFilter = function () {
    if (Meteor.user()) {
        subscribeToOwnUser(Meteor.userId());
        var prod = Products.findOne({slug: this.params.slug}),
            intersectArr;
        if (prod) {
            intersectArr = _.intersection(Roles.getGroupsForUser(Meteor.userId(), prod._id), ['administrator', 'developmentTeam', 'productOwner', 'scrumMaster', 'developmentTeam']);
            if (intersectArr.length === 0) {
                this.render('noAccess');
            } else {
                this.next();
            }
        } else {
            this.render(this.notFoundTemplate);
        }
    } else {
        this.render('accessDenied');
    }
};

productOwnerAdminFilter = function () {
    if (Meteor.user()) {
        subscribeToOwnUser(Meteor.userId());
        var prod = Products.findOne({slug: this.params.slug});
        if (prod) {
            var intersectArr = _.intersection(Roles.getGroupsForUser(Meteor.userId(), prod._id), ['administrator', 'productOwner']);
            if (intersectArr.length === 0) {
                this.render('noAccessToEdit');
            } else {
                this.next();
            }
        } else {
            this.render(this.notFoundTemplate);
        }
    } else {
        this.render('accessDenied');
    }
};

recipientsFilter = function () {
    if (Meteor.user()) {
        Meteor.subscribe('conversationParticipants', this.params.slug);
        let conversation = Conversations.findOne({slug: this.params.slug});
        if (conversation) {
            if (!_.contains(conversation.recipients, Meteor.userId()) && conversation.userId != Meteor.userId()) this.render('noAccessConversation');
            else this.next();
        } else
            this.render(this.notFoundTemplate);
    } else this.render('accessDenied');
};

productAdvancedFilter = function () {
    this.subscribe('singleProduct', this.params.slug);
    var product = this.data();
    if (product) {
        if (!product.advancedMode) {
            this.redirect('taskBoardPage', {slug: this.params.slug});
        } else {
            this.subscribe('stickiesBasic', this.params.slug);
        }
    } else {
        this.render(this.notFoundTemplate);
    }
    this.next();
};