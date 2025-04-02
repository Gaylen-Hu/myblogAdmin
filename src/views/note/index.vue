<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="标题">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
        ></el-input>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
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
        ></el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>

      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="noteList"
      highlight-current-row
      @selection-change="handleSelectionChange"
    >

    <!-- {
    "id": 1,
    "content": "sunt ipsum cupidatadsdasdasdt deserunt1111",
    "mediaResources": "https://intrepid-waist.com/,https://intrepid-waist.com/",
    "tags": "sit sunt sadasdoccaecat```111",
    "likeCount": 19,
    "location": "veniam",
    "locale": "zh-CN",
    "createdAt": "2025-03-29T07:09:48.000Z"
} -->
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.content | ellipsis }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="mediaResources" label="媒体资源" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.mediaResources | ellipsis }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="标签" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.tags | ellipsis }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="likeCount" label="点赞数" width="80"></el-table-column>
      <el-table-column prop="location" label="位置" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.location | ellipsis }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="locale" label="语言" width="80"></el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160">

        <template slot-scope="scope">
          <span>{{  parseTime(scope.row.createdAt)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            class="deleteColor"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >

        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改随笔对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="70%"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-tabs>
          <el-tab-pane label="基本信息">

            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="published">发布</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="内容" prop="content">
              <v-md-editor
                v-model="form.content"
                height="500px"
                :disabled-menus="[]"
                @upload-image="handleUploadImage"
              ></v-md-editor>
            </el-form-item>
            <el-form-item label="语言" prop="lang">
              <el-select v-model="form.locale" placeholder="请选择语言">
                <el-option
                  v-for="item in langOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
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
            <el-form-item label="图片" prop="mediaResources">
            <image-upload
                v-model="form.mediaResources"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listNote, getNote, addNote, updateNote, deleteNote, publishNote, unpublishNote,batchRemove } from "@/api/note/note";
import OSS from "ali-oss";
import { getAllTags, createTag } from "@/api/blog/tags";

export default {
  name: "Note",
  filters: {
    ellipsis(value) {
      if (!value) return '';
      if (value.length > 50) {
        return value.slice(0, 50) + '...';
      }
      return value;
    }
  },
  data() {
    return {
      tagOptions: [],
      langOptions: [
        { label: "中文", value: "zh-CN" },
        { label: "英文", value: "en-US" }
      ],
      client: null,
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 状态选项
      statusOptions: [
        { label: '草稿', value: 'draft' },
        { label: '已发布', value: 'published' }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        status: undefined
      },
      // 日期范围
      dateRange: [],
      // 总条数
      total: 0,
      // 随笔表格数据
      noteList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {
        id: undefined,
        title: "",
        content: "",
        status: "draft"
      },
      // 表单校验
      rules: {
        title: [
          { required: true, message: "随笔标题不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "随笔内容不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.client = new OSS({
      region: process.env.VUE_APP_REGION,
      accessKeyId: process.env.VUE_APP_ACCESS_KEY_ID,
      accessKeySecret: process.env.VUE_APP_ACCESS_KEY_SECRET,
      bucket: process.env.VUE_APP_BUCKET,
    });
    this.getTagOptions();
    this.getList();
  },
  methods: {
    /** 查询随笔列表 */
    getList() {
      this.loading = true;
      listNote(this.addDateRange(this.queryParams, this.dateRange)).then(res => {
        const response = res.data;
        this.noteList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        title: "",
        content: "",
        status: "draft"
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加随笔";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getNote(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改随笔";
      });
    },
    /** 发布按钮操作 */
    handlePublish(row) {
      const ids = row.id || this.ids;
      this.$confirm('确认发布选中的随笔吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return publishNote(ids);
      }).then(() => {
        this.getList();
        this.$message.success("发布成功");
      });
    },
    /** 下架按钮操作 */
    handleUnpublish(row) {
      const ids = row.id || this.ids;
      this.$confirm('确认下架选中的随笔吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return unpublishNote(ids);
      }).then(() => {
        this.getList();
        this.$message.success("下架成功");
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('确认删除选中的随笔吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        if(row.id){
          return deleteNote(ids);
        }else{
          return batchRemove({ids:ids.join(",")});
        }

      }).then(() => {
        this.getList();
        this.$message.success("删除成功");
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateNote(this.form).then(response => {
              this.$message.success("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addNote(this.form).then(response => {
              this.$message.success("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 图片上传处理 */
    async handleUploadImage(event, insertImage, files) {
      const file = files[0];
      const timestamp = new Date().getTime();
      const result = await this.client.put(
        `lcw_notion/images/${timestamp}_${file.name}`,
        file
      );
      insertImage({
        url: result.url,
        desc: result.name,
      });
    },
      // Get tag options
    getTagOptions() {
      getAllTags().then(response => {
        this.tagOptions = response.data;
      });
    },
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
  }
};
</script>

<style scoped>
/* 可以根据需要添加自定义样式 */
</style>