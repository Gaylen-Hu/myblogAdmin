<template>
  <div class="image-picker">
    <!-- 显示已选图片 -->
    <div v-if="selectedImage" class="preview-area">
      <img :src="selectedImage.variants.small" :alt="selectedImage.altText" class="preview-image">
      <div class="image-info">
        <p>{{ selectedImage.title }}</p>
        <el-button size="mini" @click="removeImage">移除</el-button>
      </div>
    </div>

    <!-- 选择按钮 -->
    <el-button
      type="primary"
      @click="dialogVisible = true"
      icon="el-icon-picture"
    >
      {{ selectedImage ? '更换图片' : '选择图片' }}
    </el-button>

    <!-- 图片选择对话框 -->
    <el-dialog
    append-to-body
      title="选择图片"
      :visible.sync="dialogVisible"
      width="80%"
      top="5vh"
    >
      <div class="image-library">
        <!-- 搜索过滤 -->
        <div class="filter-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索图片标题或描述"
            clearable
            style="width: 300px"
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </div>

        <!-- 图片列表 -->
        <div class="image-grid">
          <div
            v-for="image in filteredImages"
            :key="image.id"
            class="image-item"
            :class="{ selected: isSelected(image) }"
            @click="selectImage(image)"
          >
            <img :src="image.variants.thumb" :alt="image.altText">
            <div class="image-meta">
              <p class="title">{{ image.title }}</p>
            </div>
          </div>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection">确认选择</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {  getFileList } from "@/api/file";

export default {
  props: {
    value: {  // 用于v-model双向绑定
      type: [Array,String, Object],
      default: []
    },
  },
  data() {
    return {
      dialogVisible: false,
      searchQuery: '',
      tempSelected: null,
      imageList: [],  // 存储图片列表
    }
  },
  computed: {
    selectedImage: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)  // 更新v-model
      }
    },
    filteredImages() {
      if (!this.searchQuery) return this.imageList
      const query = this.searchQuery.toLowerCase()
      return this.imageList.filter(img =>
        img.title.toLowerCase().includes(query) ||
        (img.description && img.description.toLowerCase().includes(query))
      )
    }
  },
  methods: {
    fetchImages(){
      getFileList({ page: 1, limit: 10 }).then(res => {
        console.log('获取图片列表', res)
        console.log( res.data.items[0]?.variants?.thumb)
        this.imageList = res.data.items.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          variants: {
            thumb: item?.variants?.thumb||item.url,
            small: item?.variants?.small||item.url
          },
          altText: item.altText || 'Image'
        }))
      })
    },
    isSelected(image) {
      return this.tempSelected && this.tempSelected.id === image.id
    },
    selectImage(image) {
      this.tempSelected = image
    },
    confirmSelection() {
      this.selectedImage = this.tempSelected
      this.dialogVisible = false
    },
    removeImage() {
      this.selectedImage = null
    }
  },
  mounted() {
    this.fetchImages()
  },
}
</script>

<style scoped>
.image-picker {
  margin: 15px 0;
}

.preview-area {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.preview-image {
  max-width: 150px;
  max-height: 100px;
  object-fit: contain;
  margin-right: 15px;
}

.image-info {
  flex: 1;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
  max-height: 60vh;
  overflow-y: auto;
}

.image-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.image-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-item.selected {
  border: 2px solid #409EFF;
  background-color: #f0f7ff;
}

.image-item img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  display: block;
}

.image-meta {
  margin-top: 5px;
}

.image-meta .title {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}
</style>