import request from '@/utils/request'

export function listNote(query) {
  return request({
    url: '/notes/list',
    method: 'get',
    params: query
  })
}

export function getNote(id) {
  return request({
    url: `/notes/${id}`,
    method: 'get'
  })
}

export function addNote(data) {
  return request({
    url: '/notes',
    method: 'post',
    data
  })
}
export function batchRemove(data) {
  return request({
    url: '/notes/batchRemove',
    method: 'post',
    data
  })
}

export function updateNote(id, data) {
  return request({
    url: `/notes/${id}`,
    method: 'patch',
    data
  })
}

export function deleteNote(id) {
  return request({
    url: `/notes/${id}`,
    method: 'delete'
  })
}

export function getAllNotes() {
  return request({
    url: '/notes',
    method: 'get'
  })
}

export function recommendNote(query) {
  return request({
    url: '/notes/recommend',
    method: 'get',
    params: query
  })
}