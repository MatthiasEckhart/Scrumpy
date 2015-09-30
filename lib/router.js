Router.configure({
    layoutTemplate: 'layout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading',
    progressSpinner: false,
    waitOn: function () {
        if (Meteor.user() !== undefined) {
            //user is ready
            if (Meteor.user() && Meteor.user().notifications) {
                //user is logged in
                return [Meteor.subscribe('notifications', Meteor.user().notifications), Meteor.subscribe('privateMessages', Meteor.userId()), Meteor.subscribe('allParticipantsAvatarsInvolved', Meteor.userId()), Meteor.subscribe('projectsForNotification')];
            }
        }
    }
});

DashboardController = RouteController.extend({
    template: 'dashboard',
    increment: 3,
    productIds: function () {
        if (Meteor.user() && Meteor.user().roles) {
            return _.union(Meteor.user().roles.administrator, Meteor.user().roles.developmentTeam, Meteor.user().roles.productOwner, Meteor.user().roles.scrumMaster).filter(function (e) {
                return e
            });
        }
        return null;
    },
    limit: function () {
        return parseInt(this.params.productsLimit) || this.increment;
    },
    findOptions: function () {
        return {sort: {lastModified: -1}, limit: this.limit()};
    },
    waitOn: function () {
        var subscriptionArr = [Meteor.subscribe('dashboardStatistics'), Meteor.subscribe('dashboardStatisticsPrivate')];
        if (Meteor.user() && Meteor.user().roles) {
            subscriptionArr.push(Meteor.subscribe('products', this.findOptions(), this.productIds()));
            subscriptionArr.push(Meteor.subscribe('productStat'));
        }
        return subscriptionArr;
    },
    products: function () {
        if (this.productIds() && Meteor.user()) {
            return Products.find({_id: {$in: this.productIds()}}, this.findOptions());
        }
    },
    data: function () {
        if (!Meteor.user() || this.products() == undefined) {
            return DashboardStatistics.find();
        }
        var hasMore = this.products().fetch().length === this.limit(),
            nextPath = this.route.path({productsLimit: this.limit() + this.increment});
        return {
            products: this.products(),
            nextPath: hasMore ? nextPath : null
        };
    }
});

Router.map(function () {
    this.route('login', {
        path: '/login/',
        disableProgress: true
    });
    this.route('register', {
        path: '/register/',
        disableProgress: true
    });
    this.route('productDashboard', {
        path: '/product/:slug/',
        onBeforeAction: [scrumTeamFilter, productAdvancedFilter],
        data: function () {
            return Products.findOne({slug: this.params.slug});
        },
        waitOn: function () {
            return [Meteor.subscribe('singleProduct', this.params.slug), Meteor.subscribe('userStoriesBasic', this.params.slug), Meteor.subscribe('sprints', this.params.slug), Meteor.subscribe('burndown', this.params.slug),
                Meteor.subscribe('comments', this.params.slug), Meteor.subscribe('privateMessageForProduct', this.params.slug),
                Meteor.subscribe('usersInProductRole', this.params.slug), Meteor.subscribe('stickiesAdvancedByProductSlug', this.params.slug), Meteor.subscribe('usersDeclinedInv', this.params.slug),
                Meteor.subscribe('activityStreamElements', this.params.slug), Meteor.subscribe('invitations', this.params.slug)];
        }
    });
    this.route('sprintPlanning', {
        path: '/product/:slug/sprint-planning',
        onBeforeAction: [scrumTeamFilter, productAdvancedFilter],
        data: function () {
            return Products.findOne({slug: this.params.slug});
        },
        waitOn: function () {
            return [Meteor.subscribe('singleProduct', this.params.slug), Meteor.subscribe('userStoriesBasic', this.params.slug), Meteor.subscribe('sprints', this.params.slug), Meteor.subscribe('burndown', this.params.slug),
                Meteor.subscribe('comments', this.params.slug), Meteor.subscribe('privateMessageForProduct', this.params.slug),
                Meteor.subscribe('usersInProductRole', this.params.slug), Meteor.subscribe('stickiesAdvancedByProductSlug', this.params.slug)];
        }
    });
    this.route('documents', {
        path: '/product/:slug/documents',
        onBeforeAction: [scrumTeamFilter, productAdvancedFilter],
        data: function () {
            return Products.findOne({slug: this.params.slug});
        },
        waitOn: function () {
            return [Meteor.subscribe('singleProduct', this.params.slug), Meteor.subscribe('documents', this.params.slug), Meteor.subscribe('sprints', this.params.slug)];
        }
    });
    this.route('taskBoardPage', {
        path: '/task-board/:slug/:startDate?/:endDate?',
        onBeforeAction: [scrumTeamFilter, function () {
            var product = this.data(),
                sprintAvail,
                sprint,
                storyIds;
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
                            startDate: moment(sprint.startDate).format('YYYY-MM-DD'),
                            endDate: moment(sprint.endDate).format('YYYY-MM-DD')
                        });
                    }
                    /* Get sprint via date routing parameters. */
                    sprintAvail = Sprints.findOne({
                        productId: product._id,
                        startDate: moment(this.params.startDate).toDate(),
                        endDate: moment(this.params.endDate).toDate()
                    });
                    /* If sprint is available, we want to subscribe to the corresponding stickies. */
                    if (sprintAvail && this.ready()) {
                        storyIds = [];
                        UserStories.find({sprintId: sprintAvail._id}).forEach(function (story) {
                            storyIds.push(story._id);
                        });
                        this.subscribe('stickiesAdvanced', storyIds);
                    } else {
                        this.render('loading');
                    }
                    this.next();
                } else {
                    this.render('loading');
                }
            } else {
                /* If we do not process an advanced product, we subscribe to the corresponding stickies. */
                this.subscribe('stickiesBasic', this.params.slug);
                if (!this.ready()) {
                    this.render('loading');
                }
                this.next();
            }
        }],
        waitOn: function () {
            if (this.params.startDate && this.params.endDate) {
                return [Meteor.subscribe('singleProduct', this.params.slug), Meteor.subscribe('usersInProductRole', this.params.slug), Meteor.subscribe('sprints', this.params.slug),
                    Meteor.subscribe('userStoriesAdvanced', this.params.slug, moment(this.params.startDate).toDate(), moment(this.params.endDate).toDate())];
            }
            return [Meteor.subscribe('singleProduct', this.params.slug), Meteor.subscribe('usersInProductRole', this.params.slug),
                Meteor.subscribe('userStoriesBasic', this.params.slug), Meteor.subscribe('sprints', this.params.slug)];

        },
        data: function () {
            return Products.findOne({slug: this.params.slug});
        }
    });
    this.route('productCreate', {
        path: '/create',
        waitOn: function () {
            return Meteor.subscribe('usernamesRoles');
        }
    });
    this.route('productEdit', {
        path: '/product/:slug/edit',
        onBeforeAction: [productOwnerAdminFilter],
        waitOn: function () {
            return [Meteor.subscribe('usernamesRoles'), Meteor.subscribe('singleProduct', this.params.slug), Meteor.subscribe('privateMessageForProduct', this.params.slug), Meteor.subscribe('invitations', this.params.slug)];
        },
        data: function () {
            return Products.findOne({slug: this.params.slug});
        }
    });
    this.route('settingsPage', {
        path: '/settings',
        data: function () {
            return Users.findOne(Meteor.userId());
        },
        waitOn: function () {
            if (Meteor.userId()) {
                return Meteor.subscribe('ownUser', Meteor.userId());
            }
            return null;
        }
    });
    this.route('profilePage', {
        path: '/profile/:username',
        waitOn: function () {
            return [Meteor.subscribe('userProfile', this.params.username), Meteor.subscribe('statisticsForProfilePage', this.params.username)];
        },
        data: function () {
            return Users.findOne({username: this.params.username});
        }
    });
    this.route('privateMessagesList', {
        path: '/private-messages',
        waitOn: function () {
            return [Meteor.subscribe('privateMessages', Meteor.userId()), Meteor.subscribe('allParticipantsAvatarsInvolved', Meteor.userId())];
        }
    });
    this.route('privateMessageCreate', {
        path: '/private-messages/create',
        waitOn: function () {
            return [Meteor.subscribe('usernames')];
        }
    });
    this.route('privateMessage', {
        path: '/private-messages/:slug',
        onBeforeAction: participantsFilter,
        waitOn: function () {
            return [Meteor.subscribe('privateMessage', this.params.slug), Meteor.subscribe('participantsAvatars', this.params.slug), Meteor.subscribe('invitationsPM', this.params.slug)];
        },
        data: function () {
            return PrivateMessages.findOne({slug: this.params.slug});
        }
    });
    this.route('privateMessageEdit', {
        path: '/private-messages/:slug/edit',
        data: function () {
            return PrivateMessages.findOne({slug: this.params.slug});
        }
    });
    this.route('dashboard', {
        path: '/:productsLimit?',
        controller: DashboardController
    });
    this.route('notFound', {
        path: '*'
    });
});

var requireLogin = function () {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        this.next();
    }
};

Router.onBeforeAction(requireLogin, {
    only: ['productCreate', 'productDashboard', 'productEdit', 'settingsPage', 'privateMessagesList', 'privateMessage', 'privateMessageCreate', 'privateMessageEdit', 'sprintPlanning', 'documents', 'taskBoardPage', 'profilePage']
});

Router.onBeforeAction(function () {
    if (Session.equals('noSprintsError', false)) {
        clearAlerts();
    }
    clearDialogs();
    if (Session.equals('pmCreateEditable', false) && Session.equals('productCreateCheckbox', false)) {
        clearDevTeam();
        clearScrumMaster();
    }
    clearRecipients();
    this.next();
});

Router.onBeforeAction('loading');
if (Meteor.isClient) {
    Router.onBeforeAction('dataNotFound');
}