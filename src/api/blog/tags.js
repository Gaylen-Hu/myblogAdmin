import request from '@/utils/request'

export function getTagList(query) {
    return request({
        url: '/tag/list',
        method: 'get',
        params: query
    })
}

export function createTag(data) {
    return request({
        url: '/tag',
        method: 'post',
        data
    })
}

export function getAllTags() {
    return request({
        url: '/tag',
        method: 'get'
    })
}

export function getTagById(id) {
    return request({
        url: `/tag/${id}`,
        method: 'get'
    })
}

export function updateTag(id, data) {
    return request({
        url: `/tag/${id}`,
        method: 'patch',
        data
    })
}

export function deleteTag(id) {
    return request({
        url: `/tag/${id}`,
        method: 'delete'
    })
}
// batchDeleteTag
export function batchDeleteTag(data) {
    return request({
        url: `/tag/batchDelete`,
        method: 'post',
        data
    })
}
