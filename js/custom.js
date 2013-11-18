var from = 0;
var startDate = "";
var endDate = "";
var startPrice = "";
var endPrice = "";

function createSlider(low, high) {
    $("#slider-range").slider({
        range: true,
        min: low,
        max: high,
        values: [low, high],
        slide: function (event, ui) {
            $("#amount").val("Price - $" + ui.values[0] + " - $" + ui.values[1]);
            startPrice = ui.values[0];
            endPrice = ui.values[1];
        }
    });
    $("#amount").val("Price - $" + $("#slider-range").slider("values", 0) +
        " - $" + $("#slider-range").slider("values", 1));
    $("#priceFilter").click(function () {
        document.getElementById('searchBtn').click();
    });

}

function createDateRangePicker(start, end) {
    $('#reservation span').html(moment(start).format('MM-D-YYYY') + ' - ' + moment(end).format('MM-D-YYYY'));

    $('#reservation').daterangepicker({
            ranges: {
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')],
                'Last Year': [moment().subtract('year', 1).startOf('year'), moment().subtract('year', 1).endOf('year')]
            },
            startDate: moment(start),
            endDate: moment(end)
        },
        function (start, end) {
            $('#reservation span').html(moment(start).format('MM-D-YYYY') + ' - ' + moment(end).format('MM-D-YYYY'));
            startDate = start.format('YYYY-MM-DD');
            endDate = end.format('YYYY-MM-DD');
            document.getElementById('searchBtn').click();
        }
    );

}

function changePage(pressed, a) {
    from = ((pressed - 1) * size);
    a.search();
    a.$apply();

}

function handleReset() {
    $(".loading").css({
        "display": "none"
    });
    $(".pagination-small").css({
        "display": "none"
    });

}


function passVal(i) {
    $("#myModal").modal();
    var movieName = screenData.hits.hits[i]._source.name;
    var movieMgaa = screenData.hits.hits[i]._source.mpaaRating;
    var movieFormat = screenData.hits.hits[i]._source.format;
    var movieRating = screenData.hits.hits[i]._source.salePrice;
    var movieYear = screenData.hits.hits[i]._source.releaseDate;
    var movieImage = screenData.hits.hits[i]._source.image;
    var moviePlot = screenData.hits.hits[i]._source.plot;
    var studio = screenData.hits.hits[i]._source.studio;
    var buyURL = screenData.hits.hits[i]._source.addToCartUrl;
    var movieGenre = screenData.hits.hits[i]._source.genre;
    if (moviePlot == null) {
        moviePlot = "No Synopse avaiable";
    }
    $(".movieName").html("<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h1>" + movieName + "</h1>");
    $(".movieContent").html("<div class='topModal'><p class='imageHolder'><img src = '" + movieImage + "'></p><p class='details'>Rating : " + movieRating + "<br>Release Date : " + movieYear + "<br>Studio : " + studio + "<br>Genre : " + movieGenre + "<br>Format : " + movieFormat + "<br>MPAA : " + movieMgaa + "</p></div><br><div class='bottomModal'><pre>" + moviePlot + "</pre></div><br>");
    $(".movieFooter").html("<p class='link'><a role='button' href='" + buyURL + "' target ='_blank'  class='btn btn-success'>Buy</a></p>");
}

$('#searchText').bind("enterKey", function (e) {
    document.getElementById('searchBtn').click();
});
$('#searchText').keyup(function (e) {
    if (e.keyCode == 13) {
        $(this).trigger("enterKey");
    }
});



function addRangeMPAA(input) {
    for (var i = 0; i < input.facets.MPAA.entries.length; i++) {
        input.facets.MPAA.entries[i].key = input.facets.MPAA.entries[i].key + " to " + parseInt(input.facets.MPAA.entries[i].key + 50);
    }
    return input;
}

function addPlot(input) {
    for (var k = 0; k < input.hits.hits.length; k++) {
        if (input.hits.hits[k]._source.plot != undefined) {
            input.hits.hits[k]._source.editedPlot = input.hits.hits[k]._source.plot.substr(0, 100);
        }
    }
    return input;
}

function removeUnknownField(input) {
    for (var i = 0; i < input.facets.studio.terms.length; i++) {
        if (input.facets.studio.terms[i].term == "UNKNOWN") {
            input.facets.studio.terms.splice(i, 1);
        }
    }
    return input;
}