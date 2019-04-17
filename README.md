# Online-auction
Angular7开发在线竞拍网站
本项目是针对慕课网“Angular4.0从入门到实战 打造股票管理网站”，虽然说视频教学用的还是Angular2的版本，而自己使用的是Angular7，有些东西的设置会有所不同，但是大致上还是会有很多相识的，另外附赠上自己在学习过程中做的一些个人笔记，只是个人拙见，第一次放项目在github，希望有大神可以关注并给予指点。

项目运行：
在命令行中运行nodemon bulid/aution_server.js
如果环境不一样的情况请执行npm install


对于项目中还有几个问题，希望有缘人看到可以帮忙解答一下。

问题一：
在项目中的轮播图使用的是引入JQuery第三方库包的方式，但是在会报"$ is not defined"这个问题，对应轮播组件是在app目录下的carsousel文件夹；
已经按照网上搜索的方法安装库包，但并未起作用

问题二：
在项目搜索功能中，发出HTTP请求时，除了URL路径外，还需要增加search参数的调用，此处的search方法使用的是自定义的一个传递参数方法，但是会报错TS2345的错误，查阅angular关于HTTP发出get请求的参数，发现get请求的search参数中的URLSearchParams方法已被弃用，请问该如何解决
 
