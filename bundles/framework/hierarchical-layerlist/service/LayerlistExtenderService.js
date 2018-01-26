/**
 * @class Oskari.framework.bundle.hierarchical-layerlist.OskariEventNotifierServic
 */
(function(Oskari) {
    var _log = Oskari.log('HierarchicalLayerlist.LayerlistExtenderService');

    Oskari.clazz.define('Oskari.framework.bundle.hierarchical-layerlist.LayerlistExtenderService',

        /**
         * @method create called automatically on construction
         * @static
         */
        function() {
            var me = this;
            this.sb = Oskari.getSandbox();
            this._options = {
                /* Default options */
                core: {
                    check_callback: true,
                    themes: {
                        variant: 'large'
                    }
                },
                checkbox: {
                    keep_selected_style: false
                },
                types: {
                    group: {
                        icon: 'jstree-group-icon',
                        valid_children: ['layer']
                    },
                    layer: {
                        icon: 'jstree-layer-icon',
                        valid_children: []
                    }
                },
                search: {
                    show_only_matches: true
                },
                state: {
                    key: 'hierarchical-layerlist'
                },
                conditionalselect: function(node, event) {
                    me.trigger('jstree-contionalselect', {
                        node: node,
                        event: event
                    });
                },
                plugins: ['checkbox', 'changed', 'wholerow', 'types', 'search', 'state', 'conditionalselect']
            };
            this._events = [
                /* Default handlers */
                {
                    name: 'changed.jstree',
                    handler: function(e, data) {
                        var selected = data.changed.selected;
                        var deselected = data.changed.deselected;

                        selected.forEach(function(sel) {
                            var selArr = sel.split('-');
                            var type = selArr[0];
                            var layerId = selArr[1];
                            if (type === 'layer' && !me.sb.isLayerAlreadySelected(layerId)) {
                                me.sb.postRequestByName('AddMapLayerRequest', [layerId]);
                            }
                        });

                        deselected.forEach(function(desel) {
                            var deselArr = desel.split('-');
                            var type = deselArr[0];
                            var layerId = deselArr[1];
                            if (type === 'layer' && me.sb.isLayerAlreadySelected(layerId)) {
                                me.sb.postRequestByName('RemoveMapLayerRequest', [layerId]);
                            }
                        });

                    }
                }
            ];
            this._mainTools = {};
            this._groupTools = {};
            this._layerTools = {};
            this._hasAdmin = false;

            // attach on, off, trigger functions
            Oskari.makeObservable(this);


        }, {
            __name: "HierarchicalLayerlist.LayerlistExtenderService",
            __qname: "Oskari.framework.bundle.hierarchical-layerlist.LayerlistExtenderService",

            getQName: function() {
                return this.__qname;
            },
            getName: function() {
                return this.__name;
            },
            getSandbox: function() {
                return this.sandbox;
            },
            /**
             * Get layerlist options
             * @method getLayerlistOption
             * @param  {String}                 key layerlist option id, if not defined then return all.
             * @return {Object|String|Boolean}  option value
             */
            getLayerlistOption: function(key) {
                if (!key) {
                    return this._options;
                }
                return this._options[key];
            },
            /**
             * Add layerlist option
             * @method addLayerlistOption, for example allow draggin etc.
             * @param  {String}                 key     option key
             * @param  {Object|String|Boolean}  value   option value
             * @param {Boolean}                 notTriggerEvent not trigger event when tru, defaults false
             */
            addLayerlistOption: function(key, value, notTriggerEvent) {
                this._options[key] = value;
                if (!notTriggerEvent) {
                    this.trigger('option.added', {
                        key: key,
                        value: value
                    });
                }
            },

            /**
             * Get main tool.
             * @method getMainTool
             * @param  {String}    id if defined return tool id corresponding tool, if not defeined return all maintools.
             * @return {Object}    wanted main tool or all main tools
             */
            getMainTool: function(id) {
                if (!id) {
                    return this._mainTools;
                }
                return this._mainTools[id];
            },
            /**
             * Add layerlist maintool (top row tools)
             * @method addMainTool
             * @param  {String}    id      tool unique id
             * @param  {Function}  handler tool handler
             * @param  {Object}    options tool options:
             *                             {
             *                                 cls: 'active-cls',
             *                                 tooltip: 'Tool tooltip'
             *                             }
             *
             */
            addMainTool: function(id, handler, options) {
                if (this._mainTools[id]) {
                    _log.warn('Main tool "' + id + '" allready defined.');
                    return;
                }
                if (typeof handler !== 'function') {
                    _log.warn('Main tool "' + id + '" has no any handler, not added.');
                    return;
                }

                this._mainTools[id] = {
                    handler: function(tool) {
                        handler(tool, id);
                    },
                    options: options
                };
                this.trigger('maintool.added', {
                    id: id,
                    handler: handler,
                    options: options
                });
            },
            /**
             * Get event handlers
             * @method getEventHandler
             * @param  {String}        eventName event name
             * @return {Array}         if eventName not defeined then return all events, other return all wanted event name handlers
             */
            getEventHandler: function(eventName) {
                var me = this;
                if (!eventName) {
                    return me._events;
                }
                return jQuery.grep(me._events, function(name) {
                    return name === eventName;
                });
            },
            /**
             * Add event handler
             * @method addEventHandler
             * @param  {String}        eventName event name
             * @param  {function}      handler   event handler
             */
            addEventHandler: function(eventName, handler) {
                var obj = {
                    name: name,
                    handler: handler
                };
                this._events.push(obj);
                this.trigger('event.added', obj);
            },
            /**
             * Get group tool(s)
             * @method getGroupTool
             * @param  {String}     id group tool id
             * @return {Object}     wanted group tool (also check visibleChecker)
             */
            getGroupTool: function(id) {
                if (!id) {
                    return this._groupTools;
                }
                if (this._groupTools[id] && this._groupTools[id].hasVisible()) {
                    return this._groupTools[id];
                }
                return null;
            },
            /**
             * Add group tool
             * @method addGroupTool
             * @param  {String}     id         group tool id
             * @param  {Function}   handler    tool handler
             * @param  {Function}   hasVisible has visible function
             * @param  {Object}     options    group tool options:
             *                                 {
             *                                     cls: 'active-cls'
             *                                 }
             */
            addGroupTool: function(id, handler, hasVisible, options) {
                if (this._groupTools[id]) {
                    _log.warn('Group tool "' + id + '" allready defined.');
                    return;
                }
                if (typeof handler !== 'function') {
                    _log.warn('Group tool "' + id + '" has no any handler, not added.');
                    return;
                }

                var visible = hasVisible;
                if (typeof visible !== 'function') {
                    visible = function() {
                        return true;
                    };
                }

                this._groupTools[id] = {
                    handler: handler(id),
                    options: options,
                    hasVisible: visible
                };
                this.trigger('grouptool.added', {
                    id: id,
                    handler: handler(id),
                    options: options,
                    hasVisible: visible
                });
            },
            /**
             * Get layer tool.
             * @method getLayerTool
             * @param  {String}    id if defined return tool id corresponding tool, if not defeined return all layer tools.
             * @return {Object}    wanted layer tool or all layer tools
             */
            getLayerTool: function(id) {
                if (!id) {
                    return this._layerTools;
                }
                return this._layerTools[id];
            },
            /**
             * Add layer tool
             * @method addLayerTool
             * @param  {String}     id      layer tool id
             * @param  {Function}   handler layer tool handler
             * @param  {Object}     options layer tool options:
             *                                 {
             *                                     cls: 'active-cls'
             *                                 }
             */
            addLayerTool: function(id, handler, options) {
                if (this._layerTools[id]) {
                    _log.warn('Layer tool "' + id + '" allready defined.');
                    return;
                }
                if (typeof handler !== 'function') {
                    _log.warn('Layer tool "' + id + '" has no any handler, not added.');
                    return;
                }

                this._layerTools[id] = {
                    handler: handler(id),
                    options: options
                };
                this.trigger('layertool.added', {
                    id: id,
                    handler: handler(id),
                    options: options
                });
            },
            /**
             * Sets admin role
             * @method setAdmin
             * @param  {Boolean} isAdmin is admin
             */
            setAdmin: function(isAdmin) {
                this._hasAdmin = isAdmin;
                this.trigger('admin.changed', this._hasAdmin);
            },
            /**
             * Has admin
             * @method hasAdmin
             * @return {Boolean} is admin-hierarchical-layerlist configured
             */
            hasAdmin: function() {
                return this._hasAdmin;
            }

        }, {
            'protocol': ['Oskari.mapframework.service.Service']
        });
}(Oskari));