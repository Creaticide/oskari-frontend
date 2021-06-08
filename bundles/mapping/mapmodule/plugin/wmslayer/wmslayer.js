/**
 * @class Oskari.mapframework.domain.WmsLayer
 *
 * MapLayer of type WMS
 */
Oskari.clazz.define('Oskari.mapframework.domain.WmsLayer',

    /**
     * @method create called automatically on construction
     * @static
     */

    function () {
        this._availableQueryFormats = [];

        /* Layer Type */
        this._layerType = 'WMS';
    }, {
        /**
         * @method addWmsUrl
         * @param {String} wmsUrl
         * Apppends the url to layer array of wms image urls
         */
        addWmsUrl: function (wmsUrl) {
            this.addLayerUrl(wmsUrl);
        },
        /**
         * @method getWmsUrls
         * @return {String[]}
         * Gets array of layer wms image urls
         */
        getWmsUrls: function () {
            return this.getLayerUrls();
        },
        /**
         * @method setWmsUrls
         * @param {String[]} wmsUrls
         * Gets array of layer wms image urls
         */
        setWmsUrls: function (wmsUrls) {
            this.setLayerUrls(wmsUrls);
        },
        /**
         * @method setVersion
         * @param {String} version 1.3.0 or 1.1.1.
         */
        setVersion: function (version) {
            this._version = version;
        },
        /**
         * @method getVersion
         * @return {String} version 1.3.0 or 1.1.1.
         */
        getVersion: function () {
            return this._version;
        }
    }, {
        'extend': ['Oskari.mapframework.domain.AbstractLayer']
    });
