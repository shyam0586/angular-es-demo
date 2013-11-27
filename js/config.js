var hostname = 'http://af5573352169f922000.qbox.io';

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
