#!/bin/bash

if [ -z $1 ] ; then
	echo "Please enter hostname"
	exit
fi

hostname=$1

curl -X DELETE "http://$hostname:9200/products"
echo
curl -X PUT "http://$hostname:9200/products" -d '{ 	
	    "index" : { 
		"number_of_shards" : 1, 
		"number_of_replicas" : 0 ,
	    	"analysis":{      
      			"filter"  : {
        			"nGram_filter" : {
          				"type" : "nGram",
          				"min_gram" : 1,
          				"max_gram" : 20,
          				"token_chars" : [ "letter", "digit", "punctuation", "symbol" ]
        				}
      				},
      			"analyzer" : {
        			"nGram_analyzer" : {
          				"type" : "custom",
          				"tokenizer" : "whitespace",
          				"filter"  : ["lowercase", "asciifolding", "nGram_filter"]
        				},
        			"whitespace_analyzer" : {
          				"type" : "custom",
          				"tokenizer" : "whitespace",
          				"filter" : ["lowercase", "asciifolding"]
        				}
      				}
    			}
		}
	
}'

echo

curl -X PUT "http://$hostname:9200/products/movies/_mapping" -d '{
"movies" : {
    "_all" : { "enabled" : true, "search_analyzer" : "whitespace_analyzer", "index_analyzer" : "nGram_analyzer" },
    "properties" : {
	"suggest" : {
		"preserve_separators" : true ,
		"max_input_len" : 50,
		"payloads" : true,
		"analyzer" : "whitespace_analyzer",
		"preserve_position_increments" : true,
		"type" : "completion"
	},
      "sku" : { "type" : "string", "index" : "not_analyzed" },
      "name" : { "type" : "string", "index" : "not_analyzed" },
      "studio" : { "type" : "string", "index" : "not_analyzed" },
      "format" : { "type" : "string", "index" : "not_analyzed" },
      "quantityLimit" : { "type" : "integer" ,  "include_in_all" : false },
      "genre" : { "type" : "string", "index" : "not_analyzed" },
      "releaseDate" : { "type" : "date" , "format" : "yyyy-MM-dd"},
      "price" : { "type" : "double", "include_in_all" : false },
      "mpaaRating" : { "type" : "string", "index" : "not_analyzed", "include_in_all" : false },
      "plot" :  { "type" : "string", "index" : "no", "include_in_all" : false },
      "addToCartUrl" : { "type" : "string", "index" : "no", "include_in_all" : false },
      "image" : { "type" : "string", "index" : "no", "include_in_all" : false }
	}
}}'
echo
