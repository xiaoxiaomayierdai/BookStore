//可以将控制器的逻辑单独抽取成一个文件（模块）
//建立一个controller模块 在主模块上引用

angular.module('appModule.controller', [])
    .controller('homeCtrl', function ($scope, $sce) {
        $scope.html = $sce.trustAsHtml('<h1>欢迎来到我的书店</h1>');
    }).controller('addCtrl', function ($scope, Books, $location) {
        $scope.addBook = function () {
            var obj = {bookName: $scope.bookName, bookPrice: $scope.bookPrice, bookCover: $scope.bookCover};
            //保存
            Books.save(obj).$promise.then(function () {
                $location.path('/list');//保存成功后跳转到列表页
            });
        }
    }).controller('listCtrl', function ($scope, Books) {
        //点开列表后获取数据
        $scope.books = Books.query();
    }).controller('detailCtrl', function ($scope, $routeParams, Books, $location) {
        //路由参数
        //当页面跳转后 /detail/xxx  /detail/:id 获取xxx进行查询当前这本书
        // /detail/xxx  /detail/:id  => $routeParams{id:xxx}
        // /detail/:name/:addr   /detail/1/2 => {name:1,addr:2}
        //通过id查询某一项
        var id = $routeParams.id;
        $scope.book = Books.get({id});   //  /book/:id
        $scope.remove = function () {
            Books.delete({id}).$promise.then(function () {
                $location.path('/list');
            });
        };
        //控制修改的切换
        $scope.flag = true;
        $scope.changeFlag = function () {
            $scope.flag = false;
            //更改的时候不更改源数据 更改克隆的
            $scope.temp = JSON.parse(JSON.stringify($scope.book));
        };
        $scope.cancel = function () {
            $scope.flag = true;
        };
        //修改 将temp传入到服务端
        $scope.update = function () {
            Books.update({id}, $scope.temp).$promise.then(function () {
                $scope.flag = true;
                $scope.book = $scope.temp;//将最新的数据替换掉老的数据
            });
        }
    });