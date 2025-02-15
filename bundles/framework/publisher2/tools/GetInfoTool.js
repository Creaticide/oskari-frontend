Oskari.clazz.define('Oskari.mapframework.publisher.tool.GetInfoTool',
    function () {
    }, {
        index: 8,
        allowedLocations: [],
        allowedSiblings: [],

        groupedSiblings: true,

        templates: {
            colours: jQuery('<div id="publisher-layout-colours" class="tool-options">' + '<label for="publisher-colours"></label>' + '<div id="publisher-layout-coloursSelector">' + '<input type="text" name="publisher-colour" disabled />' + '<button id="publisher-colours"></button>' + '</div>' + '</div>'),
            coloursPopup: jQuery('<div id="publisher-colour-popup">' + '<div id="publisher-colour-inputs"></div>' + '<div id="publisher-colour-preview"></div>' + '</div>'),
            customClrs: jQuery('<div id="publisher-custom-colours">' + '<div class="publisher-color-picker-group-wrapper">' + '<div id="publisher-custom-colours-bg"></div>' + '<div id="publisher-custom-colours-title"></div>' + '<div id="publisher-custom-colours-header"></div>' + '</div>' + '<div id="publisher-custom-colours-iconcls"></div>' + '</div>'),
            rgbInput: jQuery('<div class="rgbInput">' + '<label for="red">R</label><input type="text" name="red" maxlength="3" />' + '<label for="green">G</label><input type="text" name="green" maxlength="3" />' + '<label for="blue">B</label><input type="text" name="blue" maxlength="3" />' + '</div>'),
            iconClsInput: jQuery('<div class="iconClsInput">' + '<input type="radio" name="custom-icon-class" value="icon-close" /><label for="icon-close"></label>' + '<input type="radio" name="custom-icon-class" value="icon-close-white" /><label for="icon-close-white"></label>' + '</div>'),
            inputRadio: jQuery('<div><input type="radio" /><label></label></div>'),
            colorPickers: {
                background: jQuery('<div class="color-picker-background"></div>'),
                title: jQuery('<div class="color-picker-title"></div>'),
                header: jQuery('<div class="color-picker-header"></div>')
            }
        },

        values: {
            colourScheme: {
                val: 'dark_grey',
                bgColour: '#424343',
                titleColour: '#FFFFFF',
                headerColour: '#424343',
                iconCls: 'icon-close-white'
            }
        },

        initialValues: {
            colours: [{
                val: 'light_grey',
                bgColour: '#EFF2F2',
                titleColour: '#333438',
                headerColour: '#333438',
                iconCls: 'icon-close'
            }, {
                val: 'dark_grey',
                bgColour: '#424343',
                titleColour: '#FFFFFF',
                headerColour: '#424343',
                iconCls: 'icon-close-white'
            }, {
                val: 'blue',
                bgColour: '#0091FF',
                titleColour: '#FFFFFF',
                headerColour: '#0091FF',
                iconCls: 'icon-close-white'
            }, {
                val: 'red',
                bgColour: '#FF3333',
                titleColour: '#FFFFFF',
                headerColour: '#FF3333',
                iconCls: 'icon-close-white'
            }, {
                val: 'green',
                bgColour: '#26BF4C',
                titleColour: '#FFFFFF',
                headerColour: '#48732E',
                iconCls: 'icon-close-white'
            }, {
                val: 'yellow',
                bgColour: '#FFDE00',
                titleColour: '#333438',
                headerColour: '#333438',
                iconCls: 'icon-close'
            }, {
            // Custom colour scheme, fields are set to the same default colors as dark grey
            // otherwise they would be all black and preview would look too indistinct
                val: 'custom',
                bgColour: '#424343',
                titleColour: '#FFFFFF',
                headerColour: '#424343',
                iconCls: 'icon-close-white'
            }]
        },

        // Save the custom colour values here to prepopulate the popup.
        customColourValues: {
            bg: null,
            title: null,
            header: null,
            iconCsl: null
        },

        maxColourValue: 255,
        minColourValue: 0,
        eventHandlers: {
            'Publisher2.ToolEnabledChangedEvent': function (event) {
                var me = this;
                var tool = event.getTool();
                if (tool.getTool().id === me.getTool().id && tool.isStarted() && me.values.colourScheme) {
                    me._sendColourSchemeChangedEvent(me.values.colourScheme);
                }
            }
        },
        noUI: false,
        init: function (data) {
            var me = this;
            var isConf = !!((data && data.configuration && data.configuration.mapfull));
            if (isConf && data.configuration.mapfull.conf && data.configuration.mapfull.conf.plugins) {
                const tool = this.getTool();
                const plugin = data.configuration.mapfull.conf.plugins.filter(p => p.id === tool.id)[0];
                const pluginConfig = plugin ? plugin.config || {} : {};

                // Gets plugin color scheme
                if (pluginConfig.colourScheme) {
                    me.values.colourScheme = pluginConfig.colourScheme;
                    me._sendColourSchemeChangedEvent(me.values.colourScheme);
                }

                me.noUI = !!pluginConfig.noUI;
                me.setEnabled(true);
            }

            Object.keys(me.eventHandlers).forEach(eventName => {
                me.__sandbox.registerForEventByName(me, eventName);
            });
        },
        getName: function () {
            return 'Oskari.mapframework.publisher.tool.GetInfoTool';
        },
        /**
     * @method onEvent
     * @param {Oskari.mapframework.event.Event} event a Oskari event object
     * Event is handled forwarded to correct #eventHandlers if found or discarded if not.
     */
        onEvent: function (event) {
            var handler = this.eventHandlers[event.getName()];
            if (!handler) {
                return;
            }
            return handler.apply(this, [event]);
        },
        /**
    * Get tool object.
    * @method getTool
    *
    * @returns {Object} tool description
    */
        getTool: function () {
            return {
                id: 'Oskari.mapframework.mapmodule.GetInfoPlugin',
                title: 'GetInfoPlugin',
                config: {
                    ignoredLayerTypes: ['WFS'],
                    infoBox: false
                }
            };
        },
        /**
    * Is the tool toggled on by default.
    * @method isDefaultTool
    * @public
    *
    * @returns {Boolean} is the tool toggled on by default.
    */
        isDefaultTool: function () {
            return true;
        },

        isColourDialogOpen: false,

        /**
    * Set enabled.
    * @method setEnabled
    * @public
    *
    * @param {Boolean} enabled is tool enabled or not
    */
        _setEnabledImpl: function (enabled) {
            var me = this;
            if (enabled === true && me.state.mode !== null && me.__plugin && typeof me.__plugin.setMode === 'function') {
                me.__plugin.setMode(me.state.mode);
            }
        },

        isEnabled: function () {
            return this.state.enabled;
        },
        /**
    * Get extra options.
    * @method getExtraOptions
    * @public
    *
    * @returns {Object} jQuery element
    */
        getExtraOptions: function () {
            var me = this,
                template = me.templates.colours.clone(),
                selectedColour = me.values.colourScheme || {},
                colourName = selectedColour.val ? me.__instance._localization.BasicView.layout.fields.colours[selectedColour.val] : me.__instance._localization.BasicView.layout.fields.colours['dark_grey'],
                colourLabel = me.__instance._localization.BasicView.layout.fields.colours.label,
                colourPlaceholder = me.__instance._localization.BasicView.layout.fields.colours.placeholder,
                buttonLabel = me.__instance._localization.BasicView.layout.fields.colours.buttonLabel;

            // Set the localizations.
            template.find('label').html(colourLabel);

            // Set the button handler
            template.find('button').html(buttonLabel).on('click', function () {
                if (me.isColourDialogOpen === false) {
                    me._openColourDialog(jQuery(this));
                }
            });

            // Prepopulate data
            template.find('input[name=publisher-colour]').attr('placeholder', colourPlaceholder).val(colourName);

            var input = Oskari.clazz.create(
                'Oskari.userinterface.component.CheckboxInput'
            );
            input.setTitle(me.__instance._localization.BasicView.noUI);
            input.setHandler(function (checked) {
                if (checked === 'on') {
                    me.noUI = true;
                    me.getPlugin().publisherHideUI(true);
                } else {
                    me.noUI = false;
                    me.getPlugin().publisherHideUI(false);
                }
            });

            input.setChecked(me.noUI);

            var inputEl = input.getElement();
            if (inputEl.style) {
                inputEl.style.width = 'auto';
            }

            template.append(inputEl);

            return template;
        },

        /**
    * Get values.
    * @method getValues
    * @public
    *
    * @returns {Object} tool value object
    */
        getValues: function () {
            var me = this;

            if (me.state.enabled) {
                return {
                    configuration: {
                        mapfull: {
                            conf: {
                                plugins: [{
                                    id: this.getTool().id,
                                    config: {
                                        colourScheme: me.values.colourScheme || {},
                                        noUI: me.noUI
                                    }
                                }]
                            }
                        }
                    }
                };
            } else {
                return null;
            }
        },

        /**
     * Creates and opens the dialog from which to choose the colour scheme.
     * Also handles the creation of the sample gfi popup.
     *
     * @method _openColourDialog
     */
        _openColourDialog: function () {
            var me = this,
                popup = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
                closeButton = Oskari.clazz.create('Oskari.userinterface.component.Button'),
                title = me.__instance._localization.BasicView.layout.popup.title,
                content = me.templates.coloursPopup.clone(),
                colours = me.initialValues.colours,
                colourInput,
                colourName,
                prevColour = me.values.colourScheme,
                selectedColour;
            closeButton.setTitle(me.__instance._localization.BasicView.layout.popup.close);
            closeButton.setHandler(function () {
                popup.close(true);
                me._colourSchemePopup = null;
                me.isColourDialogOpen = false;
            });

            // Create the preview GFI dialog.
            content.find('div#publisher-colour-preview').append(me._createGfiPreview());

            // Append the colour scheme inputs to the dialog.
            colours.forEach(color => {
                colourInput = me.templates.inputRadio.clone();
                colourName = me.__instance._localization.BasicView.layout.fields.colours[color.val];

                colourInput.find('input[type=radio]').attr({
                    id: color.val,
                    name: 'colour',
                    value: color.val
                });
                colourInput.find('label').html(colourName).attr({
                    for: color.val
                });

                content.find('div#publisher-colour-inputs').append(colourInput);

                // Create the inputs for custom colour
                if (color.val === 'custom') {
                    content.find('div#publisher-colour-inputs').append(me._createCustomColoursInputs());
                    // Color picker value or icon changed
                    content.find('div#publisher-custom-colours').on('change', function () {
                        jQuery('#publisher-colour-inputs input[id=custom]').prop('checked', true);
                        jQuery('div.basic_publisher').find('input[name=publisher-colour]').val(me.__instance._localization.BasicView.layout.fields.colours['custom']).attr('data-colour-code', 'custom');
                        me._updatePreviewFromCustomValues(content);
                    });
                }
            });

            // Things to do when the user changes the colour scheme:
            content.find('input[name=colour]').on('change', function () {
                selectedColour = me._getItemByCode(jQuery(this).val(), me.initialValues.colours);
                // change the preview gfi
                me._changeGfiColours(selectedColour, content);
                // change the value of the colour scheme input in the layout panel
                colourName = me.__instance._localization.BasicView.layout.fields.colours[selectedColour.val];
                jQuery('div.basic_publisher').find('input[name=publisher-colour]').val(colourName).attr('data-colour-code', selectedColour.val);
                me.values.colourScheme = selectedColour;
                // notify others of the changed colour scheme
                me._sendColourSchemeChangedEvent(selectedColour);
            });

            // Set the selected colour
            if (prevColour) {
                me._changeGfiColours(prevColour, content);
                content.find('input[name=colour][value=' + prevColour.val + ']').attr('checked', 'checked');
            }

            popup.show(title, content, [closeButton]);
            this._colourSchemePopup = popup;
            me.isColourDialogOpen = true;
        },

        /**
     * Creates the sample gfi where the user can see the effects of the chosen colour scheme.
     *
     * @method _createGfiPreview
     * @return {jQuery} returns the sample gfi
     */
        _createGfiPreview: function () {
        // Example data
            var me = this,
                title = me.__instance._localization.BasicView.layout.popup.gfiDialog.title,
                featureName = me.__instance._localization.BasicView.layout.popup.gfiDialog.featureName,
                featureDesc = me.__instance._localization.BasicView.layout.popup.gfiDialog.featureDesc,
                linkUrl = window.location;
            // Templates
            var dialogContent = jQuery('<div></div>'),
                header = jQuery('<div class="popupTitle"></div>'),
                headerWrapper = jQuery('<div class="popupHeader"></div>'),
                headerCloseButton = jQuery('<div class="olPopupCloseBox icon-close-white" style="position: absolute; top: 12px;"></div>'),
                contentDiv = jQuery('<div class="popupContent"></div>'),
                contentWrapper = jQuery('<div class="contentWrapper"></div>'),
                popupDataContent = jQuery('<div class="myplaces_wrapper"><div class="myplaces_place">' +
                '<h3 class="myplaces_header"></h3>' +
                '<p class="myplaces_desc"></p>' +
                '<img class="myplaces_img"></img>' +
                '<a class="myplaces_link" target="_blank"></a>' +
                '</div></div>');

            header.append(title);
            headerWrapper.append(header);
            headerWrapper.append(headerCloseButton);
            headerWrapper.css({
                'width': '320px'
            });

            popupDataContent.find('h3.myplaces_header').html(featureName);
            popupDataContent.find('p.myplaces_desc').html(featureDesc);
            popupDataContent.find('a.myplaces_link').html(linkUrl).attr('href', linkUrl);
            contentDiv.append(popupDataContent);
            contentDiv.css({
                'margin-left': '0px',
                'height': '120px'
            });
            contentWrapper.append(contentDiv);
            contentWrapper.css({
                'width': '320px'
            });

            dialogContent.append(headerWrapper).append(contentWrapper);

            return dialogContent;
        },

        /**
     * Sets the styles of the sample gfi with the selected colour scheme.
     *
     * @method _changeGfiColours
     * @param {Object} selectedColour
     * @param {jQuery} container (optional, defaults to the colour preview element on page)
     */
        _changeGfiColours: function (selectedColour, container) {
            container = container || jQuery('div#publisher-colour-popup');

            var gfiHeader = container.find('div.popupHeader'),
                gfiTitle = container.find('div.popupTitle'),
                featureHeader = container.find('h3.myplaces_header'),
                closeButton = container.find('div.olPopupCloseBox');

            gfiHeader.css({
                'background-color': selectedColour.bgColour
            });

            gfiTitle.css({
                'color': selectedColour.titleColour
            });

            featureHeader.css({
                'color': selectedColour.headerColour
            });

            closeButton.removeClass('icon-close-white');
            closeButton.removeClass('icon-close');
            closeButton.addClass(selectedColour.iconCls);
        },

        /**
     * Creates a popup from which custom colour scheme can be defined.
     *
     * @method _createCustomColoursPopup
     * @return {undefined}
     */
        _createCustomColoursPopup: function () {
            var me = this,
                popup = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
                closeButton = Oskari.clazz.create('Oskari.userinterface.component.Button'),
                title = me.__instance._localization.BasicView.layout.fields.colours.custom,
                content = me._createCustomColoursInputs(),
                customColours;

            closeButton.setTitle(me.__instance._localization.BasicView.layout.popup.close);
            closeButton.setHandler(function () {
                me._collectCustomColourValues(content);
                // Change the preview gfi and send event only if currently checked
                if (jQuery('div#publisher-colour-inputs input#custom').prop('checked')) {
                    customColours = me._getItemByCode('custom', me.initialValues.colours);
                    // Change the colours of the preview popup
                    me._changeGfiColours(customColours);
                    // Send an event notifying the changed colours
                    me._sendColourSchemeChangedEvent(customColours);
                }
                popup.close(true);
                me._customColoursPopup = null;
            });

            popup.show(title, content, [closeButton]);
            me._customColoursPopup = popup;
        },

        /**
     * Creates the inputs for putting in your favourite colours.
     *
     * @method _createCustomColoursInputs
     * @return {jQuery} return the template to select custom colours
     */
        _createCustomColoursInputs: function () {
            var me = this,
                template = me.templates.customClrs.clone(),
                layoutLoc = me.__instance._localization.BasicView.layout,
                bgLoc = layoutLoc.fields.colours.customLabels.bgLabel,
                titleLoc = layoutLoc.fields.colours.customLabels.titleLabel,
                headerLoc = layoutLoc.fields.colours.customLabels.headerLabel,
                iconClsInputs = me.templates.iconClsInput.clone(),
                iconClsLoc = layoutLoc.fields.colours.customLabels.iconLabel,
                iconCloseLoc = layoutLoc.fields.colours.customLabels.iconCloseLabel,
                iconCloseWhiteLoc = layoutLoc.fields.colours.customLabels.iconCloseWhiteLabel,
                rgbValue;
            iconClsInputs.find('label[for=icon-close]').html(iconCloseLoc);
            iconClsInputs.find('label[for=icon-close-white]').html(iconCloseWhiteLoc);

            me._createColorPickers();

            var colorPickerBackground = me.templates.colorPickers.background.clone(),
                colorPickerTitle = me.templates.colorPickers.title.clone(),
                colorPickerHeader = me.templates.colorPickers.header.clone();

            colorPickerBackground.append(me._colorPickers[0].getElement());
            colorPickerTitle.append(me._colorPickers[1].getElement());
            colorPickerHeader.append(me._colorPickers[2].getElement());

            template.find('div#publisher-custom-colours-bg').append(bgLoc).append(colorPickerBackground);
            template.find('div#publisher-custom-colours-title').append(titleLoc).append(colorPickerTitle);
            template.find('div#publisher-custom-colours-header').append(headerLoc).append(colorPickerHeader);
            template.find('div#publisher-custom-colours-iconcls').append(iconClsLoc).append(iconClsInputs);

            this._prepopulateCustomColoursTemplate(template);

            template.find('input[type=text]').on('change', function () {
            // If the value is not a number or is out of range (0-255), set the value to proper value.
                rgbValue = jQuery(this).val();
                if (isNaN(rgbValue) || (rgbValue < me.minColourValue)) {
                    jQuery(this).val(me.minColourValue);
                } else if (rgbValue > me.maxColourValue) {
                    jQuery(this).val(me.maxColourValue);
                }
            });

            return template;
        },

        /**
     * Prepopulates the custom colours template with saved colour values.
     *
     * @method  _prepopulateCustomColoursTemplate
     * @param  {jQuery} template
     * @return {undefined}
     */
        _prepopulateCustomColoursTemplate: function (template) {
            var me = this,
                iconClsInputs = template.find('div#publisher-custom-colours-iconcls'),
                customColours = me.customColourValues;

            me._colorPickers[0].setValue(customColours.bg || me.initialValues.colours[6].bgColour);
            me._colorPickers[1].setValue(customColours.title || me.initialValues.colours[6].titleColour);
            me._colorPickers[2].setValue(customColours.header || me.initialValues.colours[6].headerColour);

            iconClsInputs.find('input[type=radio]').prop('checked', false);
            var iconCls = customColours.iconCls || 'icon-close-white';
            iconClsInputs.find('input[value=' + iconCls + ']').prop('checked', true);
        },

        /**
     * Prepopulates an rgb div with given values
     *
     * @method _prepopulateRgbDiv
     * @param  {jQuery} rgbDiv
     * @param  {Object} colours
     *          {
     *              red: <0-255>,
     *              green: <0-255>,
     *              blue: <0-255>
     *          }
     * @return {undefined}
     */
        _prepopulateRgbDiv: function (rgbDiv, colours) {
            if (!colours) {
                return;
            }

            rgbDiv.find('input[name=red]').val(colours.red);
            rgbDiv.find('input[name=green]').val(colours.green);
            rgbDiv.find('input[name=blue]').val(colours.blue);
        },

        /**
     * Collects the custom colours values from the content div.
     *
     * @method _collectCustomColourValues
     * @param  {jQuery} content
     * @return {undefined}
     */
        _collectCustomColourValues: function (content) {
            var me = this,
                iconCls = content.find('div#publisher-custom-colours-iconcls input[name=custom-icon-class]:checked').val(),
                customColours = this._getItemByCode('custom', me.initialValues.colours);

            this.customColourValues.bg = me._colorPickers[0].getValue();
            this.customColourValues.title = me._colorPickers[1].getValue();
            this.customColourValues.header = me._colorPickers[2].getValue();
            this.customColourValues.iconCls = iconCls;

            customColours.bgColour = me._colorPickers[0].getValue();
            customColours.titleColour = me._colorPickers[1].getValue();
            customColours.headerColour = me._colorPickers[2].getValue();
            customColours.iconCls = iconCls || 'icon-close-white';
        },

        /**
     * Returns an rgb colour object parsed from the div.
     *
     * @method _getColourFromRgbDiv
     * @param {jQuery} rgbDiv
     * @return {Object} returns an rgb colour object
     *          {
     *              red: <0-255>,
     *              green: <0-255>,
     *              blue: <0-255>
     *          }
     */
        _getColourFromRgbDiv: function (rgbDiv) {
            var red = rgbDiv.find('input[name=red]').val(),
                green = rgbDiv.find('input[name=green]').val(),
                blue = rgbDiv.find('input[name=blue]').val();

            red = red.length ? parseInt(red, 10) : 0;
            green = green.length ? parseInt(green, 10) : 0;
            blue = blue.length ? parseInt(blue, 10) : 0;

            return {
                red: red,
                green: green,
                blue: blue
            };
        },

        /**
     * Retrieves the item from the list which value matches the code given
     * or null if not found on the list.
     *
     * @method _getItemByCode
     * @param {String} code
     * @param {Array[Object]} list
     * @return {Object/null}
     */
        _getItemByCode: function (code, list) {
            return list.find(l => l.val === code) || null;
        },

        /**
     * @method createColorPickers
     * Creates an array of color picker components
     * @private
     */
        _createColorPickers: function () {
            var options = { className: 'oskari-colorpickerinput', cancelText: this.__instance._localization.BasicView.buttons.cancel };
            this._colorPickers = [
                Oskari.clazz.create('Oskari.userinterface.component.ColorPickerInput', options),
                Oskari.clazz.create('Oskari.userinterface.component.ColorPickerInput', options),
                Oskari.clazz.create('Oskari.userinterface.component.ColorPickerInput', options)
            ];
        },

        /**
     * @method updatePreviewFromCustomValues
     * Updates preview colors from color pickers and icon choice
     * @param {Object} content
     */

        _updatePreviewFromCustomValues: function (content) {
            var selectedColour = {};
            selectedColour.bgColour = this._colorPickers[0].getValue();
            selectedColour.titleColour = this._colorPickers[1].getValue();
            selectedColour.headerColour = this._colorPickers[2].getValue();
            selectedColour.iconCls = content.find('div#publisher-custom-colours-iconcls input[name=custom-icon-class]:checked').val();
            selectedColour.val = 'custom';
            this.values.colourScheme = selectedColour;
            this._sendColourSchemeChangedEvent(selectedColour);
            this._changeGfiColours(selectedColour, content);
            this._collectCustomColourValues(content);
        },

        /**
     * Returns an rgb colour object in css formatted string.
     *
     * @method _getCssRgb
     * @param  {Object} rgb
     *          {
     *              red: <0-255>,
     *              green: <0-255>,
     *              blue: <0-255>
     *          }
     * @return {String}
     */
        _getCssRgb: function (rgb) {
            return 'rgb(' + rgb.red + ', ' + rgb.green + ', ' + rgb.blue + ')';
        },

        /**
     * Sends an event to notify interested parties that the colour scheme has changed.
     *
     * @method _sendColourSchemeChangedEvent
     * @param {Object} colourScheme the changed colour scheme
     */
        _sendColourSchemeChangedEvent: function (colourScheme) {
            this._sendEvent('Publisher.ColourSchemeChangedEvent', colourScheme);
            this._sendEvent('Publisher2.ColourSchemeChangedEvent', colourScheme);
        },

        /**
     * "Sends" an event, that is, notifies other components of something.
     *
     * @method _sendEvent
     * @param {String} eventName the name of the event
     * @param {Whatever} eventData the data we want to send with the event
     */
        _sendEvent: function (eventName, eventData) {
            var eventBuilder = Oskari.eventBuilder(eventName),
                evt;

            if (eventBuilder) {
                evt = eventBuilder(eventData);
                this.__sandbox.notifyAll(evt);
            }
        },
        /**
    * Stop tool.
    * @method stop
    * @public
    */
        stop: function () {
            var me = this;
            if (me.__plugin) {
                if (me.__sandbox && me.__plugin.getSandbox()) {
                    me.__plugin.stopPlugin(me.__sandbox);
                }
                me.__mapmodule.unregisterPlugin(me.__plugin);
            }

            Object.keys(me.eventHandlers).forEach(eventName => {
                me.__sandbox.unregisterFromEventByName(me, eventName);
            });
        }
    }, {
        'extend': ['Oskari.mapframework.publisher.tool.AbstractPluginTool'],
        'protocol': ['Oskari.mapframework.publisher.Tool']
    });
