$(document).ready(function() {
    addArtists()
});

var currentRoundAlbums = [];
var currentRoundAlbumArt;
var artistsMap = new Map();
var currentRoundArtist;
var totalScore = 0;
var currentRound = 1;
var roundTry = 1;
var spinBollean = true; // in use for spin workaround



function addArtists() {
    for (var i = 0; i < topArtists.length; i++) {
        $("#artistList").append('<option value="' + topArtists[i] + '">');
    }
}


function newGame() {
    clearGame();
    $('#round').show();
    $('#roundTry').show();
    $('#artistGuess').prop('disabled', false);
    spin();
    itunesSearch();
    $("#newGame").css("animation", "notGlowing 1500ms 1");
}

function clearGame() {
    clearRound();
    totalScore = 0;
    $("#score").html("Total Score: 0");
    currentRound = 1;
    totalScore = 0;
    artistsMap = new Map();
    $("#scroller").animate({
        marginTop: "56%"
    }, 2000);
    $("#round").attr('src', 'pics/round1.png');
    $('#round').hide();
    $('#roundTry').hide();
    $('#artistGuess').prop('disabled', true);
}

function clearRound() {
    $("#album1").empty();
    $("#album2").empty();
    $("#album3").empty();
    $("#artistGuess").empty();
    roundTry = 1;
    currentRoundAlbums = [];
    $('#hint').css("background-image", "none");
    $('#hint').hide();
    $('#hintHeadline').hide();
    $("#roundTry").html("3 Tries left");
    $('#artistGuess').val("");
}



function itunesSearch() {
    while (true) {
        var newArtist = topArtists[parseInt(Math.random() * 100)];
        if (!artistsMap.has(newArtist))
            break;
    }
    artistsMap.set(newArtist, null);
    currentRoundArtist = newArtist;

    var search_params = {
        term: currentRoundArtist,
        entity: 'album',
        limit: 30,
    };
    $.ajax({
        url: 'https://itunes.apple.com/search',
        data: search_params,
        success: handleTunesSearchResults,
        dataType: 'jsonp',


    });

}

function handleTunesSearchResults(arg) {
    var results = arg.results;
    var albumCount = 0;
    var artistNameMap = new Map();
    var artistNameSplit = currentRoundArtist.split(' ');
    for (var i = 0; i < artistNameSplit.length; i++) {
        if (artistNameSplit[i].toLowerCase != "the")
            artistNameMap.set((artistNameSplit[i].toLowerCase()), null);
    }
    for (var i = 0; i < results.length; i++) {
        var item = results[i];
        var currentResault = {
            artistName: item.artistName,
            albumName: item.collectionName,
            albumArt: item.artworkUrl100,
        };

        if (!spoilerAlert(currentResault.albumName, artistNameMap)) {
            albumCount++;
            currentRoundAlbums[albumCount] = currentResault.albumName;
            if (albumCount == 3)
                break;
        }

    }
    if (albumCount < 3) {
        itunesSearch();

    } else {
        currentRoundAlbumArt = currentResault.albumArt;
        showAlbum(1);
    }
}

function spoilerAlert(albumName, artistNameMap) {
    var lowerCaseAlbumName = albumName.toLowerCase();
    if (lowerCaseAlbumName.includes("best of") || lowerCaseAlbumName.includes("greatest hits")) // checkeng that the album is not "greatest hits" (dosnt help)
        return true;
    var albumNameSplit = lowerCaseAlbumName.split(' ');
    for (var i = 0; i < albumNameSplit.length; i++) {
        if (artistNameMap.has((albumNameSplit[i].toLowerCase())))
            return true;
    }
    return false;
}



function showAlbum(tryNum) {

    $("#album" + tryNum).html(currentRoundAlbums[tryNum]);
    $('#submitAnswer').prop('disabled', false);
    if (tryNum == 3) {
        $('#hint').css("background-image", "url(" + currentRoundAlbumArt + ")");
        $('#hint').show();
        $('#hintHeadline').show();
    }

}


function submitAnswer() {
    $('#submitAnswer').prop('disabled', true);
    if (currentRoundArtist == $('#artistGuess').val()) {
        addScore(roundTry);
        $('#rightSound')[0].play();
        nextRound();
    } else {
        if (roundTry == 2)
            $('#hint').show();
        if (roundTry == 3)
            nextRound();
        else
            nextTry();
        $('#wrongSound')[0].play();
    }
}


function addScore(roundTry) {
    switch (roundTry) {
        case 1:
            totalScore = totalScore + 5;
            break;
        case 2:
            totalScore = totalScore + 3;
            break;
        case 3:
            totalScore = totalScore + 1;
            break;

    }
    var marginCalc = (56 - (totalScore * (20.1 / 25))) + "%";
    var scrollerMargin = {
        'marginTop': marginCalc
    };


    $("#scroller").animate(scrollerMargin, 1000);

    $("#score").html("Total Score: " + totalScore);
}

function nextRound() {
    if (currentRound == 5) {
        $("#gameOverMessage").html('Game Over! <br/> final score: ' + totalScore);
        $("#gameOverContainer").css('display', "block");
    } else {
        spin();
        clearRound();
        currentRound++;
        itunesSearch();
        var src = "pics/round" + currentRound + ".png";
        var srcAttr = {
            'src': src
        };
        $("#round").attr(srcAttr);
    }
}

function nextTry() {
    roundTry++;
    $('#artistGuess').val("");
    showAlbum(roundTry);
    if (roundTry == 2)
        $("#roundTry").html("2 Tries left");
    else
        $("#roundTry").html("Last try...");


}

function spin() {
    if (spinBollean) {
        $("#record").css("animation-name", "recordSpin2");
        $("#round").css("animation-name", "roundSpin2");
    } else {
        $("#record").css("animation-name", "recordSpin");
        $("#round").css("animation-name", "roundSpin");
    }

    spinBollean = !spinBollean;
}

function endGame() {
    clearGame();
    $("#gameOverContainer").css('display', "none");
    $("#newGame").css("animation", "glowing 1500ms infinite");
}