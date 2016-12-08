angular.module('app').service('apiConnector', function ($http) {

    return {
        
        getData: function (callback) {
            $http.get('/api/data')
                .success(function (data) {
                    callback(data);
                });
        },
        getSharePrices: function (callback) {
            $http.get('/api/data/sharePrices')
                .success(function (data) {
                    callback(data);
                });
        },

    };
    
});