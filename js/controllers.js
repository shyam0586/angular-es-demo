// We should be storng all global variables here.
var filtersArray = {}; // Stores the termFilter list like Rating and isDvd/BluRay
var screenData = ""; // Current response data from ES , stores globally
var size = 12; // Size per page of ES
var totalResult = 0; // Total number of results for the current query
var currentPage = 1; // For pagination
var isFirst = true; // For a text query , we dont update the filters , until another text query is fired. 
//This flag is to mark if its a text search or a filter search
var sortField = "quantityLimit"; // Default sort filed. I hacked this field cause , I needed some quality results with images in the first hit.
var oldSearchTerm = ""; // Thi variable would be used to track if a search query have changed or not.
var currentPage = 1;

angular.module('controllers', []);

angular.module('controllers').directive('myRepeatDirective', function () {
    return function (scope, element, attrs) {
        if (scope.$last) {
            $(".loading").css({
                "display": "none"
            });
            $(".pagination-small").css({
                "display": "block"
            });
            
        }
    };
})

angular.module('controllers').controller('SearchCtrl', function ($scope, ejsResource, $http, limitToFilter) {

    // Auto complete
    // We use Elasticsearch search suggestor - http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-suggesters-completion.html
    $scope.movies = function (movieName) {
        $(".searchbox").removeClass('autosearchOff').addClass('autosearchOn');

        return $http({
            method: 'POST',
            url: hostname + '/' + index + '/_suggest',
            data: getSuggestJSON(movieName)
        }).
        then(function (response) {
            var data = response.data;
            var suggestArray = data['movie-suggest'][0]['options'];
            var array = [];
            for (var suggest in suggestArray) {
                //console.log(suggestArray[suggest].text);
                array.push(suggestArray[suggest]['text']);
            }
            $(".searchbox").removeClass('autosearchOn').addClass('autosearchOff');
            return limitToFilter(suggestArray, 15);
        });

    };

    // Create a elasticsearch instance
    var ejs = ejsResource(hostname);


    var filters = {};

    $scope.search = function () {
        $(".loading").css({
            "display": "block"
        });
        $(".pagination-small").css({
            "display": "none"
        });
        var client = ejs.Request()
            .indices(index)
            .types(type);

        // Check for dropdown value. This is to add filter for Format
        /*	if($scope.ddSelectSelected.text != "All Options"){
		filtersArray['format'] = [ $scope.ddSelectSelected.text];
	}
	else{
		delete filtersArray['format'];
	}*/
        //Construct ES request
        var queryString = '*';
        if ($scope.queryTerm != undefined || $scope.queryTerm == "") {
            queryString = $scope.queryTerm;
        }
        var oQuery = "";
        if (queryString == '*') {
            oQuery = ejs.MatchAllQuery();
        } else {
            oQuery = ejs.MatchQuery('_all', queryString);
        }
        if ($scope.queryTerm != oldSearchTerm) {
            isFirst = true;
            currentPage = 1
            oldSearchTerm = $scope.queryTerm;
            filtersArray = [];
            from = 0;
            startDate = "";
            endDate = "";
            startPrice = "";
            endPrice = "";
        }
        // For sorting customScoreQuery is a lot better than the sort feature. As sort is expensive and evil.
        if (sortField != "")
            oQuery = oQuery = ejs.CustomScoreQuery(oQuery, "doc['" + sortField + "'].value");
        // We create all facets

        var rating = ejs.TermsFacet("rating").field("mpaaRating");
        var studio = ejs.TermsFacet("studio").field("studio");
        var format = ejs.TermsFacet("format").field("format");
        var price = ejs.RangeFacet("salePrice").field("salePrice").addRange(0, 15).addRange(15, 30).addRange(30, 60).addUnboundedFrom(60);
        var year = ejs.StatisticalFacet("year").field("releaseDate");
        var request = client.query(oQuery)
            .facet(price)
            .facet(studio)
            .facet(rating)
            .facet(format)
            .facet(year)
            .from(from)
            .size(size);
        var boolFilters = ejs.BoolFilter();
        var isFilterPresent = false;
        var filter = ejs.BoolFilter(); // We create a boolean filter to house all filters
        if (startDate != "" && endDate != "") {
            var range = ejs.RangeFilter('releaseDate').from(startDate).to(endDate); // Create a normal range filter for releaseDate
            filter.must(range);
            isFilterPresent = true;
        }
        for (var f in filtersArray) {
            var rangeBool = ejs.BoolFilter();
            if (f == "salePrice") {
                for (var r in filtersArray[f]) {
                    var dateStr = filtersArray[f][r];
                    if (dateStr.indexOf('-') != -1) {
                        var rFrom = dateStr.replace("/[ \t]*/", "").split("-")[0].replace("$", "");
                        var rTo = dateStr.replace("/[ \t]*/", "").split("-")[1].replace("$", "");
                        range = ejs.NumericRangeFilter('salePrice').from(parseInt(rFrom)).to(parseInt(rTo)); // Create a number range filter for salesPrice
                    } else {
                        var rFrom = dateStr.replace("/[ \t]*/", "").split("-")[0].replace("$", "").replace("+", "");
                        range = ejs.NumericRangeFilter('salePrice').from(parseInt(rFrom)); // Create a number range filter for salesPrice
                    }
                    rangeBool.should(range);
                }
                filter.must(rangeBool);
                isFilterPresent = true;
            } else {
                var termFilter = ejs.TermsFilter(f, filtersArray[f]); // For the rest simply create a terms query
                filter.must(termFilter);
                isFilterPresent = true;
            }
        }
        if (isFilterPresent) {
            request.filter(filter); // Add our filter , if there exist any filter
        }

        var r = request.doSearch().
        then(function (response) {
            var message = "";
            var isBad = false;
            if (sortField = "quantityLimit") {
                sortField = "";
            }
            // Caputre error and handle it
            if (response == undefined || !response.hasOwnProperty('hits') || !response['hits'].hasOwnProperty('total')) {
                message = "Error in the results";
                isBad = true;
            }
            // Capture empty results
            if (response.hits.hits.length == 0) {
                message = "There are no results";
                isBad = true;
            }
            // Mark the message as bad if any of the above happens
            if (isBad) {
                response = {
                    message: message,
                    bad: true
                };
                $(".loading").css({
                    "display": "none"
                });
                return response;
            } else {
                message = response.hits.total + " Movies found";
                response['message'] = message;
            }
            // Add an index varaible to each hit. 
            response = addIndexAndName(response);
            response = formatPriceRange(response);
            response = removeUnknownField(response);
            response = addPlot(response);
            screenData = response;
            totalResult = response.hits.total;
            // To display "N Movies found"
            $scope.total = totalResult;
            // Variables of Pagination
            $scope.totalItems = totalResult; // total results
            $scope.size = size; // Size per page
            $scope.currentPage = currentPage; // Current page
            $scope.maxSizeFn = function(){ 
						if($(window).width() < 760){
							return 3
						}else{
							return 10; // Max Size
						}
					}
            $scope.maxSize = 10; // Number of page change options 

            if (totalResult == 0) {
                handleReset();
            }
            // Handle page change request
            $scope.setPage = function (pageNo) {
                currentPage = pageNo;
                $scope.currentPage = pageNo;
                from = from + (pageNo - 1) * size;
                $scope.search();
            };
            // If the query is a text term query and not a filter change initiated query , update the filters
            if (isFirst) {
                isFirst = false;
                currentPage = 1;
                createSlider(response.facets.salePrice.min, response.facets.salePrice.max);
                createDateRangePicker(response.facets.year.min, response.facets.year.max);
            }
            return response;
        });
        $scope.message = r;
        $scope.results = r;
        // Update the fiter section , if its only a fresh search query which is not initiated using a filter change
        if (isFirst) {
            $scope.checkResults = r;
        }
        //Resetting from
        from = 0;


    };
    // Capture a filter selection and apply it to filterArray
    // Fiter array is of format { Rating : [ PG , R , TV-1 ] , Format : [ DVD ] }
    $scope.filter = function (field, term) {
        filtersArray[field] = (typeof filtersArray[field] != 'undefined' && filtersArray[field] instanceof Array) ? filtersArray[field] : [];
        if (filtersArray.hasOwnProperty(field)) {

            if (filtersArray[field].indexOf(term) >= 0) {
                filtersArray[field].splice(filtersArray[field].indexOf(term), 1);

            } else {
                filtersArray[field].push(term);
            }
            if (filtersArray[field].length == 0) {
                delete filtersArray[field];
            }
        } else {
            filtersArray[field].push(term);
        }
        $scope.search();
    }

    // Sort varialbe change
    $scope.update = function (field) {
        sortField = sortBy[field];
        $scope.search();
    }

});


// On startup , trigger a search
angular.element(document).ready(function () {
	 document.getElementById('searchBtn').click();
});