$(function () {
    var $predictForm = $('#predict-form');
    var $submitBtn = $('#submit-btn');
    var $result = $('#result');
    var inputFields = {
        $arrLoc: $('#arr-loc-search'),
        $depLoc: $('#dep-loc-search'),
        $date: $('#calendar-input')
    };
    var $errorBox = $('#result-error');
    var $resultBox = $('#result-result');

    var DelayGenie = {
        init: function () {
            DelayGenie._initMaps();
            DelayGenie._initEventHandlers();
            inputFields.$date.calendar({
                firstDayOfWeek: 1,
                today: true,
                touchReadonly: false,
                ampm: false
            });
        },

        _initEventHandlers: function () {
            $predictForm.on('submit', DelayGenie._handleFormSubmit);
        },

        _initMaps: function () {
            var options = {
                types: ['(cities)'],
                componentRestrictions: {country: 'us'}
            };
            new google.maps.places.Autocomplete(inputFields.$arrLoc[0], options);
            new google.maps.places.Autocomplete(inputFields.$depLoc[0], options);
        },

        _getCoords: function ($searchField) {
            return new Promise(function (resolve) {
                var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + $searchField.val() + "&key=AIzaSyBOyRbabpx1GmuPlAxAd8a7F7urzKZKB3k";
                $.ajax({
                    type: "GET",
                    url: url,
                    success: function (msg) {
                        resolve({
                            lat: msg.results[0].geometry.location.lat,
                            lon: msg.results[0].geometry.location.lng
                        });
                    }
                }).fail(function () {
                    resolve({})
                })
            });
        },

        _handleFormSubmit: function (event) {
            event.preventDefault();
            DelayGenie._toggleLoadingButton(true);
            DelayGenie._toggleResultBox(false);

            var departure = DelayGenie._getCoords(inputFields.$depLoc);
            var arrival = DelayGenie._getCoords(inputFields.$arrLoc);

            Promise.all([departure, arrival]).then(function (values) {
                var data = {
                    departure: values[0],
                    arrival: values[1],
                    date: new Date(inputFields.$date.calendar('get date')).getTime()
                };
                DelayGenie._postPredict(data);
            });
        },

        _postPredict: function (data) {
            $.ajax({
                method: 'post',
                url: '/predict',
                data: JSON.stringify(data),
                contentType: 'application/json'
            }).done(function (data) {
                DelayGenie._toggleFailResultBox(false);
                DelayGenie._showResultContent(data);
            }).fail(function () {
                DelayGenie._toggleFailResultBox(true);
            }).always(function () {
                DelayGenie._toggleLoadingButton(false);
                DelayGenie._toggleResultBox(true);
            })
        },

        _toggleLoadingButton: function (enable) {
            $submitBtn.toggleClass('loading', enable);
        },

        _toggleResultBox: function (enable) {
            if (enable) {
                $result.slideDown();
            } else {
                $result.slideUp();
            }
        },

        _toggleFailResultBox: function (showFailBox) {
            $errorBox.toggle(showFailBox);
            $resultBox.toggle(!showFailBox);
        },

        _showResultContent: function (data) {
            // TODO
        }
    };

    DelayGenie.init();
});