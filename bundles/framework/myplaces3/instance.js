import { LOCALE_KEY } from './constants';
import { showModal } from './reactModalHelper';

/**
 * @class Oskari.mapframework.bundle.myplaces3.MyPlacesBundleInstance
 *
 * My places functionality
 */
Oskari.clazz.define(
    'Oskari.mapframework.bundle.myplaces3.MyPlacesBundleInstance',

    /**
     * @method create called automatically on construction
     * @static
     */
    function () {
        this.loc = Oskari.getMsg.bind(null, LOCALE_KEY);
        this.sandbox = null;
        this.buttons = undefined;
        this.categoryHandler = undefined;
        this.myPlacesService = undefined;
        this.idPrefix = 'myplaces';
        this.finishedDrawing = false;
        this.editPlace = false;
    }, {
        __name: 'MyPlaces3',

        __drawStyle: {
            draw: {
                fill: {
                    color: 'rgba(35, 216, 194, 0.3)'
                },
                stroke: {
                    color: 'rgba(35, 216, 194, 1)',
                    width: 2
                },
                image: {
                    radius: 4,
                    fill: {
                        color: 'rgba(35, 216, 194, 0.7)'
                    }
                }
            },
            modify: {
                fill: {
                    color: 'rgba(0, 0, 238, 0.3)'
                },
                stroke: {
                    color: 'rgba(0, 0, 238, 1)',
                    width: 2
                },
                image: {
                    radius: 4,
                    fill: {
                        color: 'rgba(0,0,0,1)'
                    }
                }
            }
        },
        getDrawStyle: function () {
            return this.__drawStyle;
        },
        /**
         * @method getName
         * @return {String} the name for the component
         */
        getName: function () {
            return this.__name;
        },
        getEditPlaceName: function () {
            return this.editPlaceName;
        },
        /**
         * @method getSandbox
         * @return {Oskari.Sandbox}
         */
        getSandbox: function () {
            return this.sandbox;
        },
        /**
         * @method showMessage
         * Shows user a message with ok button
         * @param {String} title popup title
         * @param {String} message popup message
         */
        showMessage: function (title, message) {
            var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            var okBtn = Oskari.clazz.create('Oskari.userinterface.component.buttons.OkButton');
            okBtn.setHandler(function () {
                dialog.close(true);
            });
            dialog.makeModal();
            dialog.show(title, message, [okBtn]);
        },
        /**
         * @method forceDisable
         * Disables the functionality since something went wrong
         * (couldnt create default category)
         */
        forceDisable: function () {
            this.buttons.disableButtons();

            this.showMessage(this.loc('category.organization') + ' - ' +
            this.loc('notification.error.title'), this.loc('notification.error.generic'));
        },
        /**
         * @method getService
         * Returns the my places main service
         * @return {Oskari.mapframework.bundle.myplaces3.service.MyPlacesService}
         */
        getService: function () {
            return this.myPlacesService;
        },

        isFinishedDrawing: function () {
            return this.finishedDrawing;
        },
        setIsFinishedDrawing: function (bln) {
            this.finishedDrawing = !!bln;
        },
        isEditPlace: function () {
            return this.editPlace;
        },
        setIsEditPlace: function (bln) {
            this.editPlace = !!bln;
        },

        /**
         * @method myPlaceSelected
         * Place was selected
         * @param {} event
         */
        myPlaceSelected: function () {
            // cleanup
            // ask toolbar to select default tool
            var toolbarRequest = Oskari.requestBuilder('Toolbar.SelectToolButtonRequest')();
            this.sandbox.request(this, toolbarRequest);
            this.editPlace = false;
            this.getMainView().cleanupDrawingVariables();
        },

        /**
         * @method getCategoryHandler
         * Returns reference to the category handler
         * @return {Oskari.mapframework.bundle.myplaces3.CategoryHandler}
         */
        getCategoryHandler: function () {
            return this.categoryHandler;
        },
        /**
         * @method getMainView
         * Returns reference to the main view
         * @return {Oskari.mapframework.bundle.myplaces3.view.MainView}
         */
        getMainView: function () {
            return this.view;
        },
        /**
         * @method update
         * implements BundleInstance protocol update method - does nothing atm
         */
        update: function () {},
        /**
         * @method init
         * implements Module protocol init method
         */
        init: function () {},
        /**
         * @method  @private _addEventHandlers Add event handlers
         */
        _addRequestHandlers: function () {
            var conf = this.conf || {};
            var sandbox = Oskari.getSandbox(conf.sandbox);

            var editRequestHandler = Oskari.clazz.create(
                'Oskari.mapframework.bundle.myplaces3.request.EditRequestHandler',
                sandbox,
                this
            );
            sandbox.requestHandler(
                'MyPlaces.EditPlaceRequest',
                editRequestHandler
            );
            sandbox.requestHandler(
                'MyPlaces.DeletePlaceRequest',
                editRequestHandler
            );
            sandbox.requestHandler(
                'MyPlaces.EditCategoryRequest',
                editRequestHandler
            );
            sandbox.requestHandler(
                'MyPlaces.DeleteCategoryRequest',
                editRequestHandler
            );
            sandbox.requestHandler(
                'MyPlaces.PublishCategoryRequest',
                editRequestHandler
            );

            var openAddLayerDialogHandler = Oskari.clazz.create(
                'Oskari.mapframework.bundle.myplaces3.request.OpenAddLayerDialogHandler',
                sandbox,
                this
            );
            sandbox.requestHandler(
                'MyPlaces.OpenAddLayerDialogRequest',
                openAddLayerDialogHandler
            );
        },
        /**
         * @method start
         * implements BundleInstance protocol start methdod
         */
        start: function () {
            // Should this not come as a param?
            var conf = this.conf || {};
            var sandbox = Oskari.getSandbox(conf.sandbox);
            this.sandbox = sandbox;

            Oskari.log('MyPlaces3').debug('Initializing my places module...');

            // handles toolbar buttons related to my places
            this.buttons = Oskari.clazz.create('Oskari.mapframework.bundle.myplaces3.ButtonHandler', this);
            this.buttons.start();

            var user = Oskari.user();
            if (!user.isLoggedIn()) {
                // guest users don't need anything else
                return;
            }

            sandbox.register(this);

            // back end communication
            this.myPlacesService = Oskari.clazz.create('Oskari.mapframework.bundle.myplaces3.service.MyPlacesService', sandbox);
            // register service so personal data can access it
            this.sandbox.registerService(this.myPlacesService);
            // handles category related logic - syncs categories to my places map layers etc
            this.categoryHandler = Oskari.clazz.create('Oskari.mapframework.bundle.myplaces3.CategoryHandler', this);
            // start loads myplaces layers
            this.categoryHandler.start();

            // handles my places insert form etc
            this.view = Oskari.clazz.create('Oskari.mapframework.bundle.myplaces3.view.MainView', this);
            this.view.start();

            this._addRequestHandlers();

            this.tab = Oskari.clazz.create('Oskari.mapframework.bundle.myplaces3.MyPlacesTab', this, this.getMainView().sendStopDrawRequest);

            this.tab.initContainer();
            // binds tab to events
            if (this.tab.bindEvents) {
                this.tab.bindEvents();
            }

            if (!sandbox.hasHandler('PersonalData.AddTabRequest')) {
                return;
            }
            var addAsFirstTab = true;
            var reqBuilder = Oskari.requestBuilder('PersonalData.AddTabRequest');
            var req = reqBuilder(
                this.tab.getTitle(),
                this.tab.getContent(),
                addAsFirstTab,
                this.idPrefix);
            sandbox.request(this, req);
        },
        /**
         * @method stop
         * implements BundleInstance protocol stop method - does nothing atm
         */
        stop: function () {
            this.sandbox = null;
        },

        openAddLayerDialog: function () {
            // create popup
            const handler = this.categoryHandler;
            const saveLayer = (name, style) => {
                handler.saveCategory({
                    name,
                    style
                });
            };
            showModal(this.loc('tab.addCategoryFormButton'), null, saveLayer);
        }
    }, {
        /**
         * @property {String[]} protocol
         * @static
         */
        protocol: ['Oskari.bundle.BundleInstance']
    });
