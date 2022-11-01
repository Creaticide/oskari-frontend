import React from 'react';
import ReactDOM from 'react-dom';
import { MapModuleButton } from '../../../mapping/mapmodule/MapModuleButton';
import { QuestionOutlined } from '@ant-design/icons';

Oskari.clazz.define('Oskari.mapframework.bundle.maplegend.plugin.MapLegendPlugin',
    function (config, plugins) {
        var me = this;
        me._config = config || {};
        me._plugins = plugins;
        me._clazz = 'Oskari.mapframework.bundle.maplegend.plugin.MapLegendPlugin';
        me._defaultLocation = 'top right';
        me._templates = {
            maplegend: jQuery('<div class="mapplugin maplegend"></div>'),
            legendContainer: jQuery('<div class="legendSelector"></div>'),
            legendInfo: jQuery('<div class="legendInfo"></div>'),
            legendDivider: jQuery('<div class="maplegend-divider"></div>')
        };
        me._index = 90;
        me._element = null;
        me._isVisible = false;
        me._loc = null;
        me._popup = null;
        me.inMobileMode = false;
    }, {
        _setLayerToolsEditModeImpl: function () {
            if (this.inLayerToolsEditMode() && this.isOpen()) {
                this._toggleToolState();
            }
        },
        _createControlElement: function () {
            var me = this,
                loc = Oskari.getLocalization('maplegend', Oskari.getLang());
            var isMobile = Oskari.util.isMobile();

            this.inMobileMode = isMobile;
            me._loc = loc;

            return this.createDesktopElement();
        },

        /**
         * @public @method changeToolStyle
         * Changes the tool style of the plugin
         *
         * @param {Object} style
         * @param {jQuery} div
         */
        changeToolStyle: function (style, div) {
            var me = this,
                el = div || me.getElement();

            if (!el) {
                return;
            }

            const styleClass = style || 'rounded-dark';

            me.renderButton(styleClass, el);
        },

        renderButton: function (style, element) {
            let el = element;
            if (!element) {
                el = this.getElement();
            }
            if (!el) return;

            let styleName = style;
            if (!style) {
                styleName = this.getToolStyleFromMapModule();
            }

            ReactDOM.render(
                <MapModuleButton
                    className='t_maplegend'
                    title={this._loc.tooltip}
                    icon={<QuestionOutlined />}
                    styleName={styleName || 'rounded-dark'}
                    onClick={() => {
                        if (!this.inLayerToolsEditMode()) {
                            this.togglePopup();
                        }
                    }}
                    iconActive={this._isVisible}
                />,
                el[0]
            );
        },

        togglePopup: function () {
            const me = this;
            const themeColours = me.getMapModule().getThemeColours();
            let singleLegend = false;
            let dropdown = null;
            const popupLocation = this.getPopupPosition();
            const legend = me.getElement();

            if (me._toggleToolState() === false) {
                return;
            }
            const legends = me.getLegends();
            let title = me._loc.title;
            if (legends.length === 1) {
                title = me._loc.singleLegend + legends[0].title;
                singleLegend = true;
                me._popup.show(title, null);
            } else {
                me._popup.show(title, null);
                me._popup.moveTo(legend, popupLocation, true);
            }

            const content = me._popup.getJqueryContent();
            const legendContent = me.generateLegendContainer(singleLegend);
            if (!singleLegend) {
                dropdown = legendContent.find('.oskari-select');
            }
            content.append(legendContent);

            const popupCloseIcon = (me.getMapModule().getTheme() === 'dark') ? 'icon-close-white' : undefined;

            me._popup.createCloseIcon();
            me._popup.setColourScheme({
                'bgColour': themeColours.backgroundColour,
                'titleColour': themeColours.textColour,
                'iconCls': popupCloseIcon
            });

            me._popup.makeDraggable();
            me._popup.onClose(function () {
                me._popup.dialog.children().empty();
                me._isVisible = false;
                me._popup.close();
                me.renderButton(null, null);
            });
            me._popup.adaptToMapSize(me.getSandbox(), 'maplegend');
            me._isVisible = true;
            me.getLayerLegend(function (img) {
                content.find('.imgDiv').remove();
                content.find('.legendLink').remove();
                content.find('.error').remove();
                var legendImage = jQuery('<div class="imgDiv"></div>');
                var legendLink = jQuery('<div class="legendLink"><a target="_blank" ></a></br></br></div>');
                legendLink.find('a').attr('href', img.src);
                legendLink.find('a').text(me._loc.newtab);
                legendImage.append(img);
                content.append(legendLink);
                content.append(legendImage);
                me._popup.moveTo(legend, popupLocation, true);
            }, function () {
                me._popup.moveTo(legend, popupLocation, true);
                content.find('.imgDiv').remove();
                content.find('.error').remove();
                content.append('<div class="error">' + me._loc.invalidLegendUrl + '</div>');
            }, singleLegend, dropdown);

            if (!singleLegend) {
                dropdown.trigger('change');
            }
            me.renderButton(null, null);
        },
        createDesktopElement: function () {
            var me = this;
            var legend = me._templates.maplegend.clone();
            var popupService = me.getSandbox().getService('Oskari.userinterface.component.PopupService');
            me._popup = popupService.createPopup();
            me._popup.addClass('maplegend__popup');
            popupService.closeAllPopups(true);

            return legend;
        },
        getPopupPosition: function () {
            var popupLocation;

            if (this._config.location && this._config.location.classes === 'top left') {
                popupLocation = 'right';
            } else {
                popupLocation = 'left';
            }
            return popupLocation;
        },
        generateLegendContainer: function (singleLegend) {
            var me = this;
            var legendContainer = this._templates.legendContainer.clone();
            var legendInfo = this._templates.legendInfo.clone();
            var legendDivider = this._templates.legendDivider.clone();

            legendInfo.text(me._loc.infotext);

            if (!singleLegend) {
                var dropdown = me.createDropdown();
                legendContainer.append(legendInfo);
                legendContainer.append(legendDivider);
                legendContainer.append(dropdown);
            } else {
                legendContainer.append(legendDivider);
            }
            return legendContainer;
        },
        createDropdown: function () {
            var select = Oskari.clazz.create('Oskari.userinterface.component.SelectList');

            var legendLayers = this.getLegends();
            var options = {
                placeholder_text: 'layers',
                allow_single_deselect: false,
                disable_search_threshold: 10,
                width: '100%'
            };
            var dropdown = select.create(legendLayers, options);
            dropdown.css({
                width: '96%',
                paddingBottom: '1em'
            });
            select.adjustChosen();
            select.selectFirstValue();
            return dropdown;
        },
        getLayerLegend: function (successCb, errorCb, singleLegend, dropdown) {
            var layer,
                me = this;

            if (singleLegend) {
                var legendLayer = me.getLegends();
                layer = Oskari.getSandbox().findMapLayerFromSelectedMapLayers(legendLayer[0].id);

                if (!layer) {
                    return;
                }
                var legendImg = jQuery('<img id="legendImg"></img>');
                legendImg.attr('src', layer.getLegendImage());

                if (typeof successCb === 'function') {
                    legendImg.on('load', function () {
                        successCb(this);
                    });
                }
                if (typeof errorCb === 'function') {
                    legendImg.on('error', function () {
                        errorCb(this);
                    });
                }
            } else {
                dropdown.on('change', function (e, params) {
                    var id = e.target.value ? e.target.value : jQuery(e.target).find(':selected').val();
                    layer = Oskari.getSandbox().findMapLayerFromSelectedMapLayers(id);

                    if (!layer) {
                        return;
                    }
                    var legendImg = jQuery('<img id="legendImg"></img>');
                    legendImg.attr('src', layer.getLegendImage());
                    legendImg.on('load', function () {
                        // do stuff on success
                        successCb(this);
                    });
                    legendImg.on('error', function () {
                        errorCb(this);
                    });
                });
            }
        },
        getLegends: function () {
            var layers = this.getSandbox().findAllSelectedMapLayers().slice(0);
            var legendLayers = [];

            layers.forEach(function (layer) {
                if (!layer.getLegendImage()) {
                    return;
                }
                var layerObject = {
                    id: layer.getId(),
                    title: Oskari.util.sanitize(layer.getName())
                };
                legendLayers.push(layerObject);
            });
            return legendLayers;
        },
        _createUI: function () {
            var me = this,
                conf = me._config;
            this._element = this._createControlElement();
            if (this._element) {
                this.addToPluginContainer(this._element);
            }
            // Change the style if in the conf
            if (conf && conf.toolStyle) {
                me.changeToolStyle(conf.toolStyle, me.getElement());
            } else {
                var toolStyle = me.getToolStyleFromMapModule();
                me.changeToolStyle(toolStyle, me.getElement());
            }
        },
        isOpen: function () {
            return this._isVisible;
        },

        redrawUI: function (mapInMobileMode, forced) {
            if (this.getElement()) {
                this.teardownUI(true);
            }

            this._createUI();
        },
        teardownUI: function () {
            // detach old element from screen
            if (this.getElement() !== undefined) {
                this.getElement().detach();
                this.removeFromPluginContainer(this.getElement());
            }
        },
        /**
         * Toggle tool state.
         * @method @private _toggleToolState
         */
        _toggleToolState: function () {
            if (this.isOpen()) {
                this._isVisible = false;
                this._popup.close(true);
                return this.isOpen();
            } else {
                this._isVisible = true;
                this.createDesktopElement();
            }
        },
        /**
         * Get jQuery element.
         * @method @public getElement
         */
        getElement: function () {
            return this._element;
        },
        stopPlugin: function () {
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
