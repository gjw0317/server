'use strict';

/*
 * @author ChandraLee
 */

(function (domeApp, undefined) {
	domeApp.controller('DockerfileModalCtr', DockerfileModalCtr);

	function DockerfileModalCtr($modalInstance, project, $domeProject, $sce) {
		var vm = this;
		$domeProject.projectService.previewDockerfile(project._formartProject()).then(function (res) {
			if (res.data.resultCode == 200) {
				vm.dockerfileTxt = res.data.result ? $sce.trustAsHtml(res.data.result.replace(/[\n\r]/g, '<br/>')) : $sce.trustAsHtml('无数据！');
			} else {
				vm.dockerfileTxt = $sce.trustAsHtml('<h4 class="txt-error">请求失败！</h4><p class="txt-error">错误信息：' + res.data.resultMsg + '</p>');
			}
		}, function () {
			vm.dockerfileTxt = $sce.trustAsHtml('<p class="txt-error">请求失败！</p>');
		});
		vm.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}
	DockerfileModalCtr.$inject = ['$modalInstance', 'project', '$domeProject', '$sce'];
})(window.domeApp);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4L3RwbC9tb2RhbC9kb2NrZXJmaWxlTW9kYWwvZG9ja2VyZmlsZU1vZGFsQ3RyLmVzIl0sIm5hbWVzIjpbImRvbWVBcHAiLCJ1bmRlZmluZWQiLCJjb250cm9sbGVyIiwiRG9ja2VyZmlsZU1vZGFsQ3RyIiwiJG1vZGFsSW5zdGFuY2UiLCJwcm9qZWN0IiwiJGRvbWVQcm9qZWN0IiwiJHNjZSIsInZtIiwicHJvamVjdFNlcnZpY2UiLCJwcmV2aWV3RG9ja2VyZmlsZSIsIl9mb3JtYXJ0UHJvamVjdCIsInRoZW4iLCJyZXMiLCJkYXRhIiwicmVzdWx0Q29kZSIsImRvY2tlcmZpbGVUeHQiLCJyZXN1bHQiLCJ0cnVzdEFzSHRtbCIsInJlcGxhY2UiLCJyZXN1bHRNc2ciLCJjYW5jZWwiLCJkaXNtaXNzIiwiJGluamVjdCIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUlBLENBQUMsVUFBQ0EsT0FBRCxFQUFVQyxTQUFWLEVBQXdCO0FBQ3hCRCxTQUFRRSxVQUFSLENBQW1CLG9CQUFuQixFQUF5Q0Msa0JBQXpDOztBQUVBLFVBQVNBLGtCQUFULENBQTRCQyxjQUE1QixFQUE0Q0MsT0FBNUMsRUFBcURDLFlBQXJELEVBQW1FQyxJQUFuRSxFQUF5RTtBQUN4RSxNQUFJQyxLQUFLLElBQVQ7QUFDQUYsZUFBYUcsY0FBYixDQUE0QkMsaUJBQTVCLENBQThDTCxRQUFRTSxlQUFSLEVBQTlDLEVBQXlFQyxJQUF6RSxDQUE4RSxVQUFVQyxHQUFWLEVBQWU7QUFDNUYsT0FBSUEsSUFBSUMsSUFBSixDQUFTQyxVQUFULElBQXVCLEdBQTNCLEVBQWdDO0FBQy9CUCxPQUFHUSxhQUFILEdBQW1CSCxJQUFJQyxJQUFKLENBQVNHLE1BQVQsR0FBa0JWLEtBQUtXLFdBQUwsQ0FBaUJMLElBQUlDLElBQUosQ0FBU0csTUFBVCxDQUFnQkUsT0FBaEIsQ0FBd0IsU0FBeEIsRUFBbUMsT0FBbkMsQ0FBakIsQ0FBbEIsR0FBa0ZaLEtBQUtXLFdBQUwsQ0FBaUIsTUFBakIsQ0FBckc7QUFDQSxJQUZELE1BRU87QUFDTlYsT0FBR1EsYUFBSCxHQUFtQlQsS0FBS1csV0FBTCxDQUFpQiwrREFBK0RMLElBQUlDLElBQUosQ0FBU00sU0FBeEUsR0FBb0YsTUFBckcsQ0FBbkI7QUFDQTtBQUNELEdBTkQsRUFNRyxZQUFZO0FBQ2RaLE1BQUdRLGFBQUgsR0FBbUJULEtBQUtXLFdBQUwsQ0FBaUIsZ0NBQWpCLENBQW5CO0FBQ0EsR0FSRDtBQVNBVixLQUFHYSxNQUFILEdBQVksWUFBWTtBQUN2QmpCLGtCQUFla0IsT0FBZixDQUF1QixRQUF2QjtBQUNBLEdBRkQ7QUFHQTtBQUNEbkIsb0JBQW1Cb0IsT0FBbkIsR0FBNkIsQ0FBQyxnQkFBRCxFQUFtQixTQUFuQixFQUE4QixjQUE5QixFQUE4QyxNQUE5QyxDQUE3QjtBQUNBLENBbkJELEVBbUJHQyxPQUFPeEIsT0FuQlYiLCJmaWxlIjoiaW5kZXgvdHBsL21vZGFsL2RvY2tlcmZpbGVNb2RhbC9kb2NrZXJmaWxlTW9kYWxDdHIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQGF1dGhvciBDaGFuZHJhTGVlXG4gKi9cblxuKChkb21lQXBwLCB1bmRlZmluZWQpID0+IHtcblx0ZG9tZUFwcC5jb250cm9sbGVyKCdEb2NrZXJmaWxlTW9kYWxDdHInLCBEb2NrZXJmaWxlTW9kYWxDdHIpO1xuXG5cdGZ1bmN0aW9uIERvY2tlcmZpbGVNb2RhbEN0cigkbW9kYWxJbnN0YW5jZSwgcHJvamVjdCwgJGRvbWVQcm9qZWN0LCAkc2NlKSB7XG5cdFx0bGV0IHZtID0gdGhpcztcblx0XHQkZG9tZVByb2plY3QucHJvamVjdFNlcnZpY2UucHJldmlld0RvY2tlcmZpbGUocHJvamVjdC5fZm9ybWFydFByb2plY3QoKSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG5cdFx0XHRpZiAocmVzLmRhdGEucmVzdWx0Q29kZSA9PSAyMDApIHtcblx0XHRcdFx0dm0uZG9ja2VyZmlsZVR4dCA9IHJlcy5kYXRhLnJlc3VsdCA/ICRzY2UudHJ1c3RBc0h0bWwocmVzLmRhdGEucmVzdWx0LnJlcGxhY2UoL1tcXG5cXHJdL2csICc8YnIvPicpKSA6ICRzY2UudHJ1c3RBc0h0bWwoJ+aXoOaVsOaNru+8gScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dm0uZG9ja2VyZmlsZVR4dCA9ICRzY2UudHJ1c3RBc0h0bWwoJzxoNCBjbGFzcz1cInR4dC1lcnJvclwiPuivt+axguWksei0pe+8gTwvaDQ+PHAgY2xhc3M9XCJ0eHQtZXJyb3JcIj7plJnor6/kv6Hmga/vvJonICsgcmVzLmRhdGEucmVzdWx0TXNnICsgJzwvcD4nKTtcblx0XHRcdH1cblx0XHR9LCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2bS5kb2NrZXJmaWxlVHh0ID0gJHNjZS50cnVzdEFzSHRtbCgnPHAgY2xhc3M9XCJ0eHQtZXJyb3JcIj7or7fmsYLlpLHotKXvvIE8L3A+Jyk7XG5cdFx0fSk7XG5cdFx0dm0uY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0JG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XG5cdFx0fTtcblx0fVxuXHREb2NrZXJmaWxlTW9kYWxDdHIuJGluamVjdCA9IFsnJG1vZGFsSW5zdGFuY2UnLCAncHJvamVjdCcsICckZG9tZVByb2plY3QnLCAnJHNjZSddO1xufSkod2luZG93LmRvbWVBcHApOyJdfQ==
