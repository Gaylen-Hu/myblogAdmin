import request  from '@/utils/request'
import { translateBlogSSE } from '@/utils/request'

  export function getBlogList(query) {
    return request({
      url: '/blogs/list',
      method: 'get',
      params: query
    });
  }

  export function createBlog(data) {
    return request({
      url: '/blogs',
      method: 'post',
      data
    });
  }

  export function getAllBlogs() {
    return request({
      url: '/blogs',
      method: 'get'
    });
  }

  export function getBlogById(id) {
    return request({
      url: `/blogs/${id}`,
      method: 'get'
    });
  }

  export function updateBlog(id, data) {
    return request({
      url: `/blogs/${id}`,
      method: 'patch',
      data
    });
  }

  export function deleteBlog(id) {
    return request({
      url: `/blogs/${id}`,
      method: 'delete'
    });
  }
  export function batchDeleteBlog(data) {
    return request({
      url: `/blogs/batchDelete`,
      method: 'post',
      data
    });
  }
  // @Patch(':id/publish')


  export function publishBlog(id) {
    return request({
      url: `/blogs/${id}/publish`,
      method: 'patch'
    });
  }

  export function unpublishBlog(id) {
    return request({
      url: `/blogs/${id}/unpublish`,
      method: 'patch'
    });
  }
  // seo/generate

  export function seoGenerate(data) {
    return request({
      url: `/seo/generate`,
      method: 'post',
      data,
      timeout: 60000
    });
  }
  // translateBlog
  export function translateBlog(data) {
    return request({
      url: `/seo/translate`,
      method: 'post',
      data,
      timeout: 60000
    });
  }
