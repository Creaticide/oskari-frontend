import './Flyout';
import './Tile';
import './view/DefaultSearchView';
import './event/TabChangedEvent';
import './request/AddTabRequest';
import './request/AddTabRequestHandler';
import './request/AddSearchResultActionRequest';
import './request/RemoveSearchResultActionRequest';
import './request/SearchResultActionRequestHandler';
import '../../service/search/searchservice';

/**
 * @class Oskari.mapframework.bundle.search.SearchBundleInstance
 *
 * Main component and starting point for the "search" functionality.
 * Provides search functionality for the map.
 *
 * See Oskari.mapframework.bundle.search.SearchBundle for bundle definition.
 *
 */
Oskari.clazz.define(
    'Oskari.mapframework.bundle.search.SearchBundleInstance',

    /**
     * @static @method create called automatically on construction
     *
     *
     */
    function () {
        this.sandbox = null;
        this.started = false;
        this.plugins = {};
        this.localization = null;
        this.service = null;
        this.tabPriority = 1.0;
        this.disableDefault = false;
        this.safeChars = false;
    }, {
        /**
         * @static
         * @property __name
         */
        __name: 'Search',
        /**
         * @method getName
         * @return {String} the name for the component
         */
        getName: function () {
            return this.__name;
        },

        /**
         * @method setSandbox
         * @param {Oskari.Sandbox} sandbox
         * Sets the sandbox reference to this component
         */
        setSandbox: function (sandbox) {
            this.sandbox = sandbox;
        },

        /**
         * @method getSandbox
         * @return {Oskari.Sandbox}
         */
        getSandbox: function () {
            return this.sandbox;
        },

        /**
         * @method getLocalization
         * Returns JSON presentation of bundles localization data for
         * current language.
         * If key-parameter is not given, returns the whole localization
         * data.
         *
         * @param {String} key (optional) if given, returns the value for
         *         key
         * @return {String/Object} returns single localization string or
         *      JSON object for complete data depending on localization
         *      structure and if parameter key is given
         */
        getLocalization: function (key) {
            if (!this._localization) {
                this._localization = Oskari.getLocalization(this.getName());
            }
            if (key && this._localization[key]) {
                return this._localization[key];
            }
            if (!this.localization) {
                return {};
            }
            return this._localization;
        },

        /**
         * @method start
         * implements BundleInstance protocol start methdod
         */
        start: function () {
            var me = this;

            if (me.started) {
                return;
            }

            me.started = true;

            var conf = this.conf || {},
                sandboxName = (conf ? conf.sandbox : null) || 'sandbox',
                sandbox = Oskari.getSandbox(sandboxName);

            me.sandbox = sandbox;

            this.localization = Oskari.getLocalization(this.getName());

            // Default tab priority
            if (this.conf && typeof this.conf.priority === 'number') {
                this.tabPriority = this.conf.priority;
            }

            // Create default UI or not?
            if (this.conf && this.conf.disableDefault === true) {
                this.disableDefault = true;
            }

            // Filter special characters?
            if (this.conf && this.conf.safeChars === true) {
                this.safeChars = true;
            }

            var servName = 'Oskari.service.search.SearchService';
            this.service = Oskari.clazz.create(servName, sandbox, conf.url);

            sandbox.register(me);
            var p;
            for (p in me.eventHandlers) {
                if (me.eventHandlers.hasOwnProperty(p)) {
                    sandbox.registerForEventByName(me, p);
                }
            }

            // Let's extend UI
            var reqName = 'userinterface.AddExtensionRequest',
                reqBuilder = Oskari.requestBuilder(reqName),
                request = reqBuilder(this);
            sandbox.request(this, request);

            sandbox.registerAsStateful(this.mediator.bundleId, this);

            // draw ui
            me.createUi();

            // UI exists and we can hook up the request handler
            this.requestHandlers = {
                addTabRequestHandler: Oskari.clazz.create(
                    'Oskari.mapframework.bundle.search.request.AddTabRequestHandler',
                    sandbox, this.plugins['Oskari.userinterface.Flyout']),
                addSearchResultActionRequestHandler: Oskari.clazz.create(
                    'Oskari.mapframework.bundle.search.request.SearchResultActionRequestHandler',
                    sandbox, this.plugins['Oskari.userinterface.Flyout'])
            };
            sandbox.requestHandler(
                'Search.AddTabRequest',
                this.requestHandlers.addTabRequestHandler);
            sandbox.requestHandler(
                'Search.AddSearchResultActionRequest',
                this.requestHandlers.addSearchResultActionRequestHandler);
            sandbox.requestHandler(
                'Search.RemoveSearchResultActionRequest',
                this.requestHandlers.addSearchResultActionRequestHandler);

            this._registerForGuidedTour();
        },

        /**
         * @method init
         * implements Module protocol init method - does nothing atm
         */
        init: function () {
            return null;
        },

        /**
         * @method update
         * implements BundleInstance protocol update method - does
         * nothing atm
         */
        update: function () {

        },

        /**
         * @method onEvent
         * @param {Oskari.mapframework.event.Event} event a Oskari event
         * object
         * Event is handled forwarded to correct #eventHandlers if found
         * or discarded if not.
         */
        onEvent: function (event) {
            var handler = this.eventHandlers[event.getName()];
            if (!handler) {
                return;
            }

            return handler.apply(this, [event]);
        },

        /**
         * @property {Object} eventHandlers
         * @static
         */
        eventHandlers: {
            /**
             * @method ExtensionUpdatedEvent
             */
            'userinterface.ExtensionUpdatedEvent': function (event) {
                var plugin = this.plugins['Oskari.userinterface.Flyout'];

                // ExtensionUpdateEvents are fired a lot, only let search extension event to be handled when enabled
                if (event.getExtension().getName() !== this.getName()) {
                    // wasn't me -> do nothing
                    return;
                }
                if (event.getViewState() !== 'close') {
                    plugin.focus();
                }
            }
        },

        /**
         * @method stop
         * implements BundleInstance protocol stop method
         */
        stop: function () {
            var sandbox = this.sandbox(),
                p;
            for (p in this.eventHandlers) {
                if (this.eventHandlers.hasOwnProperty(p)) {
                    sandbox.unregisterFromEventByName(this, p);
                }
            }

            var reqName = 'userinterface.RemoveExtensionRequest',
                reqBuilder = Oskari.requestBuilder(reqName),
                request = reqBuilder(this);

            sandbox.request(this, request);

            this.sandbox.unregisterStateful(this.mediator.bundleId);
            this.sandbox.unregister(this);
            this.started = false;
        },

        /**
         * @method startExtension
         * implements Oskari.userinterface.Extension protocol
         * startExtension method
         * Creates a flyout and a tile:
         * Oskari.mapframework.bundle.publisher.Flyout
         * Oskari.mapframework.bundle.publisher.Tile
         */
        startExtension: function () {
            this.plugins['Oskari.userinterface.Flyout'] =
                Oskari.clazz.create('Oskari.mapframework.bundle.search.Flyout',
                    this);
            this.plugins['Oskari.userinterface.Tile'] =
                Oskari.clazz.create('Oskari.mapframework.bundle.search.Tile',
                    this);
        },

        /**
         * @method stopExtension
         * implements Oskari.userinterface.Extension protocol
         * stopExtension method
         * Clears references to flyout and tile
         */
        stopExtension: function () {
            this.plugins['Oskari.userinterface.Flyout'] = null;
            this.plugins['Oskari.userinterface.Tile'] = null;
        },

        /**
         * @method getPlugins
         * implements Oskari.userinterface.Extension protocol getPlugins
         * method
         * @return {Object} references to flyout and tile
         */
        getPlugins: function () {
            return this.plugins;
        },

        /**
         * @method getTitle
         * @return {String} localized text for the title of the component
         */
        getTitle: function () {
            return this.getLocalization('title');
        },

        /**
         * @method getDescription
         * @return {String} localized text for the description of the
         * component
         */
        getDescription: function () {
            return this.getLocalization('desc');
        },

        /**
         * @method createUi
         * (re)creates the UI for "selected layers" functionality
         */
        createUi: function () {
            this.plugins['Oskari.userinterface.Flyout'].createUi();
            this.plugins['Oskari.userinterface.Tile'].refresh();
        },

        /**
         * @method setState
         * @param {Object} state bundle state as JSON
         */
        setState: function (state) {
            this.plugins['Oskari.userinterface.Flyout'].setState(state);
        },

        /**
         * @method getState
         * @return {Object} bundle state as JSON
         */
        getState: function () {
            return this.plugins['Oskari.userinterface.Flyout'].getState();
        },

        /**
         * @static
         * @property __guidedTourDelegateTemplate
         * Delegate object given to guided tour bundle instance. Handles content & actions of guided tour popup.
         * Function "this" context is bound to bundle instance
         */
        __guidedTourDelegateTemplate: {
            priority: 10,
            show: function () {
                this.sandbox.postRequestByName('userinterface.UpdateExtensionRequest', [null, 'attach', 'Search']);
            },
            hide: function () {
                this.sandbox.postRequestByName('userinterface.UpdateExtensionRequest', [null, 'close', 'Search']);
            },
            getTitle: function () {
                return this.localization.guidedTour.title;
            },
            getContent: function () {
                var content = jQuery('<div></div>');
                content.append(this.localization.guidedTour.message);
                return content;
            },
            getLinks: function () {
                var me = this;
                var loc = this.localization.guidedTour;
                var linkTemplate = jQuery('<a href="#"></a>');
                var openLink = linkTemplate.clone();
                openLink.append(loc.openLink);
                openLink.on('click',
                    function () {
                        me.sandbox.postRequestByName('userinterface.UpdateExtensionRequest', [null, 'attach', 'Search']);
                        openLink.hide();
                        closeLink.show();
                    });
                var closeLink = linkTemplate.clone();
                closeLink.append(loc.closeLink);
                closeLink.on('click',
                    function () {
                        me.sandbox.postRequestByName('userinterface.UpdateExtensionRequest', [null, 'close', 'Search']);
                        openLink.show();
                        closeLink.hide();
                    });
                closeLink.show();
                openLink.hide();
                return [openLink, closeLink];
            }
        },

        /**
         * @method _registerForGuidedTour
         * Registers bundle for guided tour help functionality. Waits for guided tour load if not found
         */
        _registerForGuidedTour: function () {
            var me = this;
            function sendRegister () {
                var requestBuilder = Oskari.requestBuilder('Guidedtour.AddToGuidedTourRequest');
                if (requestBuilder && me.sandbox.hasHandler('Guidedtour.AddToGuidedTourRequest')) {
                    var delegate = {
                        bundleName: me.getName()
                    };
                    for (var prop in me.__guidedTourDelegateTemplate) {
                        if (typeof me.__guidedTourDelegateTemplate[prop] === 'function') {
                            delegate[prop] = me.__guidedTourDelegateTemplate[prop].bind(me); // bind methods to bundle instance
                        } else {
                            delegate[prop] = me.__guidedTourDelegateTemplate[prop]; // assign values
                        }
                    }
                    me.sandbox.request(me, requestBuilder(delegate));
                }
            }

            function handler (msg) {
                if (msg.id === 'guidedtour') {
                    sendRegister();
                }
            }

            var tourInstance = me.sandbox.findRegisteredModuleInstance('GuidedTour');
            if (tourInstance) {
                sendRegister();
            } else {
                Oskari.on('bundle.start', handler);
            }
        }
    }, {
        /**
         * @property {String[]} protocol
         * @static
         */
        protocol: [
            'Oskari.bundle.BundleInstance',
            'Oskari.mapframework.module.Module',
            'Oskari.userinterface.Extension'
        ]
    }
);
