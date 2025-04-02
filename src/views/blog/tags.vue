<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="标签名">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入标签名"
        ></el-input>
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
      :data="tagList"
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="标签名"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="status" label="状态" width="80"></el-table-column>
      <el-table-column
        prop="sortOrder"
        label="排序"
        width="80"
      ></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
       <el-table-column prop="act" label="操作" >
        <template slot-scope="scope">
            <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>

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

    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="标签描述" prop="description">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item label="标签状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="active" value="active"></el-option>
            <el-option label="disabled" value="disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序值" prop="sort_order">
          <el-input-number v-model="form.sortOrder" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="标签样式类" prop="class">
          <el-input v-model="form.class"></el-input>
        </el-form-item>
     
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  getTagList,
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  batchDeleteTag
} from "@/api/blog/tags";

export default {
  name: "Tags",
  data() {
    return {
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      tags: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: "",
        status: "",
      },
      total: 0,
      dateRange: [],
      tagList: [],

      title: "",
      open: false,
      form: {
        name: "",
        description: "",
        status: "active",
        sort_order: 0,
        class: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入标签名称", trigger: "blur" },
          { max: 50, message: "标签名称长度不能超过50个字符", trigger: "blur" },
        ],
        description: [
          {
            max: 255,
            message: "标签描述长度不能超过255个字符",
            trigger: "blur",
          },
        ],
        status: [
          {
            type: "enum",
            enum: ["active", "disabled"],
            message: "状态只能是 active 或 disabled",
            trigger: "blur",
          },
        ],
        sort_order: [
          {
            type: "number",
            min: 0,
            message: "排序值不能小于0",
            trigger: "blur",
          },
        ],
        class: [
          { max: 20, message: "样式类长度不能超过20个字符", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      getTagList(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.tagList = response.data.rows;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    resetQuery() {
      this.$refs.queryForm.resetFields();
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: "",
        status: "",
      };
      this.dateRange = [];
      this.getList();
    },
    handleDelete() {
        this.$confirm("确认删除选中的标签吗？", "提示", {
            type: "warning",
        })
            .then(() => {
            batchDeleteTag({
                ids: this.ids,
            }).then(() => {
                this.getList();
            });
            })
            .catch(() => {});
    },
    handleAdd() {
      this.title = "新增标签";
      this.open = true;
    },
    handleUpdate() {
      getTagById(this.ids[0]).then((response) => {
        this.form = response.data;
        this.title = "修改标签";
        this.open = true;
      });
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateTag(this.form.id,this.form).then(() => {
              this.open = false;
              this.getList();
            });
          } else {
            createTag(this.form).then(() => {
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    cancel() {},

    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
  },
  mounted() {
    document.title = "Tags";
  },
};
</script>