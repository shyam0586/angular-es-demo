angular.module('dvdSearch', [
    'controllers',
    'elasticjs.service',
    'ui.bootstrap',
    'ngSanitize'
]);

// Bootstrap 3 is not fully compatible with angular js. Hack to add pagination compatibility http://stackoverflow.com/questions/17994490/angular-ui-bootstrap-pagination-not-rendered-missing-styles
angular.module("template/pagination/pagination.html", []).run(["$templateCache",
    function ($templateCache) {
        $templateCache.put("template/pagination/pagination.html",
            "<ul class=\"pagination\">\n" +
            "  <li ng-repeat=\"page in pages\" ng-class=\"{active: page.active, disabled: page.disabled}\"><a ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
            "</ul>\n" +
            "");
    }
]);