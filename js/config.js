var hostname = 'http://ec2-54-200-186-105.us-west-2.compute.amazonaws.com:9200';

var sortBy = {
    "Time": "releaseDate",
    "Relevance": "",
    "Alphabetical": "name",
};

var index = "products";
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
