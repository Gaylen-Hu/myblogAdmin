<template>
  <div class="component-upload-image">
    <el-upload
      action=""
      multiple
      list-type="picture-card"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :on-remove="handleDelete"
      :show-file-list="true"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{hide: this.fileList.length >= this.limit}"
      :http-request="handleHttpRequest"
    >
      <i class="el-icon-plus"></i>
    </el-upload>

    <!-- 上传提示 -->
    <div class="el-upload__tip" slot="tip" v-if="showTip">
      请上传
      <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
      <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      的文件
    </div>

    <el-dialog
      :visible.sync="dialogVisible"
      title="预览"
      width="800"
      append-to-body
    >
      <img
        :src="dialogImageUrl"
        style="display: block; max-width: 100%; margin: 0 auto"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getOssStsToken,savefileInfo } from "@/api/file";
import OSS from 'ali-oss';
import EXIF from 'exif-js';
export default {
  props: {
    value: [String, Object, Array],
    // 图片数量限制
    limit: {
      type: Number,
      default: 5,
    },
    // 大小限制(MB)
    fileSize: {
      type: Number,
      default: 5,
    },
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ["png", "jpg", "jpeg"],
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      number: 0,
      uploadList: [],
      dialogImageUrl: "",
      dialogVisible: false,
      hideUpload: false,
      fileList: [],
      ossClient: null,
      ossConfig: null
    };
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          // 首先将值转为数组
          console.log('val:', val);
          const list = Array.isArray(val) ? val : val.split(',');
          // 然后将数组转为对象数组
          this.fileList = list.map(item => {
            if (typeof item === "string") {
              item = { name: item, url: item };
            }
            return item;
          });
        } else {
          this.fileList = [];
          return [];
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    // 是否显示提示
    showTip() {
      return this.isShowTip && (this.fileType || this.fileSize);
    },
  },
  methods: {

    getExifData(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const exifData = EXIF.readFromBinaryFile(e.target.result);
      resolve(exifData || {});
    };
    reader.readAsArrayBuffer(file);
  });
},
    // 初始化OSS客户端
    async initOSSClient() {
      if (!this.ossConfig) {
        try {
          const res = await getOssStsToken();
          this.ossConfig = res.data;
          this.ossClient = new OSS({
            region: this.ossConfig.Region,
            accessKeyId: this.ossConfig.AccessKeyId,
            accessKeySecret: this.ossConfig.AccessKeySecret,
            stsToken: this.ossConfig.SecurityToken,
            bucket: this.ossConfig.Bucket
          });
        } catch (error) {
          console.error('初始化OSS客户端失败:', error);
          this.$modal.msgError("上传服务初始化失败，请刷新页面重试");
          throw error;
        }
      }
      return this.ossClient;
    },

    // 自定义上传方法
    async handleHttpRequest(options) {
      try {
        const client = await this.initOSSClient();
        const file = options.file;

        // 生成唯一的文件名
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}_${randomString}.${fileExtension}`;
        const fileKey = `uploads/${fileName}`;

        // 上传文件到OSS
        const result = await client.put(fileKey, file);
        let processedUrls = {};
        if (file.type.startsWith('image/')) {
      // 定义不同尺寸的处理参数
      const imageProcessProfiles = {
        raw: 'auto-orient,1',
        full: 'auto-orient,1/quality,q_90',
        regular: 'auto-orient,1/resize,w_1200/quality,q_85',
        small: 'auto-orient,1/resize,w_800/quality,q_75',
        thumb: 'auto-orient,1/resize,w_200,h_200,m_fill/quality,q_60'
      };
      for (const [size, processStr] of Object.entries(imageProcessProfiles)) {
        processedUrls[size] = `${result.url}?x-oss-process=image/${processStr}`;
      }
    }


        // async function processImage(processStr, targetBucket) {
        //   const result = await client.processObjectSave(
        //     sourceImage,
        //     targetImage,
        //     processStr,
        //     targetBucket
        //   );
        //   console.log(result.res.status);
        // }
        // 上传成功后处理
        const uploadedFile = {
          name: result.name,
          url: result.url,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          bucket: this.ossConfig.bucket,
          key: result.name,
          variants: processedUrls,
          ...(file.extraInfo || {}) // 包含额外信息
        };
        console.log('uploadedFileuploadedFile:', uploadedFile);
        this.uploadList.push(uploadedFile);
        this.uploadedSuccessfully();
        const fileInfo = {
          "originalName":  uploadedFile.originalName,
          "filename": uploadedFile.name,
          "size": uploadedFile.size,
          "mimeType": uploadedFile.mimeType,
          "url": uploadedFile.url,
          "bucket":  this.ossConfig.Bucket,
          "key": uploadedFile.key,
          "variants": uploadedFile.variants,
          "exif": uploadedFile.exif || {}
    }
console.log(fileInfo);
        // 这里可以调用后端API保存文件信息
        await savefileInfo(fileInfo);

      } catch (error) {
        console.error('上传失败:', error);
        this.$modal.msgError("上传失败，请重试");
        this.$modal.closeLoading();
        this.number--;
      }
    },

    // 上传前loading加载
    async handleBeforeUpload(file) {
      let isImg = false;
      if (this.fileType.length) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        isImg = this.fileType.some(type => {
          if (file.type.indexOf(type) > -1) return true;
          if (fileExtension && fileExtension.indexOf(type) > -1) return true;
          return false;
        });
      } else {
        isImg = file.type.indexOf("image") > -1;
      }

      if (!isImg) {
        this.$modal.msgError(`文件格式不正确, 请上传${this.fileType.join("/")}图片格式文件!`);
        return false;
      }
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$modal.msgError(`上传头像图片大小不能超过 ${this.fileSize} MB!`);
          return false;
        }
      }
      try {
        const exifData = await this.getExifData(file);
        file.extraInfo = {
          exif: exifData,
        };
      } catch (error) {
         console.error('获取图片信息失败:', error);
    // 即使获取信息失败也继续上传
        file.extraInfo = {};
      }
      this.$modal.loading("正在上传图片，请稍候...");
      this.number++;
      return true; // 返回true继续上传
    },
    // 文件个数超出
    handleExceed() {
      this.$modal.msgError(`上传文件数量不能超过 ${this.limit} 个!`);
    },
    // 删除图片
    handleDelete(file) {
      const findex = this.fileList.map(f => f.name).indexOf(file.name);
      if (findex > -1) {
        this.fileList.splice(findex, 1);
        this.$emit("input", this.listToString(this.fileList));
      }
    },
    // 上传失败
    handleUploadError() {
      this.$modal.msgError("上传图片失败，请重试");
      this.$modal.closeLoading();
    },
    // 上传结束处理
    uploadedSuccessfully() {
      if (this.number > 0 && this.uploadList.length === this.number) {
        this.fileList = this.fileList.concat(this.uploadList);
        this.uploadList = [];
        this.number = 0;
        this.$emit("input", this.listToString(this.fileList));
        this.$modal.closeLoading();
      }
    },
    // 预览
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 对象转成指定字符串分隔
    listToString(list, separator) {
      let strs = "";
      separator = separator || ",";
      for (let i in list) {
        if (list[i].url) {
          strs += list[i].url + separator;
        }
      }
      return strs != '' ? strs.substr(0, strs.length - 1) : '';
    }
  }
};
</script>
<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
::v-deep.hide .el-upload--picture-card {
    display: none;
}
// 去掉动画效果
::v-deep .el-list-enter-active,
::v-deep .el-list-leave-active {
    transition: all 0s;
}

::v-deep .el-list-enter, .el-list-leave-active {
  opacity: 0;
  transform: translateY(0);
}
</style>