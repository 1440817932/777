import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import HelloWorld from '../components/HelloWorld'
import Users from '../components/user/Users.vue'
import Article from '../components/article/Article.vue'
import ArticleType from '../components/article/ArticleType'
Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/HelloWorld',
      children: [
        {
          path: '/HelloWorld',
          component: HelloWorld
        },
        {
          path: '/Users',
          component: Users
        },
        {
          path: '/Article',
          component: Article
        },
        {
          path: '/ArticleType',
          component: ArticleType
        }
      ]
    }
  ]
})
