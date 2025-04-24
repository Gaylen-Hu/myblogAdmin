<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="文件名称" prop="originalName">
        <el-input
          v-model="queryParams.originalName"
          placeholder="请输入文件名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文件类型" prop="mimeType">
        <el-select
          v-model="queryParams.mimeType"
          placeholder="请选择文件类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in mimeTypeOptions"
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
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleUpload"
          v-hasPermi="['system:file:upload']"
        >上传</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:file:edit']"
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
          v-hasPermi="['system:file:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:file:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="fileList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文件ID" prop="id" width="80" />
      <el-table-column label="文件名称" prop="originalName" :show-overflow-tooltip="true" width="180" />
      <el-table-column label="文件类型" prop="mimeType" width="120">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.mimeType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" prop="size" width="120">
        <template slot-scope="scope">
          {{ formatFileSize(scope.row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="预览图" width="100" align="center">
        <template slot-scope="scope">
          <el-image
            v-if="isImage(scope.row.mimeType)"
            style="width: 50px; height: 50px"
            :src="scope.row.url"
            :preview-src-list="[scope.row.url]"
            fit="cover"
          ></el-image>
          <div v-else>
            <i class="el-icon-document" style="font-size: 36px"></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handlePreview(scope.row)"
          >预览</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:file:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-download"
            @click="handleDownload(scope.row)"
          >下载</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:file:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 上传文件对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="500px" append-to-body>
      <image-upload
        ref="uploadImage"
        :fileSize="50"
        :fileType="['jpg','jpeg','png','gif','pdf','doc','docx','xls','xlsx','ppt','pptx','txt','zip','rar']"
        @input="handleUploadSuccess"
      ></image-upload>

      <div slot="footer" class="dialog-footer">
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改文件信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文件名称" prop="originalName">
          <el-input v-model="form.originalName" placeholder="请输入文件名称" />
        </el-form-item>
        <el-form-item label="文件标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文件标题" />
        </el-form-item>
        <el-form-item label="描述信息" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述信息" />
        </el-form-item>
        <el-form-item label="替代文本" prop="altText">
          <el-input v-model="form.altText" placeholder="请输入替代文本" />
        </el-form-item>
        <el-form-item>
          <el-button
          type="primary"
           @click="handleAIGenerate"
           >AI生成</el-button>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文件预览对话框 -->
    <el-dialog :title="preview.title" :visible.sync="preview.open" width="80%" top="5vh" append-to-body>
      <div style="text-align: center;">
        <image-preview
          v-if="isImage(preview.file.mimeType)"
          :src="preview.file.url"
          :width="'100%'"
          :height="'70vh'"
        />
        <div v-else>
          <i class="el-icon-document" style="font-size: 100px; color: #409EFF;"></i>
          <p style="margin-top: 20px; font-size: 18px;">{{ preview.file.originalName }}</p>
          <p>文件类型: {{ preview.file.mimeType }}</p>
          <p>文件大小: {{ formatFileSize(preview.file.size) }}</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="preview.open = false">关 闭</el-button>
        <el-button type="primary" @click="handleDownload(preview.file)">下 载</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOssStsToken, getFileList, getFileDetail, updateFile, deleteFile , generateImgSeo} from "@/api/file";
import { getToken } from "@/utils/auth";
import EXIF from 'exif-js';
export default {
  name: "File",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文件表格数据
      fileList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 文件类型选项
      mimeTypeOptions: [
        { value: "image/jpeg", label: "JPEG图像" },
        { value: "image/png", label: "PNG图像" },
        { value: "application/pdf", label: "PDF文档" },
        { value: "application/msword", label: "Word文档" },
        { value: "application/vnd.ms-excel", label: "Excel文档" }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        originalName: undefined,
        mimeType: undefined
      },
      // 表单参数
      form: {},
      // 上传参数
      upload: {
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "文件上传",
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/files",
        // 上传的文件列表
        fileList: [],
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的额外参数
        data: {}
      },
      // 预览参数
      preview: {
        open: false,
        title: "文件预览",
        file: {}
      },
      // 表单校验
      rules: {
        originalName: [
          { required: true, message: "文件名称不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {


    /** 查询文件列表 */
    getList() {
      this.loading = true;
      getFileList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.fileList = response.data.items;
        this.total = response.data.total;
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
        url: undefined,
        originalName: undefined,
        title: undefined,
        description: undefined,
        altText: undefined
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
    /** 上传按钮操作 */
    handleUpload() {
      this.upload.open = true;
      // 重置上传组件状态
      if (this.$refs.uploadImage) {
        this.$refs.uploadImage.fileList = [];
      }
    },
    // 上传前处理

    // 上传成功处理
    handleUploadSuccess(files) {
      if (files && files.length > 0) {
        this.upload.open = false;
        this.$modal.msgSuccess("上传成功");
        this.getList();
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getFileDetail(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改文件信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateFile(this.form.id, this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 预览按钮操作 */
    handlePreview(row) {
      this.preview.file = row;
      this.preview.title = "预览文件 - " + row.originalName;
      this.preview.open = true;
    },
    /** 下载按钮操作 */
    handleDownload(row) {
      const link = document.createElement('a');
      link.href = row.url;
      link.download = row.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除文件编号为"' + ids + '"的数据项？').then(function() {
        return deleteFile(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/file/export', {
        ...this.queryParams
      }, `file_${new Date().getTime()}.xlsx`)
    },
    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    handleAIGenerate() {
        generateImgSeo({url: this.form.url}).then(response => {
          this.$modal.msgSuccess("AI生成成功");
          this.form.title = response.data.seoInfo.title;
          this.form.description = response.data.seoInfo.description;
          this.form.altText = response.data.seoInfo.altText;
        });

    },
    // 判断是否是图片
    isImage(mimeType) {
      return mimeType && mimeType.startsWith('image/');
    }
  }
};
</script>

<style scoped>
.upload-demo {
  text-align: center;
}
</style>