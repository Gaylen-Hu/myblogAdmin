<template>
  <div class="app-container">
    <!-- Search Form -->
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      class="search-form"
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入博客标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- langOptions -->
      <el-form-item label="语言" prop="locale">
        <el-select
          v-model="queryParams.locale"
          placeholder="请选择语言"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in langOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>

      <el-form-item class="search-buttons">
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- Action Buttons -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <!-- Blog Table -->
    <el-table
      v-loading="loading"
      :data="blogList"
      highlight-current-row
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        prop="title"
        label="标题"
        align="center"
        width="200"
        show-overflow-tooltip
      />

      <el-table-column prop="lang" label="语言" align="center" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.lang === 'zh-CN' ? 'success' : 'warning'">
            {{ scope.row.lang === "zh-CN" ? "中文" : "英文" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="tags" label="标签" align="center" width="180">
        <template slot-scope="scope">
          <el-tag
            v-for="tag in scope.row.tags"
            :key="tag.id"
            :type="tag.class || ''"
            style="margin-right: 5px; margin-bottom: 5px;"
          >
            {{ tag.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="summary"
        label="摘要"
        align="center"
        show-overflow-tooltip
      />

      <el-table-column prop="status" label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
            {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="updateTime" label="更新时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="220" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdaterow(scope.row)"
          >编辑</el-button>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDeleterow(scope.row)"
          >删除</el-button>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-upload"
            @click="publish(scope.row)"
            v-if="scope.row.status !== 'published'"
          >发布</el-button>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-copy-document"
            @click="handleTranslate(scope.row)"
            v-if="scope.row.lang === 'zh-CN'"
          >翻译</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- Blog Dialog Form -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="80%"
      :close-on-click-modal="false"
      append-to-body
      top="5vh"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-tabs v-model="activeTab" tab-position="left">
          <el-tab-pane label="文章信息" name="content">
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入博客标题"
                show-word-limit
                maxlength="100"
              />
            </el-form-item>

            <el-form-item label="语言" prop="lang">
              <el-select v-model="form.lang" placeholder="请选择语言">
                <el-option
                  v-for="item in langOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="内容" prop="content">
              <v-md-editor
                v-model="form.content"
                height="500px"
                :disabled-menus="[]"
                @upload-image="handleUploadImage"
                left-toolbar="undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code | save"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="SEO信息" name="seo">
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="form.keywords"
                placeholder="请输入关键字，多个关键字用逗号分隔"
              />
            </el-form-item>

            <el-form-item label="描述" prop="summary">
              <el-input
                type="textarea"
                v-model="form.summary"
                placeholder="请输入描述"
                :rows="4"
                show-word-limit
                maxlength="200"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="generateSeoInfo"
                :loading="seoLoading"
                :disabled="!form.content"
              >
                <i class="el-icon-magic-stick"></i> AI生成SEO信息
              </el-button>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="标签" name="tags">
            <el-form-item label="标签" prop="tags">
              <el-select
                v-model="form.tags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入文章标签"
                style="width: 100%"
                @change="handleTagChange"
              >
                <el-option
                  v-for="item in tagOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>


          </el-tab-pane>

          <el-tab-pane label="封面图" name="cover">
            <el-form-item label="封面图" prop="cover">
              <!-- ImageUpload -->
              <image-upload
                v-model="form.cover"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getBlogList,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  batchDeleteBlog,
  generateSeoInfo,
  translateBlog,
  publishBlog
} from "@/api/blog/blog";
import { getAllTags, createTag } from "@/api/blog/tags";
import { getToken } from "@/utils/auth";
import OSS from "ali-oss";

export default {
  name: "BlogManagement",
  data() {
    return {
      // OSS client
      ossClient: null,

      // Loading states
      loading: false,
      submitLoading: false,
      seoLoading: false,
      translateLoading: false,

      // Selection
      ids: [],
      single: true,
      multiple: true,

      // Search
      showSearch: true,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: "",
        status: "",
        lang: ""
      },
      dateRange: [],

      // Table data
      blogList: [],
      total: 0,

      // Dialog
      open: false,
      title: "",
      activeTab: "content",

      // Form data
      form: {
        blogId: undefined,
        title: "",
        content: "",
        lang: "zh-CN",
        tags: [],
        tagStyle: "primary",
        keywords: "",
        summary: "",
        cover: "",
        status: "draft"
      },

      // Options
      statusOptions: [
        { label: "全部", value: "" },
        { label: "已发布", value: "published" },
        { label: "草稿", value: "draft" }
      ],
      langOptions: [
        { label: "中文", value: "zh-CN" },
        { label: "英文", value: "en-US" }
      ],
      tagOptions: [],

      // Rules
      rules: {
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" },
          { max: 100, message: "标题长度不能超过100个字符", trigger: "blur" }
        ],
        content: [
          { required: true, message: "内容不能为空", trigger: "blur" }
        ],
        lang: [
          { required: true, message: "请选择语言", trigger: "change" }
        ],
        summary: [
          { max: 200, message: "描述长度不能超过200个字符", trigger: "blur" }
        ]
      },

      // Upload
      uploadUrl: process.env.VUE_APP_BASE_API + "/upload",
      uploadHeaders: {
        Authorization: "Bearer " + getToken()
      }
    };
  },

  created() {
    this.initOSSClient();
    this.getTagOptions();
    this.getList();
  },

  methods: {
    // Initialize OSS client
    initOSSClient() {
      this.ossClient = new OSS({
        region: process.env.VUE_APP_OSS_REGION,
        accessKeyId: process.env.VUE_APP_OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.VUE_APP_OSS_ACCESS_KEY_SECRET,
        bucket: process.env.VUE_APP_OSS_BUCKET
      });
    },

    // Get tag options
    getTagOptions() {
      getAllTags().then(response => {
        this.tagOptions = response.data;
      });
    },

    // Get blog list
    getList() {
      this.loading = true;
      getBlogList({
        ...this.queryParams,
        ...this.dateRange
      }).then(response => {
        this.blogList = response.data.rows;
        this.total = response.data.total;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },

    // Reset search form
    resetQuery() {
      this.dateRange = [];
      this.$refs.queryForm.resetFields();
      this.handleQuery();
    },

    // Handle query
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    // Handle selection change
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.blogId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    // Add new blog
    handleAdd() {
      this.resetForm();
      this.title = "新增博客";
      this.open = true;
    },

    // Update selected blog
    handleUpdate() {
      if (this.ids.length !== 1) return;
      this.handleUpdaterow({ blogId: this.ids[0] });
    },

    // Update blog row
    handleUpdaterow(row) {
      this.resetForm();
      const blogId = row.blogId;
      getBlogById(blogId).then(response => {
        this.form = response.data;
        this.form.tags = this.form.tags.map(tag => tag.id);
        this.title = "编辑博客";
        this.open = true;
      });
    },

    // Delete selected blogs
    handleDelete() {
      const blogIds = this.ids;
      this.$confirm('确认删除选中的博客吗？', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return batchDeleteBlog(blogIds);
      }).then(() => {
        this.getList();
        this.$message.success("删除成功");
      }).catch(() => {});
    },

    // Delete blog row
    handleDeleterow(row) {
      this.$confirm(`确认删除博客 "${row.title}" 吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return deleteBlog(row.blogId);
      }).then(() => {
        this.getList();
        this.$message.success("删除成功");
      }).catch(() => {});
    },

    // Publish blog
    publish(row) {
      this.$confirm(`确认发布博客 "${row.title}" 吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return publishBlog(row.blogId);
      }).then(() => {
        this.getList();
        this.$message.success("发布成功");
      }).catch(() => {});
    },

    // Translate blog
    handleTranslate(row) {
      this.$confirm(`确认将博客 "${row.title}" 翻译为英文吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info"
      }).then(() => {
        this.translateLoading = true;
        return translateBlog(row.blogId);
      }).then(response => {
        this.form = response.data;
        this.form.tags = this.form.tags.map(tag => tag.id);
        this.title = "翻译博客";
        this.open = true;
      }).catch(() => {})
      .finally(() => {
        this.translateLoading = false;
      });
    },

    // Generate SEO info
    generateSeoInfo() {
      if (!this.form.content) {
        this.$message.warning("请先填写博客内容");
        return;
      }

      this.seoLoading = true;
      generateSeoInfo({ content: this.form.content })
        .then(response => {
          const seoInfo = response.data;
          this.$confirm(
            `AI生成SEO信息：\n标题：${seoInfo.title}\n关键字：${seoInfo.keywords.join(",")}\n描述：${seoInfo.description}`,
            "确认使用这些SEO信息吗？",
            {
              confirmButtonText: "使用",
              cancelButtonText: "取消",
              type: "info"
            }
          ).then(() => {
            this.form.title = seoInfo.title;
            this.form.keywords = seoInfo.keywords.join(",");
            this.form.summary = seoInfo.description;
          }).catch(() => {});
        })
        .catch(() => {})
        .finally(() => {
          this.seoLoading = false;
        });
    },

    // Handle tag change
    handleTagChange(tags) {
      // Create new tags if they are strings (user input)
      tags.forEach(tag => {
        if (typeof tag === 'string' && !this.tagOptions.some(opt => opt.name === tag)) {
          createTag({ name: tag }).then(response => {
            this.getTagOptions();
          });
        }
      });
    },

    // Handle image upload
    async handleUploadImage(event, insertImage, files) {
      const file = files[0];
      try {
        // Validate file
        if (!this.beforeCoverUpload(file)) return;

        // Upload to OSS
        const timestamp = new Date().getTime();
        const fileName = `blog/images/${timestamp}_${file.name}`;
        const result = await this.ossClient.put(fileName, file);

        // Insert image to editor
        insertImage({
          url: result.url,
          desc: file.name
        });
      } catch (error) {
        this.$message.error("图片上传失败: " + error.message);
      }
    },

    // Handle cover upload success
    handleCoverSuccess(response, file) {
      if (response.code === 200) {
        this.form.cover = response.data.url;
        this.$message.success("封面图上传成功");
      } else {
        this.$message.error(response.msg || "封面图上传失败");
      }
    },

    // Before cover upload
    beforeCoverUpload(file) {
      const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error('只能上传图片格式!');
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过2MB!');
      }

      return isImage && isLt2M;
    },

    // Reset form
    resetForm() {
      this.form = {
        blogId: undefined,
        title: "",
        content: "",
        lang: "zh-CN",
        tags: [],
        tagStyle: "primary",
        keywords: "",
        summary: "",
        cover: "",
        status: "draft"
      };
      this.activeTab = "content";
      this.resetFormValidate();
    },

    // Reset form validation
    resetFormValidate() {
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },

    // Submit form
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          const promise = this.form.blogId
            ? updateBlog(this.form.blogId, this.form)
            : createBlog(this.form);

          promise.then(() => {
            this.$message.success("操作成功");
            this.open = false;
            this.getList();
          }).catch(() => {})
          .finally(() => {
            this.submitLoading = false;
          });
        }
      });
    },

    // Cancel dialog
    cancel() {
      this.open = false;
      this.resetForm();
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 10px;
  }

  .search-buttons {
    float: right;
  }
}

.avatar-uploader {
  ::v-deep .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #409EFF;
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.cover-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.el-tag + .el-tag {
  margin-left: 5px;
}

::v-deep .v-md-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  &:hover {
    border-color: #c0c4cc;
  }

  &--fullscreen {
    z-index: 2000 !important;
  }
}
</style>