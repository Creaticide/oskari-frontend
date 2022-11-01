import React from 'react';
import ReactDOM from 'react-dom';
import { PanButton } from './PanButton';

/**
 * @class Oskari.mapframework.bundle.mapmodule.plugin.PanButtons
 * Adds on-screen pan buttons on the map. In the middle of the pan buttons is a
 * state reset button.
 *
 * See http://www.oskari.org/trac/wiki/DocumentationBundleMapModulePluginPanButtons
 */
Oskari.clazz.define('Oskari.mapframework.bundle.mapmodule.plugin.PanButtons',

    /**
     * @static @method create called automatically on construction
     *
     *
     */
    function (config) {
        this._clazz =
            'Oskari.mapframework.bundle.mapmodule.plugin.PanButtons';
        this._defaultLocation = 'top right';
        this._index = 20;
        this._name = 'PanButtons';
        this._panPxs = 100;
        this.inMobileMode = false;
    }, {
        /**
         * @private @method _createControlElement
         * Draws the panbuttons on the screen.
         *
         *
         * @return {jQuery}
         * Plugin jQuery element
         */
        _createControlElement: function () {
            const el = jQuery(
                '<div class="mapplugin panbuttonDiv panbuttons"></div>'
            );
            return el;
        },
        _resetClicked: function () {
            if (this.inLayerToolsEditMode()) {
                return;
            }
            const popup = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            const cb = () => {
                if (this.getSandbox().hasHandler('StateHandler.SetStateRequest')) {
                    this.getSandbox().postRequestByName('StateHandler.SetStateRequest');
                } else {
                    this.getSandbox().resetState();
                }
            };
            popup.show(null, Oskari.getMsg('MapModule', 'plugin.PanButtonsPlugin.center.confirmReset'), popup.createConfirmButtons(cb));
            popup.makeModal();
        },
        _panClicked: function (x, y) {
            if (this.inLayerToolsEditMode()) {
                return;
            }
            const pxX = this._panPxs * x;
            const pxY = this._panPxs * y;
            this.getMapModule().panMapByPixels(pxX, pxY, true);
        },
        /**
         * @public  @method _refresh
         * Called after a configuration change.
         *
         *
         */
        refresh: function () {
            var me = this,
                conf = me.getConfig();
            // Change the style if in the conf
            if (conf && conf.toolStyle) {
                me.changeToolStyle(conf.toolStyle, me.getElement());
            } else {
                // not found -> use the style config obtained from the mapmodule.
                var toolStyle = me.getToolStyleFromMapModule();
                me.changeToolStyle(toolStyle, me.getElement());
            }
        },

        /**
         * @method changeToolStyle
         * Changes the tool style of the plugin
         *
         * @param {Object} styleName
         * @param {jQuery} div
         *
         */
        changeToolStyle: function (styleName, div) {
            div = div || this.getElement();
            if (!div) {
                return;
            }

            const styleClass = styleName || 'rounded-dark';

            ReactDOM.render(
                <PanButton resetClicked={() => this._resetClicked()} panClicked={(x, y) => this._panClicked(x, y)} styleName={styleClass} />,
                div[0]
            );
        },
        /**
         * Handle plugin UI and change it when desktop / mobile mode
         * @method  @public createPluginUI
         * @param  {Boolean} mapInMobileMode is map in mobile mode
         * @param {Boolean} forced application has started and ui should be rendered with assets that are available
         */
        redrawUI: function (mapInMobileMode, forced) {
            if (!this.isVisible()) {
                // no point in drawing the ui if we are not visible
                return;
            }

            // don't do anything now if request is not available.
            // When returning false, this will be called again when the request is available
            this.teardownUI();

            this.inMobileMode = mapInMobileMode;

            this._element = this._createControlElement();
            this.refresh();
            this.addToPluginContainer(this._element);
        },
        teardownUI: function () {
            this.removeFromPluginContainer(this.getElement());
        },
        /**
         * @method _stopPluginImpl BasicMapModulePlugin method override
         * @param {Oskari.Sandbox} sandbox
         */
        _stopPluginImpl: function (sandbox) {
            this.teardownUI();
        }
    }, {
        'extend': ['Oskari.mapping.mapmodule.plugin.BasicMapModulePlugin'],
        /**
         * @static @property {string[]} protocol array of superclasses
         */
        'protocol': [
            'Oskari.mapframework.module.Module',
            'Oskari.mapframework.ui.module.common.mapmodule.Plugin'
        ]
    });
