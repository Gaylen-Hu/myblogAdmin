import request from '@/utils/request'

// 查询部门列表
export function listDept(query) {
  return request({
    url: '/dept/list',
    method: 'get',
    params: query
  })
}

// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId) {
  return request({
    url: '/dept/list/exclude/' + deptId,
    method: 'get'
  })
}

// 查询部门详细
export function getDept(deptId) {
  return request({
    url: '/dept/' + deptId,
    method: 'get'
  })
}
// 获取部门树
export function deptTreeSelect(query) {
  return request({
    url: '/dept/deptTree',
    method: 'get',
    params: query
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: '/dept',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: '/dept',
    method: 'put',
    data: data
  })
}

// 删除部门
export function delDept(deptId) {
  return request({
    url: '/dept/' + deptId,
    method: 'delete'
  })
}