var hostname = 'http://be6c2e3260c3e2af000.qbox.io';

var sortBy = {
    "Time": "releaseDate",
    "Relevance": "",
    "Alphabetical": "name",
};

var index = "blurays";
var type = 'movies';

function getSuggestJSON(name) {
    var suggestJSON = '{                                   \
                                  "movie-suggest": {             \
                                    "text" : "' + name + '",               \
                                    "completion": {           \
                                      "field": "suggest"       \
                                    }                         \
                                  }                           \
                                }';
    return suggestJSON;
}
