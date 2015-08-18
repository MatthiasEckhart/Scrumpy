var scrumTeamFilter = function () {
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

var productOwnerAdminFilter = function () {
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

var participantsFilter = function () {
    if (Meteor.user()) {
        Meteor.subscribe('privateMessageParticipants', this.params.slug);
        var pm = PrivateMessages.findOne({slug: this.params.slug});
        if (pm) {
            if (!_.contains(pm.participants, Meteor.userId())) {
                this.render('noAccessPrivateMessage');
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

var productAdvancedFilter = function() {
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

Router.configure({
    layoutTemplate: 'layout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading',
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
            if (product.advancedMode) {
                if (this.ready()) {
                    sprintAvail = Sprints.findOne({
                        productId: product._id,
                        startDate: moment(this.params.startDate).toDate(),
                        endDate: moment(this.params.endDate).toDate()
                    });
                    if ((!this.params.startDate && !this.params.endDate) || typeof sprintAvail === "undefined") {
                        sprint = Sprints.findOne({
                            productId: product._id,
                            startDate: {$lte: new Date()},
                            endDate: {$gte: new Date()}
                        });
                        if (Sprints.find().count() > 0 && sprint) {
                            Session.set('sprintNotAvailableError', true);
                            this.redirect('taskBoardPage', {
                                slug: this.params.slug,
                                startDate: moment(sprint.startDate).format('YYYY-MM-DD'),
                                endDate: moment(sprint.endDate).format('YYYY-MM-DD')
                            });
                        } else {
                            Session.set('noSprintsError', true);
                            this.redirect('productDashboard', {slug: this.params.slug});
                        }
                    } else {
                        if (this.ready()) {
                            storyIds = [];
                            UserStories.find({sprintId: sprintAvail._id}).forEach(function (story) {
                                storyIds.push(story._id);
                            });
                            this.subscribe('stickiesAdvanced', storyIds);
                        } else {
                            this.render('loading');
                        }
                        this.next();
                    }
                } else {
                    this.render('loading');
                }
            } else {
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
                    Meteor.subscribe('userStoriesBasic', this.params.slug)];

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

function subscribeToOwnUser(userId) {
    Meteor.subscribe('ownUser', userId);
}

Router.onBeforeAction(requireLogin, {
    only: ['productCreate', 'productDashboard', 'productEdit', 'settingsPage', 'privateMessagesList', 'privateMessage', 'privateMessageCreate', 'privateMessageEdit', 'sprintPlanning', 'documents', 'taskBoardPage', 'profilePage']
});

Router.onBeforeAction(function () {
    if (Session.equals('noSprintsError', false) || Session.equals('sprintNotAvailableError', false)) {
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