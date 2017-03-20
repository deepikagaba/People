angular.module("peoplesApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    peoples: function(Peoples) {
                        return Peoples.getPeople();
                    }
                }
            })
            .when("/new/people", {
                controller: "NewPeopleController",
                templateUrl: "people-form.html"
            })
            .when("/people/:peopleId", {
                controller: "EditPeopleController",
                templateUrl: "people.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Peoples", function($http) {
        this.getPeople = function() {
            return $http.get("/people").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding people.");
                });
        }
        this.createPeople = function(people) {
            return $http.post("/people", people).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating people.");
                });
        }
        this.getPerson = function(peopleId) {
            var url = "/people/" + peopleId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this person.");
                });
        }
        this.editPeople = function(person) {
            var url = "/people/" + person._id;
            return $http.put(url, person).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this person.");
                });
        }
        this.deletePeople = function(peopleId) {
            var url = "/people/" + peopleId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this person.");
                });
        }
    })
    .controller("ListController", function(peoples, $scope) {
        $scope.peoples = peoples.data;
    })
    .controller("NewPeopleController", function($scope, $location, Peoples) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.savePeople = function(people) {
            Peoples.createPeople(people).then(function(doc) {
                var peopleUrl = "#/people/" + doc.data._id;
                $location.path(peopleUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditPeopleController", function($scope, $routeParams, Peoples) {
        Peoples.getPerson($routeParams.peopleId).then(function(doc) {
            $scope.person = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.formUrl = "people-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.formUrl = "";
        }

        $scope.savePeople = function(people) {
            Peoples.editPeople(people);
            $scope.editMode = false;
            $scope.formUrl = "";
        }

        $scope.deletePeople = function(peopleId) {
            Peoples.deletePeople(peopleId);
        }
    });