import { Messaging } from 'oskari-ui/util';
import { showTooManyLayersPopup } from './view/TooManyLayersPopup';
import { PrintoutHandler } from './PrintoutHandler';

/**
 * @class Oskari.mapframework.bundle.printout.PrintoutBundleInstance
 *
 * Main component and starting point for the "map printout" functionality. Printout
 * is a wizardish tool to configure a printout .
 *
 * See Oskari.mapframework.bundle.printout.PrintoutBundle for bundle definition.
 *
 */
Oskari.clazz.define('Oskari.mapframework.bundle.printout.PrintoutBundleInstance',

    /**
     * @method create called automatically on construction
     * @static
     */

    function () {
        this.sandbox = undefined;
        this.started = false;
        this.plugins = {};
        this.localization = undefined;
        this.printout = undefined;
        this.buttonGroup = 'viewtools';
        this.ignoreEvents = false;
        this.dialog = undefined;
        this.printoutHandler = undefined;
        this.isMapStateChanged = true;
        this.state = undefined;
        this.geoJson = undefined;
        this.tableJson = undefined;
        // Additional data for each printable layer
        this.tileData = undefined;
        this.printService = undefined;
        //  Format producers
        this.backendConfiguration = {
            formatProducers: {
                'application/pdf': '',
                'image/png': ''
            }
        };
        this.popupControls = null;
        this.handler = new PrintoutHandler(this);
        this._log = Oskari.log(this.getName());
    }, {
        /**
         * @static
         * @property __name
         */
        __name: 'Printout',
        /**
         * @method getName
         * @return {String} the name for the component
         */
        getName: function () {
            return this.__name;
        },
        /**
         * @method getSandbox
         * @return {Oskari.Sandbox}
         */
        getSandbox: function () {
            return this.sandbox;
        },
        popupCleanup: function () {
            if (this.popupControls) {
                this.popupControls.close();
            }
            this.popupControls = null;
        },
        /**
         * @method getLocalization
         * Returns JSON presentation of bundles localization data for current language.
         * If key-parameter is not given, returns the whole localization data.
         *
         * @param {String} key (optional) if given, returns the value for key
         * @return {String/Object} returns single localization string or
         *      JSON object for complete data depending on localization
         *      structure and if parameter key is given
         */
        getLocalization: function (key) {
            if (!this._localization) {
                this._localization = Oskari.getLocalization(this.getName());
            }
            if (key) {
                return this._localization[key];
            }
            return this._localization;
        },
        /**
         * @method start
         * Implements BundleInstance protocol start method
         */
        start: function () {
            var me = this;

            if (me.started) {
                return;
            }
            me.started = true;
            var conf = this.conf,
                sandboxName = (conf ? conf.sandbox : null) || 'sandbox',
                sandbox = Oskari.getSandbox(sandboxName),
                p;
            me.sandbox = sandbox;

            this.localization = Oskari.getLocalization(this.getName());

            sandbox.register(me);

            for (p in me.eventHandlers) {
                if (me.eventHandlers.hasOwnProperty(p)) {
                    sandbox.registerForEventByName(me, p);
                }
            }

            me.backendConfiguration.formatProducers['application/pdf'] = (conf && !jQuery.isEmptyObject(conf.backendConfiguration) ? conf.backendConfiguration.formatProducers['application/pdf'] : null) || '';
            me.backendConfiguration.formatProducers['image/png'] = (conf && !jQuery.isEmptyObject(conf.backendConfiguration) ? conf.backendConfiguration.formatProducers['image/png'] : null) || '';

            if (!me.backendConfiguration.formatProducers['application/pdf']) {
                me.backendConfiguration.formatProducers['application/pdf'] = Oskari.urls.getRoute('GetPrint') + '&format=application/pdf&';
            }
            if (!me.backendConfiguration.formatProducers['image/png']) {
                me.backendConfiguration.formatProducers['image/png'] = Oskari.urls.getRoute('GetPrint') + '&format=image/png&';
            }
            // requesthandler
            this.printoutHandler = Oskari.clazz.create('Oskari.mapframework.bundle.printout.request.PrintMapRequestHandler', sandbox, function () {
                sandbox.postRequestByName('userinterface.UpdateExtensionRequest', [me, 'attach']);
            });
            sandbox.requestHandler('printout.PrintMapRequest', this.printoutHandler);

            // request toolbar to add buttons
            var addToolButtonBuilder = Oskari.requestBuilder('Toolbar.AddToolButtonRequest');
            var buttonConf = {
                iconCls: 'tool-print',
                tooltip: this.localization.btnTooltip,
                sticky: false,
                callback: function () {
                    me.continueToPrint();
                }
            };
            sandbox.request(this, addToolButtonBuilder('print', this.buttonGroup, buttonConf));

            // create the PrintService for handling ajax calls
            // and common functionality.
            var printService = Oskari.clazz.create(
                'Oskari.mapframework.bundle.printout.service.PrintService',
                me
            );
            sandbox.registerService(printService);
            this.printService = printService;

            // Let's extend UI
            var request = Oskari.requestBuilder('userinterface.AddExtensionRequest')(this);
            sandbox.request(this, request);

            // sandbox.registerAsStateful(this.mediator.bundleId, this);
            // draw ui

            sandbox.registerAsStateful(this.mediator.bundleId, this);

            this.tileData = {};
        },
        /**
         * @method init
         * Implements Module protocol init method - does nothing atm
         */
        init: function () {
            return null;
        },
        /**
         * @method update
         * Implements BundleInstance protocol update method - does nothing atm
         */
        update: function () {

        },
        getService: function () {
            return this.printService;
        },
        /**
         * @method onEvent
         * Event is handled forwarded to correct #eventHandlers if found or discarded if not.
         * @param {Oskari.mapframework.event.Event} event a Oskari event object
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
             * @method userinterface.ExtensionUpdatedEvent
             */
            'userinterface.ExtensionUpdatedEvent': function (event) {
                var me = this;

                if (event.getExtension().getName() !== me.getName()) {
                    // not me -> do nothing
                    return;
                }

                var isOpen = event.getViewState() !== 'close';
                if (isOpen && this.handler) {
                    this.handler?.getController()?.updatePanel();
                }
            },

            /**
             * Bundles interested to get printed send their data via this event.
             * The event listener saves the GeoJSON (if given) for use in printing
             * and the tile data (if given) for a given layer.
             *
             * @method Printout.PrintableContentEvent
             * @param {Object} event
             */
            'Printout.PrintableContentEvent': function (event) {
                var layer = event.getLayer(),
                    layerId = ((layer && layer.getId) ? layer.getId() : null),
                    tileData = event.getTileData(),
                    geoJson = event.getGeoJsonData();

                // Save the GeoJSON for later use if provided.
                // TODO:
                // Save the GeoJSON for each contentId separately.
                // view/BasicPrintOut.js should be changed as well
                // to parse the geoJson for the backend.
                if (geoJson) {
                    this.geoJson = geoJson;
                }
                // Save the tile data per layer for later use.
                if (tileData && layerId) {
                    this.tileData[layerId] = tileData;
                }
            }
            /**
             * Bundles could plot directly via this event
             * @method Printout.PrintWithoutUIEvent
             * @param {Object} event
             */
            /* 'Printout.PrintWithoutUIEvent': function (event) {
                var me = this,
                    printParams = event.getPrintParams(),
                    geoJson = event.getGeoJsonData();
                if (geoJson) {
                    me.geoJson = geoJson;
                }
                // Request pdf
                if (!me.printout) {
                    var map = jQuery(Oskari.dom.getRootEl());
                    me.printout = Oskari.clazz.create('Oskari.mapframework.bundle.printout.view.BasicPrintout', this, this.getLocalization('BasicView'), this.backendConfiguration);
                    me.printout.render(map);
                    me.printout.setEnabled(false);
                    me.printout.hide();
                }
                me.printout.printMap(printParams);
            } */
        },

        /**
         * @method stop
         * Implements BundleInstance protocol stop method
         */
        stop: function () {
            if (this.handler) {
                this.handler.closePanel();
            }

            this.geoJson = null;
            this.tileData = null;

            var sandbox = this.sandbox(),
                p;
            for (p in this.eventHandlers) {
                if (this.eventHandlers.hasOwnProperty(p)) {
                    sandbox.unregisterFromEventByName(this, p);
                }
            }

            sandbox.removeRequestHandler('printout.PrintMapRequest', this.printoutHandler);
            this.printoutHandler = null;
            var request = Oskari.requestBuilder('userinterface.RemoveExtensionRequest')(this);
            sandbox.request(this, request);

            this.sandbox.unregisterStateful(this.mediator.bundleId);
            this.sandbox.unregister(this);
            this.started = false;
        },
        continueToPrint: function () {
            if (this._isManyLayers()) {
                if (this._isTooManyLayers()) {
                    if (!this.popupControls) {
                        this.popupControls = showTooManyLayersPopup(() => this.popupCleanup());
                    }
                } else {
                    Messaging.notify(Oskari.getMsg('Printout', 'StartView.info.printoutProcessingTime'));
                    this.setPublishMode(true);
                }
            } else {
                this.setPublishMode(true);
            }
        },
        /**
         * @method getPlugins
         * implements Oskari.userinterface.Extension protocol getPlugins method
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
         * @return {String} localized text for the description of the component
         */
        getDescription: function () {
            return this.getLocalization('desc');
        },
        startExtension: function () {

        },
        stopExtension: function () {

        },
        /**
         * @method setPublishMode
         * Transform the map view to printout mode if parameter is true and back to normal if false.
         * Makes note about the map layers that the user cant publish, removes them for publish mode and
         * returns them when exiting the publish mode.
         *
         * @param {Boolean} blnEnabled
         */
        setPublishMode: function (blnEnabled) {
            // trigger an event letting other bundles know we require the whole UI
            const eventBuilder = Oskari.eventBuilder('UIChangeEvent');
            this.sandbox.notifyAll(eventBuilder(this.mediator.bundleId));

            if (blnEnabled) {
                this.sandbox.mapMode = 'mapPrintoutMode';
                this.sandbox.postRequestByName('userinterface.UpdateExtensionRequest', [this, 'hide']);

                this.handler?.getController()?.showPanel();
                // reset and disable map rotation
                this.sandbox.postRequestByName('rotate.map', []);
                this.sandbox.postRequestByName('DisableMapMouseMovementRequest', [['rotate']]);
            } else {
                this.handler?.getController()?.closePanel();
            }
        },
        /**
         * @method setState
         * Sets the bundle state
         * bundle documentation for details.
         * @param {Object} state bundle state as JSON
         */
        setState: function (state) {
            this.state = state;
        },
        /**
         * @method getState
         * Returns bundle state as JSON. State is bundle specific, check the
         * bundle documentation for details.
         * @return {Object}
         */
        getState: function () {
            var state = this.state || {};

            return state;
        },
        _isTooManyLayers: function () {
            const layerCount = this._getVisibleLayersCount();
            const isMaxLayersExceeded = layerCount > 7;
            return isMaxLayersExceeded;
        },
        _isManyLayers: function () {
            const layerCount = this._getVisibleLayersCount();
            const isManyLayersExceeded = layerCount > 3;
            return isManyLayersExceeded;
        },
        _getVisibleLayersCount: function () {
            const layers = this.getSandbox().findAllSelectedMapLayers();
            return layers.filter(layer => layer.isVisible()).length;
        }
    }, {
        /**
         * @property {String[]} protocol
         * @static
         */
        protocol: ['Oskari.bundle.BundleInstance', 'Oskari.mapframework.module.Module', 'Oskari.userinterface.Extension', 'Oskari.userinterface.Stateful']
    });
