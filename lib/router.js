/* Set global default options for router. */
Router.configure({
    layoutTemplate: 'layout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading',
    /* Disable spinner. */
    progressSpinner: false,
    waitOn: function () {
        /* Check if user and corresponding notifications are ready. */
        if (Meteor.user() && Meteor.user().notifications)
            return [
                Meteor.subscribe('notifications', Meteor.user().notifications),
                Meteor.subscribe('conversations', Meteor.userId()),
                Meteor.subscribe('allRecipientsAvatarsInvolved', Meteor.userId()),
                Meteor.subscribe('projectsForNotification')
            ];
    }
});

/* Dashboard Route Controller. */
DashboardController = RouteController.extend({
    template: 'dashboard',
    /* Show the first three projects. */
    increment: 3,
    /* Set product ids. */
    productIds: function () {
        /* Check if user and user roles are ready. */
        if (Meteor.user() && Meteor.user().roles) {
            /* User roles are named after product ids, as a consequence we can return an array of role names, queried by all different roles groups. */
            return _.union(Meteor.user().roles.administrator, Meteor.user().roles.developmentTeam, Meteor.user().roles.productOwner, Meteor.user().roles.scrumMaster).filter(function (e) {
                return e;
            });
        }
    },
    /* Limit the amount of products displayed at once (infinite pagination). */
    limit: function () {
        return parseInt(this.params.productsLimit) || this.increment;
    },
    /* Sort products by last modified time stamp. */
    findOptions: function () {
        return {sort: {lastModified: -1}, limit: this.limit()};
    },
    waitOn: function () {
        /* Subscribe to all dashboard statistics. */
        var subscriptionArr = [Meteor.subscribe('dashboardStatistics'), Meteor.subscribe('dashboardStatisticsPrivate')];
        /* Check if user and user roles are ready. */
        if (Meteor.user() && Meteor.user().roles) {
            /* Add products and products statistics to subscription array. */
            subscriptionArr.push(Meteor.subscribe('products', this.findOptions(), this.productIds()));
            subscriptionArr.push(Meteor.subscribe('productStat'));
            /* Add users to subscription array which sent an invitation and which subsequently has been accepted. */
            subscriptionArr.push(Meteor.subscribe('usersInvitationAcceptedAuthors', Meteor.userId()));
        }
        return subscriptionArr;
    },
    products: function () {
        /* If product ids and user is ready, return cursor with products documents. */
        if (this.productIds() && Meteor.user()) return Products.find({_id: {$in: this.productIds()}}, this.findOptions());
    },
    data: function () {
        /* If user is not logged in and products are undefined, we return global statistics. */
        if (!Meteor.user() || _.isUndefined(this.products())) return DashboardStatistics.find();
        /* Load more products on request. */
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
            return [
                Meteor.subscribe('singleProduct', this.params.slug),
                Meteor.subscribe('userStoriesBasic', this.params.slug),
                Meteor.subscribe('sprints', this.params.slug),
                Meteor.subscribe('burndown', this.params.slug),
                Meteor.subscribe('comments', this.params.slug),
                Meteor.subscribe('usersInvited', this.params.slug),
                Meteor.subscribe('stickiesAdvancedByProductSlug', this.params.slug),
                Meteor.subscribe('activityStreamElements', this.params.slug),
                Meteor.subscribe('productInvitations', this.params.slug)
            ];
        }
    });
    this.route('sprintPlanning', {
        path: '/product/:slug/sprint-planning',
        onBeforeAction: [scrumTeamFilter, productAdvancedFilter],
        data: function () {
            return Products.findOne({slug: this.params.slug});
        },
        waitOn: function () {
            return [
                Meteor.subscribe('singleProduct', this.params.slug),
                Meteor.subscribe('userStoriesBasic', this.params.slug),
                Meteor.subscribe('sprints', this.params.slug),
                Meteor.subscribe('burndown', this.params.slug),
                Meteor.subscribe('comments', this.params.slug),
                Meteor.subscribe('usersInvited', this.params.slug),
                Meteor.subscribe('stickiesAdvancedByProductSlug', this.params.slug)
            ];
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
                return [
                    Meteor.subscribe('singleProduct', this.params.slug),
                    Meteor.subscribe('usersInvited', this.params.slug),
                    Meteor.subscribe('sprints', this.params.slug),
                    Meteor.subscribe('userStoriesAdvanced', this.params.slug, moment(this.params.startDate).toDate(), moment(this.params.endDate).toDate())
                ];
            }
            return [
                Meteor.subscribe('singleProduct', this.params.slug),
                Meteor.subscribe('usersInvited', this.params.slug),
                Meteor.subscribe('userStoriesBasic', this.params.slug),
                Meteor.subscribe('sprints', this.params.slug)
            ];

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
    this.route('invite', {
        path: '/product/:slug/invite',
        onBeforeAction: [productOwnerAdminFilter],
        waitOn: function () {
            return [
                Meteor.subscribe('usernamesRoles'),
                Meteor.subscribe('singleProduct', this.params.slug),
                Meteor.subscribe('productInvitations', this.params.slug)
            ];
        },
        data: function () {
            return Products.findOne({slug: this.params.slug});
        }
    });
    this.route('productEdit', {
        path: '/product/:slug/edit',
        onBeforeAction: [productOwnerAdminFilter],
        waitOn: function () {
            return [
                Meteor.subscribe('usernamesRoles'),
                Meteor.subscribe('singleProduct', this.params.slug),
                Meteor.subscribe('privateMessageForProduct', this.params.slug),
                Meteor.subscribe('productInvitations', this.params.slug)
            ];
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
    this.route('conversationsList', {
        path: '/conversations',
        waitOn: function () {
            return [Meteor.subscribe('conversations', Meteor.userId()), Meteor.subscribe('allRecipientsAvatarsInvolved', Meteor.userId())];
        }
    });
    this.route('conversationCreate', {
        path: '/conversations/create',
        waitOn: function () {
            return [Meteor.subscribe('usernames')];
        }
    });
    this.route('conversation', {
        path: '/conversation/:slug',
        onBeforeAction: recipientsFilter,
        waitOn: function () {
            return [Meteor.subscribe('conversation', this.params.slug), Meteor.subscribe('recipientsAvatars', this.params.slug), Meteor.subscribe('privateMessages', this.params.slug)];
        },
        data: function () {
            return Conversations.findOne({slug: this.params.slug});
        }
    });
    this.route('conversationEdit', {
        path: '/conversation/:slug/edit',
        waitOn: function () {
            return [Meteor.subscribe('conversation', this.params.slug), Meteor.subscribe('usernames', this.params.slug)];
        },
        data: function () {
            return Conversations.findOne({slug: this.params.slug});
        }
    });
    this.route('invitations', {
        path: '/invitations',
        waitOn: function () {
            return [
                Meteor.subscribe('invitations', Meteor.userId()),
                Meteor.subscribe('productInvitationData', Meteor.userId()),
                Meteor.subscribe('usersInvitationAuthors', Meteor.userId())
            ];
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
        if (Meteor.loggingIn()) this.render(this.loadingTemplate);
        else this.render('accessDenied');
    } else this.next();
};

Router.onBeforeAction(requireLogin, {
    only: [
        'productCreate',
        'productDashboard',
        'productEdit',
        'settingsPage',
        'conversationsList',
        'conversation',
        'conversationCreate',
        'conversationEdit',
        'sprintPlanning',
        'documents',
        'taskBoardPage',
        'profilePage',
        'invitations',
        'invite'
    ]
});

Router.onBeforeAction(function () {
    if (Session.equals('noSprintsError', false)) clearAlerts();
    clearDialogs();
    this.next();
});

if (Meteor.isClient) Router.onBeforeAction('dataNotFound');