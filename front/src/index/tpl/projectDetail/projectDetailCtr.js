/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	'use strict';
	if (typeof domeApp === 'undefined') return;
	domeApp.controller('ProjectDetailCtr', ['$scope', '$state', '$stateParams', '$domeProject', '$domePublic', '$domeImage', '$timeout', '$location', '$util', '$domeUser', '$modal', function ($scope, $state, $stateParams, $domeProject, $domePublic, $domeImage, $timeout, $location, $util, $domeUser, $modal) {
		$scope.projectId = $state.params.project;
		$scope.projectCollectionId = $state.params.projectCollectionId;
		$domeProject.projectService.getProjectCollectionNameById($scope.projectCollectionId).then(function (res) {
			$scope.projectCollectionName = res.data.result || '';
		});
		if (!$scope.projectId) {
			$state.go('projectManage');
			return;
		}
		// 面包屑 父级url
        $scope.parentState = 'projectManage({id:"' + $scope.projectCollectionId +'"})';
		$scope.branch = 'master';
		$scope.valid = {
			needValid: false,
			createdFileStoragePath: false
		};
		$scope.edit = false;
		$scope.isEditCreator = false;
		$scope.isCreator = false;
		$scope.selectedCreator = null;
		$scope.isWaitingForModify = false;
		$scope.statusKey = '';
		$scope.autoBuildKey = '';
		// 项目成员的资源类型
		$scope.resourceType = 'PROJECT';
		$scope.resourceId = $scope.projectId;
		$scope.$on('memberPermisson', function (event, hasPermisson) {
			$scope.hasMemberPermisson = hasPermisson;
			if (!hasPermisson && stateInfo.indexOf('user') !== -1) {
				$state.go('projectDetail.info');
				$scope.tabActive[0].active = true;
			}
		});
		$scope.isLoading = true;
		$scope.tabActive = [{
			active: false
		}, {
			active: false
		}, {
			active: false
		}, {
			active: false
		}, {
			active: false
		}];

		$domeProject.projectService.getReadMe($scope.projectId, $scope.branch).then(function (response) {
		  $scope.markdown = response.data.result;
		});

		var project, timeout;
		var initConig = function () {
			var buildPath = $scope.project.config.dockerfileInfo.buildPath,
				dockerfilePath = $scope.project.config.dockerfileInfo.dockerfilePath;
			if (!buildPath) {
				$scope.project.config.dockerfileInfo.buildPath = '/';
			}
			if (!dockerfilePath) {
				$scope.project.config.dockerfileInfo.dockerfilePath = '/Dockerfile';
			}

			$scope.config = $scope.project.config;
		};
		var initProjectImages = function (type) {
			$scope.project.projectImagesIns.getProjectImageAsPrivateImageList('all');
			$scope.project.projectImagesIns.toggleSpecifiedImage('compile', $scope.project.customConfig.compileImage);
			$scope.project.projectImagesIns.toggleSpecifiedImage('run', $scope.project.customConfig.runImage);

			$domeImage.imageService.getExclusiveImages(type).then(function (res) {
				$scope.project.projectImagesIns.init(res.data.result);
				$scope.project.projectImagesIns.toggleSpecifiedImage('compile', $scope.project.customConfig.compileImage);
				$scope.project.projectImagesIns.toggleSpecifiedImage('run', $scope.project.customConfig.runImage);
			});
		};

		$scope.$on('memberPermisson', function (event, hasPermisson) {
			$scope.hasMemberPermisson = hasPermisson;
			if (!hasPermisson && stateInfo.indexOf('user') !== -1) {
				$state.go('projectDetail.info');
				$scope.tabActive[0].active = true;
			}
		});
		var initLoginUser = function () {
			$domeUser.userService.getCurrentUser().then(function (res) {
				$scope.loginUser = res.data.result;
			});
		};
		initLoginUser();
		//获取用户角色
		var initUserProjectRole = function () {
			$domeUser.userService.getResourceUserRole($scope.resourceType, $scope.resourceId).then(function (res) {
				var userRole = res.data.result;
				if(userRole === 'MASTER') {
					$scope.isDeleteProject = true;
				}else {
					$scope.isDeleteProject = false;
				}
				if (userRole === 'MASTER' || userRole === 'DEVELOPER') {
					$scope.isEditProject = true;
				}else {
					$scope.isEditProject = false;
				}
			}, function () {
				$scope.isDeleteProject = false;
				$scope.isEditProject = false;
			});
		};
		initUserProjectRole();
		var initProjectInfo = function initProjectInfo() {
			if (!$scope.loginUser) return setTimeout(initProjectInfo, 10);

			$domeProject.projectService.getData($scope.projectId).then(function (res) {
				project = $domeProject.getInstance('Project', res.data.result.project);
				$scope.creatorInfo = res.data.result.creatorInfo;
				if ($scope.loginUser.username === 'admin' || $scope.creatorInfo.name === $scope.loginUser.username) {
					$scope.isCreator = true;
				}else {
					$scope.isCreator = false;
				}

				$scope.project = angular.copy(project);
				initConig();
				$scope.$emit('pageTitle', {
					title: $scope.config.name,
					description: '更新于' + $util.getPageDate($scope.config.lastModify),
					mod: 'projectManage'
				});
				$scope.hasuploadFileInfos = true;
				if($scope.project.customConfig.uploadFileInfos.length == 1){
					if($scope.project.customConfig.uploadFileInfos[0].filename === ''
						&& $scope.project.customConfig.uploadFileInfos[0].content === '' ){
						$scope.hasuploadFileInfos = false;
					}
				}
		  }).finally(function () {
				$scope.isLoading = false;
			});
		};
		initProjectInfo();
		var _formartBuildLog = function (sigBuild, requestUrl) {
			var logUrl = '';
			sigBuild.interval = $util.getPageInterval(sigBuild.createTime, sigBuild.finishTime);
			sigBuild.createTime = $util.getFormatDate(sigBuild.createTime);
			if (sigBuild.state === 'Success' || sigBuild.state === 'Fail') {
				logUrl = $location.protocol() + '://' + requestUrl + '/api/ci/build/download/' + sigBuild.projectId + '/' + sigBuild.id;
			} else if (sigBuild.state === 'Building') {
				logUrl = location.protocol.replace('http', 'ws') + '//' + requestUrl + '/api/ci/build/log/realtime/websocket?buildId=' + sigBuild.id;
			} else {
				logUrl = '';
			}
			sigBuild.logHref = '/log/log.html?url=' + encodeURIComponent(logUrl);
		};
        // 项目总数
        $scope.totalItems = 0;
        // 当前页码
        $scope.pagination = {
            currentPage:  1
        };
        // 每页显示行数
        $scope.itemsPerPage = 10;
        // 显示的页码最大个数
        $scope.maxSize = 5;
		// 修改当前页码
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function() {
            freshBuildList();
        };
        $scope.togglePerPageCount = function(perPageCount) {
            $scope.itemsPerPage = perPageCount;
            $scope.pagination.currentPage = 1;
            freshBuildList();
        };
		var freshBuildList = function () {
			return $domeProject.projectService.buildInfoList($scope.projectId, $scope.pagination.currentPage, $scope.itemsPerPage).then(function(res) {
                $scope.totalItems = res.data.result.total;
				var buildList = res.data.result.buildHistories || [],
					requestUrl = $location.host(),
					i;
				if ($location.port()) {
					requestUrl += ':' + $location.port();
				}
				for (i = 0; i < buildList.length; i++) {
					_formartBuildLog(buildList[i], requestUrl);
				}
				$scope.buildList = buildList;
				buildList = null;
				return true;
			}, function() {
				return true;
			}).finally(function() {
                $scope.isLoadingBuildInfo = false;
			});
		};
		var modify = function () {
			$scope.isWaitingForModify = true;
			$scope.project.modify().then(function () {
				$domePublic.openPrompt('修改成功！');
				$scope.checkEdit();
				initProjectInfo();
				$scope.valid.needValid = false;
			}, function (res) {
				$domePublic.openWarning({
					title: '修改失败！',
					msg: 'Message:' + res.data.resultMsg
				});
			}).finally(function () {
				$scope.isWaitingForModify = false;
			});
		};
		$domeImage.imageService.getBaseImages().then(function (res) {
			$scope.imageList = res.data.result;
		});
		var initProjectCollectionUser = function () {
			$scope.selectedCreator = {
				username: $scope.creatorInfo.name,
				id: $scope.creatorInfo.creatorId
			};
			$domeUser.userService.getUserList().then(function(res) {
				$scope.creatorUserList = res.data.result || [];
			});
		};
		var updateCreator = function () {
			var newCrreator = {
					creatorId: $scope.selectedCreator.id,
					name: $scope.selectedCreator.username,
				};
				$domeProject.projectService.modifyCreator($scope.projectId, newCrreator).then(function (res) {
					$scope.isEditCreator = false;
					initProjectInfo();
				},function (res) {
					$domePublic.openWarning({
						title: "修改失败",
						msg: res.data.resultMsg
					});
				});
		};
		$scope.toggleIsEditCreator = function () {
			$scope.isEditCreator = !$scope.isEditCreator;
		};
		$scope.modifyCreator = function() {
			$scope.isEditCreator = true;
			initProjectCollectionUser();
		};
		$scope.toggleCreator = function (user) {
			$scope.selectedCreator = user;
		};
		$scope.saveEditCreator = function () {
			if ($scope.loginUser.username === 'admin') {
				updateCreator();
			}else {
				$domePublic.openConfirm("修改后将无权限再修改，是否继续").then(function() {
					updateCreator();
				});
			}
		};
		$scope.modifyCodeInfo = function() {
			var modifyProjectModalIns = $modal.open({
				templateUrl: '/index/tpl/modal/codeInfoModal/codeInfoModal.html',
				controller: 'CodeInfoModalCtr as vmPro',
				size: 'md',
				resolve: {
					project: function() {
						return $scope.config.codeInfo;
					},
					showForm: function() {
						return 'projectDetail';
					}
				}
			});
			modifyProjectModalIns.result.then(function(result) {
				// 'result' is code info
				$domeProject.projectService.modifyCodeInfo($scope.projectId, result).then(function(res) {
					initProjectInfo();
				},function(resError) {
					$domePublic.openWarning({
						title: "修改失败",
						msg: resError.data.resultMsg
					});
				});
			});
		};
		$scope.checkEdit = function () {
			$scope.edit = !$scope.edit;
			if ($scope.edit) {
				if ($scope.project.customConfig.customType) {
					// 初始化项目镜像选择
					initProjectImages($scope.project.customConfig.customType);
				}
				initConig();
			} else {
				$scope.project = angular.copy(project);
				initConig();
			}
			$scope.config = $scope.project.config;
		};
		// 切换项目类型
		// @param type: 'allType'(通用配置)/'java'
		$scope.toggleProjectType = function (type) {
			// 如果没有改变
			if (!$scope.config.userDefineDockerfile) {
				if (type == 'allType' && !$scope.project.isUseCustom && !$scope.project.isDefDockerfile) return;
				if ($scope.project.isUseCustom && type === $scope.project.customConfig.customType) return;
				if ($scope.project.isDefDockerfile && type === 'defdockerfile') return;
			}
			if (function () {
					if (!project.config.userDefineDockerfile) {
						if (type == 'allType' && !project.isUseCustom && !project.isDefDockerfile) return true;
						if (project.isUseCustom && type === project.customConfig.customType) return true;
						if (project.isDefDockerfile && type === 'defdockerfile') return true;
					}
					return false;
				}()) {
				$scope.project = angular.copy(project);
			} else {
				$scope.project.resetConfig();
			}
			initConig();
			if (type == 'allType') {
				$scope.project.isUseCustom = false;
				$scope.project.isDefDockerfile = false;
			} else if (type === 'defdockerfile') {
				$scope.project.isUseCustom = false;
				$scope.project.isDefDockerfile = true;
			} else {
				$scope.project.isUseCustom = true;
				$scope.project.isDefDockerfile = false;
				$scope.project.customConfig.customType = type;
			}
			$scope.config.userDefineDockerfile = false;
			// console.log($scope);
		};
		$scope.toggleUseDockerfile = function () {
			if ($scope.config.userDefineDockerfile) {
				return;
			}
			$scope.config.userDefineDockerfile = true;
			if (project.config.userDefineDockerfile) {
				// editProject = angular.copy(project);
				$scope.project = angular.copy(project);
			} else {
				$scope.project.resetConfig();
			}
			initConig();
		};
		$scope.getBuildList = function () {
			$scope.isLoadingBuildInfo = true;
            freshBuildList();
            // 分页后取消定时刷新
			// if (timeout) {
			// 	$timeout.cancel(timeout);
			// }
			// if (!$scope.buildList) {
			// 	freshBuildList();
			// }
			// timeout = $timeout(function () {
			// 	freshBuildList().finally(function () {
			// 		if ($state.current.name == 'projectDetail.buildlog') {
			// 			$scope.getBuildList();
			// 		}
			// 	});
			// }, 4000);
		};
		$scope.stopBuild = function (log) {
			// console.log(log);
			$domePublic.openConfirm('确定要停止构建吗？').then(function() {
				$domeProject.projectService.stopBulid(log.id).then(function(res) {
					freshBuildList();
				},function(resError) {
					$domePublic.openWarning({
						title: "操作失败",
						msg: resError.data.resultMsg
					});
				});
			});
		};
		$scope.changeDockerfilePath = function (txt) {
			if (txt == '/') {
				$scope.config.dockerfileInfo.dockerfilePath = '/Dockerfile';
			} else {
				$scope.config.dockerfileInfo.dockerfilePath = txt + '/Dockerfile';
			}
		};
		$scope.validCreatedFileStoragePath = function () {
			if (!$scope.project.isUseCustom) {
				$scope.valid.createdFileStoragePath = true;
				return;
			}
			var createdFileStoragePath = $scope.project.customConfig.createdFileStoragePath;
			for (var i = 0, l = createdFileStoragePath.length; i < l; i++) {
				if (createdFileStoragePath[i].name) {
					$scope.valid.createdFileStoragePath = true;
					return;
				}
			}
			$scope.valid.createdFileStoragePath = false;
		};
		$scope.startEdit = function () {
			$scope.edit = !$scope.edit;
		};
		$scope.isNoSet = function (str) {
			if (!str) {
				str = '未设置';
			}
			return str;
		};
		$scope.submitModify = function () {
			modify();
		};
		$scope.deleteProject = function () {
			$scope.project.delete().then(function () {
				$state.go('projectManage',{id:$scope.projectCollectionId});
			});
		};
		$scope.toggleStatus = function (status) {
			if (status === $scope.statusKey) {
				$scope.statusKey = '';
			} else {
				$scope.statusKey = status;
			}
		};
		$scope.toggleAutoBuild = function (autoBuild) {
			if (autoBuild === $scope.autoBuildKey) {
				$scope.autoBuildKey = '';
			} else {
				$scope.autoBuildKey = autoBuild;
			}
		};
		$scope.modifyCI = function () {
			$scope.isWaitingForModify = true;
			modify();
		};
		$scope.openBuild = function () {
			$domeProject.buildProject($scope.config.id, !!$scope.config.codeInfo).then(function () {
				freshBuildList();
			});
		};
		$scope.getDockerfile = function () {
			$scope.project.getDockerfile();
		};

		$scope.$on('$destroy', function (argument) {
			if (timeout) {
				$timeout.cancel(timeout);
			}
		});
		var stateInfo = $state.$current.name;
		if (stateInfo.indexOf('config') !== -1) {
			$scope.tabActive[1].active = true;
		} else if (stateInfo.indexOf('autobuild') !== -1) {
			$scope.tabActive[2].active = true;
		} else if (stateInfo.indexOf('buildlog') !== -1) {
			$scope.tabActive[3].active = true;
			$scope.getBuildList();
		} else if (stateInfo.indexOf('user') !== -1) {
			$scope.tabActive[4].active = true;
		} else {
			$scope.tabActive[0].active = true;
		}

	}]);
})(window.domeApp);