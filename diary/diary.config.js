(function() {
    'use strict';

    angular
        .module('myapp.diary')
        .config(configure);

    configure.$inject = [
        'c8yComponentsProvider',
        'gettext'
    ];

    function configure(
        c8yComponentsProvider,
        gettext
    ) {
        c8yComponentsProvider.add({ // adds a menu item to the widget menu list with ...
            name: '日志功能', // ... the name *"Icon Map"*
            nameDisplay: gettext('diary'), // ... the displayed name *"Icon Map"*
            description: gettext('diary'), // ... a description
            templateUrl: ':::PLUGIN_PATH:::/views/diary.html', // ... displaying *"charts.main.html"* when added to the dashboard
            // configTemplateUrl: ':::PLUGIN_PATH:::/views/config.html',
            //如果有config配置页在加上config的路径，这个页是add一个部件的时候弹窗下面部分出来的配置页
            options: {
                noDeviceTarget: true
            }
        });
    }
}());
