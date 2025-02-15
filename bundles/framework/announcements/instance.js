/**
 * @class Oskari.framework.bundle.announcements.AnnouncementsBundleInstance
 *
 * Main component and starting point for the announcements functionality.
 *
 * See Oskari.framework.bundle.announcements.AnnouncementsBundleInstance for bundle definition.
 */
Oskari.clazz.define('Oskari.framework.bundle.announcements.AnnouncementsBundleInstance',

    /**
     * @method create called automatically on construction
     * @static
     */
    function () {
        var conf = this.getConfiguration();
        this.sandbox = this.getSandbox();
        conf.name = 'announcements';
        conf.flyoutClazz = 'Oskari.framework.bundle.announcements.Flyout';
    }, {

        afterStart: function () {
            var me = this;
            if (me.started) {
                return;
            }

            me.announcementsService = Oskari.clazz.create('Oskari.framework.announcements.service.AnnouncementsService', me.sandbox);
            me.sandbox.registerService(me.announcementsService);

            me.plugins['Oskari.userinterface.Flyout'].createAnnouncementsHandler(me.announcementsService);

            if (me.conf && me.conf.plugin) {
                const mapModule = me.sandbox.findRegisteredModuleInstance('MainMapModule');
                const plugin = Oskari.clazz.create('Oskari.framework.announcements.plugin.AnnouncementsPlugin', me.conf.plugin.config);
                mapModule.registerPlugin(plugin);
                mapModule.startPlugin(plugin);
            }

            // RPC function to get announcements
            Oskari.on('app.start', function (details) {
                const rpcService = Oskari.getSandbox().getService('Oskari.mapframework.bundle.rpc.service.RpcService');
                if (!rpcService) {
                    return;
                }
                rpcService.addFunction('getAnnouncements', function () {
                    return new Promise((resolve) => {
                        me.announcementsService.fetchAnnouncements(announcements => resolve(announcements));
                    });
                });
            });
        },

        /**
         * @method update
         * implements BundleInstance protocol update method - does nothing atm
         */
        stop: function () {
        }
    }, {
        'extend': ['Oskari.userinterface.extension.DefaultExtension']
    }
);
