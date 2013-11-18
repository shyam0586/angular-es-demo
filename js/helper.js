var monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function changeTime(input){
   for(var i = 0; i < input.facets.year.entries.length; i++){
		input.facets.year.entries[i].time = convertToNormalTime(input.facets.year.entries[i].time);
	}
	return input;
}

function formatPriceRange(input){
   for(var i = 0; i < input.facets.salePrice.ranges.length; i++){
		var from = input.facets.salePrice.ranges[i].from;
		var to = input.facets.salePrice.ranges[i].to;
		if( to == undefined ){
                	input.facets.salePrice.ranges[i].rangeString = "$" + from + "+";
		}
		else{
                	input.facets.salePrice.ranges[i].rangeString = "$" + from + "- $" + to;
		}
        }
        return input;
}


function convertToNormalTime(input){
	var date = new Date(input);
	var year = date.getFullYear();
	var nextYear = date.getFullYear() + 1
	var formattedTime = year + " to " + nextYear;
	return formattedTime;
}

function changeTime(input){
   for(var i = 0; i < input.facets.year.entries.length; i++){
                input.facets.year.entries[i].time = convertToNormalTime(input.facets.year.entries[i].time);
        }
        return input;
}


function pad2(number) {
	return (number < 10 ? '0' : '') + number;
}

function addIndexAndName(input){
	for(var i = 0; i < input.hits.hits.length; i++){
		input.hits.hits[i]._source.indexNumber = i;
		input.hits.hits[i]._source.shortName = input.hits.hits[i]._source.name.
										replace(/ *\([^)]*\) */g, "").
										replace(/ *\[[^\]]*\] */g, "");
	}
	return input;
}
