/**
 * Warning! Do not rename this file. Currently, we are not able to control Meteor's file load order.
 * As a consequence, we need to guarantee that this file loads before router.js.
 */
scrumTeamFilter = function () {
    if (Meteor.user()) {
        subscribeToOwnUser(Meteor.userId());
        var product = Products.findOne({slug: this.params.slug}),
            intersectArr;
        if (product) {
            intersectArr = _.intersection(Roles.getGroupsForUser(Meteor.userId(), product._id), ['administrator', 'developmentTeam', 'productOwner', 'scrumMaster', 'developmentTeam']);
            if (intersectArr.length === 0) this.render('noAccess');
            else this.next();
        } else this.render(this.notFoundTemplate);
    } else this.render('accessDenied');
};

productOwnerAdminFilter = function () {
    if (Meteor.user()) {
        subscribeToOwnUser(Meteor.userId());
        var product = Products.findOne({slug: this.params.slug});
        if (product) {
            var intersectArr = _.intersection(Roles.getGroupsForUser(Meteor.userId(), product._id), ['administrator', 'productOwner']);
            if (intersectArr.length === 0) this.render('noAccessToEdit');
            else this.next();
        } else this.render(this.notFoundTemplate);
    } else this.render('accessDenied');
};

conversationAdminFilter = function () {
    if (Meteor.user()) {
        let conversation = Conversations.findOne({slug: this.params.slug});
        if (conversation) {
            if (conversation.userId != Meteor.userId()) this.render('noAccessToEdit');
            else this.next();
        } else this.render(this.notFoundTemplate);
    } else this.render('accessDenied');
};

recipientsFilter = function () {
    if (Meteor.user()) {
        Meteor.subscribe('conversationParticipants', this.params.slug);
        let conversation = Conversations.findOne({slug: this.params.slug});
        if (conversation) {
            if (!_.contains(conversation.recipients, Meteor.userId()) && conversation.userId != Meteor.userId()) this.render('noAccessConversation');
            else this.next();
        } else this.render(this.notFoundTemplate);
    } else this.render('accessDenied');
};

productAdvancedFilter = function () {
    this.subscribe('singleProduct', this.params.slug);
    var product = this.data().product;
    if (product) {
        if (!product.advancedMode) this.redirect('taskBoardPage', {slug: this.params.slug});
        else this.subscribe('stickiesBasic', this.params.slug);
    } else this.render(this.notFoundTemplate);
    this.next();
};

requireLogin = function () {
    if (!Meteor.user()) {
        if (Meteor.loggingIn() || Session.equals('logoutSuccess', true)) this.render(this.loadingTemplate);
        else this.render('accessDenied');
    } else this.next();
};

taskBoardPageFilter = function () {
    var product = this.data(),
        sprintAvail,
        sprint;
    /* Check if we have an advanced product. */
    if (product.advancedMode) {
        /* Check if subscription data is ready. */
        if (this.ready()) {
            /* Check if we do not have any sprints which correspond with our product. */
            if (Sprints.find({productId: product._id}).count() == 0) {
                /* No sprints found. */
                Session.set('noSprintsError', true);
                /* Redirect to product dashboard. */
                this.redirect('productDashboard', {slug: this.params.slug});
            }
            /* Check if routing parameters are available. */
            if (!this.params.startDate && !this.params.endDate) {
                /* If no routing parameters are available, we get the sprint which matches the current date.  */
                sprint = Sprints.findOne({
                    productId: product._id,
                    startDate: {$lte: new Date()},
                    endDate: {$gte: new Date()}
                });
                /* Check if there is no sprint available which matches the current date. */
                if (_.isUndefined(sprint)) {
                    /* If no sprint is available which matches the current date, we get the latest record in our Sprints collection. */
                    sprint = Sprints.findOne({
                        productId: product._id
                    }, {sort: {submitted: 1}, limit: 1});
                }
                this.redirect('taskBoardPage', {
                    slug: this.params.slug,
                    startDate: moment.utc(sprint.startDate).format('YYYY-MM-DD'),
                    endDate: moment.utc(sprint.endDate).format('YYYY-MM-DD')
                });
            }
            /* Get sprint via date routing parameters. */
            sprintAvail = Sprints.findOne({
                productId: product._id,
                startDate: moment.utc(this.params.startDate).toDate(),
                endDate: moment.utc(this.params.endDate).toDate()
            });
            /* If sprint is available, we want to subscribe to the corresponding stickies. */
            if (sprintAvail && this.ready()) this.subscribe('stickiesAdvanced', sprintAvail._id);
            else this.render('loading');
            this.next();
        } else this.render('loading');
    } else {
        /* If we do not process an advanced product, we subscribe to the corresponding stickies. */
        this.subscribe('stickiesByProductSlug', this.params.slug);
        if (!this.ready()) this.render('loading');
        else this.next();
    }
};