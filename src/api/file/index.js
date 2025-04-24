// src/api/file/index.js
import request from '@/utils/request'

/**
 * 获取阿里云OSS临时访问凭证
 * @returns {Promise} 包含STS Token等信息的Promise
 */
export function getOssStsToken() {
  return request({
    url: '/files/sts-token',
    method: 'get'
  })
}

/**
 * 创建文件记录（保存文件信息到数据库）
 * @param {Object} data 文件信息，符合CreateFileDto格式
 * @returns {Promise} 包含创建结果的Promise
 */
export function createFile(data) {
  return request({
    url: '/files',
    method: 'post',
    data
  })
}

/**
 * 分页查询文件列表
 * @param {Object} params 查询参数
 * @param {string} [params.mimeType] 按文件类型过滤
 * @param {string} [params.keyword] 搜索关键词(匹配文件名或描述)
 * @param {number} [params.limit] 每页数量
 * @param {number} [params.page] 页码
 * @returns {Promise} 包含文件列表的Promise
 */
export function getFileList(params) {
  return request({
    url: '/files',
    method: 'get',
    params
  })
}

/**
 * 获取文件详情
 * @param {string|number} id 文件ID
 * @returns {Promise} 包含文件详情的Promise
 */
export function getFileDetail(id) {
  return request({
    url: `/files/${id}`,
    method: 'get'
  })
}

/**
 * 更新文件信息
 * @param {string|number} id 文件ID
 * @param {Object} data 更新数据，符合UpdateFileDto格式
 * @returns {Promise} 包含更新结果的Promise
 */
export function updateFile(id, data) {
  return request({
    url: `/files/${id}`,
    method: 'patch',
    data
  })
}

/**
 * 删除文件
 * @param {string|number} id 文件ID
 * @returns {Promise} 包含删除结果的Promise
 */
export function deleteFile(id) {
  return request({
    url: `/files/${id}`,
    method: 'delete'
  })
}

// /seo/image
export function generateImgSeo(data) {
  return request({
    url: '/seo/image',
    method: 'post',
    data
  })
}

// 保持原有导出以兼容旧代码
export function savefileInfo(data) {
  return createFile(data)
}