<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.search" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!--        <el-col :span="4">-->
        <!--          <el-button type="primary" @click="goAddPage">添加商品</el-button>-->
        <!--        </el-col>-->
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="评论用户名" prop="userName"></el-table-column>
        <el-table-column label="评论内容)" prop="content"></el-table-column>
        <el-table-column label="发布账号" prop="userId"></el-table-column>
        <el-table-column label="创建时间" prop="createTime">
          <template slot-scope="scope">{{scope.row.time | dataFormat }}</template>
        </el-table-column>
        <el-table-column prop="status" label="评论禁用">
          <template slot-scope="scope">
            <el-switch :active-value="1" :inactive-value="0" v-model="scope.row.status" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="showEditArticleDialog(scope.row.id)"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.curPage"
        :page-sizes="[1, 5, 10, 15, 20]"
        :page-size="queryInfo.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>

    <!-- 修改物品的对话框 -->
    <el-dialog
      title="修改物品信息"
      :visible.sync="articleVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="editArticleForm"
        ref="editArticleFormRef"
        :rules="editArticleFormRules"
        label-width="70px"
      >
        <el-form-item label="评论人id">
          <el-input v-model="editArticleForm.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="评论内容" prop="price">
          <el-input v-model="editArticleForm.content"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="articleVisible = false">取 消</el-button>
        <el-button type="primary" @click="editArticle">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        search: '',
        curPage: 1,
        limit: 5
      },
      // 商品列表
      goodsList: [],
      editArticleForm: {},
      articleVisible: false,
      id: {
        id: ''
      },
      // 商品总数
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.post('articleComment/listAll', this.queryInfo)
      if (res.code !== 0) {
        return this.$message.error('获取评论列表失败！')
      }
      this.goodsList = res.data.list
      //   console.log(this.goodsList)
      this.total = res.data.totalCount
    },
    // 修改用户信息
    editArticle () {
      // 提交请求前，表单预验证
      this.$refs.editArticleFormRef.validate(async valid => {
        // console.log(valid)
        // 表单预校验失败
        if (!valid) return
        const { data: res } = await this.$http.post(
          '/articleComment/update',
          {
            id: this.editArticleForm.id,
            content: this.editArticleForm.content
          }
        )
        if (res.code !== 0) {
          this.$message.error('更新评论信息失败！')
        }
        // 隐藏添加用户对话框
        this.articleVisible = false
        this.$message.success('更新评论信息成功！')
        this.getGoodsList()
      })
    },
    // 编辑商品信息
    async showEditArticleDialog (id) {
      this.id.id = id
      const { data: res } = await this.$http.post('/articleComment/info', this.id)
      if (res.code !== 0) {
        // return this.$message.error('查询物品信息失败！')
      }
      this.editArticleForm = res.data
      this.articleVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      this.$refs.editArticleFormRef.resetFields()
    },
    // 监听 switch开关 状态改变
    async userStateChanged (userInfo) {
      this.id.id = userInfo.id
      // console.log(userInfo)
      const { data: res } = await this.$http.post('/articleComment/update', userInfo)
      if (res.code !== 0) {
        userInfo.status = !userInfo.status
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功！')
    },
    handleSizeChange (newSize) {
      this.queryInfo.limit = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newSize) {
      this.queryInfo.curPage = newSize
      this.getGoodsList()
    },
    // 通过Id删除商品
    async removeById (id) {
      this.id.id = id
      const confirmResult = await this.$confirm(
        '此操作将永久删除该评论, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.post('/articleComment/delete', this.id)
      if (res.code !== 0) {
        return this.$message.error('删除评论失败！')
      }
      this.$message.success('删除评论成功！')
      this.getGoodsList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
